"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother);

/**
 * Site-wide smooth scrolling (GSAP ScrollSmoother). The page eases toward the
 * scroll target with a little inertia/overshoot — a subtle bounce — which also
 * stretches the scroll-driven morph out in time.
 *
 * ScrollSmoother transforms #smooth-content, so it must wrap ALL scrolling
 * content; position:fixed UI (navbar, CRT overlay, music toggle) stays OUTSIDE.
 * It also breaks position:sticky inside the content, which is why the hero is
 * pinned with ScrollTrigger instead (see TvHero).
 */
export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const wrapper = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    ScrollSmoother.create({
      wrapper: wrapper.current!,
      content: content.current!,
      smooth: 1.7, // seconds to "catch up" to the scroll — the floaty glide
      smoothTouch: 0.1, // light smoothing on touch (keep it responsive)
      effects: true, // honour data-speed / data-lag attributes
    });
  });

  return (
    <div id="smooth-wrapper" ref={wrapper}>
      <div id="smooth-content" ref={content}>
        {children}
      </div>
    </div>
  );
}
