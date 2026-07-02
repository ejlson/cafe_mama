"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { cldUrl } from "@/lib/cloudinary";

/**
 * GalleryOverlay — the swipe-in horizontal gallery page, opened by the navbar
 * "Gallery" link via the `open-gallery` custom event. The floating badge that
 * used to live here has been replaced by the W4W teardrop (see W4WBadge).
 * The swipe is a CSS transform transition driven by the `open` state, so it
 * doesn't race with React on first mount the way a GSAP tween did.
 */
const GOLD = "#f4c33c";

type Slider = {
  update: () => void;
  destroy: () => void;
  target: number;
  isDragging: boolean;
};

export default function GalleryOverlay() {
  const [open, setOpen] = useState(false);
  const sliderEl = useRef<HTMLDivElement>(null);
  const wasPaused = useRef(false);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("open-gallery", onOpen);
    return () => window.removeEventListener("open-gallery", onOpen);
  }, []);

  // Pause the smooth scroller under the overlay while it's open.
  useEffect(() => {
    const sm = ScrollSmoother.get?.();
    if (open) {
      if (sm) {
        wasPaused.current = sm.paused();
        sm.paused(true);
      }
    } else {
      sm?.paused(wasPaused.current);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !sliderEl.current) return;
    const el = sliderEl.current;
    let slider: Slider | undefined;
    let raf = 0;
    let killed = false;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Drive the slider directly off wheel/trackpad. ScrollSmoother intercepts
    // wheel in the capture phase at the document level, so a normal listener on
    // the slider never sees it — we listen on window in the CAPTURE phase and
    // stop it reaching ScrollSmoother.
    const onWheel = (e: WheelEvent) => {
      if (!slider) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      const delta =
        Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      slider.target += delta * 0.0002;
    };
    window.addEventListener("wheel", onWheel, { passive: false, capture: true });

    (async () => {
      const { default: Core } = await import("smooothy");
      if (killed || !sliderEl.current) return;
      slider = new Core(el, {
        infinite: true,
        snap: false,
        speedDecay: 0.5,
        dragSensitivity: 0.002,
      }) as Slider;
      // Steady self-scroll — the strip cruises on its own and returns to this
      // speed after a drag/flick/wheel settles. Negative so the content drifts
      // right-to-left like film through a gate.
      const SPEED = -0.0001;
      const loop = () => {
        if (slider && !reduce && !slider.isDragging) slider.target += SPEED;
        slider!.update();
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    })();

    return () => {
      killed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("wheel", onWheel, { capture: true });
      slider?.destroy();
    };
  }, [open]);

  return (
    <div
      className={`fixed inset-0 z-[95] text-cream transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] ${open ? "translate-x-0" : "translate-x-full"}`}
      style={{ background: "#FF1353" }}
      aria-hidden={!open}
    >
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="font-arialblack absolute right-6 top-5 z-10 text-sm uppercase tracking-[0.2em] transition-opacity hover:opacity-70 sm:right-10 sm:text-base"
        style={{ color: GOLD }}
      >
        Close ✕
      </button>

      <div
        ref={sliderEl}
        data-slider
        className="flex h-full cursor-grab items-end overflow-hidden active:cursor-grabbing"
      >
        {[0, 1].map((i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={cldUrl("/gallery/gallery-strip.jpg")}
            alt="Café Mama & Sons gallery — best sellers, the team, and the Kentish Town shop"
            loading="lazy"
            draggable={false}
            className="block h-full w-auto max-w-none shrink-0"
          />
        ))}
      </div>
    </div>
  );
}
