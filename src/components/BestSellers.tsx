"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cldUrl } from "@/lib/cloudinary";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * "OUR TOP SELLERS" — the drinks tab opener.
 *
 * Layout: "OUR" sits at the top-left in a smaller weight; "TOP" is the
 * dominant element below it; "SELLERS" sits to the right of TOP with its
 * baseline aligned to TOP's.  Each glyph carries its own small rotation so
 * the title reads like a row of party balloons; on first scroll-into-view
 * each one inflates from tiny to full size with a strong back-out
 * overshoot.
 */
type Drink = {
  name: string[];
  img: string;
  color: string;
};

const DRINKS: Drink[] = [
  {
    name: ["UBE", "MATCHA"],
    img: "/media/drinks/ubematcha-web.jpg",
    color: "#5b3f86",
  },
  {
    name: ["SPANISH", "LATTE"],
    img: "/media/drinks/spanishlatte-web.jpg",
    color: "#f4c33c",
  },
  {
    name: ["HONEY", "PEACH", "MANGO"],
    img: "/media/drinks/hpm-web.jpg",
    color: "#e89b2b",
  },
];

const TITLE_COLOR = "#fbd400";

// Stable pseudo-random angle for a balloon-letter, anchored by line+index so
// the rotation is deterministic across renders.
const wobble = (lineIdx: number, charIdx: number) => {
  const seed = lineIdx * 31 + charIdx * 17 + 11;
  // map to a value in roughly [-10, 10] degrees
  return ((seed * 13) % 19) - 9;
};

export default function BestSellers() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;

      const chars = gsap.utils.toArray<HTMLSpanElement>(".bs-char", root.current);
      const cards = gsap.utils.toArray<HTMLElement>(".bs-card", root.current);

      // Initial state — each glyph parked tiny and invisible, but already at
      // its final per-letter rotation (read from data-final-rot, written in
      // the JSX below). Rotation is NOT tweened so each letter inflates in
      // place at its final balloon angle.
      chars.forEach((c) => {
        const r = Number(c.dataset.finalRot ?? 0);
        gsap.set(c, {
          scale: 0.1,
          rotate: r,
          autoAlpha: 0,
          transformOrigin: "50% 70%",
        });
      });
      gsap.set(cards, { yPercent: 12, autoAlpha: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top 80%",
          once: true,
        },
      });

      // Balloon inflate — scale 0.1 → 1 with a strong overshoot. Sequential
      // stagger so they "pump up" one by one across the title.
      tl.to(chars, {
        scale: 1,
        autoAlpha: 1,
        ease: "back.out(3)",
        duration: 0.95,
        stagger: { each: 0.045, from: "start" },
      });

      tl.to(
        cards,
        {
          yPercent: 0,
          autoAlpha: 1,
          ease: "power3.out",
          duration: 0.7,
          stagger: 0.12,
        },
        "-=0.55",
      );
    },
    { scope: root, dependencies: [] },
  );

  return (
    <div ref={root} className="relative mb-12 mt-6 sm:mb-16 sm:mt-10">
      {/* Poster title.
            Row 1: OUR (top-left, smaller)
            Row 2: TOP (large) + SELLERS (smaller, baseline-aligned to TOP) */}
      <h3
        aria-label="Our Top Sellers"
        className="title-shadow relative z-0 font-poster leading-[0.78] tracking-tight"
        style={{ color: TITLE_COLOR }}
      >
        {/* OUR */}
        <div
          aria-hidden
          className="block pl-[1%] text-left text-[11vw] sm:text-[7rem]"
        >
          {[..."OUR"].map((c, i) => (
            <span
              key={`l1-${i}`}
              data-final-rot={wobble(1, i)}
              className="bs-char inline-block will-change-transform"
            >
              {c}
            </span>
          ))}
        </div>

        {/* TOP + SELLERS — flex row, bottom-aligned. whitespace-nowrap +
            shrink-0 stops the inline-block glyph spans from wrapping onto
            new lines inside the flex children. */}
        <div
          aria-hidden
          className="flex items-end gap-[3vw] -mt-[3vw] sm:-mt-6 sm:gap-8"
        >
          <span className="block shrink-0 whitespace-nowrap leading-[0.78] text-[24vw] sm:text-[20rem]">
            {[..."TOP"].map((c, i) => (
              <span
                key={`l2-${i}`}
                data-final-rot={wobble(2, i)}
                className="bs-char inline-block will-change-transform"
              >
                {c}
              </span>
            ))}
          </span>
          <span className="block shrink-0 whitespace-nowrap leading-[0.78] pb-[1vw] text-[10vw] sm:pb-3 sm:text-[8rem]">
            {[..."SELLERS"].map((c, i) => (
              <span
                key={`l3-${i}`}
                data-final-rot={wobble(3, i)}
                className="bs-char inline-block will-change-transform"
              >
                {c}
              </span>
            ))}
          </span>
        </div>
      </h3>

      {/* Cards — three portrait panels under the title. Small negative
          top margin pulls them up so they just kiss the bottom of TOP
          SELLERS; z-10 keeps them on top of the title at the overlap. */}
      <ul className="relative z-10 -mt-[2vw] grid grid-cols-1 gap-4 sm:-mt-8 sm:grid-cols-3 sm:gap-6">
        {DRINKS.map((d) => (
          <li
            key={d.name.join("-")}
            // hover:scale-[1.04] + hover:z-20 + deeper shadow lifts the
            // hovered card above its neighbours so it reads as forward.
            className="bs-card relative aspect-[3/4] overflow-hidden rounded-2xl border-[2.5px] border-white/70 bg-white shadow-[0_10px_28px_rgba(0,0,0,0.18)] transition-transform duration-300 ease-out hover:z-20 hover:scale-[1.04] hover:shadow-[0_18px_40px_rgba(0,0,0,0.28)]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cldUrl(d.img, { transform: "w_900,c_limit" })}
              alt={d.name.join(" ")}
              loading="lazy"
              decoding="async"
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div
              className="relative z-10 p-4 font-poster uppercase leading-[0.82] text-3xl sm:p-5 sm:text-4xl lg:text-5xl xl:text-6xl"
              style={{ color: d.color }}
            >
              {d.name.map((line) => (
                <div key={line}>{line}</div>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
