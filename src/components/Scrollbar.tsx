"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother);

/**
 * Minimal Apple-style overlay scrollbar — just the thumb, no track. The native
 * bar is hidden (globals.css); this one reflects scroll progress, eases to
 * position via gsap.quickTo (a smooth, slightly bouncy follow on top of
 * ScrollSmoother), and fades out when scrolling stops.
 */
export default function Scrollbar() {
  const thumbRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const thumb = thumbRef.current;
    if (!thumb) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const INSET = 8;
    const setY = gsap.quickTo(thumb, "y", { duration: 0.45, ease: "power3.out" });
    const smoother = ScrollSmoother.get();
    let idle: number | undefined;
    let vh = window.innerHeight;
    let thumbH = 40;
    let last = -1;
    let max = 0;

    // maxScroll reads the document's scrollHeight — a forced layout. Cache it
    // here instead of paying that read every animation frame; re-measure on
    // resize and whenever ScrollTrigger recalculates layout (refresh fires
    // after images/fonts load and after the hero↔menu transitions).
    const measure = () => {
      vh = window.innerHeight;
      max = ScrollTrigger.maxScroll(window);
      const doc = max + vh;
      thumbH = Math.max(36, Math.round((vh / doc) * (vh - INSET * 2)));
      thumb.style.height = `${thumbH}px`;
    };
    measure();
    ScrollTrigger.addEventListener("refresh", measure);

    // Show the thumb while scrolling, fade it ~1s after it stops — Apple-style.
    const tick = () => {
      const scroll = smoother ? smoother.scrollTop() : window.scrollY;
      const p = max > 0 ? Math.min(1, Math.max(0, scroll / max)) : 0;
      setY(p * (vh - thumbH - INSET * 2));
      if (Math.abs(scroll - last) > 0.5) {
        last = scroll;
        gsap.to(thumb, { autoAlpha: 1, duration: 0.2, overwrite: "auto" });
        if (idle) clearTimeout(idle);
        idle = window.setTimeout(
          () => gsap.to(thumb, { autoAlpha: 0, duration: 0.6 }),
          1000,
        );
      }
    };
    gsap.ticker.add(tick);
    const onResize = () => measure();
    window.addEventListener("resize", onResize);

    return () => {
      gsap.ticker.remove(tick);
      ScrollTrigger.removeEventListener("refresh", measure);
      window.removeEventListener("resize", onResize);
      if (idle) clearTimeout(idle);
    };
  });

  return (
    <div
      ref={thumbRef}
      aria-hidden
      className="pointer-events-none fixed right-1.5 top-2 z-[120] w-1.5 rounded-full opacity-0"
      style={{
        background: "rgba(120,120,120,0.6)",
        boxShadow: "0 0 0 0.5px rgba(255,255,255,0.15)",
        willChange: "transform",
      }}
    />
  );
}
