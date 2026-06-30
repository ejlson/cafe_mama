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
    // Touch devices use NATIVE scrolling. ScrollSmoother's touch handling
    // intercepts touch events (preventDefault) to smooth them, which on phones
    // swallows taps and can trap you on the hero. ScrollTrigger still works with
    // native scroll, so animations are unaffected; we just skip the smoothing.
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;
    const smoother = ScrollSmoother.create({
      wrapper: wrapper.current!,
      content: content.current!,
      smooth: 1.7, // seconds to "catch up" to the scroll — the floaty glide
      effects: true, // honour data-speed / data-lag attributes
    });
    // Kill it on teardown so it doesn't linger (e.g. across hot-reloads).
    return () => smoother.kill();
  });

  return (
    // pointer-events-none on both wrappers so they don't sit on top of the
    // fixed footer (z-0) and swallow clicks meant for the order-online nav.
    // Children keep their default `pointer-events: auto` — pointer-events is
    // not inherited, so the menu and every interactive child stay clickable.
    <div id="smooth-wrapper" ref={wrapper} className="pointer-events-none">
      <div id="smooth-content" ref={content} className="pointer-events-none">
        {children}
      </div>
    </div>
  );
}
