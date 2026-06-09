"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import BestSellers from "@/components/BestSellers";
import Location from "@/components/Location";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Poster-style menu, after the cafe's yellow "menu." flyer. A row of category
 * tabs (Sandos / Breakfast / Drinks / Bakery) switches the list below. Sandos
 * is fully populated; the meal-deal banner rides above it. Other categories
 * carry their data where we have it, or a "coming soon" placeholder.
 */
type Item = {
  name: string;
  price: string;
  desc?: string;
  allergens?: string;
  img?: string;
  angle?: number;
  w?: number;
  h?: number;
};
type Group = { title: string; items: Item[] };
type Category = {
  key: string;
  label: string;
  groups?: Group[];
  soon?: boolean;
};

const SANDOS: Item[] = [
  {
    name: "Chilli Kimchi Chicken",
    price: "9",
    desc: "Crispy chicken, chilli crisp, kimchi mayo, American cheese, tomatoes and lettuce.",
    allergens: "crustacean, fish",
    img: "/media/sandos/chilli-kimchi-chicken.jpg",
    angle: -7,
    w: 230,
    h: 300,
  },
  {
    name: "Egg Mayo",
    price: "9",
    desc: "Creamy egg mayo with chives and onion.",
    img: "/media/sandos/egg-mayo.jpg",
    angle: 5,
    w: 290,
    h: 200,
  },
  {
    name: "Tuna Melt",
    price: "9",
    desc: "Tuna mayo with sweetcorn, topped with crispy melted cheddar.",
    img: "/media/sandos/tuna-melt.jpg",
    angle: -3,
    w: 220,
    h: 260,
  },
  {
    name: "Jerk Chicken",
    price: "10",
    desc: "Jerk chicken with mayo, fresh tomato and pesto.",
    img: "/media/sandos/jerk-chicken.jpg",
    angle: 8,
    w: 310,
    h: 215,
  },
  {
    name: "Adobo Mushroom",
    price: "9.5",
    desc: "Crispy croquette stuffed with creamy adobo mushrooms and rich pesto.",
    allergens: "soya",
    img: "/media/sandos/adobo-mushroom.jpg",
    angle: -9,
    w: 240,
    h: 295,
  },
  {
    name: "Corned Beef",
    price: "10.5",
    desc: "Corned beef croquette with lettuce and mayo.",
    allergens: "nuts, celery & crustaceans",
    img: "/media/sandos/corned-beef.jpg",
    angle: 4,
    w: 265,
    h: 205,
  },
];

const SIDES: Item[] = [
  { name: "Box of 20 Tater-Tots", price: "5" },
  { name: "Box of Crisps", price: "3" },
];

const DRINKS_GROUPS: Group[] = [
  {
    title: "Coffee",
    items: [
      { name: "Spanish Iced Latte", price: "5.20" },
      { name: "Ube or Milo Latte", price: "6.20" },
    ],
  },
  {
    title: "Matcha",
    items: [
      { name: "Ube or Milo Matcha", price: "6.20" },
      { name: "Mango Matcha", price: "5.70" },
      { name: "Strawberry Matcha", price: "5.70" },
      { name: "Spanish Iced Matcha", price: "5.20" },
    ],
  },
  {
    title: "Tea",
    items: [
      { name: "Calamansi Ade", price: "4.70" },
      { name: "Honey Peach Mango", price: "4.70" },
      { name: "Strawberry Black Tea", price: "4.70" },
      { name: "Spanish Iced Hojicha", price: "6.00" },
      { name: "Iced Milo Hojicha", price: "6.00" },
    ],
  },
  {
    title: "Protein Shake",
    items: [
      { name: "Mango Float", price: "8.50" },
      { name: "Chocnut", price: "8.50" },
      { name: "Avocado Pandan", price: "8.50" },
    ],
  },
];

const CATEGORIES: Category[] = [
  {
    key: "sandos",
    label: "Sandos",
    groups: [
      { title: "Sandos", items: SANDOS },
      { title: "Sides", items: SIDES },
    ],
  },
  { key: "drinks", label: "Drinks", groups: DRINKS_GROUPS },
  { key: "bakery", label: "Bakery", soon: true },
];

function ItemRow({
  item,
  body,
  dot,
  active,
  registerRow,
}: {
  item: Item;
  body: string;
  dot: string;
  active?: boolean;
  registerRow?: (name: string, el: HTMLLIElement | null) => void;
}) {
  const interactive = Boolean(item.img);
  const hasDetail = Boolean(item.desc || item.img);
  const [hover, setHover] = useState(false);
  const detailRef = useRef<HTMLDivElement>(null);
  // Open on desktop hover, or for the scroll-active item on mobile.
  const open = hover || Boolean(active);

  // Smoothly ramp the detail height 0 ↔ auto. overflow is clipped only while it
  // animates and set back to visible when open, so the image's drop shadow
  // isn't cropped by the collapsing container.
  useEffect(() => {
    const el = detailRef.current;
    if (!el || !hasDetail) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(el, {
        height: open ? "auto" : 0,
        autoAlpha: open ? 1 : 0,
        overflow: open ? "visible" : "hidden",
      });
      return;
    }
    const tween = open
      ? gsap.to(el, {
          height: "auto",
          autoAlpha: 1,
          duration: 0.5,
          ease: "power3.out",
          onStart: () => gsap.set(el, { overflow: "hidden" }),
          onComplete: () => gsap.set(el, { overflow: "visible" }),
        })
      : gsap.to(el, {
          height: 0,
          autoAlpha: 0,
          duration: 0.32,
          ease: "power2.inOut",
          onStart: () => gsap.set(el, { overflow: "hidden" }),
        });
    return () => {
      tween.kill();
    };
  }, [open, hasDetail]);

  return (
    <li
      ref={
        interactive && registerRow
          ? (el) => registerRow(item.name, el)
          : undefined
      }
      className={`py-2.5 ${interactive ? "cursor-pointer" : ""}`}
      onMouseEnter={hasDetail ? () => setHover(true) : undefined}
      onMouseLeave={hasDetail ? () => setHover(false) : undefined}
    >
      {/* The row only ever shows the name · leader · price. */}
      <p
        className={`flex items-baseline gap-2 transition-transform duration-200 ease-out ${
          hover ? "translate-x-1.5" : ""
        }`}
      >
        <span
          style={{ color: body }}
          className="font-arialblack text-lg uppercase tracking-tight sm:text-xl"
        >
          {item.name}
        </span>
        <span
          aria-hidden
          style={{ borderColor: dot }}
          className="mx-1 flex-1 translate-y-[-4px] border-b-[3px] border-dotted"
        />
        <span
          style={{ color: body }}
          className="font-arialblack text-lg sm:text-xl"
        >
          {item.price}
        </span>
      </p>

      {hasDetail && (
        <div ref={detailRef} className="h-0 overflow-hidden opacity-0">
          <div className="pt-2">
            {item.desc && (
              <p
                style={{ color: body }}
                className="max-w-prose text-xs font-semibold uppercase leading-snug tracking-wide opacity-70 sm:text-[13px]"
              >
                {item.desc}
                {item.allergens && (
                  <span className="opacity-70"> ({item.allergens})</span>
                )}
              </p>
            )}
            {item.img && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.img}
                alt={item.name}
                loading="lazy"
                className="mb-2 mt-3 aspect-[4/3] w-full max-w-sm rounded-2xl border-4 border-cream object-cover shadow-[0_12px_30px_rgba(0,0,0,0.4)]"
              />
            )}
          </div>
        </div>
      )}
    </li>
  );
}

// Poster-style group heading: coloured face with a hard black offset shadow,
// echoing the navbar and the big "menu." title.
function GroupTitle({ children, accent }: { children: string; accent: string }) {
  return (
    <h3
      className="font-arialblack text-4xl uppercase leading-none sm:text-5xl"
      style={{ color: accent, textShadow: "4px 4px 0 #000" }}
    >
      {children}
    </h3>
  );
}

function GroupBlock({
  group,
  accent,
  body,
  dot,
  activeImg,
  registerRow,
}: {
  group: Group;
  accent: string;
  body: string;
  dot: string;
  activeImg?: string | null;
  registerRow?: (name: string, el: HTMLLIElement | null) => void;
}) {
  return (
    <div className="mt-10 first:mt-0">
      <GroupTitle accent={accent}>{group.title}</GroupTitle>
      <ul className="mt-3">
        {group.items.map((it) => (
          <ItemRow
            key={it.name}
            item={it}
            body={body}
            dot={dot}
            active={activeImg === it.name}
            registerRow={registerRow}
          />
        ))}
      </ul>
    </div>
  );
}

// Longanisa meal-deal poster, slotted in after the sandos. The artwork already
// carries its own headline, so we just frame it under the black-box title.
function LonganisaDeal({ accent }: { accent: string }) {
  return (
    <div className="mt-10">
      <GroupTitle accent={accent}>Longanisa</GroupTitle>
      <div className="mt-4 flex justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/media/longanisa.png"
          alt="Longanisa meal deal — available for £10.75"
          loading="lazy"
          className="w-full max-w-sm -rotate-1 rounded-2xl border-4 border-cream shadow-[0_14px_34px_rgba(0,0,0,0.4)]"
        />
      </div>
    </div>
  );
}

// Comic "sale sticker" sunburst — a spiky star polygon, like the hand-painted
// price bursts on sari-sari signage.
function burstPoints(spikes: number, outer: number, inner: number) {
  const step = Math.PI / spikes;
  let pts = "";
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = i * step - Math.PI / 2;
    pts += `${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)} `;
  }
  return pts.trim();
}

function MealDealBanner() {
  return (
    <div className="relative mb-12">
      {/* The rectangle IS the video. The footage dissolves into the page in a
          soft oval vignette — the sun-yellow background bleeds over the edges,
          exactly like a photo feathered into a solid colour. */}
      <div className="relative aspect-[4/3] sm:aspect-[16/9]">
        {/* The video is masked into a tall oval — its alpha fades to nothing
            toward the edges, revealing the sun background with no hard seam. */}
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster="/media/g-mealdeals-poster.jpg"
          style={{
            WebkitMaskImage:
              "radial-gradient(ellipse 64% 70% at 50% 48%, #000 26%, rgba(0,0,0,0.5) 50%, transparent 68%)",
            maskImage:
              "radial-gradient(ellipse 64% 70% at 50% 48%, #000 26%, rgba(0,0,0,0.5) 50%, transparent 68%)",
          }}
        >
          <source src="/media/sando-adobo-mushroom.mp4" type="video/mp4" />
        </video>

        {/* Soft dark scrim in the top-left so the sticker title stays legible,
            confined inside the oval so it never touches the feathered edges */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_58%_58%_at_24%_30%,rgba(0,0,0,0.66),transparent_72%)]"
          style={{
            WebkitMaskImage:
              "radial-gradient(ellipse 64% 70% at 50% 48%, #000 26%, transparent 68%)",
            maskImage:
              "radial-gradient(ellipse 64% 70% at 50% 48%, #000 26%, transparent 68%)",
          }}
        />

        {/* Sticker text — top-left of the oval, loud jeepney-signage styling,
            each line a different colour like a hand-painted store sign */}
        <div className="absolute inset-0 flex flex-col items-start justify-start p-7 sm:p-10">
          <h3 className="font-arialblack text-5xl uppercase leading-[0.78] sm:text-7xl">
            <span
              className="block -rotate-3 text-sun"
              style={{
                WebkitTextStroke: "3px #c2452d",
                paintOrder: "stroke fill",
                textShadow: "0 4px 0 #14564c, 3px 7px 0 rgba(0,0,0,0.5)",
              }}
            >
              Meal
            </span>
            <span
              className="-ml-1 block rotate-1 text-[#e23b2e]"
              style={{
                WebkitTextStroke: "3px #f6efdd",
                paintOrder: "stroke fill",
                textShadow: "0 4px 0 #14564c, 3px 7px 0 rgba(0,0,0,0.5)",
              }}
            >
              Deals!
            </span>
          </h3>
          <p
            className="mt-3 max-w-xs text-xs font-arialblack uppercase tracking-wide text-cream sm:text-sm"
            style={{
              WebkitTextStroke: "1px #c2452d",
              paintOrder: "stroke fill",
              textShadow: "0 2px 0 rgba(0,0,0,0.5)",
            }}
          >
            All meal deals come with crisps and a drink of your choice.
          </p>
        </div>

      </div>

      {/* Price burst — comically large comic sale sticker hugging the oval's
          top-right. Red fill + dark pine outline so it reads loud against it. */}
      <div className="absolute right-1 -top-12 rotate-[12deg] sm:right-10 sm:-top-16">
        <div className="relative h-52 w-52 drop-shadow-[0_9px_0_rgba(0,0,0,0.4)] sm:h-[21rem] sm:w-[21rem]">
          <svg viewBox="0 0 100 100" className="h-full w-full">
            <polygon
              points={burstPoints(16, 50, 38)}
              fill="#e23b2e"
              stroke="#14564c"
              strokeWidth="5"
              strokeLinejoin="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center leading-none text-sun">
            <span className="font-arialblack text-base uppercase sm:text-2xl">
              Only
            </span>
            <span
              className="font-arialblack text-7xl sm:text-[10rem]"
              style={{
                WebkitTextStroke: "2px #14564c",
                paintOrder: "stroke fill",
              }}
            >
              £14
            </span>
            <span className="font-arialblack text-sm uppercase sm:text-xl">
              Sulit!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// The background gradient colours for each menu palette. Stored as CSS vars
// (--wave-*) so the hero→menu wave matches, and so we can smoothly tween them
// from one palette to the next when switching tabs (Mála-Project style).
type BgVars = { f0: string; f1: string; b0: string; b1: string };
const bgVars = (isDrinks: boolean): BgVars =>
  isDrinks
    ? { f0: "#c4afe6", f1: "#9b81c9", b0: "#9b81c9", b1: "#7e63b0" }
    : { f0: "#ffe06b", f1: "#f5b13e", b0: "#f5b13e", b1: "#e89b2b" };

function setBgVars(v: BgVars) {
  const s = document.documentElement.style;
  s.setProperty("--wave-f0", v.f0);
  s.setProperty("--wave-f1", v.f1);
  s.setProperty("--wave-b0", v.b0);
  s.setProperty("--wave-b1", v.b1);
}

export default function Menu() {
  const [active, setActive] = useState("sandos");
  const current = CATEGORIES.find((c) => c.key === active) ?? CATEGORIES[0];

  // Mobile: which image item is currently "in focus" as you scroll.
  const [activeImg, setActiveImg] = useState<string | null>(null);
  const rowsRef = useRef<Map<string, HTMLLIElement>>(new Map());
  const registerRow = useCallback(
    (name: string, el: HTMLLIElement | null) => {
      if (el) rowsRef.current.set(name, el);
      else rowsRef.current.delete(name);
    },
    [],
  );

  // On mobile, the active item is the last image-row whose top has passed the
  // reading line (~45% down the viewport). As you scroll, the active item
  // changes one at a time, so its image expands and the previous one collapses.
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    let raf = 0;
    const compute = () => {
      raf = 0;
      if (!mq.matches) {
        setActiveImg((v) => (v === null ? v : null));
        return;
      }
      const line = window.innerHeight * 0.45;
      let name: string | null = null;
      let bestTop = -Infinity;
      for (const [n, el] of rowsRef.current) {
        const top = el.getBoundingClientRect().top;
        if (top <= line && top > bestTop) {
          bestTop = top;
          name = n;
        }
      }
      setActiveImg((v) => (v === name ? v : name));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [active]);

  // The title, tabs and list rise + fade in each time the menu is revealed by
  // the hero→menu transition (which dispatches "menu:reveal"). They start hidden
  // so nothing shows behind the hero.
  const sectionRef = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const targets = gsap.utils.toArray<HTMLElement>(
        "[data-reveal]",
        sectionRef.current,
      );
      gsap.set(targets, { autoAlpha: 0 });
      const play = () =>
        gsap.fromTo(
          targets,
          { y: 60, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.85,
            stagger: 0.12,
            ease: "power3.out",
            overwrite: true,
          },
        );
      window.addEventListener("menu:reveal", play);
      return () => window.removeEventListener("menu:reveal", play);
    },
    { scope: sectionRef },
  );

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
    };
    const o = { p: 0 };
    gsap.to(o, {
      p: 1,
      duration: 0.6,
      ease: "power2.inOut",
      onUpdate: () =>
        setBgVars({ f0: li.f0(o.p), f1: li.f1(o.p), b0: li.b0(o.p), b1: li.b1(o.p) }),
    });

    // Cross-dissolve the list out; the swap + fade-in happens in useGSAP below.
    gsap.to(catRef.current, {
      autoAlpha: 0,
      y: 8,
      duration: 0.28,
      ease: "power2.in",
      onComplete: () => setActive(key),
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
        },
      );
    },
    { dependencies: [active], scope: sectionRef },
  );

  // Per-category text theme (the background gradient is handled by the vars
  // above). Drinks gets light type on pastel ube; others keep the poster red.
  const theme = drinks
    ? {
        accent: "#fbd400", // headings, tabs, title
        body: "#f6efdd", // item names + prices
        dot: "rgba(246,239,221,0.5)", // dotted leaders
        line: "rgba(246,239,221,0.4)", // borders
      }
    : {
        accent: "#e23b2e",
        body: "#221a12",
        dot: "rgba(34,26,18,0.35)",
        line: "rgba(226,59,46,0.2)",
      };

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
      <div className="relative mx-auto max-w-5xl px-5 pt-6 sm:px-8 sm:pt-10">
        {/* Title */}
        <h2
          data-reveal
          style={{ color: theme.accent }}
          className="menu-title font-arialblack text-[30vw] leading-[0.78] sm:text-[12rem]"
        >
          menu<span>.</span>
        </h2>

        {/* Category tabs */}
        <nav
          data-reveal
          style={{ borderColor: theme.line }}
          className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-b-2 pb-1 sm:mt-10"
        >
          {CATEGORIES.map((c) => {
            const isActive = active === c.key;
            return (
              <button
                key={c.key}
                onClick={() => switchCategory(c.key)}
                style={{
                  color: theme.accent,
                  boxShadow: isActive ? `0 3px 0 0 ${theme.accent}` : undefined,
                }}
                className={`font-arialblack pb-2 text-lg uppercase tracking-tight transition-opacity sm:text-2xl ${
                  isActive ? "opacity-100" : "opacity-40 hover:opacity-70"
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </nav>

        {/* Active category */}
        <div data-reveal className="mt-8">
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
              current.groups?.map((g) => (
                <Fragment key={g.title}>
                  <GroupBlock
                    group={g}
                    accent={theme.accent}
                    body={theme.body}
                    dot={theme.dot}
                    activeImg={activeImg}
                    registerRow={registerRow}
                  />
                  {/* Longanisa meal deal sits right after the sandos list. */}
                  {active === "sandos" && g.title === "Sandos" && (
                    <LonganisaDeal accent={theme.accent} />
                  )}
                </Fragment>
              ))
            )}
          </div>
        </div>

        {/* Allergen note */}
        <p
          style={{ color: theme.accent, borderColor: theme.line }}
          className="mt-12 border-t-2 pt-5 text-xs font-semibold uppercase tracking-wide opacity-70"
        >
          Allergens listed in brackets. Alternative milks +30p. Please tell us
          about any allergies before ordering.
        </p>

        {/* Location widget — lives at the end of the menu so it shares this
            section's gradient background. */}
        <Location />
      </div>

    </section>
  );
}
