"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother, SplitText);

const HOURS: { day: string; time: string }[] = [
  { day: "Mon – Fri", time: "8:00 – 18:00" },
  { day: "Saturday", time: "9:00 – 18:00" },
  { day: "Sunday", time: "9:00 – 17:00" },
];

const ADDRESS = "83 Kentish Town Rd, London NW1 8NY";
const MAPS_QUERY = encodeURIComponent(
  "Cafe Mama & Sons, 83 Kentish Town Rd, London NW1 8NY",
);
const DIRECTIONS = `https://www.google.com/maps/search/?api=1&query=${MAPS_QUERY}`;

/**
 * Location section — a single centred widget that tilts in 3D toward the
 * cursor, after GSAP's "cursor-driven perspective tilt" demo
 * (https://demos.gsap.com/demo/cursor-driven-perspective-tilt/).
 *
 * A `perspective` stage holds one `preserve-3d` card; pointer position is
 * normalised to -0.5…0.5 and mapped to rotationX / rotationY via gsap.quickTo
 * for smooth, GPU-friendly updates. Inner layers carry a translateZ depth plus
 * a parallax offset so they pop off the card as it tilts. Leaving the stage
 * eases everything back to flat.
 */
export default function Location() {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const stageEl = stage.current!;
      const cardEl = card.current!;
      const layers = gsap.utils.toArray<HTMLElement>(".tilt-layer");

      // Push each layer out along Z so it floats above the card face.
      layers.forEach((l) =>
        gsap.set(l, { z: Number(l.dataset.z ?? 0) }),
      );

      // ---- "COME FIND US" marquee rows — each scrolls forever at its own
      // speed/direction so the rows are continuously offset, like a carousel.
      const tracks = gsap.utils.toArray<HTMLElement>(".cfu-track");
      tracks.forEach((t, i) => {
        const ltr = i % 2 === 0; // two directions, alternating per row
        const dur = ltr ? 60 : 46; // two speeds (slow)
        // Duplicated content + xPercent 0↔-50 wraps seamlessly, so text
        // re-enters from the opposite side forever.
        gsap.fromTo(
          t,
          { xPercent: ltr ? 0 : -50 },
          { xPercent: ltr ? -50 : 0, ease: "none", duration: dur, repeat: -1 },
        );
      });

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      // ---- "Where are we?" intro — horizontal pinned scroll ----
      // The phrase scrolls horizontally across a pinned screen and each
      // character pops up from a random offset as it crosses (nested
      // ScrollTriggers driven by `containerAnimation`), leading you into the
      // Location widget below.
      const horizEl = root.current!.querySelector<HTMLElement>(
        ".where-horizontal",
      );
      const trackEl = root.current!.querySelector<HTMLElement>(".where-track");
      const lines = gsap.utils.toArray<HTMLElement>(".where-line");
      let split: ReturnType<typeof SplitText.create> | null = null;
      if (trackEl && horizEl) {
        if (reduced) {
          gsap.set(horizEl, { justifyContent: "center" });
          gsap.set(trackEl, { paddingLeft: 0 });
        } else {
          split = SplitText.create(lines, { type: "chars, words" });
          const scrollTween = gsap.to(trackEl, {
            xPercent: -100,
            ease: "none",
            scrollTrigger: {
              trigger: horizEl,
              pin: true,
              end: "+=2400",
              scrub: true,
            },
          });
          split.chars.forEach((char) => {
            gsap.from(char, {
              yPercent: "random(-200, 200)",
              rotation: "random(-20, 20)",
              ease: "back.out(1.2)",
              scrollTrigger: {
                trigger: char,
                containerAnimation: scrollTween,
                start: "left 100%",
                end: "left 30%",
                scrub: 1,
              },
            });
          });
        }
      }

      // Reduced motion → leave the card flat/static (marquee stays put).
      if (reduced) return;

      // ---- Scroll assist ----
      // As you arrive at the Location section, gently glide it into a full,
      // screen-framed view. ScrollSmoother.scrollTo(target, true, ...) eases
      // with the smoother's own inertia, so it ramps up to speed and settles
      // softly. IntersectionObserver is the trigger (a ScrollTrigger onEnter is
      // unreliable under ScrollSmoother here). A short scroll-velocity tracker
      // lets a hard, fast scroll blow straight past without being grabbed.
      let lastY = window.scrollY;
      let lastT = performance.now();
      let vel = 0;
      const onScroll = () => {
        const now = performance.now();
        const y = window.scrollY;
        const dt = now - lastT;
        if (dt > 0) vel = ((y - lastY) / dt) * 1000;
        lastY = y;
        lastT = now;
      };
      window.addEventListener("scroll", onScroll, { passive: true });

      let armed = true; // re-arms once you leave the zone
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) {
              armed = true;
              continue;
            }
            if (!armed) continue;
            if (Math.abs(vel) > 3200) continue; // let fast scroll-throughs pass
            armed = false;
            const sm = ScrollSmoother.get();
            if (sm) sm.scrollTo(stageEl, true, "center center");
          }
        },
        // fire when the section's top reaches ~75% down the viewport
        { rootMargin: "0px 0px -25% 0px", threshold: 0 },
      );
      io.observe(stageEl);
      const cleanupAssist = () => {
        io.disconnect();
        split?.revert();
        window.removeEventListener("scroll", onScroll);
      };

      const MAX_ROT = 4; // degrees at the edges — gentle tilt

      // Hover → the widget grows via a pure transform scale. Transforms are
      // GPU-composited and never touch layout, so the page doesn't reflow (no
      // jitter) and the full-bleed marquee behind it is left completely alone.
      // (A width animation reflowed the page every frame, which is what was
      // resizing the word-art and jittering the site.)
      const grow = (on: boolean) =>
        gsap.to(cardEl, {
          scale: on ? 1.14 : 1,
          duration: 0.5,
          ease: "power3.out",
          overwrite: "auto",
        });

      // "WE'RE HERE" heading: GSAP-controlled so it stays centred at rest and
      // glides to the top-right edge on hover (left:100% tracks the widening
      // card; xPercent:-100 + x pulls it just inside the right border).
      const headEl = cardEl.querySelector<HTMLElement>(".loc-heading");
      if (headEl) gsap.set(headEl, { left: "50%", xPercent: -50, z: 80 });
      const moveHead = (on: boolean) => {
        if (!headEl) return;
        gsap.to(headEl, {
          left: on ? "100%" : "50%",
          xPercent: on ? -100 : -50,
          x: on ? -22 : 0,
          duration: 0.55,
          ease: "power2.out",
          overwrite: "auto",
        });
      };

      const rotX = gsap.quickTo(cardEl, "rotationX", {
        duration: 0.6,
        ease: "power3",
      });
      const rotY = gsap.quickTo(cardEl, "rotationY", {
        duration: 0.6,
        ease: "power3",
      });
      const moveX = layers.map((l) =>
        gsap.quickTo(l, "x", { duration: 0.7, ease: "power3" }),
      );
      const moveY = layers.map((l) =>
        gsap.quickTo(l, "y", { duration: 0.7, ease: "power3" }),
      );

      const onEnter = () => {
        grow(true); // hover → smooth scale-up (no reflow)
        moveHead(true); // heading slides to top-right
      };
      const onMove = (e: PointerEvent) => {
        const r = stageEl.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5; // -0.5 … 0.5
        const py = (e.clientY - r.top) / r.height - 0.5;
        rotY(px * MAX_ROT * 2);
        rotX(-py * MAX_ROT * 2);
        layers.forEach((l, i) => {
          const depth = Number(l.dataset.depth ?? 0);
          moveX[i](px * depth);
          moveY[i](py * depth);
        });
      };

      const onLeave = () => {
        rotX(0);
        rotY(0);
        grow(false);
        moveHead(false); // heading back to centre
        moveX.forEach((f) => f(0));
        moveY.forEach((f) => f(0));
      };

      stageEl.addEventListener("pointerenter", onEnter);
      stageEl.addEventListener("pointermove", onMove);
      stageEl.addEventListener("pointerleave", onLeave);
      return () => {
        stageEl.removeEventListener("pointerenter", onEnter);
        stageEl.removeEventListener("pointermove", onMove);
        stageEl.removeEventListener("pointerleave", onLeave);
        cleanupAssist();
      };
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      {/* ---- "Where are we?" intro — full-bleed horizontal pinned scroll ---- */}
      <section className="where-horizontal relative ml-[calc(50%-50vw)] flex h-screen w-screen items-center overflow-hidden">
        <div className="where-track flex w-max flex-col items-center gap-[1.5vw] pl-[100vw]">
          <h3
            className="where-line nav-blackface flex w-max gap-[4vw] whitespace-nowrap text-[clamp(2rem,10vw,12rem)] leading-[1.1]"
            style={{ color: "var(--loc-text, #2463c3)" }}
          >
            Where are we?
          </h3>
          <p
            className="where-line nav-blackface flex w-max gap-[3vw] whitespace-nowrap text-[clamp(1rem,5vw,5.5rem)] leading-[1.1]"
            style={{ color: "var(--loc-text, #2463c3)" }}
          >
            Nasaan tayo?
          </p>
        </div>
      </section>

      <div
        ref={stage}
        id="location"
        className="relative flex w-full items-center justify-center px-6 py-28 text-ink"
        style={{ perspective: "1200px" }}
      >
      {/* ---- full-bleed "COME FIND US" marquee rows ---- */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-1/2 z-0 flex w-screen -translate-x-1/2 flex-col justify-center gap-0 overflow-hidden opacity-85"
      >
        {Array.from({ length: 6 }).map((_, row) => (
          <div key={row} className="flex-1 overflow-hidden">
            <div className="cfu-track flex h-full w-max items-center">
              {Array.from({ length: 8 }).map((_, j) => (
                // blue tile (sandwiches) + yellow tile (drinks) crossfade via
                // --art-blue / --art-yellow, which the Menu sets per tab
                <div key={j} className="relative h-full shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/media/word%20art/come-find-us-tile-purple.png"
                    alt=""
                    className="block h-full w-auto max-w-none select-none"
                    style={{ opacity: "var(--art-blue, 1)" }}
                    draggable={false}
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/media/word%20art/come-find-us-tile-yellow.png"
                    alt=""
                    className="absolute left-0 top-0 block h-full w-auto max-w-none select-none"
                    style={{ opacity: "var(--art-yellow, 0)" }}
                    draggable={false}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div
        ref={card}
        className="relative z-10 w-[min(90vw,520px)] rounded-[2rem] border-[6px] shadow-[0_18px_44px_rgba(0,0,0,0.45)]"
        style={{
          transformStyle: "preserve-3d",
          // same warm/purple gradient wash as the menu (and drinks) background
          background:
            "radial-gradient(135% 120% at 50% -10%, var(--wave-f0, #ffe06b) 0%, var(--wave-f1, #f5b13e) 70%, var(--wave-b1, #e89b2b) 100%)",
          borderColor: "#f6efdd",
          color: "var(--loc-text, #2463c3)",
        }}
      >
        {/* map face */}
        <div
          className="relative h-64 overflow-hidden rounded-t-[1.4rem] border-b-[6px] sm:h-72"
          style={{ borderBottomColor: "#f6efdd" }}
        >
          <iframe
            title="Map to Cafe Mama & Sons"
            className="loc-map pointer-events-none h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://maps.google.com/maps?q=${MAPS_QUERY}&z=16&output=embed`}
            style={{ filter: "saturate(1.08) sepia(0.12) brightness(1.01)" }}
          />

          {/* floating heading — centred at rest, slides to the top-right on
              hover. Not a tilt-layer; GSAP owns its transform. */}
          <h2
            className="loc-heading pointer-events-none absolute left-1/2 top-5 -translate-x-1/2 whitespace-nowrap font-arialblack text-4xl uppercase leading-none sm:text-5xl"
            style={{ textShadow: "4px 4px 0 #221a12" }}
          >
            We&apos;re Here!!
          </h2>
        </div>

        {/* info face */}
        <div className="px-7 py-6 sm:px-9">
          <div className="tilt-layer" data-z="50" data-depth="-8">
            <p className="font-body text-[0.7rem] font-bold uppercase tracking-[0.4em] opacity-80">
              The corner spot
            </p>
            <p className="mt-1 font-arialblack text-lg uppercase leading-tight sm:text-xl">
              {ADDRESS}
            </p>
          </div>

          <dl
            className="tilt-layer mt-5 divide-y divide-[var(--loc-text)]/35 border-y border-[var(--loc-text)]/35"
            data-z="30"
            data-depth="-8"
          >
            {HOURS.map((h) => (
              <div key={h.day} className="flex items-center justify-between py-2.5">
                <dt className="text-sm font-semibold uppercase tracking-widest opacity-70">
                  {h.day}
                </dt>
                <dd className="font-arialblack text-base tracking-tight">
                  {h.time}
                </dd>
              </div>
            ))}
          </dl>

          <div
            className="tilt-layer mt-6 flex flex-wrap gap-3"
            data-z="70"
            data-depth="-10"
          >
            {/* filled in the accent colour, label in the card-base colour */}
            <a
              href={DIRECTIONS}
              target="_blank"
              rel="noreferrer"
              className="rounded-full px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] transition-opacity hover:opacity-80"
              style={{
                backgroundColor: "var(--loc-text, #2463c3)",
                color: "var(--loc-card, #f4c33c)",
              }}
            >
              Get directions
            </a>
            {/* outlined in the accent colour, matching the text */}
            <a
              href="https://www.instagram.com/cafe_mama_sons/"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border-2 px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] transition-opacity hover:opacity-80"
              style={{
                borderColor: "var(--loc-text, #2463c3)",
                color: "var(--loc-text, #2463c3)",
              }}
            >
              @cafe_mama_sons
            </a>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * PREVIOUS LOCATION SECTION — the GSAP swipe-slider style two-panel reveal with
 * the progress dots on the right. Kept here (commented out) in case we want to
 * switch back. To restore: delete the active component above and uncomment this.
 * https://demos.gsap.com/demo/swipe-slider/
 * -------------------------------------------------------------------------- */
/*
// A heading split into per-character spans for the stagger reveal.
function Chars({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className}>
      {[...text].map((c, i) => (
        <span key={i} className="loc-char inline-block whitespace-pre">
          {c === " " ? " " : c}
        </span>
      ))}
    </span>
  );
}

export default function Location() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const slides = gsap.utils.toArray<HTMLElement>(".loc-slide");
      const N = slides.length;
      const bgs = slides.map((s) => s.querySelector<HTMLElement>(".loc-bg")!);
      const outers = slides.map((s) => s.querySelector<HTMLElement>(".loc-outer")!);
      const inners = slides.map((s) => s.querySelector<HTMLElement>(".loc-inner")!);
      const chars = slides.map((s) => s.querySelectorAll<HTMLElement>(".loc-char"));
      const dots = gsap.utils.toArray<HTMLElement>(".loc-dot");

      // Reduced motion → just three full-screen panels you scroll past normally.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(slides, { position: "relative" });
        gsap.set(el, { height: "auto" });
        return;
      }

      // stack the panels and clip every one but the first off-screen
      slides.forEach((s, i) => gsap.set(s, { zIndex: i }));
      gsap.set(outers, { yPercent: 100 });
      gsap.set(inners, { yPercent: -100 });
      gsap.set([outers[0], inners[0]], { yPercent: 0 });
      gsap.set(bgs.slice(1), { yPercent: 6 });
      chars.forEach((cs, i) => {
        if (i > 0) gsap.set(cs, { autoAlpha: 0, yPercent: 140 });
      });
      gsap.set(dots[0], { backgroundColor: "#fbd400", scale: 1.6 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "+=" + (N - 1) * 100 + "%",
          pin: true,
          scrub: 0.6,
          snap: { snapTo: 1 / (N - 1), duration: 0.35, ease: "power1.inOut" },
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const idx = Math.round(self.progress * (N - 1));
            dots.forEach((d, i) =>
              gsap.to(d, {
                backgroundColor: i === idx ? "#fbd400" : "rgba(34,26,18,0.3)",
                scale: i === idx ? 1.6 : 1,
                duration: 0.3,
                overwrite: true,
              }),
            );
          },
        },
      });

      for (let i = 1; i < N; i++) {
        const at = i - 1;
        tl.to(bgs[i - 1], { yPercent: -6, ease: "none", duration: 1 }, at)
          .to(outers[i], { yPercent: 0, ease: "power2.inOut", duration: 1 }, at)
          .to(inners[i], { yPercent: 0, ease: "power2.inOut", duration: 1 }, at)
          .to(bgs[i], { yPercent: 0, ease: "power2.inOut", duration: 1 }, at)
          .to(
            chars[i],
            {
              autoAlpha: 1,
              yPercent: 0,
              ease: "power2",
              duration: 0.7,
              stagger: { each: 0.02, from: "random" },
            },
            at + 0.25,
          );
      }
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      id="location"
      className="relative h-screen w-full overflow-hidden text-ink"
    >
      // progress dots
      <div className="pointer-events-none absolute right-5 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-3 sm:right-8">
        {[0, 1].map((i) => (
          <span
            key={i}
            className="loc-dot h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: "rgba(34,26,18,0.3)" }}
          />
        ))}
      </div>

      // ---- Slide 1 — full-bleed Google map ----
      <section className="loc-slide absolute inset-0">
        <div className="loc-outer absolute inset-0 overflow-hidden">
          <div className="loc-inner relative h-full w-full overflow-hidden bg-cream-deep">
            <div className="loc-bg absolute -top-[6%] left-0 h-[112%] w-full">
              <iframe
                title="Map to Cafe Mama & Sons"
                className="pointer-events-none h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=${MAPS_QUERY}&z=16&output=embed`}
                style={{ filter: "saturate(1.08) sepia(0.12) brightness(1.01)" }}
              />
            </div>
            // overlay (not parallaxed)
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-between py-24">
              <h2
                className="font-arialblack text-6xl uppercase leading-[0.82] text-sun sm:text-7xl lg:text-8xl"
                style={{ textShadow: "5px 5px 0 #221a12" }}
              >
                <Chars text="WE'RE HERE" />
              </h2>
              <div
                className="pointer-events-auto max-w-md rounded-2xl border-4 border-ink bg-cream/95 px-6 py-4 text-center"
                style={{ boxShadow: "6px 6px 0 #221a12" }}
              >
                <p className="font-body text-[0.7rem] font-bold uppercase tracking-[0.4em] text-tomato">
                  The corner spot
                </p>
                <p className="mt-1 font-arialblack text-lg uppercase leading-tight sm:text-xl">
                  {ADDRESS}
                </p>
                <a
                  href={DIRECTIONS}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block rounded-full bg-ink px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-cream transition-opacity hover:opacity-80"
                >
                  Get directions
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      // ---- Slide 2 — hours + directions ----
      <section className="loc-slide absolute inset-0">
        <div className="loc-outer absolute inset-0 overflow-hidden">
          <div className="loc-inner h-full w-full overflow-hidden">
            <div
              className="loc-bg absolute -top-[6%] left-0 flex h-[112%] w-full items-center justify-center"
              style={{ background: "#6c4a8f" }}
            >
              <div className="mx-auto grid w-full max-w-5xl items-center gap-10 px-6 sm:px-12 lg:grid-cols-2">
                <div>
                  <p className="font-body text-xs font-bold uppercase tracking-[0.5em] text-sun">
                    Opening hours
                  </p>
                  <h3
                    className="mt-3 font-arialblack text-6xl uppercase leading-[0.85] text-cream sm:text-7xl"
                    style={{ textShadow: "4px 4px 0 #221a12" }}
                  >
                    <Chars text="DROP BY" />
                  </h3>
                  <dl className="mt-8 max-w-sm divide-y divide-cream/20 border-y border-cream/20 text-cream">
                    {HOURS.map((h) => (
                      <div key={h.day} className="flex items-center justify-between py-3">
                        <dt className="text-sm font-semibold uppercase tracking-widest">
                          {h.day}
                        </dt>
                        <dd className="font-arialblack text-lg tracking-tight text-sun">
                          {h.time}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div
                  className="rounded-3xl border-4 border-ink bg-cream p-8"
                  style={{ boxShadow: "8px 8px 0 #221a12" }}
                >
                  <p className="font-arialblack text-2xl uppercase leading-tight">
                    {ADDRESS}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                    Coffee, sandos &amp; pastries — made by mama, served by the
                    sons.
                  </p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <a
                      href={DIRECTIONS}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-ink px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-cream transition-opacity hover:opacity-80"
                    >
                      Get directions
                    </a>
                    <a
                      href="https://www.instagram.com/cafe_mama_sons/"
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border-2 border-ink px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:bg-ink hover:text-cream"
                    >
                      @cafe_mama_sons
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
*/
