"use client";

import { useEffect, useState } from "react";

/**
 * Full-screen loading overlay: a cup (the sketch-style rounded trapezoid,
 * black outline) on the food-menu gold, filling bottom-up with the drinks
 * menu's ube purple. Motion follows Emil Kowalski's principles:
 *
 *  - The fill is REAL feedback, not decoration: it crawls to ~90% on a long
 *    decelerating curve while assets stream, then sprints to 100% with a
 *    short confident ease the moment the page is actually ready — so the
 *    animation's story matches what the browser is doing.
 *  - Custom cubic-beziers, nothing linear: crawl uses an easeOutQuint-style
 *    curve (fast early progress, long settle), completion uses
 *    cubic-bezier(0.32, 0.72, 0, 1) — his signature swift-in gentle-out.
 *  - The liquid surface is a gently looping wave (pure transform, GPU-only),
 *    disabled under prefers-reduced-motion.
 *
 * Ready = document `load` + hero <video> first frame, hard-capped at 6s so a
 * slow asset can never hold the user hostage.
 */

// Food-menu gold (--wave-f0 for the food palette in Menu.tsx).
const GOLD = "#fbd400";
// Food-menu accent — the pink/red used for menu text on gold.
const PINK = "#FF1353";
// Drinks-menu ube palette (--wave f0/f1/b1 for drinks in Menu.tsx).
const UBE_LIGHT = "#c4afe6";
const UBE = "#9b81c9";
const UBE_DEEP = "#7e63b0";

// Cup interior: top edge y=30, floor y=240 → 210 units of fill travel.
const FILL_TRAVEL = 210;

export default function LoadingScreen() {
  const [gone, setGone] = useState(false);
  const [fading, setFading] = useState(false);
  // 0 → empty cup, 1 → full. Drives a translateY on the liquid group.
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);

  // Kick the crawl on the first paint so the 4s CSS transition has a state
  // change to animate (0 → 0.9).
  useEffect(() => {
    const id = requestAnimationFrame(() => setProgress(0.9));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const heroReady = () =>
      new Promise<void>((resolve) => {
        const iv = window.setInterval(() => {
          const v = document.querySelector<HTMLVideoElement>("#top video");
          if (!v) return;
          window.clearInterval(iv);
          if (v.readyState >= 2) return resolve();
          v.addEventListener("loadeddata", () => resolve(), { once: true });
          v.addEventListener("canplay", () => resolve(), { once: true });
          v.addEventListener("error", () => resolve(), { once: true });
        }, 100);
        // stop polling for the element after 2s (static hero fallback)
        window.setTimeout(() => window.clearInterval(iv), 2000);
      });

    const docReady = () =>
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            window.addEventListener("load", () => resolve(), { once: true });
          });

    const hardCap = new Promise<void>((resolve) =>
      window.setTimeout(resolve, 6000),
    );

    Promise.race([Promise.all([docReady(), heroReady()]), hardCap]).then(() => {
      if (cancelled) return;
      // Sprint the fill to 100% (0.45s), let the full cup register for a
      // beat, then fade the overlay away.
      setReady(true);
      setProgress(1);
      window.setTimeout(() => {
        if (cancelled) return;
        setFading(true);
        window.setTimeout(() => setGone(true), 400);
      }, 650);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (gone) return null;

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[9998] flex flex-col items-center justify-center gap-8 transition-opacity duration-[400ms] ease-out ${fading ? "pointer-events-none opacity-0" : "opacity-100"}`}
      style={{ backgroundColor: GOLD }}
    >
      <svg
        width="150"
        height="195"
        viewBox="0 0 200 260"
        fill="none"
        className="block"
      >
        <defs>
          {/* Ube gradient — light at the surface, deep at the cup floor. */}
          <linearGradient id="ls-ube" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={UBE_LIGHT} />
            <stop offset="55%" stopColor={UBE} />
            <stop offset="100%" stopColor={UBE_DEEP} />
          </linearGradient>
          {/* Interior of the cup, inset from the outline so the liquid never
              bleeds over the stroke. */}
          <clipPath id="ls-cup-clip">
            <path d="M44 28 L156 28 L143 234 Q142 241 135 242 Q100 246 65 242 Q58 241 57 234 Z" />
          </clipPath>
        </defs>

        {/* Liquid — a group that rises with progress. Inside it, a
            double-width wave strip loops horizontally (transform-only) so the
            surface reads as liquid, not a rising rectangle. */}
        <g clipPath="url(#ls-cup-clip)">
          <g
            style={{
              transform: `translateY(${(1 - progress) * FILL_TRAVEL}px)`,
              // Crawl: long decelerating ease (fast early, gentle settle).
              // Completion: Kowalski's swift cubic-bezier(0.32,0.72,0,1).
              transition: ready
                ? "transform 0.45s cubic-bezier(0.32, 0.72, 0, 1)"
                : "transform 4s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {/* Wave surface + body. Path starts at the cup's top (y=22 in
                group space) so translateY(0) = full cup. 400 wide = two wave
                periods; the loop shifts it -200px for a seamless cycle. */}
            <path
              className="ls-wave"
              d="M0 30 Q 25 22 50 30 T 100 30 T 150 30 T 200 30 T 250 30 T 300 30 T 350 30 T 400 30 V 300 H 0 Z"
              fill="url(#ls-ube)"
            />
          </g>
        </g>

        {/* Cup outline — drawn AFTER the liquid so the stroke stays crisp on
            top. Rounded trapezoid matching the brand sketch. */}
        <path
          d="M40 22 Q36 22 36.5 28 L50 236 Q51 245 60 246 Q100 251 140 246 Q149 245 150 236 L163.5 28 Q164 22 160 22 Q100 15 40 22 Z"
          stroke="#000"
          strokeWidth="7"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>

      <span
        className="font-arialblack text-[11px] uppercase tracking-[0.5em] sm:text-xs"
        style={{ color: PINK }}
      >
        Now brewing
      </span>

      <style>{`
        .ls-wave {
          animation: ls-wave-x 2.2s linear infinite;
          will-change: transform;
        }
        @keyframes ls-wave-x {
          from { transform: translateX(0); }
          to   { transform: translateX(-200px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .ls-wave { animation: none; }
        }
      `}</style>
    </div>
  );
}
