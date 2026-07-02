"use client";

import { useEffect, useState } from "react";
import { cldUrl } from "@/lib/cloudinary";

/**
 * Full-screen loading overlay shown until the page's critical assets have
 * settled. Fades away once EITHER:
 *   - document.readyState hits "complete" AND the hero <video> has fired
 *     `loadeddata` (first frame decoded), or
 *   - a safety timeout of 6s elapses (never hold the user hostage on a slow
 *     asset — the poster is fine to look at while things finish).
 *
 * Renders on top of everything (z-[9998], just under the CustomCursor's 9999)
 * with a warm cream background matching the brand so there's no jarring
 * white flash. A small dancing music-note logo + "Loading" caption keeps
 * the room from feeling empty.
 */
export default function LoadingScreen() {
  const [gone, setGone] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const finish = () => {
      if (cancelled) return;
      // 350ms fade — matches the fade-in on hero content, so nothing feels
      // hard-swapped in.
      setFading(true);
      window.setTimeout(() => setGone(true), 350);
    };

    const heroReady = () =>
      new Promise<void>((resolve) => {
        const done = () => {
          window.clearInterval(iv);
          resolve();
        };
        // Poll for the hero video element (it mounts client-side inside
        // TvHero). Once we find it, watch loadeddata; if it already has
        // enough data, resolve immediately.
        const iv = window.setInterval(() => {
          const v = document.querySelector<HTMLVideoElement>("#top video");
          if (!v) return;
          window.clearInterval(iv);
          if (v.readyState >= 2) return done();
          v.addEventListener("loadeddata", done, { once: true });
          v.addEventListener("canplay", done, { once: true });
          v.addEventListener("error", done, { once: true });
        }, 100);
        // give up polling for the element itself after 2s (SPA / static hero)
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

    Promise.race([Promise.all([docReady(), heroReady()]), hardCap]).then(
      finish,
    );

    return () => {
      cancelled = true;
    };
  }, []);

  if (gone) return null;

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[9998] flex flex-col items-center justify-center gap-6 bg-[#1a140e] transition-opacity duration-[350ms] ${fading ? "pointer-events-none opacity-0" : "opacity-100"}`}
    >
      {/* Bouncing music note — reuses the same mask/gold styling as the
          MusicToggle so the loading state feels like part of the same visual
          language. */}
      <span
        className="relative block h-12 w-12 animate-[note-bounce_1.1s_ease-in-out_infinite]"
        style={{
          WebkitMaskImage: `url(${cldUrl("/media/musical-note.png")})`,
          maskImage: `url(${cldUrl("/media/musical-note.png")})`,
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
          backgroundColor: "#f4c33c",
        }}
      />
      <span className="font-arialblack text-[10px] uppercase tracking-[0.5em] text-[#f4c33c] opacity-80 sm:text-xs">
        Now brewing
      </span>
      <style>{`
        @keyframes note-bounce {
          0%, 100% { transform: translateY(0) rotate(-8deg); }
          50%      { transform: translateY(-12px) rotate(6deg); }
        }
      `}</style>
    </div>
  );
}
