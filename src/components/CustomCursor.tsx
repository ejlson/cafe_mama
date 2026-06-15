"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

/**
 * Custom cursor — a small gold dot that tracks the pointer precisely with a
 * larger ring trailing behind it; the ring swells over links/buttons. Lives at
 * the top level (outside ScrollSmoother) so fixed positioning maps to the
 * viewport. Fine-pointer / hover devices only; the native cursor is hidden via
 * the `has-custom-cursor` class on <html>.
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const dot = dotRef.current!;
    const ring = ringRef.current!;

    document.documentElement.classList.add("has-custom-cursor");
    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, autoAlpha: 0 });

    const dx = gsap.quickTo(dot, "x", { duration: 0.1, ease: "power3" });
    const dy = gsap.quickTo(dot, "y", { duration: 0.1, ease: "power3" });
    const rx = gsap.quickTo(ring, "x", { duration: 0.35, ease: "power3" });
    const ry = gsap.quickTo(ring, "y", { duration: 0.35, ease: "power3" });

    let shown = false;
    const move = (e: PointerEvent) => {
      if (!shown) {
        shown = true;
        gsap.to([dot, ring], { autoAlpha: 1, duration: 0.2 });
      }
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
    };
    // Hide when the pointer leaves the window so the ring/dot never get stranded
    // at a corner (e.g. when reaching for the menu bar). `move` re-shows it on
    // re-entry. Without this the gold-on-gold ring reads as a stray white dot.
    const hideCursor = () => {
      shown = false;
      gsap.to([dot, ring], { autoAlpha: 0, duration: 0.2 });
    };
    const isInteractive = (t: EventTarget | null) =>
      t instanceof Element && t.closest("a, button, [data-cursor]");
    const over = (e: PointerEvent) => {
      if (isInteractive(e.target))
        gsap.to(ring, { scale: 1.8, duration: 0.25, ease: "power3" });
    };
    const out = (e: PointerEvent) => {
      if (isInteractive(e.target))
        gsap.to(ring, { scale: 1, duration: 0.25, ease: "power3" });
    };

    window.addEventListener("pointermove", move);
    document.addEventListener("pointerover", over);
    document.addEventListener("pointerout", out);
    document.documentElement.addEventListener("pointerleave", hideCursor);
    window.addEventListener("blur", hideCursor);
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", over);
      document.removeEventListener("pointerout", out);
      document.documentElement.removeEventListener("pointerleave", hideCursor);
      window.removeEventListener("blur", hideCursor);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  });

  return (
    <>
      {/* opacity-0 by default so they never show at 0,0 on coarse-pointer
          devices (where the cursor JS bails before hiding them) */}
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-8 w-8 rounded-full border-2 border-sun opacity-0"
      />
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-2 w-2 rounded-full bg-sun opacity-0"
      />
    </>
  );
}
