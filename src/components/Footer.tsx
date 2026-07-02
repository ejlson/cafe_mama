"use client";

import { useEffect, useRef, useState } from "react";
import { cldUrl } from "@/lib/cloudinary";

const CENTER =
  "M0-0.3C0-0.3,464,0,1139,0s1139-0.3,1139-0.3V683H0V-0.3z";

// Instagram glyph for the footer's order-online nav. 24×24 viewBox so it
// renders crisply at any line-height.
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.06 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.06 1.17-.25 1.8-.41 2.23a3.7 3.7 0 0 1-.9 1.38c-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.06-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.06-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.86 5.86 0 0 0-2.12 1.39A5.86 5.86 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.79.73 1.46 1.39 2.12.66.66 1.33 1.08 2.12 1.39.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.86 5.86 0 0 0 2.12-1.39 5.86 5.86 0 0 0 1.39-2.12c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.86 5.86 0 0 0-1.39-2.12A5.86 5.86 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0Zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.41-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88Z" />
    </svg>
  );
}

const ORDER_LINKS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/cafe_mama_sons/",
    Icon: InstagramIcon,
  },
];

// London (Europe/London) is the cafe's actual local time — keep it correct
// regardless of where the visitor's browser sits.
function londonNow(d: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    hour12: false,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const dayMap: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  };
  return {
    h: Number(get("hour")),
    m: Number(get("minute")),
    s: Number(get("second")),
    // Sub-second precision shared across timezones — used so the second
    // hand sweeps smoothly between integer ticks and the 59→0 wrap snaps
    // in a single raf frame instead of being interpolated backward by CSS.
    ms: d.getMilliseconds(),
    tz: get("timeZoneName") || "GMT",
    day: dayMap[get("weekday")] ?? new Date().getDay(),
  };
}

type Time = { h: number; m: number; s: number; ms: number; tz: string; day: number };

// Cafe Mama hours mirror OpeningClock / Location: Mon–Fri 8–17, Sat–Sun 9–17.
function isOpenNow(t: Time) {
  const [open, close] = t.day === 0 || t.day === 6 ? [9, 17] : [8, 17];
  const decimalHour = t.h + t.m / 60;
  return decimalHour >= open && decimalHour < close;
}

function useLondonTime() {
  const [t, setT] = useState<Time | null>(null);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      setT(londonNow(new Date()));
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, []);
  return t;
}

function ClockFace({ t }: { t: Time }) {
  // Sub-second second value so the hand sweeps in raf rather than ticking
  // each integer second. `t` updates every animation frame via
  // requestAnimationFrame, so secAngle advances by tiny increments and the
  // 59→0 wrap snaps within one frame instead of CSS-interpolating backward
  // from 354° to 0°.
  const sFrac = t.s + t.ms / 1000;
  const mFrac = t.m + sFrac / 60;
  const hFrac = (t.h % 12) + mFrac / 60;

  const hourAngle = (hFrac / 12) * 360;
  const minAngle = (mFrac / 60) * 360;
  const secAngle = (sFrac / 60) * 360;

  // SVG geometry — clock face is 400×400, centred on (200,200).
  const C = 200;
  const R = 180;

  const open = isOpenNow(t);
  const statusText = open ? "(I think) we're open" : "we're closed :(";

  // Elevation comes from two stacked artwork layers driven by CSS vars:
  //   --foot-clock-shadow → wide, heavily blurred halo (the "shadow")
  //   --foot-clock-face   → disc face that matches the active tab colour
  // Menu.tsx swaps these per active category, so the drinks tab pulls the
  // yellow variant from /footerclock/drinksmenu while food uses the
  // pink/wine variant from /footerclock.
  // The clock disc inside the SVG artwork is 715×715 (radius 357.5).
  // Container = that disc size, so the visible face edge aligns with the
  // container box and the dial SVG fills it 1:1.
  return (
    // Clock face artwork is fixed at 715×715 with absolutely-positioned
    // overlays up to 915px wide. The parent wrapper handles mobile scaling
    // (see Footer return), so this container just lays out the dial at
    // native size.
    <div className="relative aspect-square h-[715px] w-[715px] max-w-full">
      {/* shadow halo — rendered at the SVG's natural pixel size (food
          variant is 915×915, drinks is 815×815). `background-size: auto`
          forces the native dimensions; the 915² box is big enough to hold
          either variant centred without clipping the blur edge. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[915px] w-[915px] max-w-none -translate-x-1/2 -translate-y-1/2 select-none bg-center bg-no-repeat"
        style={{
          backgroundImage: `var(--foot-clock-shadow, url('${cldUrl("/footerclock/Ellipse%2069.svg")}'))`,
          backgroundSize: "auto",
        }}
      />
      {/* face disc — native size (food 759×759, drinks 765×765). The 765²
          box accommodates either variant. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[765px] w-[765px] max-w-none -translate-x-1/2 -translate-y-1/2 select-none bg-center bg-no-repeat"
        style={{
          backgroundImage: `var(--foot-clock-face, url('${cldUrl("/footerclock/Ellipse%2070.svg")}'))`,
          backgroundSize: "auto",
        }}
      />

      {/* Open / Closed status — same Archivo body font as the menu item
          descriptions, full-caps, near the top of the dial */}
      <div
        className="pointer-events-none absolute left-1/2 top-[22%] z-10 -translate-x-1/2 select-none whitespace-nowrap text-center text-xs font-semibold uppercase tracking-[0.2em] [color:var(--foot-brand,#f4c33c)] opacity-90 sm:text-sm"
      >
        {statusText}
      </div>
      {/* Cafe Mama mark, masked to the brand text colour. Mask served via
          Cloudinary — /public/media is gitignored so the local path 404s in
          production and the mark vanishes. */}
      <span
        aria-hidden
        className="absolute left-1/2 top-1/2 block h-[34%] w-[34%] -translate-x-1/2 -translate-y-1/2 opacity-30"
        style={{
          backgroundColor: "var(--foot-brand, #f4c33c)",
          WebkitMaskImage: `url(${cldUrl("/media/logo/CAFE MAMA SQUARE LOGO.png")})`,
          maskImage: `url(${cldUrl("/media/logo/CAFE MAMA SQUARE LOGO.png")})`,
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
        }}
      />

      {/* Dial SVG matches the container 1:1 — the container IS the disc
          visible diameter (715 px), so R=180 in the viewBox lands at 90%
          of the disc, putting the rim ring right where the face edge is. */}
      <svg
        viewBox="0 0 400 400"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden
      >
        {/* outer rim ring — thin and crisp */}
        <circle
          cx={C}
          cy={C}
          r={R}
          fill="none"
          stroke="var(--foot-brand, #f4c33c)"
          strokeOpacity={0.85}
          strokeWidth={0.8}
        />

        {/* 60 minute ticks — thinner and more opaque, between the rim
            and the numerals */}
        {Array.from({ length: 60 }).map((_, i) => {
          const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
          const r1 = R - 12;
          const r2 = R - 6;
          return (
            <line
              key={i}
              x1={C + Math.cos(a) * r1}
              y1={C + Math.sin(a) * r1}
              x2={C + Math.cos(a) * r2}
              y2={C + Math.sin(a) * r2}
              stroke="var(--foot-brand, #f4c33c)"
              strokeOpacity={0.95}
              strokeWidth={0.7}
              strokeLinecap="round"
            />
          );
        })}

        {/* hour numerals 1..12 — slightly smaller, inside the tick ring */}
        {Array.from({ length: 12 }).map((_, i) => {
          const num = i + 1;
          const a = (num / 12) * Math.PI * 2 - Math.PI / 2;
          const rText = R - 32;
          return (
            <text
              key={num}
              x={C + Math.cos(a) * rText}
              y={C + Math.sin(a) * rText}
              textAnchor="middle"
              dominantBaseline="central"
              fontFamily="'Courier New', ui-monospace, monospace"
              fontSize={14}
              fontWeight={700}
              fill="var(--foot-brand, #f4c33c)"
              opacity={1}
            >
              {num}
            </text>
          );
        })}

        {/* hour hand */}
        <g transform={`rotate(${hourAngle} ${C} ${C})`}>
          <path
            d={`M ${C - 4} ${C + 14}
                L ${C + 4} ${C + 14}
                L ${C + 2.4} ${C - 92}
                L ${C - 2.4} ${C - 92} Z`}
            fill="var(--foot-brand, #f4c33c)"
          />
        </g>

        {/* minute hand */}
        <g transform={`rotate(${minAngle} ${C} ${C})`}>
          <path
            d={`M ${C - 3} ${C + 18}
                L ${C + 3} ${C + 18}
                L ${C + 1.6} ${C - 138}
                L ${C - 1.6} ${C - 138} Z`}
            fill="var(--foot-brand, #f4c33c)"
          />
        </g>

        {/* second hand — thin orange line with counterweight. No CSS
            transition: secAngle now advances every raf with sub-second
            precision, so the hand moves smoothly without the browser
            interpolating the 59→0 wrap backward across the dial. */}
        <g transform={`rotate(${secAngle} ${C} ${C})`}>
          <rect
            x={C - 0.9}
            y={C - 156}
            width={1.8}
            height={184}
            fill="#ff7a2f"
          />
          <rect
            x={C - 2}
            y={C + 4}
            width={4}
            height={30}
            rx={1.5}
            fill="#ff7a2f"
          />
        </g>

        {/* centre hub */}
        <circle cx={C} cy={C} r={5.5} fill="var(--foot-brand, #f4c33c)" />
        <circle
          cx={C}
          cy={C}
          r={3.2}
          fill="none"
          stroke="#ff7a2f"
          strokeWidth={1.6}
        />
      </svg>
    </div>
  );
}

export default function Footer() {
  const ref = useRef<HTMLElement>(null);
  const time = useLondonTime();

  // Scroll-driven corner rounding for the menu-card. As the user approaches
  // the end of the menu, the card's bottom corners round up so it reads like
  // the card is peeling away to expose this footer through the gaps.
  //
  // Polled with rAF instead of a scroll listener because ScrollSmoother
  // drives the page via a CSS transform on #smooth-content and DOESN'T fire
  // scroll events on the wrapper — a "scroll" handler here would never run.
  // A rAF tick is cheap (one getBoundingClientRect + two style writes) and
  // stays perfectly in sync with the smoother's own render cadence.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const card = document.querySelector<HTMLElement>("[data-menu-card]");
    if (!card) return;

    const maxRadius =
      window.matchMedia("(min-width: 640px)").matches ? 64 : 40;

    let raf = 0;
    let lastR = -1;
    const tick = () => {
      const vh = window.innerHeight;
      const cardBottom = card.getBoundingClientRect().bottom;
      // Progress 0 → card.bottom is at/below viewport bottom (no rounding).
      // Progress 1 → card.bottom has travelled one viewport-height upward
      // off the screen (full rounding). Squared so the curve starts gently
      // and accelerates as the card lifts further — feels more "peel-y".
      const linear = Math.max(0, Math.min(1, (vh - cardBottom) / vh));
      const eased = linear * linear;
      const r = Math.round(eased * maxRadius * 100) / 100;
      if (r !== lastR) {
        const px = `${r}px`;
        card.style.borderBottomLeftRadius = px;
        card.style.borderBottomRightRadius = px;
        lastR = r;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const digital = time
    ? `${String(time.h).padStart(2, "0")}:${String(time.m).padStart(2, "0")}`
    : "";

  return (
    <footer
      ref={ref}
      // Pinned to the viewport, behind the smooth-scroll content. The menu
      // card scrolls up over the top of it; the slide-up reveal happens
      // because main moves off the bottom of the screen while this stays
      // put. grid + place-items-center centres the clock in the viewport.
      className="fixed inset-x-0 bottom-0 z-0 grid h-screen w-full place-items-center overflow-hidden text-cream"
    >
      {/* curved top edge + full-bleed gradient panel */}
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
            <stop offset="0" style={{ stopColor: "var(--foot-a, #ff7a2f)" }} />
            <stop offset="1" style={{ stopColor: "var(--foot-b, #e8362b)" }} />
          </linearGradient>
        </defs>
        <path id="bouncy-path" fill="url(#footGrad)" d={CENTER} />
      </svg>

      {/* top-right ordering stack — Instagram + delivery partners. Each row
          is `LABEL [ICON]`; the icon column is fixed-width so the three
          glyphs line up vertically regardless of label length. */}
      <nav
        aria-label="Order online"
        // Mobile top offset bumped 10 → 20 so the Instagram / delivery nav
        // clears the shopfront navbar area and sits comfortably in the
        // footer's upper zone instead of hugging the top edge. Desktop
        // (sm:top-14, lg:right-16) unchanged.
        className="absolute right-6 top-20 z-[50] flex flex-col items-end gap-2 sm:right-10 sm:top-14 lg:right-16"
      >
        {ORDER_LINKS.map(({ href, label, Icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] [color:var(--foot-brand,#f4c33c)] transition-opacity hover:opacity-70 sm:text-sm"
          >
            <span>{label}</span>
            <span className="flex h-5 w-5 shrink-0 items-center justify-center sm:h-6 sm:w-6">
              <Icon className="h-full w-full" />
            </span>
          </a>
        ))}
      </nav>

      {/* left rail — digital readout, edge-aligned, vertically centred with clock.
          Slight inner-shadow effect: a soft dark stroke at the top of the
          glyphs + a hairline highlight at the bottom — reads as letters
          pressed into the surface. */}
      {time && (
        <div
          className="font-arialblack pointer-events-none absolute left-6 top-1/2 z-10 hidden -translate-y-1/2 select-none whitespace-nowrap text-[clamp(2rem,4.5vw,4.5rem)] leading-none tracking-[0.12em] [color:var(--foot-brand,#f4c33c)] sm:left-10 md:block lg:left-16"
          style={{
            textShadow:
              "0 -1px 1px rgba(0,0,0,0.32), 0 1px 0 rgba(255,255,255,0.18)",
          }}
        >
          {digital}
        </div>
      )}

      {/* right rail — timezone, same inset feel */}
      {time && (
        <div
          className="font-arialblack pointer-events-none absolute right-6 top-1/2 z-10 hidden -translate-y-1/2 select-none whitespace-nowrap text-[clamp(2rem,4.5vw,4.5rem)] leading-none tracking-[0.12em] [color:var(--foot-brand,#f4c33c)] sm:right-10 md:block lg:right-16"
          style={{
            textShadow:
              "0 -1px 1px rgba(0,0,0,0.32), 0 1px 0 rgba(255,255,255,0.18)",
          }}
        >
          {time.tz}
        </div>
      )}

      {/* centerpiece — clock disc dead-centre. Absolute + translate guarantees
          the wrap is centred even when its 715×715 contents overflow a
          mobile viewport; the scale shrinks the visual on small screens so
          the dial, halo and "we're closed" caption all fit on-screen. Mobile
          scale bumped 0.42 → 0.55 so the clock reads clearly at phone
          widths — the previous size was too tight against the horizon. */}
      <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 scale-[0.55] sm:scale-100">
        {time && <ClockFace t={time} />}
      </div>

      {/* mobile-only stacked readout — sits between the Instagram nav and
          the top of the clock face. Bottom-anchored on mobile would collide
          with the W4WBadge / OpeningClock / FocusMode widget stack on the
          right rail, so top-anchored keeps it visible and uncluttered.
          top pushed 6.5 → 11 so the "HH:MM · BST" line clears the
          Instagram / delivery nav (which sits at top-20 = 80px on mobile)
          with comfortable breathing room. */}
      {time && (
        <div
          className="font-arialblack pointer-events-none absolute left-1/2 top-[11rem] z-10 -translate-x-1/2 select-none whitespace-nowrap text-lg leading-none tracking-[0.12em] [color:var(--foot-brand,#f4c33c)] md:hidden"
        >
          {digital} · {time.tz}
        </div>
      )}
    </footer>
  );
}
