"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import Location from "@/components/Location";
import BestSellers from "@/components/BestSellers";
import { CATEGORIES } from "@/lib/menu-data";
import FullRule from "@/components/menu/FullRule";
import GroupBlock from "@/components/menu/GroupBlock";
import CollabMarquee from "@/components/menu/CollabMarquee";
import CafeDescription from "@/components/menu/CafeDescription";
import MealDealBanner from "@/components/menu/MealDealBanner";
import BlogSection from "@/components/menu/BlogSection";
import { bgVars, setBgVars, textTheme } from "@/components/menu/palette";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother);

/**
 * The menu "page" — poster title + Food/Drinks tabs, the grouped item lists,
 * then the cafe description, press marquee, Location and Blog sections.
 *
 * Menu data lives in src/lib/menu-data.ts (shared with the cafe-reply brain
 * so comment replies quote real prices); the sub-sections live in
 * src/components/menu/.
 */
export default function Menu() {
  const [active, setActive] = useState("sandos");
  const current = CATEGORIES.find((c) => c.key === active) ?? CATEGORIES[0];

  // The menu content renders in place with no entrance animation — the
  // hero→menu morph transition provides all the motion, so the title, tabs
  // and list are simply there once it completes.
  const sectionRef = useRef<HTMLElement>(null);

  // Mála-Project-style tab transition: the list cross-dissolves while the
  // background gradient smoothly morphs to the new palette.
  const catRef = useRef<HTMLDivElement>(null);
  const firstCat = useRef(true);
  const switching = useRef(false);
  const drinks = active === "drinks";

  // Initial paint: set the background palette vars to the current category.
  useEffect(() => {
    setBgVars(bgVars(active === "drinks"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const switchCategory = (key: string) => {
    if (key === active || switching.current) return;
    switching.current = true;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const from = bgVars(active === "drinks");
    const to = bgVars(key === "drinks");

    if (reduce) {
      setBgVars(to);
      setActive(key);
      return;
    }

    // Smoothly morph the background gradient colours to the new palette.
    const li = {
      f0: gsap.utils.interpolate(from.f0, to.f0),
      f1: gsap.utils.interpolate(from.f1, to.f1),
      b0: gsap.utils.interpolate(from.b0, to.b0),
      b1: gsap.utils.interpolate(from.b1, to.b1),
      fa: gsap.utils.interpolate(from.fa, to.fa),
      fb: gsap.utils.interpolate(from.fb, to.fb),
      lt: gsap.utils.interpolate(from.lt, to.lt),
      lc: gsap.utils.interpolate(from.lc, to.lc),
      ab: gsap.utils.interpolate(from.ab, to.ab),
      ay: gsap.utils.interpolate(from.ay, to.ay),
      fbr: gsap.utils.interpolate(from.fbr, to.fbr),
    };
    const o = { p: 0 };
    gsap.to(o, {
      p: 1,
      duration: 0.6,
      ease: "power2.inOut",
      onUpdate: () =>
        setBgVars({
          f0: li.f0(o.p),
          f1: li.f1(o.p),
          b0: li.b0(o.p),
          b1: li.b1(o.p),
          fa: li.fa(o.p),
          fb: li.fb(o.p),
          lt: li.lt(o.p),
          lc: li.lc(o.p),
          ab: li.ab(o.p),
          ay: li.ay(o.p),
          fbr: li.fbr(o.p),
          // URL strings can't be interpolated — snap to the destination
          // artwork the moment the tab switch starts.
          clockShadow: to.clockShadow,
          clockFace: to.clockFace,
          pillGlow: to.pillGlow,
          pillFace: to.pillFace,
        }),
    });

    // Cross-dissolve the list out; the swap + fade-in happens in useGSAP below.
    // onInterrupt releases the `switching` latch if this tween is ever killed
    // (overwrite, unmount mid-switch) — without it the guard stayed true
    // forever and the tabs stopped responding.
    gsap.to(catRef.current, {
      autoAlpha: 0,
      y: 8,
      duration: 0.28,
      ease: "power2.in",
      onComplete: () => setActive(key),
      onInterrupt: () => {
        switching.current = false;
      },
    });
  };

  useGSAP(
    () => {
      if (firstCat.current) {
        firstCat.current = false;
        return;
      }
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        switching.current = false;
        return;
      }
      gsap.fromTo(
        catRef.current,
        { autoAlpha: 0, y: 8 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
          onComplete: () => {
            switching.current = false;
          },
          onInterrupt: () => {
            switching.current = false;
          },
        },
      );
    },
    { dependencies: [active], scope: sectionRef },
  );

  const theme = textTheme(drinks);

  return (
    <section
      ref={sectionRef}
      id="menu"
      // Subtle gradient wash, built from the --wave-* vars so it morphs smoothly
      // (and a faint dot texture overlay for depth).
      style={{
        background:
          "radial-gradient(135% 120% at 50% -10%, var(--wave-f0, #ffe06b) 0%, var(--wave-f1, #f5b13e) 70%, var(--wave-b1, #e89b2b) 100%)",
      }}
      className="relative overflow-hidden py-10 text-pine sm:py-14"
    >
      <div className="relative mx-auto w-full max-w-[1500px] px-4 pb-44 pt-6 sm:w-[80%] sm:px-8 sm:pt-10">
        {/* Framed menu — full-bleed rules across each block. */}
        <div className="relative">
          {/* Header rail — title + tabs */}
          <div className="relative">

          {/* Line above the title */}
          <FullRule color={theme.accent} className="mb-0" />

          {/* Title — line-box trimmed to cap height + baseline so the gap above
              and below is purely the symmetric py, not the font's whitespace.
              Letter gap set with tracking so Arial Black fits on a single line
              at narrower desktop widths. */}
          <h2
            aria-label="Menu"
            style={{ color: theme.accent }}
            className="title-shadow menu-title block w-full whitespace-nowrap text-center font-arialblack tracking-[0.04em] text-[17vw] leading-none [text-box:trim-both_cap_alphabetic] pt-[7px] pb-[17px] sm:text-[14rem]"
          >
            MENU
          </h2>

          {/* Line under the title, above the Food / Drinks tabs */}
          <FullRule color={theme.accent} className="mt-0" />

          {/* Category tabs — 5px breathing room above/below the tab caps so
              the surrounding rules sit at a consistent gap. text-box trim
              hugs the line to cap height so pt/pb match what you see. */}
          <nav className="flex flex-wrap items-baseline justify-center gap-x-5 gap-y-1 [text-box:trim-both_cap_alphabetic] pt-[5px] pb-[5px] sm:gap-x-10">
          {CATEGORIES.map((c, i) => {
            const isActive = active === c.key;
            return (
              <span key={c.key} className="flex items-baseline gap-x-5 sm:gap-x-10">
                {i > 0 && (
                  <span
                    aria-hidden
                    className="font-cheee text-2xl leading-none opacity-100 sm:text-6xl"
                    style={{ color: theme.accent }}
                  >
                    •
                  </span>
                )}
                <button
                  onClick={() => switchCategory(c.key)}
                  style={{ color: theme.accent }}
                  // Press feedback (scale 0.97, 150ms ease-out) so the tab
                  // answers the tap instantly, even while the list dissolve
                  // is still running.
                  className={`font-cheee text-2xl uppercase leading-none tracking-tight transition-[opacity,transform] duration-150 ease-out active:scale-[0.97] sm:text-6xl ${
                    isActive ? "opacity-100" : "opacity-40 hover:opacity-70"
                  }`}
                >
                  {c.label}
                </button>
              </span>
            );
          })}
        </nav>

          {/* Line under the Food / Drinks tabs */}
          <FullRule color={theme.accent} className="mt-0" />
          </div>
          {/* end header rail */}

        {/* Active category */}
        <div className="mt-8">
          <div ref={catRef}>
            {active === "sandos" && <MealDealBanner />}
            {active === "drinks" && <BestSellers />}

            {current.soon ? (
              <p
                style={{ color: theme.accent }}
                className="py-16 text-center font-arialblack text-2xl uppercase opacity-40 sm:text-3xl"
              >
                {current.label} menu — coming soon
              </p>
            ) : (
              // List rail — the grouped menu items
              <div className="relative">
                {current.groups?.map((g) => (
                  <div key={g.title}>
                    <FullRule color={theme.accent} className="mt-2" />
                    <GroupBlock
                      group={g}
                      accent={theme.accent}
                      body={theme.body}
                      dot={theme.dot}
                      twoCol={active === "sandos" || active === "drinks"}
                    />
                  </div>
                ))}

                {/* Allergen note — inside the rail so the rules run through it */}
                <FullRule color={theme.accent} className="mt-2" />
                <p
                  style={{ color: theme.accent }}
                  className="mt-1 text-xs font-semibold uppercase tracking-wide opacity-70"
                >
                  Allergens listed in brackets. Alternative milks, such as oat and coconut milk, are available for an additional 50p. Please
                  tell us about any allergies before ordering.
                </p>
                <FullRule color={theme.accent} className="mt-2" />

              </div>
            )}
          </div>
        </div>
        </div>
        {/* end framed menu */}

        {/* Cafe Mama Description */}
        <CafeDescription accent={theme.accent} />

        {/* Press / collab logos — draggable, continuously-scrolling strip */}
        <CollabMarquee accent={theme.accent} />
        <FullRule color={theme.accent} className="mt-2" />

        {/* Location widget — shares this section's gradient background. */}
        <Location />

        {/* Blog */}
        <BlogSection accent={theme.accent} />
      </div>

    </section>
  );
}
