"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";

gsap.registerPlugin(useGSAP, MorphSVGPlugin);

/**
 * Footer bounce — the GSAP demo (https://demos.gsap.com/demo/footer-bounce/).
 * The footer's top edge is an SVG path that morphs from a hanging curve to flat
 * with an elastic ease when you scroll into it; the spring's strength is read
 * from scroll velocity. Menu-coloured gradient + the navbar's heavy gold type.
 */
// Exact demo paths: DOWN (top edge hangs to y=156) springs to CENTER (flat).
const DOWN =
  "M0-0.3C0-0.3,464,156,1139,156S2278-0.3,2278-0.3V683H0V-0.3z";
const CENTER =
  "M0-0.3C0-0.3,464,0,1139,0s1139-0.3,1139-0.3V683H0V-0.3z";

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useGSAP(
    () => {
      const path = pathRef.current!;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        path.setAttribute("d", CENTER);
        return;
      }

      const bounce = (velocity: number) => {
        // exact demo: variation from velocity drives the elastic amplitude/period
        const variation = gsap.utils.clamp(-0.9, 0.9, velocity / 10000);
        gsap.fromTo(
          path,
          { morphSVG: DOWN },
          {
            duration: 2,
            morphSVG: CENTER,
            ease: `elastic.out(${1 + variation}, ${1 - variation})`,
            overwrite: true,
          },
        );
      };

      // Track scroll velocity so the spring strength reflects how hard you
      // arrived (the demo reads ScrollTrigger.getVelocity, but that depends on
      // the scroller; window scroll works under ScrollSmoother too).
      let lastY = window.scrollY;
      let lastT = performance.now();
      let vel = 0;
      const onScroll = () => {
        const now = performance.now();
        const y = window.scrollY;
        const dt = now - lastT;
        if (dt > 0) vel = ((y - lastY) / dt) * 1000;
        lastY = y;
        lastT = now;
      };
      window.addEventListener("scroll", onScroll, { passive: true });

      // Fire the bounce whenever the footer scrolls into view — Intersection
      // Observer works regardless of ScrollSmoother's transform/scroll proxy,
      // which a ScrollTrigger onEnter does not reliably catch here.
      // fire when the footer's top edge is ~120px into view, so the wobble
      // plays where you can actually see it (not while it's still off the
      // bottom of the screen)
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) if (e.isIntersecting) bounce(vel);
        },
        { rootMargin: "0px 0px -120px 0px", threshold: 0 },
      );
      io.observe(footerRef.current!);

      return () => {
        io.disconnect();
        window.removeEventListener("scroll", onScroll);
      };
    },
    { scope: footerRef },
  );

  return (
    <footer
      ref={footerRef}
      // Lift the footer over the section above (z-20 + negative margin) so its
      // morphing top edge reveals the warm menu behind it — no cream/black gap.
      // The footer's own colour is a deeper warm (terracotta) so it's clearly
      // distinct from the bright menu while staying in the same palette.
      className="relative z-20 -mt-[150px] text-cream"
    >
      {/* morphing top edge — deep-warm gradient */}
      <svg
        aria-hidden
        id="footer-img"
        className="absolute inset-0 block h-full w-full"
        style={{ overflow: "visible" }}
        viewBox="0 0 2278 683"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient
            id="footGrad"
            x1="0"
            y1="0"
            x2="0"
            y2="683"
            gradientUnits="userSpaceOnUse"
          >
            {/* Colours follow the active menu tab (set by Menu via --foot-*):
                bright orange-red for sandwiches, vibrant violet for drinks. */}
            <stop offset="0" style={{ stopColor: "var(--foot-a, #ff7a2f)" }} />
            <stop offset="1" style={{ stopColor: "var(--foot-b, #e8362b)" }} />
          </linearGradient>
        </defs>
        <path ref={pathRef} id="bouncy-path" fill="url(#footGrad)" d={DOWN} />
      </svg>

      <div className="relative z-10 px-0 pb-7 pt-44">
        {/* Brand — two big lines that fill the width, split after MAMA */}
        <a
          href="#top"
          className="nav-blackface font-cheee block w-full pl-4 text-left leading-[0.78] tracking-[-0.03em] sm:pl-8"
          style={{ textShadow: "none", color: "var(--foot-brand, #f4c33c)" }}
        >
          <span className="block whitespace-nowrap text-[14vw]">
            CAFE&nbsp;MAMA
          </span>
          <span className="block whitespace-nowrap text-[14vw]">
            &amp;&nbsp;SONS
          </span>
        </a>

        {/* bottom strip: review CTA + instagram + email */}
        <div className="mt-7 flex flex-wrap items-center justify-end gap-x-4 gap-y-2 px-4">
          <a
            href={`https://www.google.com/search?q=${encodeURIComponent(
              "Cafe Mama & Sons, 83 Kentish Town Rd, London NW1 8NY",
            )}#lrd=`}
            target="_blank"
            rel="noreferrer"
            aria-label="Leave us a Google review"
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#f4c33c] transition-opacity hover:opacity-70"
          >
            <span aria-hidden className="text-sm leading-none">★★★★★</span>
            Review us on Google
          </a>
          <a
            href="#blog"
            className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#f4c33c] transition-opacity hover:opacity-70"
          >
            Blog
          </a>
          <a
            href="https://www.instagram.com/cafe_mama_sons/"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="text-[#f4c33c] transition-opacity hover:opacity-70"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-5 w-5"
              aria-hidden
            >
              <rect x="2" y="2" width="20" height="20" rx="5.5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.6" cy="6.4" r="1.1" fill="currentColor" stroke="none" />
            </svg>
          </a>
          <a
            href="mailto:hello@cafemamasons.com"
            className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#f4c33c] transition-opacity hover:opacity-70"
          >
            hello@cafemamasons.com
          </a>
        </div>
      </div>
    </footer>
  );
}
