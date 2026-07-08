"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Draggable } from "gsap/Draggable";
import { CAFE_DESC } from "@/lib/menu-data";
import FullRule from "@/components/menu/FullRule";

gsap.registerPlugin(useGSAP, ScrollTrigger, Draggable);

/**
 * The one-line cafe description set as a giant justified block, with an
 * interactive word-physics layer: the cursor shoves words left/right, they
 * collide and slide their neighbours aside, then spring back home. Words can
 * also be dragged. Skipped on touch and under prefers-reduced-motion.
 */
export default function CafeDescription({ accent }: { accent: string }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const words = gsap.utils.toArray<HTMLElement>(".cafe-word", root.current);

      // Interactive physics: motion is horizontal-only. The cursor shoves words
      // left/right and they collide with each other (resolved along x) so they
      // slide their neighbours aside instead of overlapping, then spring back
      // home. Words can also be dragged left/right. Skip on touch / reduced.
      const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      const box = root.current?.querySelector<HTMLElement>(".cafe-box");
      if (reduce || !fine || !words.length || !box) return;

      const n = words.length;
      const dispX = new Array(n).fill(0); // physics target offset from home
      const dispY = new Array(n).fill(0);
      const renderX = new Array(n).fill(0); // smoothed offset actually drawn
      const velX = new Array(n).fill(0);
      const velY = new Array(n).fill(0);
      const lastTouch = new Array(n).fill(-1e9); // time of last interaction (s)
      const cx = new Array(n).fill(0); // home centre (relative to the h3 box)
      const cy = new Array(n).fill(0);
      const hw = new Array(n).fill(0); // half extents
      const hh = new Array(n).fill(0);
      const setX = words.map((w) => gsap.quickSetter(w, "x", "px"));
      const setY = words.map((w) => gsap.quickSetter(w, "y", "px"));

      // The bounded box (between the top & bottom rules) — words bounce off its
      // four walls. Measured each layout so it survives page scroll / resize.
      let boxW = 0;
      const measure = () => {
        const base = box.getBoundingClientRect();
        boxW = base.width;
        words.forEach((w, i) => {
          const dx = Number(gsap.getProperty(w, "x")) || 0;
          const dy = Number(gsap.getProperty(w, "y")) || 0;
          const r = w.getBoundingClientRect();
          cx[i] = r.left - base.left - dx + r.width / 2;
          cy[i] = r.top - base.top - dy + r.height / 2;
          hw[i] = r.width / 2;
          hh[i] = r.height / 2;
        });
      };
      measure();

      // Entrance: words SLIDE in horizontally from alternating sides as the
      // section scrolls into view (restores the slide-in that was dropped in
      // the Arial Black titles pass). Animates xPercent + autoAlpha, which
      // compose with the physics engine below — physics owns `x`, so the two
      // never fight. ease-out + 40ms stagger per the animation standards.
      gsap.from(words, {
        xPercent: (i) => (i % 2 === 0 ? -45 : 45),
        autoAlpha: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.04,
        scrollTrigger: { trigger: box, start: "top 85%", once: true },
      });

      const dragging = new Set<HTMLElement>();
      let clientX = -9999;
      let clientY = -9999;
      let hot = false;

      const SPRING = 0.05; // pull back home — gentle, so the return glides
      const DRIFT_FRICTION = 0.93; // decay while drifting → long, smooth float
      const HOME_FRICTION = 0.78; // strong damping while homing → no overshoot
      const R = 160; // cursor influence radius (px)
      const PUSH = 2.4; // cursor shove strength (accumulates, so keep it small)
      const RETURN_DELAY = 0.6; // seconds adrift before a word heads home
      const MAX_VEL = 8; // px/frame speed cap — keeps the slide unhurried
      const MAX_DISP = 600; // px — words may slide far enough to fill line gaps
      const BOUNCE = 0; // no rebound off the walls — they just glide to a stop
      const ITER = 5; // collision solver passes
      const GAP = 18; // min horizontal gap between words — keeps them legible
      const VFACT = 0.72; // shrink collision box vertically so lines don't touch
      const SMOOTH = 0.14; // render lerp toward the physics target → silky glide

      // --- Autonomous + scroll-driven sliding ---
      // Each word gets a fixed left/right bias. Scrolling shoves words along
      // that bias (an organic scatter, not a uniform shift), and a random timer
      // also nudges a random word every so often so they drift on their own.
      // Both just inject horizontal velocity — the existing drift + spring-home
      // then carries the slide out and eases the word back to its place.
      const slideBias = words.map(() => Math.random() * 2 - 1);
      let scrollDelta = 0;
      let lastSY = window.scrollY;
      const onScrollSlide = () => {
        scrollDelta += window.scrollY - lastSY;
        lastSY = window.scrollY;
      };
      window.addEventListener("scroll", onScrollSlide, { passive: true });
      let nextNudge = 2; // seconds — first self-slide fires ~2s in

      // Physics only runs while the description is on screen — the collision
      // solver is O(words²) per frame and used to run from page load onward,
      // even while the hero covered everything.
      let physicsVisible = false;
      const physIo = new IntersectionObserver(
        ([entry]) => {
          physicsVisible = entry?.isIntersecting ?? false;
        },
        { rootMargin: "80px" },
      );
      physIo.observe(box);

      const tick = (time: number) => {
        if (!physicsVisible) return;
        const base = box.getBoundingClientRect();
        const lx = clientX - base.left;
        const ly = clientY - base.top;

        // scroll shove — each word drifts by its own bias as you scroll
        if (scrollDelta !== 0) {
          for (let i = 0; i < n; i++) {
            if (dragging.has(words[i])) continue;
            velX[i] += scrollDelta * 0.06 * slideBias[i];
            lastTouch[i] = time; // let it drift before homing
          }
          scrollDelta = 0;
        }

        // random self-slide — shove one random word at random intervals
        if (time >= nextNudge) {
          nextNudge = time + 1.4 + Math.random() * 3.2; // 1.4–4.6s apart
          const k = Math.floor(Math.random() * n);
          if (!dragging.has(words[k])) {
            velX[k] += (Math.random() < 0.5 ? -1 : 1) * (2.5 + Math.random() * 3.5);
            lastTouch[k] = time;
          }
        }

        for (let i = 0; i < n; i++) {
          if (dragging.has(words[i])) {
            // Draggable owns this word — read its offset so it acts as a moving
            // obstacle for the others, and keep its return timer fresh.
            dispX[i] = Number(gsap.getProperty(words[i], "x")) || 0;
            dispY[i] = Number(gsap.getProperty(words[i], "y")) || 0;
            renderX[i] = dispX[i]; // track the drag so release glides on smoothly
            velX[i] = 0;
            velY[i] = 0;
            lastTouch[i] = time;
            continue;
          }
          let touched = false;
          if (hot) {
            const ddx = cx[i] + dispX[i] - lx;
            const ddy = cy[i] + dispY[i] - ly;
            const dd = Math.hypot(ddx, ddy) || 1;
            if (dd < R) {
              const f = 1 - dd / R;
              // shove horizontally away from the cursor (sign of ddx), strength
              // by proximity — pure left/right, never vertical.
              velX[i] += (ddx >= 0 ? 1 : -1) * f * PUSH;
              touched = true;
            }
          }
          if (touched) lastTouch[i] = time;

          // Drift freely just after a knock; only start springing home — and
          // shoving neighbours on the way — once it's been adrift a while.
          const homing = time - lastTouch[i] > RETURN_DELAY;
          if (homing) {
            velX[i] += -dispX[i] * SPRING;
          }
          const fr = homing ? HOME_FRICTION : DRIFT_FRICTION;
          velX[i] *= fr;
          velY[i] *= fr;

          // Cap speed so a knock can't fling a word.
          const sp = Math.hypot(velX[i], velY[i]);
          if (sp > MAX_VEL) {
            velX[i] *= MAX_VEL / sp;
            velY[i] *= MAX_VEL / sp;
          }
          dispX[i] += velX[i];
          dispY[i] += velY[i];

          // Cap distance from home so it never drifts off — bleed the outward
          // velocity when it hits the limit.
          const dm = Math.hypot(dispX[i], dispY[i]);
          if (dm > MAX_DISP) {
            const k = MAX_DISP / dm;
            dispX[i] *= k;
            dispY[i] *= k;
            velX[i] *= 0.4;
            velY[i] *= 0.4;
          }

          // Bounce off the left & right walls of the box (motion is horizontal).
          const lft = cx[i] + dispX[i] - hw[i];
          if (lft < 0) {
            dispX[i] -= lft;
            if (velX[i] < 0) velX[i] = -velX[i] * BOUNCE;
          }
          const rgt = cx[i] + dispX[i] + hw[i];
          if (rgt > boxW) {
            dispX[i] -= rgt - boxW;
            if (velX[i] > 0) velX[i] = -velX[i] * BOUNCE;
          }
        }

        // Resolve word-vs-word overlaps along the axis of least penetration.
        for (let it = 0; it < ITER; it++) {
          for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
              const ax = cx[i] + dispX[i];
              const ay = cy[i] + dispY[i];
              const bx = cx[j] + dispX[j];
              const by = cy[j] + dispY[j];
              const ox = hw[i] + hw[j] + GAP - Math.abs(ax - bx);
              const oy = (hh[i] + hh[j]) * VFACT - Math.abs(ay - by);
              if (ox <= 0 || oy <= 0) continue;
              const di = dragging.has(words[i]);
              const dj = dragging.has(words[j]);
              if (di && dj) continue;
              const mi = di ? 0 : dj ? 1 : 0.5;
              const mj = dj ? 0 : di ? 1 : 0.5;
              // resolve overlaps horizontally only — words stay on their line.
              const sgn = ax < bx ? 1 : -1;
              dispX[i] -= sgn * ox * mi;
              dispX[j] += sgn * ox * mj;
              velX[i] -= sgn * ox * 0.06 * mi;
              velX[j] += sgn * ox * 0.06 * mj;
            }
          }
        }

        for (let i = 0; i < n; i++) {
          if (dragging.has(words[i])) continue;
          // ease the drawn position toward the physics target — smooths the
          // start of every slide and any collision correction.
          renderX[i] += (dispX[i] - renderX[i]) * SMOOTH;
          setX[i](renderX[i]);
          setY[i](dispY[i]);
        }
      };
      gsap.ticker.add(tick);

      const el = root.current!;
      const onMove = (e: PointerEvent) => {
        clientX = e.clientX;
        clientY = e.clientY;
        hot = true;
      };
      const onLeave = () => {
        hot = false;
      };
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
      window.addEventListener("resize", measure);

      // Drag: grab a word and slide it left/right through the others; on release
      // the sim springs it back home.
      const draggables = words.flatMap((w) =>
        Draggable.create(w, {
          type: "x",
          inertia: false,
          onPress() {
            dragging.add(w);
          },
          onRelease() {
            dragging.delete(w);
          },
        }),
      );

      return () => {
        physIo.disconnect();
        gsap.ticker.remove(tick);
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
        window.removeEventListener("resize", measure);
        window.removeEventListener("scroll", onScrollSlide);
        draggables.forEach((d) => d.kill());
      };
    },
    { scope: root },
  );

  return (
    <div ref={root} className="relative mt-[15px]">
      {/* Bounded box — words bounce off its side edges and drift along the
          x axis (motion is horizontal-only, so vertical breathing room is
          purely cosmetic). Width is inherited from the menu wrapper so the
          description lines up with the menu rail above it. */}
      <div className="cafe-box">
        <h3
          aria-label={CAFE_DESC}
          style={{ color: accent }}
          className="font-cheee w-full text-justify uppercase [text-align-last:justify] text-2xl leading-[0.95] sm:text-[4.5vw]"
        >
          {CAFE_DESC.split(" ").map((word, wi) => (
            <span key={wi} aria-hidden>
              <span className="cafe-word inline-block cursor-grab touch-none select-none whitespace-nowrap will-change-transform active:cursor-grabbing">
                {word.split("").map((ch, ci) => (
                  <span key={ci} className="cafe-char inline-block">
                    {ch}
                  </span>
                ))}
              </span>{" "}
            </span>
          ))}
        </h3>
        <FullRule color={accent} className="mt-2" />
      </div>
    </div>
  );
}
