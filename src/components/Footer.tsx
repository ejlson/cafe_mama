"use client";

import { useEffect, useRef, useState } from "react";

const CENTER =
  "M0-0.3C0-0.3,464,0,1139,0s1139-0.3,1139-0.3V683H0V-0.3z";

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
    <div className="relative aspect-square h-[715px] w-[715px] max-w-full">
      {/* shadow halo — rendered at the SVG's natural pixel size (food
          variant is 915×915, drinks is 815×815). `background-size: auto`
          forces the native dimensions; the 915² box is big enough to hold
          either variant centred without clipping the blur edge. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[915px] w-[915px] max-w-none -translate-x-1/2 -translate-y-1/2 select-none bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "var(--foot-clock-shadow, url('/footerclock/Ellipse%2069.svg'))",
          backgroundSize: "auto",
        }}
      />
      {/* face disc — native size (food 759×759, drinks 765×765). The 765²
          box accommodates either variant. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[765px] w-[765px] max-w-none -translate-x-1/2 -translate-y-1/2 select-none bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "var(--foot-clock-face, url('/footerclock/Ellipse%2070.svg'))",
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
      {/* Cafe Mama mark, masked to the brand text colour */}
      <span
        aria-hidden
        className="absolute left-1/2 top-1/2 block h-[34%] w-[34%] -translate-x-1/2 -translate-y-1/2 opacity-30"
        style={{
          backgroundColor: "var(--foot-brand, #f4c33c)",
          WebkitMaskImage: "url('/media/logo/CAFE%20MAMA%20SQUARE%20LOGO.png')",
          maskImage: "url('/media/logo/CAFE%20MAMA%20SQUARE%20LOGO.png')",
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

      {/* top-right ordering stack — Instagram + delivery partners. Same
          Archivo body font as the "(I think) we're open" status overlay. */}
      <nav
        aria-label="Order online"
        className="absolute right-6 top-10 z-10 flex flex-col items-end gap-2 sm:right-10 sm:top-14 lg:right-16"
      >
        <a
          href="https://www.instagram.com/cafe_mama_sons/"
          target="_blank"
          rel="noreferrer"
          className="text-xs font-semibold uppercase tracking-[0.2em] [color:var(--foot-brand,#f4c33c)] transition-opacity hover:opacity-70 sm:text-sm"
        >
          Instagram
        </a>
        <a
          // Search Deliveroo for the cafe — drop in the direct store URL
          // once the listing is live.
          href="https://deliveroo.co.uk/search?query=Cafe+Mama+Sons"
          target="_blank"
          rel="noreferrer"
          className="text-xs font-semibold uppercase tracking-[0.2em] [color:var(--foot-brand,#f4c33c)] transition-opacity hover:opacity-70 sm:text-sm"
        >
          Deliveroo
        </a>
        <a
          // Search Uber Eats for the cafe — drop in the direct store URL
          // once the listing is live.
          href="https://www.ubereats.com/gb/search?q=Cafe+Mama+%26+Sons"
          target="_blank"
          rel="noreferrer"
          className="text-xs font-semibold uppercase tracking-[0.2em] [color:var(--foot-brand,#f4c33c)] transition-opacity hover:opacity-70 sm:text-sm"
        >
          Uber Eats
        </a>
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

      {/* centerpiece — clock disc dead-centre */}
      <div className="relative z-10">
        {time && <ClockFace t={time} />}
      </div>

      {/* mobile-only stacked readout under the clock */}
      {time && (
        <div
          className="font-arialblack pointer-events-none absolute bottom-16 left-1/2 z-10 -translate-x-1/2 select-none text-2xl leading-none tracking-[0.12em] [color:var(--foot-brand,#f4c33c)] md:hidden"
        >
          {digital} · {time.tz}
        </div>
      )}
    </footer>
  );
}
