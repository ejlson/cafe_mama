"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Footer with a velocity-driven elastic "bounce", after
 * https://demos.gsap.com/demo/footer-bounce/ — a curved hump on the footer's
 * top edge that bulges up when you scroll into it (read from scroll velocity)
 * and settles back with an elastic wobble. Gradient background + the navbar's
 * heavy gold "nav-blackface" type.
 */
const TOP = 160; // px height of the curve band above the footer
const MAXB = 140; // px the hump can bulge (kept < TOP so it never clips)

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useGSAP(
    () => {
      const path = pathRef.current!;
      const proxy = { b: 0 };
      // a quadratic hump sitting on the footer's top edge; b=0 → flat (no hump)
      const draw = () =>
        path.setAttribute(
          "d",
          `M0,${TOP} Q600,${TOP - proxy.b} 1200,${TOP} Z`,
        );
      draw();

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const st = ScrollTrigger.create({
        trigger: footerRef.current!,
        start: "top bottom",
        end: "bottom bottom",
        onUpdate: (self) => {
          // scroll velocity → instantaneous bulge, then ease back to flat with
          // an elastic bounce
          const v = gsap.utils.clamp(-MAXB, MAXB, self.getVelocity() / 30);
          gsap.killTweensOf(proxy);
          gsap.fromTo(
            proxy,
            { b: v },
            {
              b: 0,
              duration: 1.1,
              ease: "elastic.out(1, 0.3)",
              onUpdate: draw,
            },
          );
        },
      });
      return () => st.kill();
    },
    { scope: footerRef },
  );

  return (
    <footer
      ref={footerRef}
      className="relative text-cream"
      style={{
        background: "linear-gradient(180deg, #6c4a8f 0%, #221a12 100%)",
      }}
    >
      {/* curved hump that lives just above the footer's top edge */}
      <svg
        aria-hidden
        className="absolute left-0 top-0 w-full -translate-y-full"
        style={{ height: TOP }}
        viewBox={`0 0 1200 ${TOP}`}
        preserveAspectRatio="none"
      >
        <path ref={pathRef} fill="#6c4a8f" d={`M0,${TOP} Q600,${TOP} 1200,${TOP} Z`} />
      </svg>

      <div className="relative z-10 px-6 pb-14 pt-24 sm:pt-28">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 text-center">
          <a href="#top" className="nav-blackface leading-[0.92] tracking-tight">
            <span className="block text-4xl sm:text-5xl lg:text-6xl">
              CAFE&nbsp;MAMA
            </span>
            <span className="block text-4xl sm:text-5xl lg:text-6xl">
              &amp;&nbsp;SONS
            </span>
          </a>

          <nav className="nav-blackface flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-xl sm:text-2xl">
            <a href="#menu">Menu</a>
            <a href="#location">Location</a>
            <a href="#gallery">Gallery</a>
            <a
              href="https://www.instagram.com/cafe_mama_sons/"
              target="_blank"
              rel="noreferrer"
            >
              Instagram
            </a>
          </nav>

          <p className="text-[11px] uppercase tracking-[0.3em] text-cream/60">
            © {new Date().getFullYear()} Cafe Mama &amp; Sons · Broadcasting on
            CH 03
          </p>
        </div>
      </div>
    </footer>
  );
}
