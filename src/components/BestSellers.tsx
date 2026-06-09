"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother, MotionPathPlugin);

/**
 * "OUR BEST SELLERS" — a single-screen, self-playing sequence at the top of the
 * Drinks tab. It plays like a short video: the moment the tab is in view it runs
 * forward on its own; scrolling down keeps it forward, scrolling back up reverses.
 *
 * Beats: a dotted line is drawn down from the top, popping in each best-seller's
 * framed photo (with its die-cut sticker on the corner), spread across the page →
 * the paper bag rises with "OUR BEST SELLERS" sat behind it → each framed photo
 * follows the line down into the bag → the three stickers settle in a row along
 * the bottom of the bag, and a large hero sticker lands top-left with its name
 * printed behind it.
 */

type Drink = {
  name: string;
  title: string[];
  price: string;
  full: string;
  cut: string;
  cutRatio: number; // sticker PNG native width / height — so the box matches it
};

const DRINKS: Drink[] = [
  {
    name: "Ube Matcha",
    title: ["UBE", "MATCHA"],
    price: "6.20",
    full: "/media/drinks/ubematcha-web.jpg",
    cut: "/media/drinks/cuts/ubematcha_sticker.png",
    cutRatio: 620 / 864,
  },
  {
    name: "Honey Peach Mango",
    title: ["HONEY", "PEACH", "MANGO"],
    price: "4.70",
    full: "/media/drinks/hpm-web.jpg",
    cut: "/media/drinks/cuts/hpm_sticker.png",
    cutRatio: 620 / 808,
  },
  {
    name: "Spanish Iced Latte",
    title: ["SPANISH", "LATTE"],
    price: "5.20",
    full: "/media/drinks/spanishlatte-web.jpg",
    cut: "/media/drinks/cuts/spanishlatte_sticker.png",
    cutRatio: 620 / 827,
  },
];

const BAG = "/media/drinks/paper-bag-clean.png";
const BAG_RATIO = 1000 / 671; // w/h of the cleaned (wide) bag art

// A smooth (Catmull-Rom → cubic bézier) path through a list of waypoints, so the
// curve is rounded everywhere and passes exactly through each point.
function smoothPath(pts: { x: number; y: number }[]) {
  const f = (n: number) => n.toFixed(1);
  let d = `M ${f(pts[0].x)} ${f(pts[0].y)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? pts[i + 1];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${f(c1x)} ${f(c1y)}, ${f(c2x)} ${f(c2y)}, ${f(p2.x)} ${f(p2.y)}`;
  }
  return d;
}

export default function BestSellers() {
  const stageRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const revealRef = useRef<SVGRectElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const bagWrapRef = useRef<HTMLDivElement>(null);
  const fullRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cutRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cutBtnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const cutInnerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cutLabelRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    (_context, contextSafe) => {
      const stage = stageRef.current!;
      const svg = svgRef.current!;
      const path = pathRef.current!;

      let tl: gsap.core.Timeline | null = null;
      let st: ScrollTrigger | null = null;

      const build = (motion: boolean) => {
        tl?.kill();
        st?.kill();

        const w = stage.clientWidth;
        const h = stage.clientHeight; // tall SECTION height (multi-screen)
        const vh = window.innerHeight; // one screen
        const cx = w / 2;

        // ===================================================================
        //  BAG — big, sized to the viewport, at the bottom of the tall section so
        //  it fills the screen at the finale. Raise 0.86 → bigger bag.
        // ===================================================================
        const bagW = Math.min(w * 1.6, vh * 1.1 * BAG_RATIO);
        const bagH = bagW / BAG_RATIO;
        const bagTopY = h - bagH - vh * 0.02;
        const bagMouthY = bagTopY + bagH * 0.06;

        // framed photos for the 3 sets — large
        const fullW = gsap.utils.clamp(185, 275, w * 0.17);
        const fullH = fullW * 1.4;

        // stickers settle along the bottom of the bag. Uniform WIDTH so every
        // cup body reads the same size; each box's HEIGHT follows that sticker's
        // own aspect ratio, so tall garnishes (ube's ice peak) just rise higher
        // instead of shrinking the cup. Bottoms are aligned below.
        const cutW = gsap.utils.clamp(120, 225, bagW * 0.18);
        const cutHFor = (i: number) => cutW / DRINKS[i].cutRatio;

        // horizontal spread of the drinks
        const amp = Math.min(w * 0.26, 360);
        // SHORT-ish starting trail (the line leads in from the top), the drinks
        // spread WELL APART down the section, then a LONG trailing line that runs
        // deep into the bag.
        const lineTop = vh * 0.05;
        const wobbleStart = vh * 0.5;
        const bandBot = Math.min(bagTopY - fullH * 0.5, vh * 1.15);
        const lineEnd = bagTopY + bagH * 0.32;
        const span = bandBot - wobbleStart;
        const peakY = [0.05, 0.5, 0.95].map((t) => wobbleStart + span * t);
        const peakX = [cx + amp, cx - amp, cx + amp];
        // A "shoulder" point just above and below each peak (at the same x) makes
        // the curve arc around a rounded top instead of coming to a point.
        const sh = Math.min(span * 0.1, 80);
        // lead-in: straight descent from the top to just before the first drink
        const waypoints = [
          { x: cx, y: lineTop },
          { x: cx, y: wobbleStart },
        ];
        peakY.forEach((py, i) => {
          waypoints.push({ x: peakX[i], y: py - sh });
          waypoints.push({ x: peakX[i], y: py + sh });
        });
        // trailing: straight descent from the last drink down into the bag
        waypoints.push({ x: cx, y: bandBot });
        waypoints.push({ x: cx, y: lineEnd });
        path.setAttribute("d", smoothPath(waypoints));
        svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
        const total = path.getTotalLength();
        gsap.set(revealRef.current, {
          attr: { x: 0, y: lineTop, width: w, height: motion ? 0 : lineEnd - lineTop },
        });

        // --- stations: each drink sits at its rounded peak; find its length on
        //     the path (closest sampled point) so the photo can fly down the line ---
        const samples = Array.from({ length: 601 }, (_, k) => {
          const L = (total * k) / 600;
          const p = path.getPointAtLength(L);
          return { x: p.x, y: p.y, len: L };
        });
        const stations = [0, 1, 2].map((i) => {
          const wp = { x: peakX[i], y: peakY[i] };
          let best = samples[0];
          let bd = Infinity;
          for (const s of samples) {
            const dd = (s.x - wp.x) ** 2 + (s.y - wp.y) ** 2;
            if (dd < bd) {
              bd = dd;
              best = s;
            }
          }
          return { x: wp.x, y: wp.y, len: best.len };
        });

        // all three stickers line up in a row across the bag, evenly spread but
        // kept clear of the edges, with their BOTTOMS on one baseline (so the
        // differing cup heights line up at the base, not by their centres).
        const baseline = bagTopY + bagH * 0.78 + cutHFor(1) / 2;
        const slot = (i: number) => ({
          x: cx + (i - (DRINKS.length - 1) / 2) * cutW * 1.15,
          y: baseline - cutHFor(i) / 2,
        });

        // --- place static elements ---
        gsap.set(bagWrapRef.current, {
          width: bagW,
          left: cx,
          top: bagTopY + bagH / 2,
          xPercent: -50,
          yPercent: -50,
        });

        gsap.set(titleRef.current, {
          left: cx,
          top: bagTopY + h * 0.11,
          xPercent: -50,
          yPercent: -100,
        });
        DRINKS.forEach((_, i) => {
          const s = stations[i];
          const cornerX = s.x + fullW * 0.42;
          const cornerY = s.y - fullH * 0.32;
          gsap.set(fullRefs.current[i], {
            width: fullW,
            height: fullH,
            left: s.x,
            top: s.y,
            xPercent: -50,
            yPercent: -50,
            x: 0,
            y: 0,
            rotate: i % 2 ? 6 : -6,
          });
          gsap.set(cutRefs.current[i], {
            width: cutW,
            height: cutHFor(i),
            left: cornerX,
            top: cornerY,
            xPercent: -50,
            yPercent: -50,
            x: 0,
            y: 0,
          });
        });

        if (!motion) {
          gsap.set(titleRef.current, { autoAlpha: 1, y: 0 });
          gsap.set(bagWrapRef.current, { autoAlpha: 1, scale: 1, y: 0 });
          gsap.set(fullRefs.current, { autoAlpha: 0 });
          DRINKS.forEach((_, i) => {
            const s = stations[i];
            const sl = slot(i);
            gsap.set(cutRefs.current[i], {
              autoAlpha: 1,
              scale: 1,
              x: sl.x - (s.x + fullW * 0.42),
              y: sl.y - (s.y - fullH * 0.32),
            });
          });
          return;
        }

        // hidden initial states
        gsap.set(titleRef.current, { autoAlpha: 0, y: 80 });
        gsap.set(bagWrapRef.current, { autoAlpha: 0, scale: 0.85, y: 70 });
        gsap.set(fullRefs.current, { autoAlpha: 0, scale: 0.4 });
        gsap.set(cutRefs.current, { autoAlpha: 0, scale: 0 });

        tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });

        const TT = 10; // timeline span (the scrub maps the whole section scroll to this)

        // a drink at section-y Y is at the screen CENTRE when the scroll has
        // progressed this far — pop it exactly then
        const popAt = (Y: number) =>
          gsap.utils.clamp(0.02, 0.72, (Y - vh / 2) / (h - vh)) * TT;

        // 1) draw line as user scrolls down
        const EDGE = vh * 0.66; // draw-edge sits in the lower third of the screen
        const tFull = gsap.utils.clamp(2, TT, ((lineEnd - EDGE) / (h - vh)) * TT);
        tl.fromTo(
          revealRef.current,
          { attr: { height: Math.max(0, EDGE - lineTop) } },
          { attr: { height: lineEnd - lineTop }, ease: "none", duration: tFull },
          0,
        );
        // 2) each drink pops when it reaches the MIDDLE of the screen
        DRINKS.forEach((_, i) => {
          const at = popAt(stations[i].y);
          tl!.to(
            fullRefs.current[i],
            { autoAlpha: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" },
            at,
          );
          tl!.to(
            cutRefs.current[i],
            { autoAlpha: 1, scale: 1, duration: 0.45, ease: "back.out(2.2)" },
            at + 0.12,
          );
        });

        // 3) the bag + "OUR BEST SELLERS" rise in near the end, as you reach them
        tl.to(
          bagWrapRef.current,
          { autoAlpha: 1, scale: 1, y: 0, duration: 0.9, ease: "back.out(1.4)" },
          TT * 0.72,
        );
        tl.to(
          titleRef.current,
          { autoAlpha: 1, y: 0, duration: 0.9, ease: "back.out(1.5)" },
          TT * 0.74,
        );

        // 3) photos follow the line into the bag; stickers settle (the finale)
        DRINKS.forEach((_, i) => {
          const s = stations[i];
          const sl = slot(i);
          const at = TT * 0.82 + i * 0.45;
        
          // a) glide across to sit directly above the bag's mouth (upright)
          tl!.to(
            fullRefs.current[i],
            {
              x: cx - s.x,
              y: bagTopY - bagH * 0.04 - s.y,
              scale: 0.5,
              rotate: 0,
              duration: 0.55,
              ease: "power2.inOut",
            },
            at,
          );
          // b) then drop STRAIGHT DOWN into the bag (x held at centre)
          tl!.to(
            fullRefs.current[i],
            {
              y: bagTopY + bagH * 0.3 - s.y,
              scale: 0.3,
              duration: 0.65,
              ease: "power1.in",
            },
            at + 0.55,
          );
          // c) fade out as it sinks behind the bag front
          tl!.to(
            fullRefs.current[i],
            { autoAlpha: 0, duration: 0.3, ease: "power1.in" },
            at + 0.95,
          );
          
          tl!.to(
            cutRefs.current[i],
            { autoAlpha: 0, scale: 0.6, duration: 0.3, ease: "power2.in" },
            at + 0.45,
          );
          tl!.to(
            cutRefs.current[i],
            {
              x: sl.x - (s.x + fullW * 0.42),
              y: sl.y - (s.y - fullH * 0.32),
              rotate: 0,
              duration: 0,
            },
            at + 0.8,
          );
          tl!.to(
            cutRefs.current[i],
            { autoAlpha: 1, scale: 1, duration: 0.55, ease: "back.out(2.2)" },
            at + 0.85,
          );
        });

        // Scroll-driven + PINNED: the stage is held in view while the timeline
        // (line draw, drinks popping, photos moving into the bag) is scrubbed to
        // the scroll position — so the whole thing animates on screen as the user
        // scrolls down, and reverses as they scroll back up.
        st = ScrollTrigger.create({
          trigger: stage,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          animation: tl,
          invalidateOnRefresh: true,
        });
      };

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => build(true));

      // Click a settled sticker on the bag: it springs up with its name/price;
      // click again to drop it back. (Acts on an inner element so it doesn't
      // fight the scroll-scrubbed position of the outer sticker.)
      const open: boolean[] = DRINKS.map(() => false);
      const toggle = contextSafe!((i: number) => {
        const inner = cutInnerRefs.current[i];
        const label = cutLabelRefs.current[i];
        if (!inner) return;
        open[i] = !open[i];
        gsap.to(inner, {
          scale: open[i] ? 1.55 : 1,
          y: open[i] ? -44 : 0,
          duration: 0.55,
          ease: open[i] ? "back.out(2.4)" : "power3.inOut",
          overwrite: "auto",
        });
        if (open[i]) {
          gsap.fromTo(inner, { rotate: -6 }, { rotate: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" });
        }
        if (label) {
          gsap.to(label, {
            autoAlpha: open[i] ? 1 : 0,
            y: open[i] ? 0 : 10,
            duration: 0.4,
            ease: "power2.out",
            overwrite: "auto",
          });
        }
      });
      cutBtnRefs.current.forEach((btn, i) => {
        if (btn) btn.onclick = () => toggle(i);
      });

      mm.add("(prefers-reduced-motion: reduce)", () => build(false));

      // ---- auto-play by auto-scrolling the page through the pinned section ----
      // When the Drinks tab opens, gently drive the scroll down so the whole
      // sequence plays on its own (the pinned scrub follows the scroll). The user
      // can grab control any time — a wheel/touch/key stops the auto-scroll.
      let autoTween: gsap.core.Tween | gsap.core.Timeline | null = null;
      let stopAuto = () => {};
      let autoTimer = 0;
      const startAutoScroll = () => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        if (!st) return;
        const smoother = ScrollSmoother.get();
        const getY = () => (smoother ? smoother.scrollTop() : window.scrollY);
        const setY = (y: number) =>
          smoother ? smoother.scrollTop(y) : window.scrollTo(0, y);
        const cur = getY();
        const target = st.end;
        const begin = st.start;
        if (target - cur < 60) return;
        const o = { y: cur };
        // 1) drop quickly to where the section pins (skip the blank gap above it)
        // 2) then ease slowly through the pinned animation
        autoTween = gsap
          .timeline()
          .to(o, {
            y: Math.max(begin, cur),
            duration: 0.5,
            ease: "power2.in",
            onUpdate: () => setY(o.y),
          })
          .to(o, {
            y: target,
            duration: gsap.utils.clamp(8, 15, (target - Math.max(begin, cur)) / 150),
            ease: "power1.inOut",
            onUpdate: () => setY(o.y),
          });
        const onUser = () => stopAuto();
        stopAuto = () => {
          autoTween?.kill();
          autoTween = null;
          window.removeEventListener("wheel", onUser);
          window.removeEventListener("touchstart", onUser);
          window.removeEventListener("keydown", onUser);
          stopAuto = () => {};
        };
        window.addEventListener("wheel", onUser, { passive: true });
        window.addEventListener("touchstart", onUser, { passive: true });
        window.addEventListener("keydown", onUser);
        autoTween.eventCallback("onComplete", stopAuto);
      };

      const raf = requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        autoTimer = window.setTimeout(startAutoScroll, 180);
      });

      let rt = 0;
      let firstRO = true;
      const ro = new ResizeObserver(() => {
        if (firstRO) {
          firstRO = false;
          return;
        }
        clearTimeout(rt);
        rt = window.setTimeout(() => {
          const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          build(!reduce);
          ScrollTrigger.refresh();
        }, 200);
      });
      ro.observe(stage);

      return () => {
        cancelAnimationFrame(raf);
        clearTimeout(rt);
        clearTimeout(autoTimer);
        stopAuto();
        ro.disconnect();
        tl?.kill();
        st?.kill();
        mm.revert();
      };
    },
    { scope: stageRef },
  );

  return (
    <div
      ref={stageRef}
      className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] h-[280vh] w-screen overflow-hidden"
    >
      {/* dotted line — viewBox matches the stage in px, so the dots stay round */}
      <svg
        ref={svgRef}
        className="pointer-events-none absolute inset-0 z-0 h-full w-full"
        fill="none"
        aria-hidden
      >
        <defs>
          <clipPath id="bs-reveal-clip">
            <rect ref={revealRef} x="0" y="0" width="0" height="0" />
          </clipPath>
        </defs>
        <path
          ref={pathRef}
          clipPath="url(#bs-reveal-clip)"
          stroke="#fbd400"
          strokeWidth={9}
          strokeLinecap="round"
          strokeDasharray="1 26"
          opacity={0.92}
        />
      </svg>

      {/* "OUR BEST SELLERS" — behind the bag, navbar gold + hard black shadow.
          Size knob: change the text-* classes below (e.g. sm:text-[12rem]). */}
      <div ref={titleRef} className="pointer-events-none absolute z-[5] w-max text-center">
        <h3 className="nav-blackface text-[10vw] uppercase leading-[0.82] sm:text-[9vw]">
          Our Best
          <br />
          Sellers
        </h3>
      </div>

      {/* framed photos that follow the line into the bag */}
      {DRINKS.map((drink, i) => (
        <div
          key={`full-${drink.name}`}
          ref={(el) => {
            fullRefs.current[i] = el;
          }}
          className="absolute z-10 overflow-hidden rounded-2xl border-[6px] border-cream shadow-[0_16px_36px_rgba(0,0,0,0.45)] will-change-transform"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={drink.full}
            alt={drink.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
      ))}

      {/* paper bag */}
      <div ref={bagWrapRef} className="absolute z-20 will-change-transform">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={BAG} alt="Paper bag of Cafe Mama best-sellers" className="block w-full" />
      </div>

      {/* the three stickers (same size) settle in a row along the bottom of the
          bag; each is clickable to spring up with its name/price */}
      {DRINKS.map((drink, i) => (
        <div
          key={`cut-${drink.name}`}
          ref={(el) => {
            cutRefs.current[i] = el;
          }}
          className="absolute z-30 will-change-transform"
        >
          <button
            type="button"
            ref={(el) => {
              cutBtnRefs.current[i] = el;
            }}
            aria-label={`${drink.name} — £${drink.price}`}
            className="relative block h-full w-full cursor-pointer border-0 bg-transparent p-0"
          >
            <div
              ref={(el) => {
                cutInnerRefs.current[i] = el;
              }}
              className="h-full w-full origin-bottom will-change-transform"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={drink.cut}
                alt={drink.name}
                loading="lazy"
                className="block h-full w-full object-contain object-bottom drop-shadow-[0_10px_16px_rgba(0,0,0,0.4)]"
              />
            </div>
            <div
              ref={(el) => {
                cutLabelRefs.current[i] = el;
              }}
              className="pointer-events-none absolute bottom-full left-1/2 mb-2 w-max -translate-x-1/2 rounded-xl bg-pine px-3 py-1 text-center opacity-0"
            >
              <span className="font-arialblack block text-sm uppercase leading-tight text-sun">
                {drink.name}
              </span>
              <span className="font-arialblack block text-sm leading-tight text-cream">
                £{drink.price}
              </span>
            </div>
          </button>
        </div>
      ))}
    </div>
  );
}
