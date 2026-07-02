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
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import Smooothy, { damp } from "smooothy";
import Location from "@/components/Location";
import { BLOG_POSTS as SHARED_BLOG_POSTS, type BlogPost as SharedBlogPost } from "@/lib/blog";
import BestSellers from "@/components/BestSellers";
import { cldUrl } from "@/lib/cloudinary";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother, Draggable, InertiaPlugin);

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
type Group = { title: string; items: Item[]; blurb?: string };

// Short, descriptive blurbs sat to the right of each food group header — these
// are the first menu copy Google sees on the page, so each one names what the
// section is and the standout item in it.
const BLURB_SANDOS =
  "Japanese-style milk-bread sandos built around Filipino flavours — adobo, longanisa, jerk chicken — all on house-baked pandesal.";
const BLURB_BREAKFAST =
  "All-day pandesal breakfast: longanisa, egg mayo and Filipino classics, served from open to close.";
const BLURB_SIDES =
  "Quick bites to round the meal deal out — golden tater-tots and a rotating box of house-made nori crisps.";
const BLURB_BAKED =
  "Daily bakes from our Kentish Town counter: ube mochi croissant, cookie croissant, milo tiramisu, ensaymada and more.";
type Category = {
  key: string;
  label: string;
  groups?: Group[];
  soon?: boolean;
};

const SANDOS: Item[] = [
  {
    name: "Chilli Kimchi Chicken",
    price: "9.00",
    desc: "Crispy chicken, chilli crisp, kimchi mayo, American cheese, tomatoes and lettuce.",
    allergens: "crustacean, fish",
    img: "/media/sandos/chilli-kimchi-chicken.jpg",
    angle: -7,
    w: 230,
    h: 300,
  },
  {
    name: "Egg Mayo",
    price: "8.50",
    desc: "Creamy egg mayo with chives and onion.",
    img: "/media/sandos/egg-mayo.jpg",
    angle: 5,
    w: 290,
    h: 200,
  },
  {
    name: "Tuna Melt",
    price: "8.50",
    desc: "Tuna mayo with sweetcorn, topped with crispy melted cheddar.",
    img: "/media/sandos/tuna-melt.jpg",
    angle: -3,
    w: 220,
    h: 260,
  },
  {
    name: "Jerk Chicken",
    price: "9.50",
    desc: "Jerk chicken with mayo, fresh tomato and pesto.",
    img: "/media/sandos/jerk-chicken.jpg",
    angle: 8,
    w: 310,
    h: 215,
  },
  {
    name: "Adobo Mushroom",
    price: "9.00",
    desc: "Crispy croquette stuffed with creamy adobo mushrooms and rich pesto.",
    allergens: "soya",
    img: "/media/sandos/adobo-mushroom.jpg",
    angle: -9,
    w: 240,
    h: 295,
  },
  {
    name: "Corned Beef",
    price: "10.50",
    desc: "Corned beef croquette with lettuce and mayo.",
    allergens: "nuts, celery & crustaceans",
    img: "/media/sandos/corned-beef.jpg",
    angle: 4,
    w: 265,
    h: 205,
  },
];

const SIDES: Item[] = [
  { name: "Box of Tater-Tots", price: "4.50" },
  { name: "Box of Crisps", price: "4.00" },
];

const PANDESAL: Item[] = [
  { name: "Egg Pandesal", price: "5.50" },
  { name: "Longanisa Pandesal", price: "9.00" },
];

const BAKED: Item[] = [
  { name: "Honey Toast", price: "2.99" },
  { name: "Honey Garlic Twist", price: "4.80" },
  { name: "Spanish Bread", price: "3.50" },
  { name: "Croissant", price: "2.90" },
  { name: "Cookie Croissant", price: "6.00" },
  { name: "Almond Croissant", price: "3.50" },
  { name: "Miso Cookie", price: "3.99" },
  { name: "Ube Bow", price: "4.90" },
  { name: "Ube Pain Au Chocolat", price: "5.50" },
  { name: "Pain Au Chocolat", price: "3.00" },
  { name: "Banana Pudding", price: "5.50" },
];

const DRINKS_GROUPS: Group[] = [
  {
    title: "Coffee",
    items: [
      { name: "Espresso", price: "3.20" },
      { name: "Cortado", price: "3.50" },
      { name: "Macchiato", price: "3.50" },
      { name: "Flat White", price: "3.70" },
      { name: "Latte (Iced/Hot)", price: "3.90" },
      { name: "Cappuccino", price: "3.90" },
      { name: "Americano (Iced/Hot)", price: "3.5" },
      { name: "Spanish Latte (Iced/Hot)", price: "5.20" },
      { name: "Ube Latte (Iced/Hot)", price: "6.20" },
      { name: "Milo Latte (Iced/Hot)", price: "6.20" },
    ],
  },
  {
    title: "Matcha",
    items: [
      { name: "Mango Matcha", price: "5.70" },
      { name: "Strawberry Matcha", price: "5.70" },
      { name: "Spanish Matcha (Iced/Hot)", price: "5.20" },
      { name: "Ube Matcha (Iced/Hot)", price: "6.20" },
      { name: "Milo Matcha (Iced/Hot)", price: "6.20" },
    ],
  },
  {
    title: "Tea",
    items: [
      { name: "Calamansi Ade/Tea", price: "4.70" },
      { name: "Honey Peach Mango", price: "4.70" },
      { name: "Strawberry Tea", price: "4.70" },
      { name: "Spanish Hojicha (Iced/Hot)", price: "6.00" },
      { name: "Milo Hojicha (Iced/Hot)", price: "6.00" },
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
      { title: "Sando/Sandwiches", items: SANDOS, blurb: BLURB_SANDOS },
      { title: "All-Day Breakfast", items: PANDESAL, blurb: BLURB_BREAKFAST },
      { title: "Sides", items: SIDES, blurb: BLURB_SIDES },
      { title: "Baked Goods", items: BAKED, blurb: BLURB_BAKED },
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
    // Track the live pointer so a freshly-shown preview can be dropped straight
    // onto the cursor — otherwise it flashes at 0,0 (a white box in the
    // top-left) while quickTo eases over from its previous position.
    let lastX = window.innerWidth / 2;
    let lastY = window.innerHeight / 2;
    const onMove = (e: PointerEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;
      xTo(e.clientX);
      yTo(e.clientY);
    };
    window.addEventListener("pointermove", onMove);

    // Bumped on every show()/hide() so a slow image's onload can't reveal the
    // preview after the pointer has already left the row.
    let token = 0;

    apiRef.current = {
      show: (d) => {
        // skip on touch / coarse pointers — there's no cursor to track
        if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches)
          return;
        const my = ++token;
        img.src = cldUrl(d.img);
        const natW = d.w ?? 240;
        const natH = d.h ?? 180;
        const W = 250;
        // Size it and place it ON the cursor instantly (no tween) so it can
        // never appear in the top-left corner.
        gsap.set(wrap, {
          width: W,
          height: W * (natH / natW),
          rotate: d.angle ?? 0,
          x: lastX,
          y: lastY,
        });
        const reveal = () => {
          if (my !== token) return; // superseded by a hide() / newer show()
          gsap.to(wrap, {
            autoAlpha: 1,
            scale: 1,
            duration: 0.35,
            ease: "back.out(1.6)",
            overwrite: "auto",
          });
        };
        // Only fade in once the photo is actually decoded, so the empty cream
        // border never shows on its own.
        if (img.complete && img.naturalWidth > 0) reveal();
        else img.onload = reveal;
      },
      hide: () => {
        token++; // cancel any pending reveal
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
            // Inline opacity:0 + visibility:hidden so the empty cream-bordered
            // img can never flash in the top-left corner before useGSAP runs
            // and calls gsap.set(autoAlpha: 0). show() overrides both via
            // autoAlpha when (and if) it's ever called.
            style={{ opacity: 0, visibility: "hidden" }}
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
  registerRow,
}: {
  item: Item;
  body: string;
  dot: string;
  registerRow?: (name: string, el: HTMLLIElement | null) => void;
}) {
  const interactive = Boolean(item.img);
  const hasDesc = Boolean(item.desc);
  const [expanded, setExpanded] = useState(false);

  return (
    <li
      ref={
        interactive && registerRow
          ? (el) => registerRow(item.name, el)
          : undefined
      }
      className="py-1"
    >
      {/* Name + price header. On every viewport the price sits on the same
          baseline as the name — if the name is too long to fit on one line
          it wraps naturally and the price stays anchored to the first
          baseline on the right. The dotted leader only makes sense on wide
          rows so it's hidden below sm.
          If there's a description, the whole header row doubles as a tap
          target on mobile to toggle it open (desktop always shows the desc
          so the button is inert there). */}
      <button
        type="button"
        onClick={hasDesc ? () => setExpanded((v) => !v) : undefined}
        aria-expanded={hasDesc ? expanded : undefined}
        className={`flex w-full items-baseline gap-2 text-left ${
          hasDesc ? "cursor-pointer sm:cursor-default" : ""
        }`}
      >
        <span
          style={{ color: body }}
          // NO flex-1 here — the name must size to its content so the dotted
          // leader (the only flex-1 item) runs the full gap from name to
          // price. With flex-1 on both, free space split 50/50 and the dots
          // started halfway across the row. min-w-0 still lets long names
          // wrap inside tight columns.
          className="min-w-0 font-arialblack text-sm uppercase leading-tight tracking-tight [text-wrap:balance] sm:text-xl"
        >
          {item.name}
        </span>
        <span
          aria-hidden
          style={{ borderColor: dot }}
          className="mx-1 hidden flex-1 translate-y-[-4px] border-b-[3px] border-dotted sm:block"
        />
        <span
          style={{ color: body }}
          className="shrink-0 font-arialblack text-[13px] leading-none sm:text-xl"
        >
          {item.price}
        </span>
        {/* Mobile-only expand chevron — subtle, indicates this row has more
            info. Rotates 45° when open. Hidden on rows without a desc and on
            sm+ (where the desc is always shown). */}
        {hasDesc && (
          <span
            aria-hidden
            style={{ color: body }}
            className={`ml-1 inline-block shrink-0 text-[13px] leading-none opacity-60 transition-transform sm:hidden ${
              expanded ? "rotate-45" : ""
            }`}
          >
            +
          </span>
        )}
      </button>

      {/* Description — mobile hides it behind the tap-to-expand toggle above.
          sm+ always shows it because there's room on wide rows. */}
      {item.desc && (
        <p
          style={{ color: body }}
          className={`mt-1 max-w-prose text-xs font-semibold uppercase leading-snug tracking-wide opacity-70 sm:block sm:text-[13px] ${
            expanded ? "block" : "hidden"
          }`}
        >
          {item.desc}
          {item.allergens && (
            <span className="opacity-70"> ({item.allergens})</span>
          )}
        </p>
      )}
    </li>
  );
}

function GroupTitle({ children, accent }: { children: string; accent: string }) {
  return (
    <h3
      className="font-cheee min-w-0 text-3xl uppercase leading-none tracking-tight [overflow-wrap:anywhere] sm:text-6xl"
      style={{ color: accent }}
    >
      {children}
    </h3>
  );
}

// A thin rule that separates blocks. Spans the content column and overhangs
// each edge a little so it runs just past where the content starts.
// Default gap is the site-wide "small separator" token (~8px). Use mt-0 /
// mb-0 only when the rule is hugging a poster headline.
function FullRule({ color, className = "mt-2" }: { color: string; className?: string }) {
  return (
    <div
      aria-hidden
      style={{ backgroundColor: color }}
      className={`relative left-1/2 h-px w-[calc(100%+2rem)] -translate-x-1/2 ${className}`}
    />
  );
}

// Vertical rules just inside each edge of the viewport — disabled (the side
// lines were removed for a cleaner, lighter frame). Kept as a no-op so the call
// sites still type-check and the rails can be restored by reinstating the JSX.
function SideRails(_props: { color: string }) {
  return null;
}

const ABOUT_IMAGES = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(
  (n) => `/media/about%20us/web/about${n}-web.jpg`,
);

// Press / collab logos for the scrolling strip. Spaces are URL-encoded.
// `alt` names each outlet for SEO / screen readers.
// Collab / press strip — only actual bitmap logos we have on disk. As new
// logo assets land in public/media/collabs, add them here.
const COLLABS: { src: string; alt: string }[] = [
  { src: "/media/collabs/Canva-logo-PNG-large-size.png", alt: "Canva" },
  { src: "/media/collabs/hotdinners.jpeg", alt: "Café Mama & Sons featured in Hot Dinners" },
  { src: "/media/collabs/feedthelion.png", alt: "Café Mama & Sons featured in Feed the Lion" },
  {
    src: "/media/collabs/London%20On%20The%20Inside.gif",
    alt: "Café Mama & Sons featured in London on the Inside",
  },
  {
    src: "/media/collabs/restaurantonline.avif",
    alt: "Café Mama & Sons featured in Restaurant Online",
  },
  { src: "/media/collabs/ldn.png", alt: "Café Mama & Sons featured in LDN" },
  { src: "/media/collabs/mamali.jpeg", alt: "Café Mama & Sons featured in Mamali" },
];
const LOREM = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
];

// Full-bleed band of press / collab logos in a draggable, continuously-scrolling
// strip. smooothy (github.com/vallafederico/smooothy) drives the infinite track;
// we nudge its `target` every frame for the auto-scroll and skip that nudge while
// the user is dragging, so on release it eases back to the steady cruising speed.
function CollabMarquee({ accent }: { accent: string }) {
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = track.current;
      if (!el) return;
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      // The [data-p] inner wrappers get a velocity-driven parallax nudge
      // (smooothy docs → Parallax and Speed). The [data-logo] images scale up
      // as they pass through the centre of the strip, then settle back.
      const pEls = Array.from(el.querySelectorAll<HTMLElement>("[data-p]"));
      const imgs = Array.from(el.querySelectorAll<HTMLElement>("[data-logo]"));
      let lspeed = 0; // smoothed scroll velocity

      const FOCUS = 360; // px from centre where the scale-up begins
      const MAX_SCALE = 1.45; // peak size at dead centre

      const slider = new Smooothy(el, {
        infinite: true,
        snap: false,
        lerpFactor: 0.06,
        dragSensitivity: 0.005,
        speedDecay: 0.9,
        onUpdate: (s) => {
          const pv = s.parallaxValues;
          if (!pv) return;
          // Frame-rate-independent smoothing of the raw velocity.
          lspeed = damp(lspeed, s.speed, 5, s.deltaTime);
          pEls.forEach((p, i) => {
            const offset = (pv[i] ?? 0) * Math.abs(lspeed) * 20;
            p.style.transform = `translateX(${offset}%)`;
          });

          if (reduce) return;
          // Distance of each logo from the centre of the screen → proximity
          // scale (1 at the FOCUS edge, MAX_SCALE dead centre).
          const mid = window.innerWidth / 2;
          imgs.forEach((img) => {
            const b = img.getBoundingClientRect();
            const d = Math.abs(b.left + b.width / 2 - mid);
            const p = gsap.utils.clamp(
              0,
              1,
              gsap.utils.mapRange(0, FOCUS, 1, 0, d),
            );
            img.style.scale = String(1 + (MAX_SCALE - 1) * p);
          });
        },
      });

      // Slides-per-frame drift — the steady cruising speed the strip returns to
      // after a drag/flick settles.
      const SPEED = 0.008;
      const tick = () => {
        if (!reduce && !slider.isDragging) slider.target += SPEED;
        slider.update();
      };
      gsap.ticker.add(tick);

      return () => {
        gsap.ticker.remove(tick);
        slider.destroy();
      };
    },
    { dependencies: [] },
  );

  // Duplicated so the track always overflows the viewport — with only a handful
  // of logos the infinite wrap would otherwise reveal a gap.
  const logos = [...COLLABS, ...COLLABS];

  return (
    <>
      <div className="relative left-1/2 w-screen -translate-x-1/2 pb-6 pt-1">
        <p
          className="mb-1 text-center text-xs font-semibold uppercase leading-snug tracking-wide opacity-70 sm:text-[13px]"
          style={{ color: accent }}
        >
          as seen in or collaborated with
        </p>
        {/* smooothy wrapper: flex + overflow-hidden, direct children are slides.
            Mask aligns the fully-opaque band with the horizontal rules that
            frame this section: FullRule is `w-[calc(100%+2rem)]` of the
            1500 px content container, so its max span is 1532 px (1500 +
            2×16 px overhang). Fade spans 60 px OUTSIDE that boundary for a
            soft dissolve past the rule ends.
            py-10 gives the drop-shadows enough vertical room that the parent
            menu section's overflow-hidden doesn't clip them. */}
        <div
          ref={track}
          className="flex cursor-grab overflow-x-clip overflow-y-visible py-10 active:cursor-grabbing"
          style={{
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0, transparent calc(max(0px, (100vw - 1532px) / 2) - 60px), black max(0px, calc((100vw - 1532px) / 2)), black calc(100% - max(0px, (100vw - 1532px) / 2)), transparent calc(100% - max(0px, (100vw - 1532px) / 2) + 60px), transparent 100%)",
            maskImage:
              "linear-gradient(to right, transparent 0, transparent calc(max(0px, (100vw - 1532px) / 2) - 60px), black max(0px, calc((100vw - 1532px) / 2)), black calc(100% - max(0px, (100vw - 1532px) / 2)), transparent calc(100% - max(0px, (100vw - 1532px) / 2) + 60px), transparent 100%)",
          }}
        >
          {logos.map((logo, i) => (
            <div
              key={i}
              className="h-16 w-36 shrink-0 select-none px-3 sm:h-24 sm:w-56 sm:px-6"
            >
              <div
                data-p
                className="flex h-full w-full items-center justify-center will-change-transform"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  data-logo
                  src={cldUrl(logo.src)}
                  alt={logo.alt}
                  loading="lazy"
                  draggable={false}
                  className="max-h-full max-w-full rounded-2xl object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.28)]"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// "about us." — a PINNED section. The text holds still while the photos on the
// right scroll up through a window with a velocity skew (they lean with scroll
// speed and snap back when you stop). A counter + bar track progress; once the
// last photo passes it releases into the "where are we?" (Location) section.
function AboutUs({ accent }: { accent: string }) {
  const root = useRef<HTMLDivElement>(null);
  const win = useRef<HTMLDivElement>(null);
  const stack = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const N = ABOUT_IMAGES.length;

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const stackEl = stack.current!;
      const winEl = win.current!;
      const travel = () => stackEl.scrollHeight - winEl.clientHeight;

      // velocity skew (after codepen.io/GreenSock/pen/eYpGLYL)
      const imgs = gsap.utils.toArray<HTMLElement>(".about-img", winEl);
      gsap.set(imgs, { transformOrigin: "center center", force3D: true });
      const skewSet = gsap.quickSetter(imgs, "skewY", "deg");
      const clamp = gsap.utils.clamp(-14, 14);
      const proxy = { skew: 0 };

      gsap
        .timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => "+=" + travel(),
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const shown = Math.min(N, Math.floor(self.progress * N) + 1);
              if (count.current)
                count.current.textContent = String(shown).padStart(2, "0");
              if (bar.current)
                bar.current.style.transform = `scaleX(${self.progress})`;

              const skew = clamp(self.getVelocity() / -260);
              if (Math.abs(skew) > Math.abs(proxy.skew)) {
                proxy.skew = skew;
                gsap.to(proxy, {
                  skew: 0,
                  duration: 0.7,
                  ease: "power3",
                  overwrite: true,
                  onUpdate: () => skewSet(proxy.skew),
                });
              }
            },
          },
        })
        .to(stackEl, { y: () => -travel(), ease: "none" });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative flex h-screen flex-col pt-2 sm:pt-3">
      <SideRails color={accent} />

      <h2
        className="font-arialblack text-[24vw] leading-[0.8] pb-[0.2em] sm:text-[25rem]"
        style={{ color: accent }}
      >
        blog
      </h2>

      {/* Line under the about-us title */}
      <FullRule color={accent} className="mt-0" />

      <div className="flex min-h-0 flex-1 gap-8 sm:gap-12">
        {/* Left — text + progress (held still) */}
        <div className="flex w-1/2 flex-col pb-6 pt-7">
          <div className="space-y-3" style={{ color: accent }}>
            {LOREM.map((t, i) => (
              <p key={i} className="max-w-2xl text-base leading-relaxed sm:text-xl">
                {t}
              </p>
            ))}
          </div>

          <div className="mt-auto pt-8" style={{ color: accent }}>
            <div className="flex items-end gap-2 font-arialblack leading-none">
              <span ref={count} className="text-5xl sm:text-6xl">
                01
              </span>
              <span className="text-xl opacity-60 sm:text-2xl">
                / {String(N).padStart(2, "0")}
              </span>
            </div>
            <div className="mt-3 h-[3px] w-full max-w-xs bg-black/10">
              <div
                ref={bar}
                className="h-full w-full origin-left"
                style={{ transform: "scaleX(0)", backgroundColor: accent }}
              />
            </div>
          </div>
        </div>

        {/* Right — photos scroll up through this window with a velocity skew.
            Horizontal padding gives the drop shadows room so they aren't clipped;
            all photos are full window-width at their natural height (no crop). */}
        <div ref={win} className="relative w-[40%] self-stretch overflow-hidden px-8">
          <div ref={stack} className="flex flex-col gap-[5vh] will-change-transform">
            {ABOUT_IMAGES.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={cldUrl(src)}
                alt=""
                loading="lazy"
                draggable={false}
                className="about-img w-full shrink-0 rounded-md shadow-[0_14px_30px_rgba(0,0,0,0.28)]"
              />
            ))}
          </div>
        </div>
      </div>

      <FullRule color={accent} className="mt-0" />
    </section>
  );
}

// Blog posts shown as the layered card row. Clicking a card opens the full post
// in a fold-in modal. Data lives in src/lib/blog.ts so the indexable /blog and
// /blog/[slug] routes render the same articles.
type BlogPost = SharedBlogPost;
const BLOG_POSTS: BlogPost[] = SHARED_BLOG_POSTS;

// The full-post pop-up. It unfolds from the top edge like a sheet of paper
// (GSAP 3D rotateX with transformPerspective), fades a dimmed backdrop in behind
// it, locks the smooth-scroll while open, and folds back up on close.
function BlogModal({ post, onClose }: { post: BlogPost; onClose: () => void }) {
  const backdrop = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const sheen = useRef<HTMLDivElement>(null);

  // The sheet's curled-up "peeled" pose: pivoting from the bottom-left corner,
  // the opposite corner lifts off the page via combined 3D rotation. Animating
  // back to flat reads as the page peeling/laying down onto the surface.
  const PEELED = {
    autoAlpha: 0,
    rotateX: 34,
    rotateY: -48,
    scale: 0.82,
    xPercent: -5,
    yPercent: 7,
  };
  const FLAT = { autoAlpha: 1, rotateX: 0, rotateY: 0, scale: 1, xPercent: 0, yPercent: 0 };

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      ScrollSmoother.get()?.paused(true);

      gsap.set(sheet.current, {
        transformPerspective: 1600,
        transformOrigin: "0% 100%", // bottom-left corner = the peel pivot
      });
      const tl = gsap.timeline();
      tl.fromTo(
        backdrop.current,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.3, ease: "power1.out" },
      );
      tl.fromTo(
        sheet.current,
        reduce ? { autoAlpha: 0, y: 20 } : PEELED,
        reduce
          ? { autoAlpha: 1, y: 0, duration: 0.3 }
          : { ...FLAT, duration: 1, ease: "power3.out" },
        0.1,
      );
      // Light sheen rakes across the page as it flattens, then fades out.
      if (!reduce)
        tl.fromTo(
          sheen.current,
          { autoAlpha: 0.65, xPercent: -30 },
          { autoAlpha: 0, xPercent: 30, duration: 0.9, ease: "power2.out" },
          "<0.05",
        );
    },
    { dependencies: [] },
  );

  const close = useCallback(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.to(sheet.current, {
      ...(reduce ? { autoAlpha: 0, y: 20 } : PEELED),
      duration: 0.5,
      ease: "power3.in",
    });
    gsap.to(backdrop.current, {
      autoAlpha: 0,
      duration: 0.4,
      delay: 0.1,
      onComplete: () => {
        ScrollSmoother.get()?.paused(false);
        onClose();
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  return createPortal(
    <div
      ref={backdrop}
      onClick={close}
      className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-black/60 px-4 py-[8vh] backdrop-blur-sm"
    >
      <article
        ref={sheet}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-cream text-pine shadow-[0_30px_80px_rgba(0,0,0,0.5)]"
      >
        {/* Sheen that rakes across the sheet as it peels flat. */}
        <div
          ref={sheen}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-br from-white/70 via-white/10 to-transparent"
        />
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-4 top-4 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-lg leading-none text-cream transition-colors hover:bg-black/50"
        >
          ✕
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cldUrl(post.img)}
          alt={post.title}
          className="h-64 w-full object-cover sm:h-80"
        />
        <div className="p-7 sm:p-10">
          <time className="text-xs font-semibold uppercase tracking-[0.2em] opacity-60">
            {post.date}
          </time>
          <h3 className="mt-2 font-arialblack text-2xl leading-tight sm:text-3xl">
            {post.title}
          </h3>
          <div className="mt-5 space-y-4 text-sm leading-relaxed sm:text-base">
            {post.body.map((para, i) => (
              <p key={i}>
                {typeof para === "string"
                  ? para
                  : para.map((seg, j) => {
                      if (typeof seg === "string") return seg;
                      const internal =
                        seg.href.startsWith("/") || seg.href.startsWith("#");
                      return (
                        <a
                          key={j}
                          href={seg.href}
                          target={internal ? undefined : "_blank"}
                          rel={internal ? undefined : "noopener noreferrer"}
                          className="font-semibold underline underline-offset-2 transition-opacity hover:opacity-70"
                        >
                          {seg.text}
                        </a>
                      );
                    })}
              </p>
            ))}
          </div>
        </div>
      </article>
    </div>,
    document.body,
  );
}

// Blog — featured-first layout. The newest post sits big up top; everything
// older drops into a horizontally-scrollable strip beneath it. Lives inside
// the same menu wrapper width as the rest of the page (no pinned scroll, no
// full-bleed breakout).
function Blog({ accent }: { accent: string }) {
  const [openPost, setOpenPost] = useState<BlogPost | null>(null);

  // BLOG_POSTS is sorted newest-first in src/lib/blog.ts.
  const [featured, ...older] = BLOG_POSTS;

  return (
    <section id="blog" className="relative mt-0">
      <FullRule color={accent} className="mb-0" />
      <h2
        aria-label="Blog"
        style={{ color: accent }}
        // Single-word title with a fixed letter-spacing — Arial Black is too
        // wide for the old "B L O G" + text-justify rail-to-rail trick to fit
        // on one line at narrower desktops, so we set the gap explicitly.
        className="title-shadow block w-full whitespace-nowrap text-center font-arialblack tracking-[0.04em] text-[17vw] leading-none [text-box:trim-both_cap_alphabetic] pt-[7px] pb-[19px] sm:text-[14rem]"
      >
        BLOG
      </h2>
      <FullRule color={accent} className="mt-0" />

      {/* ===== Featured (latest) post — big two-column layout ===== */}
      {featured && (
        <article className="mt-2">
          <button
            type="button"
            onClick={() => setOpenPost(featured)}
            className="group grid w-full grid-cols-1 items-stretch gap-8 text-left lg:grid-cols-[1.1fr_0.9fr] lg:gap-14"
            style={{ color: accent }}
          >
            <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl transition-transform duration-500 group-hover:-translate-y-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cldUrl(featured.img)}
                alt={featured.alt}
                loading="eager"
                draggable={false}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
            </div>

            <div className="flex flex-col">
              {/* "LATEST · 17 APRIL 2026" — single row, leading-none so the
                  top of these caps lines up with the top of the image to
                  the left (the grid uses items-start). Font matches the
                  menu-item allergens copy so the section reads as one
                  consistent voice. */}
              <div className="flex flex-wrap items-baseline gap-x-3 text-xs font-semibold uppercase leading-none tracking-wide opacity-70 sm:text-[13px]">
                <span aria-hidden>Latest</span>
                <span aria-hidden>·</span>
                <time dateTime={featured.isoDate}>{featured.date}</time>
              </div>
              <h3 className="mt-3 font-arialblack text-3xl uppercase leading-[0.95] tracking-tight sm:text-5xl xl:text-6xl">
                {featured.title}
              </h3>
              <p className="mt-5 max-w-prose text-base font-semibold uppercase leading-snug tracking-wide opacity-70 sm:text-lg">
                {featured.excerpt}
              </p>
              {/* mt-auto pushes this CTA to the bottom of the stretched
                  right column so its baseline lines up with the bottom edge
                  of the featured image on the left. */}
              <span className="mt-auto inline-flex items-center gap-3 pt-7 font-arialblack text-sm uppercase tracking-[0.2em] underline-offset-4 group-hover:underline">
                Read full article
                <span aria-hidden className="text-lg">→</span>
              </span>
            </div>
          </button>
        </article>
      )}

      {/* ===== Older posts — horizontally scrollable row of smaller cards ===== */}
      {older.length > 0 && (
        <div className="mt-2">
          <FullRule color={accent} className="mb-2" />
          <div
            className="flex items-end justify-between gap-4"
            style={{ color: accent }}
          >
            <h4 className="font-arialblack text-base uppercase tracking-[0.3em] opacity-80 sm:text-lg">
              Older posts
            </h4>
            <span
              aria-hidden
              className="font-arialblack text-xs uppercase tracking-[0.3em] opacity-60"
            >
              ← scroll →
            </span>
          </div>

          {/* Native horizontal overflow scroll + scroll snap so cards settle
              cleanly. Cards have a fixed width so they read as a strip. */}
          <ul className="no-scrollbar mt-5 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-1 sm:gap-7">
            {older.map((p) => (
              <li
                key={p.slug}
                className="w-[68%] shrink-0 snap-start sm:w-[36%] lg:w-[28%]"
              >
                <button
                  type="button"
                  onClick={() => setOpenPost(p)}
                  className="group flex w-full flex-col gap-3 text-left"
                  style={{ color: accent }}
                >
                  <div className="aspect-[3/2] w-full overflow-hidden rounded-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cldUrl(p.img)}
                      alt={p.alt}
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  </div>
                  <time
                    dateTime={p.isoDate}
                    className="text-[10px] font-semibold uppercase tracking-[0.25em] opacity-70 sm:text-[11px]"
                  >
                    {p.date}
                  </time>
                  <h3 className="font-arialblack text-base uppercase leading-tight tracking-tight sm:text-lg">
                    {p.title}
                  </h3>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <FullRule color={accent} className="mt-2" />

      {openPost && (
        <BlogModal post={openPost} onClose={() => setOpenPost(null)} />
      )}
    </section>
  );
}


const CAFE_DESC =
  "Cafe Mama & Sons is a Filipino-Japanese café serving freshly made sandos, all-day pandesal breakfast meals, unique drinks, and baked goods.";

function CafeDescription({ accent }: { accent: string }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const words = gsap.utils.toArray<HTMLElement>(".cafe-word", root.current);

      // Interactive physics: motion is horizontal-only. The cursor shoves words
      // left/right and they collide with each other (resolved along x) so they
      // slide their neighbours aside instead of overlapping, then spring back
      // home. Words can also be dragged left/right. Skip on touch / reduced.
      const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      const box = root.current?.querySelector<HTMLElement>(".cafe-box");
      if (reduce || !fine || !words.length || !box) return;

      const n = words.length;
      const dispX = new Array(n).fill(0); // physics target offset from home
      const dispY = new Array(n).fill(0);
      const renderX = new Array(n).fill(0); // smoothed offset actually drawn
      const velX = new Array(n).fill(0);
      const velY = new Array(n).fill(0);
      const lastTouch = new Array(n).fill(-1e9); // time of last interaction (s)
      const cx = new Array(n).fill(0); // home centre (relative to the h3 box)
      const cy = new Array(n).fill(0);
      const hw = new Array(n).fill(0); // half extents
      const hh = new Array(n).fill(0);
      const setX = words.map((w) => gsap.quickSetter(w, "x", "px"));
      const setY = words.map((w) => gsap.quickSetter(w, "y", "px"));

      // The bounded box (between the top & bottom rules) — words bounce off its
      // four walls. Measured each layout so it survives page scroll / resize.
      let boxW = 0;
      const measure = () => {
        const base = box.getBoundingClientRect();
        boxW = base.width;
        words.forEach((w, i) => {
          const dx = Number(gsap.getProperty(w, "x")) || 0;
          const dy = Number(gsap.getProperty(w, "y")) || 0;
          const r = w.getBoundingClientRect();
          cx[i] = r.left - base.left - dx + r.width / 2;
          cy[i] = r.top - base.top - dy + r.height / 2;
          hw[i] = r.width / 2;
          hh[i] = r.height / 2;
        });
      };
      measure();

      // Entrance: words SLIDE in horizontally from alternating sides as the
      // section scrolls into view (restores the slide-in that was dropped in
      // the Arial Black titles pass). Animates xPercent + autoAlpha, which
      // compose with the physics engine below — physics owns `x`, so the two
      // never fight. ease-out + 40ms stagger per the animation standards.
      gsap.from(words, {
        xPercent: (i) => (i % 2 === 0 ? -45 : 45),
        autoAlpha: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.04,
        scrollTrigger: { trigger: box, start: "top 85%", once: true },
      });

      const dragging = new Set<HTMLElement>();
      let clientX = -9999;
      let clientY = -9999;
      let hot = false;

      const SPRING = 0.05; // pull back home — gentle, so the return glides
      const DRIFT_FRICTION = 0.93; // decay while drifting → long, smooth float
      const HOME_FRICTION = 0.78; // strong damping while homing → no overshoot
      const R = 160; // cursor influence radius (px)
      const PUSH = 2.4; // cursor shove strength (accumulates, so keep it small)
      const RETURN_DELAY = 0.6; // seconds adrift before a word heads home
      const MAX_VEL = 8; // px/frame speed cap — keeps the slide unhurried
      const MAX_DISP = 600; // px — words may slide far enough to fill line gaps
      const BOUNCE = 0; // no rebound off the walls — they just glide to a stop
      const ITER = 5; // collision solver passes
      const GAP = 18; // min horizontal gap between words — keeps them legible
      const VFACT = 0.72; // shrink collision box vertically so lines don't touch
      const SMOOTH = 0.14; // render lerp toward the physics target → silky glide

      // --- Autonomous + scroll-driven sliding ---
      // Each word gets a fixed left/right bias. Scrolling shoves words along
      // that bias (an organic scatter, not a uniform shift), and a random timer
      // also nudges a random word every so often so they drift on their own.
      // Both just inject horizontal velocity — the existing drift + spring-home
      // then carries the slide out and eases the word back to its place.
      const slideBias = words.map(() => Math.random() * 2 - 1);
      let scrollDelta = 0;
      let lastSY = window.scrollY;
      const onScrollSlide = () => {
        scrollDelta += window.scrollY - lastSY;
        lastSY = window.scrollY;
      };
      window.addEventListener("scroll", onScrollSlide, { passive: true });
      let nextNudge = 2; // seconds — first self-slide fires ~2s in

      const tick = (time: number) => {
        const base = box.getBoundingClientRect();
        const lx = clientX - base.left;
        const ly = clientY - base.top;

        // scroll shove — each word drifts by its own bias as you scroll
        if (scrollDelta !== 0) {
          for (let i = 0; i < n; i++) {
            if (dragging.has(words[i])) continue;
            velX[i] += scrollDelta * 0.06 * slideBias[i];
            lastTouch[i] = time; // let it drift before homing
          }
          scrollDelta = 0;
        }

        // random self-slide — shove one random word at random intervals
        if (time >= nextNudge) {
          nextNudge = time + 1.4 + Math.random() * 3.2; // 1.4–4.6s apart
          const k = Math.floor(Math.random() * n);
          if (!dragging.has(words[k])) {
            velX[k] += (Math.random() < 0.5 ? -1 : 1) * (2.5 + Math.random() * 3.5);
            lastTouch[k] = time;
          }
        }

        for (let i = 0; i < n; i++) {
          if (dragging.has(words[i])) {
            // Draggable owns this word — read its offset so it acts as a moving
            // obstacle for the others, and keep its return timer fresh.
            dispX[i] = Number(gsap.getProperty(words[i], "x")) || 0;
            dispY[i] = Number(gsap.getProperty(words[i], "y")) || 0;
            renderX[i] = dispX[i]; // track the drag so release glides on smoothly
            velX[i] = 0;
            velY[i] = 0;
            lastTouch[i] = time;
            continue;
          }
          let touched = false;
          if (hot) {
            const ddx = cx[i] + dispX[i] - lx;
            const ddy = cy[i] + dispY[i] - ly;
            const dd = Math.hypot(ddx, ddy) || 1;
            if (dd < R) {
              const f = 1 - dd / R;
              // shove horizontally away from the cursor (sign of ddx), strength
              // by proximity — pure left/right, never vertical.
              velX[i] += (ddx >= 0 ? 1 : -1) * f * PUSH;
              touched = true;
            }
          }
          if (touched) lastTouch[i] = time;

          // Drift freely just after a knock; only start springing home — and
          // shoving neighbours on the way — once it's been adrift a while.
          const homing = time - lastTouch[i] > RETURN_DELAY;
          if (homing) {
            velX[i] += -dispX[i] * SPRING;
          }
          const fr = homing ? HOME_FRICTION : DRIFT_FRICTION;
          velX[i] *= fr;
          velY[i] *= fr;

          // Cap speed so a knock can't fling a word.
          const sp = Math.hypot(velX[i], velY[i]);
          if (sp > MAX_VEL) {
            velX[i] *= MAX_VEL / sp;
            velY[i] *= MAX_VEL / sp;
          }
          dispX[i] += velX[i];
          dispY[i] += velY[i];

          // Cap distance from home so it never drifts off — bleed the outward
          // velocity when it hits the limit.
          const dm = Math.hypot(dispX[i], dispY[i]);
          if (dm > MAX_DISP) {
            const k = MAX_DISP / dm;
            dispX[i] *= k;
            dispY[i] *= k;
            velX[i] *= 0.4;
            velY[i] *= 0.4;
          }

          // Bounce off the left & right walls of the box (motion is horizontal).
          const lft = cx[i] + dispX[i] - hw[i];
          if (lft < 0) {
            dispX[i] -= lft;
            if (velX[i] < 0) velX[i] = -velX[i] * BOUNCE;
          }
          const rgt = cx[i] + dispX[i] + hw[i];
          if (rgt > boxW) {
            dispX[i] -= rgt - boxW;
            if (velX[i] > 0) velX[i] = -velX[i] * BOUNCE;
          }
        }

        // Resolve word-vs-word overlaps along the axis of least penetration.
        for (let it = 0; it < ITER; it++) {
          for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
              const ax = cx[i] + dispX[i];
              const ay = cy[i] + dispY[i];
              const bx = cx[j] + dispX[j];
              const by = cy[j] + dispY[j];
              const ox = hw[i] + hw[j] + GAP - Math.abs(ax - bx);
              const oy = (hh[i] + hh[j]) * VFACT - Math.abs(ay - by);
              if (ox <= 0 || oy <= 0) continue;
              const di = dragging.has(words[i]);
              const dj = dragging.has(words[j]);
              if (di && dj) continue;
              const mi = di ? 0 : dj ? 1 : 0.5;
              const mj = dj ? 0 : di ? 1 : 0.5;
              // resolve overlaps horizontally only — words stay on their line.
              const sgn = ax < bx ? 1 : -1;
              dispX[i] -= sgn * ox * mi;
              dispX[j] += sgn * ox * mj;
              velX[i] -= sgn * ox * 0.06 * mi;
              velX[j] += sgn * ox * 0.06 * mj;
            }
          }
        }

        for (let i = 0; i < n; i++) {
          if (dragging.has(words[i])) continue;
          // ease the drawn position toward the physics target — smooths the
          // start of every slide and any collision correction.
          renderX[i] += (dispX[i] - renderX[i]) * SMOOTH;
          setX[i](renderX[i]);
          setY[i](dispY[i]);
        }
      };
      gsap.ticker.add(tick);

      const el = root.current!;
      const onMove = (e: PointerEvent) => {
        clientX = e.clientX;
        clientY = e.clientY;
        hot = true;
      };
      const onLeave = () => {
        hot = false;
      };
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
      window.addEventListener("resize", measure);

      // Drag: grab a word and slide it left/right through the others; on release
      // the sim springs it back home.
      const draggables = words.flatMap((w) =>
        Draggable.create(w, {
          type: "x",
          inertia: false,
          onPress() {
            dragging.add(w);
          },
          onRelease() {
            dragging.delete(w);
          },
        }),
      );

      return () => {
        gsap.ticker.remove(tick);
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
        window.removeEventListener("resize", measure);
        window.removeEventListener("scroll", onScrollSlide);
        draggables.forEach((d) => d.kill());
      };
    },
    { scope: root },
  );

  return (
    <div ref={root} className="relative mt-[15px]">
      {/* Bounded box — words bounce off its side edges and drift along the
          x axis (motion is horizontal-only, so vertical breathing room is
          purely cosmetic). Width is inherited from the menu wrapper so the
          description lines up with the menu rail above it. */}
      <div className="cafe-box">
        <h3
          aria-label={CAFE_DESC}
          style={{ color: accent }}
          className="font-cheee w-full text-justify uppercase [text-align-last:justify] text-2xl leading-[0.95] sm:text-[4.5vw]"
        >
          {CAFE_DESC.split(" ").map((word, wi) => (
            <span key={wi} aria-hidden>
              <span className="cafe-word inline-block cursor-grab touch-none select-none whitespace-nowrap will-change-transform active:cursor-grabbing">
                {word.split("").map((ch, ci) => (
                  <span key={ci} className="cafe-char inline-block">
                    {ch}
                  </span>
                ))}
              </span>{" "}
            </span>
          ))}
        </h3>
        <FullRule color={accent} className="mt-2" />
      </div>
    </div>
  );
}

function GroupBlock({
  group,
  accent,
  body,
  dot,
  registerRow,
  twoCol,
}: {
  group: Group;
  accent: string;
  body: string;
  dot: string;
  registerRow?: (name: string, el: HTMLLIElement | null) => void;
  twoCol?: boolean;
}) {
  return (
    <div className="mt-1">
      <div className="flex flex-wrap items-start gap-x-6 gap-y-1">
        <GroupTitle accent={accent}>{group.title}</GroupTitle>
        {group.blurb && (
          <p
            style={{ color: body }}
            className="min-w-0 flex-1 basis-64 pt-1.5 text-[11px] font-semibold uppercase leading-snug tracking-wide opacity-70 sm:text-xs"
          >
            {group.blurb}
          </p>
        )}
      </div>
      {/* rule under the header + blurb */}
      <FullRule color={accent} className="mt-2" />
      {/* Two-column list on ALL screen sizes when the group is Food/Drinks —
          previously only kicked in at sm:. On mobile a single column was
          leaving the menu feeling long and empty; two cols pack the items
          into a scannable grid without pushing the type below legibility. */}
      <ul className={`mt-3 ${twoCol ? "grid grid-cols-2 gap-x-4 sm:gap-x-14" : ""}`}>
        {group.items.map((it) => (
          <ItemRow
            key={it.name}
            item={it}
            body={body}
            dot={dot}
            registerRow={registerRow}
          />
        ))}
      </ul>
    </div>
  );
}



function MealDealBanner() {
  const root = useRef<HTMLDivElement>(null);
  const sfx = useRef<HTMLAudioElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const items = gsap.utils.toArray<HTMLElement>("[data-md-item]", root.current);

      // zoom in/out: the pieces punch out and snap back with a jumpy
      // overshoot (back.out → yoyo back). To stop the GPU from re-rasterising
      // each element's drop-shadow on every tween frame we:
      //   1. promote them with will-change: transform,
      //   2. *strip* the filter for the duration of the tween (the missing
      //      shadow is imperceptible during a sub-second pop), and
      //   3. soften the scale + back-out so there's less per-frame work.
      const tl = gsap.timeline({
        paused: true,
        onStart: () => {
          items.forEach((el) => {
            el.style.willChange = "transform";
            el.style.filter = "none";
          });
        },
        onComplete: () => {
          items.forEach((el) => {
            el.style.willChange = "";
            el.style.filter = "";
          });
        },
      });
      tl.fromTo(
        items,
        { scale: 1 },
        {
          scale: 1.06,
          duration: 0.5,
          ease: "back.out(1.7)",
          stagger: 0,
          yoyo: true,
          repeat: 1,
        },
      );

      // The hero (#top) is a fixed layer that covers the menu on load and fades
      // out on entry; only react once it's actually hidden.
      const heroEl = document.getElementById("top");
      const heroHidden = () =>
        !heroEl || parseFloat(getComputedStyle(heroEl).opacity || "1") < 0.5;

      // The banner's centre, in viewport coordinates.
      const centreY = () => {
        const r = root.current!.getBoundingClientRect();
        return (r.top + r.bottom) / 2;
      };

      // Entering the menu from the hero lands at the menu title (scroll top),
      // where the banner sits LOW — below the giant title. We deliberately do
      // NOT fire on entry: the user scrolls down, and only once they've brought
      // the banner's centre up to the trigger line does the pop + sfx play —
      // in place, with no scroll assist (the user keeps control of the scroll).
      // `userScrolled` guards the entry frame so a pre-centred layout can never
      // auto-fire without a deliberate scroll.
      const TRIGGER = () => window.innerHeight * 0.6; // centre must rise past here
      let armed = true; // re-arms once the banner leaves the viewport
      let userScrolled = false;

      const fire = () => {
        if (!armed || !userScrolled || !heroHidden()) return;
        if (centreY() > TRIGGER()) return; // not scrolled up to it yet
        armed = false;
        // Play the size pop + rizz right where it is — no scrollTo.
        tl.restart();
        const a = sfx.current;
        if (a) {
          a.currentTime = 0;
          a.volume = 0.6;
          a.play().catch(() => {});
        }
      };

      // Scroll-driven (reliable under ScrollSmoother, where a ScrollTrigger
      // onEnter is not): fire when the user scrolls the banner up to the trigger
      // line; re-arm once it has fully left the viewport.
      let raf = 0;
      const onScroll = () => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          userScrolled = true;
          if (armed) {
            fire();
          } else {
            // Re-arm only once the banner sits fully BELOW the viewport again
            // (i.e. the user scrolled back UP above it) — never when it's above
            // the viewport, or scrolling further down would snap them back to it.
            const r = root.current!.getBoundingClientRect();
            if (r.top > window.innerHeight) armed = true;
          }
        });
      };
      window.addEventListener("scroll", onScroll, { passive: true });

      // Re-entering the menu from the hero: reset so it waits for a fresh
      // scroll-down rather than firing on arrival.
      const onReveal = () => {
        armed = true;
        userScrolled = false;
      };
      window.addEventListener("menu:reveal", onReveal);

      return () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("menu:reveal", onReveal);
        if (raf) cancelAnimationFrame(raf);
      };
    },
    { scope: root },
  );

  return (
    <div ref={root} className="relative mb-40 mt-12 sm:mb-60 sm:mt-16">
      <audio ref={sfx} src={cldUrl("/sfx/rizz.mp3")} preload="auto" />
      <div className="relative mx-auto aspect-[5/4] w-full sm:aspect-[16/10]">
        {/* video oval backdrop — kept, sat in the upper-centre */}
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster={cldUrl("/media/g-mealdeals-poster.jpg")}
          style={{
            WebkitMaskImage:
              "radial-gradient(ellipse 74% 72% at 50% 54%, #000 22%, rgba(0,0,0,0.5) 48%, transparent 66%)",
            maskImage:
              "radial-gradient(ellipse 74% 72% at 50% 54%, #000 22%, rgba(0,0,0,0.5) 48%, transparent 66%)",
          }}
        >
          <source src={cldUrl("/media/videos/website%20adobo%20mushroom.mp4")} type="video/mp4" />
        </video>

        <img
          data-md-item
          src={cldUrl("/media/mealdeal/mealdeal-web.png")}
          alt="Cafe Mama meal deal tray"
          loading="lazy"
          decoding="async"
          className="pointer-events-none absolute bottom-[-60%] right-[-12.5%] z-10 w-[62.5%] rotate-[3deg] drop-shadow-[0_12px_18px_rgba(0,0,0,0.4)]"
        />
        <img
          data-md-item
          src={cldUrl("/media/mealdeal/spanishlatte_clear-web.png")}
          alt="Spanish latte"
          loading="lazy"
          decoding="async"
          className="pointer-events-none absolute bottom-[-32.5%] left-[-17.5%] z-20 w-[45%] -rotate-[8deg] drop-shadow-[0_12px_16px_rgba(0,0,0,0.4)]"
        />
        <img
          data-md-item
          src={cldUrl("/media/mealdeal/jonas-web.jpg")}
          alt="Jonas portrait"
          loading="lazy"
          decoding="async"
          className="pointer-events-none absolute bottom-[-27.5%] left-[55%] z-50 aspect-square w-[15%] rounded-full object-cover -rotate-[-8deg] drop-shadow-[0_12px_16px_rgba(0,0,0,0.4)]"
        />
        <img
          data-md-item
          src={cldUrl("/media/mealdeal/jerkchicken-web.png")}
          alt="Toasted sando"
          loading="lazy"
          decoding="async"
          className="pointer-events-none absolute bottom-[-70%] left-[-2.5%] z-40 w-[60%] drop-shadow-[0_12px_16px_rgba(0,0,0,0.4)]"
        />
        <img
          data-md-item
          src={cldUrl("/media/mealdeal/flatwhite-web.png")}
          alt="Flat white"
          loading="lazy"
          decoding="async"
          className="pointer-events-none absolute bottom-[-47.5%] left-[52.5%] z-30 w-[40%] -translate-x-1/2 -rotate-[-4deg] drop-shadow-[0_12px_16px_rgba(0,0,0,0.4)]"
        />

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          data-md-item
          src={cldUrl("/media/word%20art/14%20MEAL%20DEAL.svg")}
          alt="£14 meal deal — all meal deals come with house-made nori crisps & a drink of your choice, available all day"
          className="pointer-events-none absolute -top-[3%] -bottom-[40%] -left-[0%] -right-[10%] z-40 object-contain"
        />
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
  // fbr = footer "CAFE MAMA & SONS" brand colour
  fbr: string;
  // footer-clock artwork — swapped per tab so the drinks variant pulls
  // the yellow halo + face, and food pulls the pink/wine pair
  clockShadow: string;
  clockFace: string;
  // Location-section pill CTA artwork — gold/wine on food, purple on
  // drinks. Same Rectangle 151 (glow halo) + Rectangle 152 (face) pair
  // as the rest of the buttons; just recoloured per tab.
  pillGlow: string;
  pillFace: string;
};
const bgVars = (isDrinks: boolean): BgVars =>
  isDrinks
    ? {
        f0: "#c4afe6",
        f1: "#9b81c9",
        b0: "#9b81c9",
        b1: "#7e63b0",
        // drinks footer now uses the food-menu gold background
        fa: "#fbd400",
        fb: "#f4c33c",
        lt: "#fbd400",
        lc: "#5b3f86",
        ab: 0,
        ay: 1,
        // drinks: footer brand matches the drinks page (purple) background
        fbr: "#9b81c9",
        clockShadow: `url('${cldUrl("/footerclock/drinksmenu/Ellipse%2069.svg")}')`,
        clockFace: `url('${cldUrl("/footerclock/drinksmenu/Ellipse%2070.svg")}')`,
        pillGlow: `url('${cldUrl("/buttons/drinksmenu/Rectangle%20151.svg")}')`,
        pillFace: `url('${cldUrl("/buttons/drinksmenu/Rectangle%20152.svg")}')`,
      }
    : {
        // food bg = the nav-bar / drinks-text yellow (gold), subtle radial
        f0: "#fbd400",
        f1: "#f4c33c",
        b0: "#f4c33c",
        b1: "#eab92f",
        // food footer matches the food-menu text colour (lavender)
        // fa: "#9b81c9",
        // fb: "#9b81c9",
        // lt: "#9b81c9",
        fa: "#FF1353",
        fb: "#FF1353",
        lt: "#FF1353",
        lc: "#f4c33c",
        ab: 1,
        ay: 0,
        fbr: "#f4c33c",
        clockShadow: `url('${cldUrl("/footerclock/Ellipse%2069.svg")}')`,
        clockFace: `url('${cldUrl("/footerclock/Ellipse%2070.svg")}')`,
        pillGlow: `url('${cldUrl("/buttons/Rectangle%20151.svg")}')`,
        pillFace: `url('${cldUrl("/buttons/Rectangle%20152.svg")}')`,
      };

function setBgVars(v: BgVars) {
  const s = document.documentElement.style;
  s.setProperty("--wave-f0", v.f0);
  s.setProperty("--wave-f1", v.f1);
  s.setProperty("--wave-b0", v.b0);
  s.setProperty("--wave-b1", v.b1);
  s.setProperty("--foot-a", v.fa);
  s.setProperty("--foot-b", v.fb);
  s.setProperty("--foot-brand", v.fbr);
  s.setProperty("--loc-text", v.lt);
  s.setProperty("--loc-card", v.lc);
  s.setProperty("--art-blue", String(v.ab));
  s.setProperty("--art-yellow", String(v.ay));
  s.setProperty("--foot-clock-shadow", v.clockShadow);
  s.setProperty("--foot-clock-face", v.clockFace);
  s.setProperty("--loc-pill-glow", v.pillGlow);
  s.setProperty("--loc-pill-face", v.pillFace);
}

export default function Menu() {
  const [active, setActive] = useState("sandos");
  const current = CATEGORIES.find((c) => c.key === active) ?? CATEGORIES[0];

  // (The mobile scroll-active row tracker was removed along with the inline
  // mobile menu-item image. GroupBlock no longer takes activeImg / registerRow
  // props, so there's nothing left to wire up here.)

  // The title, tabs and list rise + fade in each time the menu is revealed by
  // the hero→menu transition (which dispatches "menu:reveal"). They start hidden
  // so nothing shows behind the hero.
  const sectionRef = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      // Skip the rise-and-fade reveal on touch/small screens too — the y:60
      // stagger read as janky on mobile devices, so on <768px we render the
      // title, tabs and list at their final position from the start.
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const mobile = window.matchMedia("(max-width: 767px)").matches;
      if (reduce || mobile) return;
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
        accent: "#FF1353", // food text — was lavender #9b81c9
        body: "#FF1353", // item names + prices — was lavender #9b81c9
        dot: "rgba(255,19,83,0.5)",
        line: "rgba(255,19,83,0.3)",
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
      <div className="relative mx-auto w-full max-w-[1500px] px-4 pb-44 pt-6 sm:w-[80%] sm:px-8 sm:pt-10">
        {/* Framed menu — a vertical rule down each side, full-bleed rules across.
            Side rules are food-only (the drinks animation section omits them). */}
        <div className="relative">
          {/* Header rail — title + tabs framed with side rules (both tabs) */}
          <div className="relative">
            <SideRails color={theme.accent} />

          {/* Line above the title */}
          <FullRule color={theme.accent} className="mb-0" />

          {/* Title — line-box trimmed to cap height + baseline so the gap above
              and below is purely the symmetric py, not the font's whitespace.
              Letter gap set with tracking so Arial Black fits on a single line
              at narrower desktop widths. */}
          <h2
            data-reveal
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
          <nav
            data-reveal
            className="flex flex-wrap items-baseline justify-center gap-x-5 gap-y-1 [text-box:trim-both_cap_alphabetic] pt-[5px] pb-[5px] sm:gap-x-10"
          >
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
                  className={`font-cheee text-2xl uppercase leading-none tracking-tight transition-opacity sm:text-6xl ${
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
              // List rail — the menu items framed with side rules (both tabs)
              <div className="relative">
                <SideRails color={theme.accent} />
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

                {/* Allergen note — inside the rail so the side rules run through it */}
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

        {/* About us */}
        {/* <AboutUs accent={theme.accent} /> */}

        {/* Location widget — shares this section's gradient background. */}
        <Location />

        {/* Blog */}
        <Blog accent={theme.accent} />
      </div>

    </section>
    </MenuImagePreview>
  );
}
