"use client";

import { useEffect, useState } from "react";
import { cldUrl } from "@/lib/cloudinary";

/**
 * Full-screen loading overlay: a tall, round sketch-style cup on the
 * food-menu gold filling with the drinks menu's ube purple, the square Cafe
 * Mama logo printed on the glass, and a three-dot loading indicator beneath.
 *
 * Motion (per .agents/skills/review-animations standards):
 *  - The fill is real feedback: crawls to ~90% on a long ease-out while
 *    assets stream, sprints to 100% with cubic-bezier(0.32,0.72,0,1) when
 *    the page is actually ready, then the overlay fades.
 *  - The liquid never drains to the very floor — the empty state rests a
 *    little way up the cup so it reads as a drink, not a stain.
 *  - Wave/dots are transform/opacity loops; stopped under
 *    prefers-reduced-motion while the informative fill remains.
 *
 * Ready = window `load` (all images/assets) + the hero <video> reporting
 * canplay (readyState ≥ 3), hard-capped at 12s so a stalled mobile
 * connection can't hold the page hostage forever.
 */

const GOLD = "#fbd400"; // food-menu background
const PINK = "#FF1353"; // food-menu accent
const UBE_LIGHT = "#c4afe6"; // drinks-menu palette
const UBE = "#9b81c9";
const UBE_DEEP = "#7e63b0";

// Cup interior: top y=76, floor y≈318. Travel is deliberately SHORTER than
// the interior (190 < 242) so the empty state leaves the surface ~50 units
// above the floor.
const FILL_TRAVEL = 190;

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

    // Hero video ready = canplay (readyState ≥ 3), not just first frame —
    // on slow mobile connections loadeddata could fire and still stall
    // into a black hero the moment the overlay dropped.
    const heroReady = () =>
      new Promise<void>((resolve) => {
        const iv = window.setInterval(() => {
          const v = document.querySelector<HTMLVideoElement>("#top video");
          if (!v) return;
          window.clearInterval(iv);
          if (v.readyState >= 3) return resolve();
          v.addEventListener("canplay", () => resolve(), { once: true });
          v.addEventListener("canplaythrough", () => resolve(), { once: true });
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
      window.setTimeout(resolve, 12000),
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
      className={`fixed inset-0 z-[9998] flex flex-col items-center justify-center gap-6 transition-opacity duration-[400ms] ease-out ${fading ? "pointer-events-none opacity-0" : "opacity-100"}`}
      style={{ backgroundColor: GOLD }}
    >
      <div className="relative">
        <svg width="220" height="304" viewBox="0 0 260 360" fill="none">
          <defs>
            <linearGradient id="ls-ube" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={UBE_LIGHT} />
              <stop offset="55%" stopColor={UBE} />
              <stop offset="100%" stopColor={UBE_DEEP} />
            </linearGradient>
            {/* Cup interior — hugs the stroke's inner edge so the liquid
                meets the outline with no gold gap. */}
            <clipPath id="ls-cup-clip">
              <path d="M53 76 L207 76 L196 304 Q195 317 182 318.5 Q130 324 78 318.5 Q65 317 64 304 Z" />
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
                d="M0 78 Q 25 70 50 78 T 100 78 T 150 78 T 200 78 T 250 78 T 300 78 T 350 78 T 400 78 V 440 H 0 Z"
                fill="url(#ls-ube)"
              />
            </g>
          </g>

          {/* Cup outline — tall, wide and round; drawn last so the stroke
              stays crisp over the liquid. */}
          <path
            d="M52 68 Q44 68 44.8 76 L56 306 Q57 320 71 322 Q130 328 189 322 Q203 320 204 306 L215.2 76 Q216 68 208 68 Q130 61 52 68 Z"
            stroke="#000"
            strokeWidth="8"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>

        {/* Square Cafe Mama logo, printed on the glass. */}
        <span
          className="absolute left-1/2 top-[55%] h-[76px] w-[76px] -translate-x-1/2 -translate-y-1/2"
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
        .ls-dot {
          animation: ls-dot-pulse 1.2s ease-in-out infinite;
        }
        @keyframes ls-dot-pulse {
          0%, 100% { opacity: 0.25; transform: translateY(0); }
          35%      { opacity: 1;    transform: translateY(-3px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .ls-wave, .ls-dot { animation: none; }
        }
      `}</style>
    </div>
  );
}
