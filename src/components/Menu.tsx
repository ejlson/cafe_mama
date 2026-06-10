"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import BestSellers from "@/components/BestSellers";
import Location from "@/components/Location";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * 
 * MENU SUBSECTIONS - Food, Drinks:
 * - Food will include: sandos/sandwiches and bakery, giving it more columns so that the screen looks more busy
 * - 
**/
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
  { name: "Box of Tater-Tots", price: "5" },
  { name: "Box of Crisps", price: "4" },
];

const PANDESAL: Item[] = [
  { name: "Egg Pandesal", price: "—" },
  { name: "Longanisa Pandesal", price: "—" },
];

const BAKED: Item[] = [
  { name: "Honey Toast", price: "—" },
  { name: "Garlic Twist", price: "—" },
  { name: "Spanish Bread", price: "—" },
  { name: "Croissant", price: "—" },
  { name: "Cookie Croissant", price: "—" },
  { name: "Miso Cookie", price: "—" },
  { name: "Ube Bow", price: "—" },
  { name: "Ube Cookie", price: "—" },
  { name: "Au Chocolat", price: "—" },
];

const DRINKS_GROUPS: Group[] = [
  {
    title: "Coffee",
    items: [
      { name: "Espresso", price: "—" },
      { name: "Cortado", price: "—" },
      { name: "Macchiato", price: "—" },
      { name: "Flat White", price: "—" },
      { name: "Latte", price: "—" },
      { name: "Cappuccino", price: "—" },
      { name: "Americano", price: "—" },
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
    label: "Food",
    groups: [
      { title: "Sando/Sandwiches", items: SANDOS },
      { title: "All-Day Breakfast", items: PANDESAL },
      { title: "Sides", items: SIDES },
      { title: "Baked Goods", items: BAKED },
    ],
  },
  { key: "drinks", label: "Drinks", groups: DRINKS_GROUPS },
];


type PreviewData = { img: string; w?: number; h?: number; angle?: number };
type PreviewApi = { show: (d: PreviewData) => void; hide: () => void };
const PreviewCtx = createContext<PreviewApi | null>(null);

function MenuImagePreview({ children }: { children: ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const apiRef = useRef<PreviewApi | null>(null);
  // The preview is portalled to <body> so it sits OUTSIDE ScrollSmoother's
  // transformed #smooth-content — otherwise position:fixed is relative to that
  // transform and the image drifts off the cursor.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useGSAP(
    () => {
      if (!wrapRef.current || !imgRef.current) return;
      const wrap = wrapRef.current;
      const img = imgRef.current;
    gsap.set(wrap, { xPercent: -50, yPercent: -50, autoAlpha: 0, scale: 0.8 });
    const xTo = gsap.quickTo(wrap, "x", { duration: 0.5, ease: "power3" });
    const yTo = gsap.quickTo(wrap, "y", { duration: 0.5, ease: "power3" });
    const onMove = (e: PointerEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };
    window.addEventListener("pointermove", onMove);

    apiRef.current = {
      show: (d) => {
        // skip on touch / coarse pointers — there's no cursor to track
        if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches)
          return;
        img.src = d.img;
        const natW = d.w ?? 240;
        const natH = d.h ?? 180;
        const W = 250;
        gsap.set(wrap, {
          width: W,
          height: W * (natH / natW),
          rotate: d.angle ?? 0,
        });
        gsap.to(wrap, {
          autoAlpha: 1,
          scale: 1,
          duration: 0.35,
          ease: "back.out(1.6)",
          overwrite: "auto",
        });
      },
      hide: () => {
        gsap.to(wrap, {
          autoAlpha: 0,
          scale: 0.8,
          duration: 0.25,
          ease: "power2.in",
          overwrite: "auto",
        });
      },
    };
      return () => window.removeEventListener("pointermove", onMove);
    },
    { dependencies: [mounted] },
  );

  const api = useMemo<PreviewApi>(
    () => ({
      show: (d) => apiRef.current?.show(d),
      hide: () => apiRef.current?.hide(),
    }),
    [],
  );

  return (
    <PreviewCtx.Provider value={api}>
      {children}
      {mounted &&
        createPortal(
          <div
            ref={wrapRef}
            aria-hidden
            className="pointer-events-none fixed left-0 top-0 z-[60] will-change-transform"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              alt=""
              className="block h-full w-full rounded-2xl border-[6px] border-cream object-cover shadow-[0_18px_44px_rgba(0,0,0,0.5)]"
            />
          </div>,
          document.body,
        )}
    </PreviewCtx.Provider>
  );
}

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
  const preview = useContext(PreviewCtx);

  return (
    <li
      ref={
        interactive && registerRow
          ? (el) => registerRow(item.name, el)
          : undefined
      }
      className={`py-2 ${interactive ? "cursor-pointer" : ""}`}
      onMouseEnter={
        hasDetail
          ? () => {
              setHover(true);
              if (item.img)
                preview?.show({
                  img: item.img,
                  w: item.w,
                  h: item.h,
                  angle: item.angle,
                });
            }
          : undefined
      }
      onMouseLeave={
        hasDetail
          ? () => {
              setHover(false);
              if (item.img) preview?.hide();
            }
          : undefined
      }
    >
      {/* name · leader · price */}
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

      {/* Description is always shown; the photo appears as the cursor-tracking
          preview on hover (and inline for the mobile scroll-active row). */}
      {item.desc && (
        <p
          style={{ color: body }}
          className="mt-1 max-w-prose text-xs font-semibold uppercase leading-snug tracking-wide opacity-70 sm:text-[13px]"
        >
          {item.desc}
          {item.allergens && (
            <span className="opacity-70"> ({item.allergens})</span>
          )}
        </p>
      )}
      {active && item.img && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.img}
          alt={item.name}
          loading="lazy"
          className="mb-2 mt-3 aspect-[4/3] w-full max-w-sm rounded-2xl border-4 border-cream object-cover shadow-[0_12px_30px_rgba(0,0,0,0.4)]"
        />
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
  twoCol,
}: {
  group: Group;
  accent: string;
  body: string;
  dot: string;
  activeImg?: string | null;
  registerRow?: (name: string, el: HTMLLIElement | null) => void;
  twoCol?: boolean;
}) {
  return (
    <div className="mt-10 first:mt-0">
      <GroupTitle accent={accent}>{group.title}</GroupTitle>
      <ul className={`mt-3 ${twoCol ? "sm:grid sm:grid-cols-2 sm:gap-x-14" : ""}`}>
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


function MealDealBanner() {
  return (
    <div className="relative mb-60 mt-12 sm:mt-16">
      <div className="relative mx-auto aspect-[5/4] w-full sm:aspect-[16/10]">
        {/* video oval backdrop — kept, sat in the upper-centre */}
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
              "radial-gradient(ellipse 74% 72% at 50% 54%, #000 22%, rgba(0,0,0,0.5) 48%, transparent 66%)",
            maskImage:
              "radial-gradient(ellipse 74% 72% at 50% 54%, #000 22%, rgba(0,0,0,0.5) 48%, transparent 66%)",
          }}
        >
          <source src="/media/sando-adobo-mushroom.mp4" type="video/mp4" />
        </video>

        {/* product-photo collage piled in the lower half, hugging the oval */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/media/mealdeal/mealdeal-web.png"
          alt="Cafe Mama meal deal tray"
          className="pointer-events-none absolute bottom-[-60%] right-[-3%] z-10 w-[60%] rotate-[3deg] drop-shadow-[0_12px_18px_rgba(0,0,0,0.4)]"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/media/mealdeal/spanishlatte_clear-web.png"
          alt="Spanish latte"
          className="pointer-events-none absolute bottom-[-30%] left-[-20%] z-20 w-[45%] -rotate-[8deg] drop-shadow-[0_12px_16px_rgba(0,0,0,0.4)]"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/media/mealdeal/jerkchicken-web.png"
          alt="Toasted sando"
          className="pointer-events-none absolute bottom-[-70%] left-[-5%] z-40 w-[60%] drop-shadow-[0_12px_16px_rgba(0,0,0,0.4)]"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/media/mealdeal/flatwhite-web.png"
          alt="Flat white"
          className="pointer-events-none absolute bottom-[-47.5%] left-[50%] z-30 w-[40%] -translate-x-1/2 -rotate-[-4deg] drop-shadow-[0_12px_16px_rgba(0,0,0,0.4)]"
        />

        {/* curved headline + note across the top */}
        <svg
          aria-hidden
          viewBox="0 0 1000 600"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 z-40 h-full w-full overflow-visible"
        >
          <defs>
            <path id="md-top" fill="none" d="M 55 270 A 420 215 0 0 1 945 270" />
            <path id="md-note" fill="none" d="M 215 150 A 290 80 0 0 1 785 150" />
            <filter id="md-sh-lg" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="7" dy="7" stdDeviation="0" floodColor="#000" />
            </filter>
            <filter id="md-sh-sm" x="-60%" y="-60%" width="220%" height="220%">
              <feDropShadow dx="2" dy="2" stdDeviation="0" floodColor="#000" />
            </filter>
          </defs>
          <text
            textAnchor="middle"
            fontSize="100"
            filter="url(#md-sh-lg)"
            style={{
              fontFamily: '"Arial Black","Arial Bold",sans-serif',
              fontWeight: 900,
              fill: "#9b81c9",
            }}
          >
            <textPath href="#md-top" startOffset="50%">
              £14 MEAL DEAL
            </textPath>
          </text>
          <text
            textAnchor="middle"
            fontSize="15"
            filter="url(#md-sh-sm)"
            style={{
              fontFamily: '"Arial Black","Arial Bold",sans-serif',
              fontWeight: 900,
              fill: "#9b81c9",
              letterSpacing: "0.5px",
            }}
          >
            <textPath href="#md-note" startOffset="50%">
              ALL MEAL DEALS COME WITH CRISPS &amp; A DRINK OF YOUR CHOICE
            </textPath>
          </text>
        </svg>
      </div>
    </div>
  );
}

// The background gradient colours for each menu palette. Stored as CSS vars
// (--wave-*) so the hero→menu wave matches, and so we can smoothly tween them
// from one palette to the next when switching tabs (Mála-Project style).
// fa/fb are the footer gradient colours for this palette — drinks gets a
// lighter, more vibrant violet that matches its purple wash; sandwiches/bakery
// keep the bright orange-red.
// lt = Location accent text colour, lc = Location card bg/border colour, and
// ab/ay = opacity of the blue / yellow "COME FIND US" word-art tiles. Sandwiches
// reads blue-on-gold (matching the word art); drinks flips to yellow-on-purple.
type BgVars = {
  f0: string;
  f1: string;
  b0: string;
  b1: string;
  fa: string;
  fb: string;
  lt: string;
  lc: string;
  ab: number;
  ay: number;
};
const bgVars = (isDrinks: boolean): BgVars =>
  isDrinks
    ? {
        f0: "#c4afe6",
        f1: "#9b81c9",
        b0: "#9b81c9",
        b1: "#7e63b0",
        fa: "#cf9bff",
        fb: "#9d5cf0",
        lt: "#fbd400",
        lc: "#5b3f86",
        ab: 0,
        ay: 1,
      }
    : {
        // food bg = the nav-bar / drinks-text yellow (gold), subtle radial
        f0: "#fbd400",
        f1: "#f4c33c",
        b0: "#f4c33c",
        b1: "#eab92f",
        fa: "#ff7a2f",
        fb: "#e8362b",
        lt: "#9b81c9",
        lc: "#f4c33c",
        ab: 1,
        ay: 0,
      };

function setBgVars(v: BgVars) {
  const s = document.documentElement.style;
  s.setProperty("--wave-f0", v.f0);
  s.setProperty("--wave-f1", v.f1);
  s.setProperty("--wave-b0", v.b0);
  s.setProperty("--wave-b1", v.b1);
  s.setProperty("--foot-a", v.fa);
  s.setProperty("--foot-b", v.fb);
  s.setProperty("--loc-text", v.lt);
  s.setProperty("--loc-card", v.lc);
  s.setProperty("--art-blue", String(v.ab));
  s.setProperty("--art-yellow", String(v.ay));
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
      fa: gsap.utils.interpolate(from.fa, to.fa),
      fb: gsap.utils.interpolate(from.fb, to.fb),
      lt: gsap.utils.interpolate(from.lt, to.lt),
      lc: gsap.utils.interpolate(from.lc, to.lc),
      ab: gsap.utils.interpolate(from.ab, to.ab),
      ay: gsap.utils.interpolate(from.ay, to.ay),
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
        }),
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
        body: "#fbd400", // item names + prices — yellow
        dot: "rgba(251,212,0,0.6)", // dotted leaders — yellow
        line: "rgba(251,212,0,0.4)", // borders — yellow
      }
    : {
        accent: "#9b81c9", // drinks-background lavender — was poster red
        body: "#9b81c9", // item names + prices — was dark ink
        dot: "rgba(155,129,201,0.5)",
        line: "rgba(155,129,201,0.3)",
      };

  return (
    <MenuImagePreview>
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
      <div className="relative mx-auto w-[80%] max-w-[1500px] px-5 pb-44 pt-6 sm:px-8 sm:pt-10">
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
                <GroupBlock
                  key={g.title}
                  group={g}
                  accent={theme.accent}
                  body={theme.body}
                  dot={theme.dot}
                  activeImg={activeImg}
                  registerRow={registerRow}
                  twoCol={active === "sandos"}
                />
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
    </MenuImagePreview>
  );
}
