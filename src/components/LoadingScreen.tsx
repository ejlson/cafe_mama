"use client";

import { useEffect, useState } from "react";
import { cldUrl } from "@/lib/cloudinary";

/**
 * Full-screen loading overlay: a jug pours ube (drinks-menu purple) into a
 * wide, round sketch-style cup on the food-menu gold, with the square Cafe
 * Mama logo printed on the glass and a three-dot loading indicator beneath.
 *
 * Motion (per Emil Kowalski's standards, .agents/skills/review-animations):
 *  - The fill is real feedback: crawls to ~90% on a long ease-out while
 *    assets stream, sprints to 100% with cubic-bezier(0.32,0.72,0,1) when
 *    the page is actually ready. Then the stream shuts off (scaleY from the
 *    spout), the jug rights itself, and the overlay fades.
 *  - Constant motions (jug bob, dot pulse) are gentle and loop linearly;
 *    everything else is transform/opacity only.
 *  - prefers-reduced-motion: bob/dots/stream-wiggle stop; the fill (which
 *    communicates progress) remains.
 */

const GOLD = "#fbd400"; // food-menu background
const PINK = "#FF1353"; // food-menu accent
const UBE_LIGHT = "#c4afe6"; // drinks-menu palette
const UBE = "#9b81c9";
const UBE_DEEP = "#7e63b0";

// Cup interior: top y=76, floor ~y=282 → fill travel in viewBox units.
const FILL_TRAVEL = 204;

const LOGO_URL = cldUrl("/media/logo/CAFE MAMA SQUARE LOGO.png");

export default function LoadingScreen() {
  const [gone, setGone] = useState(false);
  const [fading, setFading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);

  // Kick the crawl on first paint so the long transition has a state change.
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
      setReady(true);
      setProgress(1);
      window.setTimeout(() => {
        if (cancelled) return;
        setFading(true);
        window.setTimeout(() => setGone(true), 400);
      }, 700);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (gone) return null;

  return (
    <div
      aria-hidden
      data-ready={ready || undefined}
      className={`ls-root fixed inset-0 z-[9998] flex flex-col items-center justify-center gap-6 transition-opacity duration-[400ms] ease-out ${fading ? "pointer-events-none opacity-0" : "opacity-100"}`}
      style={{ backgroundColor: GOLD }}
    >
      <div className="relative">
        <svg width="230" height="283" viewBox="0 0 260 320" fill="none">
          <defs>
            <linearGradient id="ls-ube" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={UBE_LIGHT} />
              <stop offset="55%" stopColor={UBE} />
              <stop offset="100%" stopColor={UBE_DEEP} />
            </linearGradient>
            {/* Cup interior — hugs the stroke's inner edge so the liquid
                meets the outline with no yellow gap. */}
            <clipPath id="ls-cup-clip">
              <path d="M53 76 L207 76 L196 264 Q195 277 182 278.5 Q130 284 78 278.5 Q65 277 64 264 Z" />
            </clipPath>
          </defs>

          {/* Liquid — rises with progress; wavy surface loops horizontally. */}
          <g clipPath="url(#ls-cup-clip)">
            <g
              style={{
                transform: `translateY(${(1 - progress) * FILL_TRAVEL}px)`,
                transition: ready
                  ? "transform 0.45s cubic-bezier(0.32, 0.72, 0, 1)"
                  : "transform 4s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <path
                className="ls-wave"
                d="M0 78 Q 25 70 50 78 T 100 78 T 150 78 T 200 78 T 250 78 T 300 78 T 350 78 T 400 78 V 400 H 0 Z"
                fill="url(#ls-ube)"
              />
            </g>
          </g>

          {/* Pour stream — collapses from the spout when ready. */}
          <path
            className="ls-stream"
            d="M150 30 L162 30 L158 120 Q154 128 150 120 Z"
            fill="url(#ls-ube)"
          />

          {/* Jug — tilted top-right, gently bobbing while it pours; rights
              itself when the cup is full. transform-box keeps the rotation
              origin on the jug itself. */}
          <g className="ls-jug" transform="translate(150 36)">
            <g className="ls-jug-tilt">
              <path
                d="M0 0 L12 -10 L52 -10 Q62 -10 62 0 L62 30 Q62 40 52 40 L10 40 Q0 40 0 30 Z"
                fill={GOLD}
                stroke="#000"
                strokeWidth="7"
                strokeLinejoin="round"
              />
              <path
                d="M62 4 Q80 8 77 19 Q74 30 62 27"
                fill="none"
                stroke="#000"
                strokeWidth="7"
                strokeLinecap="round"
              />
            </g>
          </g>

          {/* Cup outline — wide, round, drawn last so the stroke stays crisp. */}
          <path
            d="M52 68 Q44 68 44.8 76 L56 266 Q57 280 71 282 Q130 288 189 282 Q203 280 204 266 L215.2 76 Q216 68 208 68 Q130 61 52 68 Z"
            stroke="#000"
            strokeWidth="8"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>

        {/* Square Cafe Mama logo, printed on the glass. */}
        <span
          className="absolute left-1/2 top-[58%] h-[72px] w-[72px] -translate-x-1/2 -translate-y-1/2"
          style={{
            backgroundColor: "#000",
            opacity: 0.82,
            WebkitMaskImage: `url(${LOGO_URL})`,
            maskImage: `url(${LOGO_URL})`,
            WebkitMaskSize: "contain",
            maskSize: "contain",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center",
          }}
        />
      </div>

      {/* Three-dot loading indicator. */}
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="ls-dot h-[9px] w-[9px] rounded-full"
            style={{ backgroundColor: PINK, animationDelay: `${i * 160}ms` }}
          />
        ))}
      </div>

      <style>{`
        .ls-wave {
          animation: ls-wave-x 2.2s linear infinite;
          will-change: transform;
        }
        @keyframes ls-wave-x {
          from { transform: translateX(0); }
          to   { transform: translateX(-200px); }
        }
        /* Jug: slow, tiny rock around the pouring tilt. */
        .ls-jug-tilt {
          transform: rotate(-32deg);
          transform-box: fill-box;
          transform-origin: 20% 80%;
          animation: ls-jug-bob 2.6s ease-in-out infinite;
          transition: transform 0.5s cubic-bezier(0.32, 0.72, 0, 1);
        }
        @keyframes ls-jug-bob {
          0%, 100% { transform: rotate(-32deg); }
          50%      { transform: rotate(-29deg); }
        }
        /* Stream: anchored at the spout; collapses downward when done. */
        .ls-stream {
          transform-box: fill-box;
          transform-origin: top;
          transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.3s ease-out;
        }
        /* Ready: shut off the pour, right the jug. */
        .ls-root[data-ready] .ls-stream { transform: scaleY(0); opacity: 0; }
        .ls-root[data-ready] .ls-jug-tilt { animation: none; transform: rotate(-12deg); }
        .ls-dot {
          animation: ls-dot-pulse 1.2s ease-in-out infinite;
        }
        @keyframes ls-dot-pulse {
          0%, 100% { opacity: 0.25; transform: translateY(0); }
          35%      { opacity: 1;    transform: translateY(-3px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .ls-wave, .ls-jug-tilt, .ls-dot { animation: none; }
        }
      `}</style>
    </div>
  );
}
