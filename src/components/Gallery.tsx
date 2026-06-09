"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

/**
 * Bento gallery, after https://codepen.io/GreenSock/pen/vYMzKZx — a mixed-size
 * photo grid at 80% width that scrolls vertically forever. Two identical bento
 * blocks are stacked and the track is translated up by exactly one block on a
 * seamless loop. Web-optimised placeholder snaps live in /media/gallery/web.
 */
const IMAGES = [
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

// Spans (in order) that tile a 4-column grid into a clean 5-row bento.
const SPANS = [
  "col-span-2 row-span-2",
  "col-span-2 row-span-1",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-2 row-span-2",
  "col-span-2 row-span-1",
  "col-span-2 row-span-1",
  "col-span-2 row-span-1",
];

function Bento({ hidden }: { hidden?: boolean }) {
  return (
    <div
      aria-hidden={hidden}
      className="grid grid-cols-4 gap-3 [grid-auto-rows:11.5vw] sm:gap-4"
    >
      {IMAGES.map((src, i) => (
        <div
          key={`${src}-${hidden ? "b" : "a"}`}
          className={`relative overflow-hidden rounded-xl border border-cream/10 ${SPANS[i]}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
      ))}
    </div>
  );
}

export default function Gallery() {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const el = track.current!;
      const block = el.children[0] as HTMLElement;
      const gap = parseFloat(getComputedStyle(el).rowGap) || 0;

      const loop = () => {
        gsap.killTweensOf(el);
        const dist = block.offsetHeight + gap; // exactly one block → seamless
        gsap.fromTo(
          el,
          { y: 0 },
          { y: -dist, ease: "none", duration: dist / 45, repeat: -1 }, // ~45px/s
        );
      };
      loop();

      // re-measure if the layout (vw-based rows) changes on resize
      window.addEventListener("resize", loop);
      return () => window.removeEventListener("resize", loop);
    },
    { scope: root },
  );

  return (
    <section
      id="gallery"
      ref={root}
      className="relative py-16 text-cream sm:py-20"
      style={{
        background:
          "radial-gradient(130% 120% at 50% 0%, #2e2114 0%, #221a12 55%, #140f08 100%)",
      }}
    >
      <div className="mx-auto mb-8 w-[80%] text-center">
        <p className="font-body text-xs font-bold uppercase tracking-[0.4em] text-peach">
          On the reel
        </p>
        <h2 className="mt-2 font-display text-5xl leading-[0.85] sm:text-6xl lg:text-7xl">
          THE GALLERY
        </h2>
      </div>

      {/* 80%-wide window; the bento track scrolls through it forever */}
      <div className="mx-auto h-[82vh] w-[80%] overflow-hidden rounded-2xl">
        <div
          ref={track}
          className="flex flex-col gap-3 will-change-transform sm:gap-4"
        >
          <Bento />
          <Bento hidden />
        </div>
      </div>
    </section>
  );
}
