"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";

gsap.registerPlugin(useGSAP, Draggable, InertiaPlugin);

/**
 * GallerySpin — a circular badge fixed bottom-right. A gallery photo fills the
 * circle and spins (GSAP), with "DON'T CLICK ME" curved gold text rotating in
 * sync, and a gold border to match the navbar. You can grab and spin it (drag
 * to rotate, with throw inertia). A tap plays the anime-wow SFX and swipes a
 * full-screen page in from the right with a horizontal, draggable gallery.
 */
const PHOTOS = [
  "DSCF2296",
  "DSC07056",
  "DSCF3015",
  "DSCF2298",
  "DSC07722",
  "DSCF2472",
  "DSCF3035",
  "DSC07739",
  "DSCF2995",
  "DSCF3052",
].map((n) => `/media/gallery/web/${n}-web.jpg`);

const GOLD = "#f4c33c";
type Slider = {
  update: () => void;
  destroy: () => void;
  target: number;
  isDragging: boolean;
};

export default function GallerySpin() {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const overlay = useRef<HTMLDivElement>(null);
  const sliderEl = useRef<HTMLDivElement>(null);
  const spinLayer = useRef<HTMLSpanElement>(null);
  const sfx = useRef<HTMLAudioElement>(null);
  const wasPaused = useRef(false);

  // cycle the photo filling the badge
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % PHOTOS.length), 2600);
    return () => clearInterval(t);
  }, []);

  // the navbar "Gallery" link opens the overlay via this event
  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("open-gallery", onOpen);
    return () => window.removeEventListener("open-gallery", onOpen);
  }, []);

  const activate = () => {
    const a = sfx.current;
    if (a) {
      a.currentTime = 0;
      a.volume = 0.7;
      a.play().catch(() => {});
    }
    setOpen(true);
  };

  // continuous auto-spin + drag-to-spin (throwable). Both drive the same GSAP
  // rotation so they don't fight (a CSS animation would).
  useGSAP(() => {
    // Park it off-screen AND make it visible (clearing the `invisible` class
    // used to suppress the first-paint flash). autoAlpha controls visibility, so
    // — unlike a CSS transform class — it doesn't pollute GSAP's xPercent base.
    gsap.set(overlay.current, { xPercent: 100, autoAlpha: 1 });
    const layer = spinLayer.current;
    if (!layer) return;

    const spin = () =>
      gsap.to(layer, { rotation: "+=360", duration: 8, ease: "none", repeat: -1 });
    let tween = spin();

    const [drag] = Draggable.create(layer, {
      type: "rotation",
      inertia: true,
      onPressInit() {
        tween.kill(); // hand control to the drag
      },
      onClick() {
        activate(); // fired only when it was a tap, not a spin
      },
      onRelease() {
        // resume the idle spin on every release that isn't a throw (a plain tap
        // fires no drag/throw callback, so this is what restarts it)
        if (!this.tween) tween = spin();
      },
      onThrowComplete() {
        tween = spin(); // throw settled → resume auto-spin
      },
    });

    return () => {
      drag.kill();
      tween.kill();
    };
  }, []);

  // swipe the overlay in/out and lock the page behind it while it's open
  useEffect(() => {
    const ov = overlay.current;
    if (!ov) return;
    const sm = ScrollSmoother.get?.();
    if (open) {
      if (sm) {
        wasPaused.current = sm.paused();
        sm.paused(true);
      }
      gsap.to(ov, { xPercent: 0, duration: 0.7, ease: "power3.inOut" });
    } else {
      gsap.to(ov, {
        xPercent: 100,
        duration: 0.6,
        ease: "power3.inOut",
        onComplete: () => sm?.paused(wasPaused.current),
      });
    }
  }, [open]);

  // spin up the horizontal slider while the page is open
  useEffect(() => {
    if (!open || !sliderEl.current) return;
    const el = sliderEl.current;
    let slider: Slider | undefined;
    let raf = 0;
    let killed = false;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Drive the slider directly off wheel/trackpad. ScrollSmoother intercepts
    // wheel in the capture phase at the document level, so a normal listener on
    // the slider never sees it — we listen on window in the CAPTURE phase (fires
    // first) and stop it reaching ScrollSmoother. Bigger deltas → faster.
    const onWheel = (e: WheelEvent) => {
      if (!slider) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      slider.target += delta * 0.0002;
    };
    window.addEventListener("wheel", onWheel, { passive: false, capture: true });

    (async () => {
      const { default: Core } = await import("smooothy");
      if (killed || !sliderEl.current) return;
      // speedDecay keeps a drag/flick's momentum coasting before it settles, so
      // throwing the strip speeds it up; snap:false lets it drift continuously.
      slider = new Core(el, {
        infinite: true,
        snap: false,
        speedDecay: 0.5,
        dragSensitivity: 0.002,
      }) as Slider;
      // Steady self-scroll — the strip cruises on its own and returns to this
      // speed after a drag/flick/wheel settles. Paused while actively dragging.
      // Negative SPEED so the content drifts from right to left (the strip
      // reads left-to-right as it scrolls past you, like film through a gate).
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
    <>
      {/* anime-wow sound */}
      <audio ref={sfx} src="/sfx/anime-wow.mp3" preload="auto" />

      {/* ---- spinnable badge ---- */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Don't click me"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            activate();
          }
        }}
        className="fixed bottom-6 right-6 z-[55] h-28 w-28 cursor-grab overflow-hidden rounded-full border-[3px] shadow-[0_8px_24px_rgba(0,0,0,0.45)] active:cursor-grabbing sm:h-32 sm:w-32"
        style={{ borderColor: GOLD }}
      >
        {/* spinning layer — photo + tint + curved text all rotate together */}
        <span ref={spinLayer} className="absolute inset-0 block">
          {/* photo fills the circle; oversized so corners never reveal a gap */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={idx}
            src={PHOTOS[idx]}
            alt="Café Mama & Sons — Filipino-Japanese café & bakery in Kentish Town, London"
            draggable={false}
            className="absolute left-1/2 top-1/2 h-[150%] w-[150%] max-w-none -translate-x-1/2 -translate-y-1/2 object-cover"
          />
          {/* dark tint so the gold text stays legible over any photo */}
          <span className="absolute inset-0 bg-black/45" />
          {/* curved text */}
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
            <defs>
              <path
                id="gs-ring"
                fill="none"
                d="M50,50 m-39,0 a39,39 0 1,1 78,0 a39,39 0 1,1 -78,0"
              />
            </defs>
            <text
              fontSize="11"
              letterSpacing="0.3"
              style={{ fill: GOLD, fontFamily: '"Arial Black","Arial Bold",sans-serif', fontWeight: 900 }}
            >
              <textPath href="#gs-ring" startOffset="0">
                DON&apos;T&nbsp;CLICK&nbsp;ME&nbsp;✦&nbsp;DON&apos;T&nbsp;CLICK&nbsp;ME&nbsp;✦&nbsp;
              </textPath>
            </text>
          </svg>
        </span>
      </div>

      {/* ---- swipe-in gallery page ---- */}
      {/* `invisible` hides it on the very first paint (before useGSAP runs) so
          the pink page never flashes on load. We use visibility rather than a
          transform class because GSAP's xPercent would otherwise inherit the
          class transform as a baseline and never fully slide back in. GSAP's
          gsap.set clears it via autoAlpha. */}
      <div
        ref={overlay}
        className="invisible fixed inset-0 z-[95] text-cream"
        style={{ background: "#FF1353" }}
      >
        {/* Close button floats over the strip so the JPG can fill the entire
            viewport edge-to-edge (top, bottom, both sides). Higher z than the
            slider so it stays clickable. */}
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute right-6 top-5 z-10 font-arialblack text-sm uppercase tracking-[0.2em] transition-opacity hover:opacity-70 sm:right-10 sm:text-base"
          style={{ color: GOLD }}
        >
          Close ✕
        </button>

        {/* smooothy horizontal slider — one designed magazine strip (a JPEG
            export of the gallery layout), rendered twice so smooothy's
            infinite mode has a second copy to wrap to without revealing a
            gap. h-full lets the slider fill the entire overlay so the JPG
            touches the top and bottom of the viewport. */}
        <div
          ref={sliderEl}
          data-slider
          className="flex h-full cursor-grab items-end overflow-hidden active:cursor-grabbing"
        >
          {[0, 1].map((i) => (
            // The img is the flex item directly — no aspect-ratio wrapper.
            // h-full pins it to the slider's height; w-auto + the JPG's
            // intrinsic 17300×1024 give it a natural width that matches
            // the source pixel-for-pixel. block strips inline whitespace so
            // the slide width is exactly the rendered image width (smooothy
            // measures via getBoundingClientRect on the slide).
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src="/gallery/gallery-strip.jpg"
              alt="Café Mama & Sons gallery — best sellers, the team, and the Kentish Town shop"
              loading="lazy"
              draggable={false}
              className="block h-full w-auto max-w-none shrink-0"
            />
          ))}
        </div>
      </div>
    </>
  );
}
