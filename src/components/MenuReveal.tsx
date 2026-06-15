"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { Observer } from "gsap/Observer";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother, Observer);

/**
 * Full-screen "dynamic morphing" transition between the hero and the menu.
 *
 * Adapted from Blake Bowen's Shape Overlays (codepen.io/osublake/pen/BYwgBg):
 * the wave is built from NUM_POINTS control points that each animate on their
 * own random delay, so the silhouette keeps changing shape across the sweep.
 *
 * The hero (#top) is a separate fixed layer and the menu is the scroll content,
 * so they never overlap in the flow. The transition freezes the page, sweeps
 * the wave up to cover, swaps which layer is shown UNDER the cover, then sweeps
 * away — so neither section ever appears before its animation. It's a reversible
 * toggle driven by GSAP Observer (raw wheel/touch → instant), and the navbar
 * links / button feed into the same transition.
 */
const NUM_POINTS = 10;
const SEG = (1 / (NUM_POINTS - 1)) * 100;

// Fill BELOW the wavy line: points near 0 → line high → screen covered;
// points at 100 → line at the bottom → uncovered.
function buildPath(points: number[]) {
  let d = `M 0 ${points[0]} C`;
  for (let j = 0; j < NUM_POINTS - 1; j++) {
    const p = (j + 1) * SEG;
    const cp = p - SEG / 2;
    d += ` ${cp} ${points[j]} ${cp} ${points[j + 1]} ${p} ${points[j + 1]}`;
  }
  return d + ` V 100 H 0 Z`;
}

export default function MenuReveal() {
  const rootRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<SVGPathElement>(null);
  const backRef = useRef<SVGPathElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useGSAP(
    () => {
      const heroEl = document.querySelector<HTMLElement>("#top");
      const layers = [
        { el: backRef.current, pts: new Array(NUM_POINTS).fill(100) },
        { el: frontRef.current, pts: new Array(NUM_POINTS).fill(100) },
      ];
      const render = () =>
        layers.forEach((l) => l.el?.setAttribute("d", buildPath(l.pts)));
      render();

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const sm = () => ScrollSmoother.get();
      let at: "hero" | "menu" = "hero";
      let busy = false;

      // Start on the hero: it's shown, the menu scroll is locked behind it.
      sm()?.paused(true);

      // The hero "Menu ⌄" cue must only ever be visible on the hero. overwrite
      // ensures the latest show/hide wins, so a rapid hero↔menu gesture (e.g.
      // trackpad momentum firing onDown+onUp) can't leave a stale show running.
      const showBtn = () =>
        gsap.to(btnRef.current, { autoAlpha: 1, duration: 0.4, overwrite: true });
      const hideBtn = () =>
        gsap.to(btnRef.current, { autoAlpha: 0, duration: 0.2, overwrite: true });

      // A quick staggered sweep of every point to `target` (0 = cover, 100 =
      // uncover) — each point on its own random delay so the shape keeps morphing.
      const sweep = (target: number) => {
        const tl = gsap.timeline({
          onUpdate: render,
          defaults: { ease: "power2.inOut", duration: 0.4 },
        });
        const pd = Array.from(
          { length: NUM_POINTS },
          (_, j) => (j / (NUM_POINTS - 1)) * 0.1 + Math.random() * 0.14,
        );
        layers.forEach((layer, i) => {
          const pathDelay = 0.1 * (target === 0 ? i : layers.length - 1 - i);
          layer.pts.forEach((_, j) => {
            tl.to(layer.pts, { [j]: target }, pd[j] + pathDelay);
          });
        });
        return tl;
      };

      // Freeze → cover → swap layers (under cover) → uncover. The page stays
      // frozen the whole time, so a section only appears once it's uncovered.
      const transition = (swap: () => void, done: () => void) => {
        busy = true;
        if (rootRef.current) rootRef.current.style.pointerEvents = "auto";
        sm()?.paused(true);
        gsap
          .timeline({
            onComplete: () => {
              if (rootRef.current) rootRef.current.style.pointerEvents = "none";
              busy = false;
              done();
            },
          })
          .add(sweep(0))
          .add(swap)
          .to({}, { duration: 0.05 })
          .add(sweep(100));
      };

      const goToMenu = (after?: () => void) => {
        if (busy || at !== "hero") return;
        hideBtn();
        if (reduce) {
          gsap.set(heroEl, { autoAlpha: 0 });
          sm()?.paused(false);
          at = "menu";
          after?.();
          return;
        }
        transition(
          () => {
            gsap.set(heroEl, { autoAlpha: 0 }); // reveal the menu beneath
            hideBtn(); // make sure the cue is gone the instant the menu appears
            sm()?.scrollTo(0, false);
            window.dispatchEvent(new Event("menu:reveal")); // play the menu's entrance
          },
          () => {
            at = "menu";
            sm()?.paused(false); // unlock menu scrolling
            after?.();
          },
        );
      };

      const goToHero = () => {
        if (busy || at !== "menu") return;
        if (reduce) {
          sm()?.scrollTo(0, false);
          gsap.set(heroEl, { autoAlpha: 1 });
          sm()?.paused(true);
          at = "hero";
          showBtn();
          return;
        }
        transition(
          () => {
            sm()?.scrollTo(0, false);
            gsap.set(heroEl, { autoAlpha: 1 }); // bring the hero back
          },
          () => {
            at = "hero";
            sm()?.paused(true); // lock behind the hero again
            showBtn();
          },
        );
      };

      // Raw wheel/touch — instant, before the page can move.
      const obs = Observer.create({
        target: window,
        type: "wheel,touch",
        tolerance: 8,
        onDown: () => {
          if (at === "hero" && !busy) goToMenu();
        },
        onUp: () => {
          const top = (sm()?.scrollTop() ?? 0) <= 4;
          if (at === "menu" && !busy && top) goToHero();
        },
      });

      // Button + any in-page nav link route through the same transition.
      const onClick = () => goToMenu();
      btnRef.current?.addEventListener("click", onClick);

      const onAnchor = (e: MouseEvent) => {
        const a = (e.target as Element).closest?.('a[href^="#"]');
        if (!a) return;
        const href = a.getAttribute("href") || "";
        if (href === "#top") {
          e.preventDefault();
          goToHero();
          return;
        }
        if (href.length > 1) {
          const target = document.querySelector<HTMLElement>(href);
          if (!target) return;
          e.preventDefault();
          if (at === "hero") goToMenu(() => sm()?.scrollTo(target, true, "top top"));
          else sm()?.scrollTo(target, true, "top top");
        }
      };
      document.addEventListener("click", onAnchor);

      return () => {
        obs.kill();
        btnRef.current?.removeEventListener("click", onClick);
        document.removeEventListener("click", onAnchor);
      };
    },
    { scope: rootRef },
  );

  return (
    <>
      <div
        ref={rootRef}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[90]"
      >
        <svg
          className="block h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Stops follow the active menu palette (set by Menu) so the wave
                always matches the background it reveals. */}
            <linearGradient id="revealBack" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: "var(--wave-b0, #f5b13e)" }} />
              <stop offset="100%" style={{ stopColor: "var(--wave-b1, #e89b2b)" }} />
            </linearGradient>
            <linearGradient id="revealFront" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: "var(--wave-f0, #fbd400)" }} />
              <stop offset="100%" style={{ stopColor: "var(--wave-f1, #f5b13e)" }} />
            </linearGradient>
          </defs>
          <path ref={backRef} fill="url(#revealBack)" />
          <path ref={frontRef} fill="url(#revealFront)" />
        </svg>
      </div>

      {/* Minimal "enter" cue, low-centre of the hero — matched to the navbar
          (gold Arial Black). The arrow only bounces on hover. */}
      <button
        ref={btnRef}
        type="button"
        className="group fixed bottom-3 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 text-[#f4c33c]"
      >
        <span className="nav-blackface text-lg uppercase tracking-wide sm:text-xl">
          Menu
        </span>
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          className="group-hover:animate-bounce"
          style={{ filter: "drop-shadow(2px 2px 0 #000)" }}
        >
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </>
  );
}
