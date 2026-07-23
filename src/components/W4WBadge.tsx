"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollSmoother } from "gsap/ScrollSmoother";

gsap.registerPlugin(useGSAP);

/**
 * W4WBadge — a floating gold-trimmed teardrop button fixed bottom-right. Taps
 * open a full-screen info card about Café Mama's Waves For Water partnership.
 * Sits in the same envelope as the old GallerySpin badge so the widget stack
 * above it (OpeningClock, FocusMode) doesn't need to move. A separate gold
 * "DONATE" pill sits directly to the left of the teardrop as a shortcut past
 * the info card.
 */
const GOLD = "#f4c33c";
const DONATE_URL = "https://www.wavesforwater.org/donate#donate-option-anchor";

export default function W4WBadge() {
  const [open, setOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLAnchorElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const wasPaused = useRef(false);
  // The hero lock (MenuReveal) also drives <html> overflow on mobile —
  // remember whatever value was there so closing the card restores it
  // instead of unlocking the hero.
  const prevOverflow = useRef("");

  // Idle bob — teardrop + pill share one tween so they hang together in
  // perfect sync. Same 1.8s sine.inOut yoyo the drop had before.
  useGSAP(() => {
    const targets = [dropRef.current, pillRef.current].filter(
      Boolean,
    ) as Element[];
    if (!targets.length) return;
    const t = gsap.to(targets, {
      y: -6,
      duration: 1.8,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });
    return () => t.kill();
  }, []);

  // Freeze the page under the modal — pause ScrollSmoother on desktop AND
  // set overflow:hidden on <html> so native scrolling (mobile, where there
  // is no smoother) can't move the page behind the card either. Slide the
  // card in from below on open. The backdrop is React-controlled (Tailwind
  // classes) so the initial hidden state is set purely in markup without a
  // mount-time GSAP tween racing the click.
  useEffect(() => {
    const sm = ScrollSmoother.get?.();
    if (open) {
      if (sm) {
        wasPaused.current = sm.paused();
        sm.paused(true);
      }
      prevOverflow.current = document.documentElement.style.overflow;
      document.documentElement.style.overflow = "hidden";
      if (card.current) {
        gsap.fromTo(
          card.current,
          { y: 40, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.5, ease: "power3.out" },
        );
      }
      return () => {
        document.documentElement.style.overflow = prevOverflow.current;
      };
    }
    sm?.paused(wasPaused.current);
  }, [open]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* Standalone DONATE pill — sits UNDER the teardrop, slightly overlapping
          its round belly so they read as one unit. Same iOS-liquid-glass
          treatment as the info card: dark blue-tinted translucent base,
          backdrop-blur that picks up whatever's behind it, thin gold-tinted
          border + top-lit rim, and a soft outer gold glow so it still reads
          as a call-to-action. Text is bold gold with a stacked drop-shadow
          so it pops against any page background. */}
      {/* Wrapper occupies exactly the teardrop's horizontal box (same right
          offset + width), so flex-centring the pill inside it pins the pill's
          centre to the drop's centre on every breakpoint — no transforms
          involved, so GSAP's idle bob (which owns the pill's transform for
          the y float) can't knock it off-centre. The pill may be wider than
          the wrapper; it overflows both sides equally. */}
      <div className="pointer-events-none fixed bottom-1 right-4 z-[56] flex w-20 justify-center sm:bottom-2 sm:right-6 sm:w-32">
        <a
          ref={pillRef}
          href={DONATE_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Donate to Waves For Water"
          // Glass treatment is desktop-only: a fixed backdrop-blur sitting
          // over the PLAYING hero video forces the GPU to re-blur that region
          // every frame — one of the biggest mobile lag sources. Phones get a
          // simple translucent dark base (the gold border + text-shadow keep
          // the pill legible on any backdrop); sm+ keeps the near-clear glass.
          className="pointer-events-auto inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-black/40 px-3 py-2 font-arialblack text-[10px] uppercase tracking-[0.18em] transition-transform duration-150 ease-out hover:scale-105 active:scale-[0.97] sm:gap-2 sm:bg-transparent sm:px-4 sm:py-2.5 sm:text-xs sm:tracking-[0.22em] sm:[background:linear-gradient(160deg,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0.04)_100%)] sm:[backdrop-filter:blur(22px)_saturate(180%)] sm:[-webkit-backdrop-filter:blur(22px)_saturate(180%)]"
          style={{
            border: `1.5px solid rgba(244,195,60,0.75)`,
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.5), 0 0 22px rgba(244,195,60,0.4), 0 10px 24px rgba(0,0,0,0.45)",
            color: GOLD,
            textShadow:
              "0 1px 2px rgba(0,0,0,0.85), 0 0 8px rgba(0,0,0,0.55), 0 0 16px rgba(0,0,0,0.35)",
          }}
        >
          <span aria-hidden style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.7))" }}>
            ♥
          </span>{" "}
          Donate
        </a>
      </div>

      {/* teardrop badge */}
      <div
        ref={dropRef}
        role="button"
        tabIndex={0}
        aria-label="Waves For Water — learn more"
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        // Mobile shrinks the whole widget stack (drop, clock, focus toggle)
        // ~30% — at h-28 the column was covering menu prices on phones.
        className="fixed bottom-6 right-4 z-[55] h-20 w-20 cursor-pointer transition-transform duration-150 ease-out active:scale-95 sm:right-6 sm:h-32 sm:w-32"
      >
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
          aria-hidden
        >
          <defs>
            <linearGradient id="w4w-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4aa8e6" />
              <stop offset="55%" stopColor="#1a76c8" />
              <stop offset="100%" stopColor="#0d4f8a" />
            </linearGradient>
            <radialGradient id="w4w-hi" cx="35%" cy="75%" r="30%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
          </defs>
          {/* tip up, round bottom — classic waterdrop, squeezed to a 100x100
              box so the badge keeps the same footprint as the old spinner and
              the OpeningClock above it doesn't have to move. */}
          <path
            d="M50 5 Q 30 25 20 48 A 32 32 0 1 0 80 48 Q 70 25 50 5 Z"
            fill="url(#w4w-fill)"
            stroke={GOLD}
            strokeWidth="3"
          />
          <ellipse cx="35" cy="78" rx="14" ry="7" fill="url(#w4w-hi)" />
        </svg>
        {/* Waves For Water Philippines logo, centered on the round part of
            the drop. Positioned absolutely so the SVG can keep its clean
            gradient + gold ring underneath. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/w4wcharity/w4w.png"
          alt="Waves For Water Philippines"
          draggable={false}
          className="pointer-events-none absolute left-1/2 top-[56%] w-[60%] -translate-x-1/2 -translate-y-1/2 select-none"
        />
      </div>

      {/* Info overlay — the backdrop blurs the whole page behind it (iOS-style
          liquid glass depends on real content showing through). Solid black-blue
          tint keeps the ocean palette without going fully opaque. */}
      <div
        className={`fixed inset-0 z-[95] flex items-center justify-center p-4 transition-opacity duration-300 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        style={{
          background: "rgba(6, 16, 36, 0.55)",
          backdropFilter: "blur(24px) saturate(140%)",
          WebkitBackdropFilter: "blur(24px) saturate(140%)",
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpen(false);
        }}
        aria-hidden={!open}
      >
        {/* Liquid-glass card — three layers stacked to build the iOS effect:
            1. `backdrop-blur` on the wrapper picks up the ocean backdrop.
            2. A soft white gradient overlay gives the "frosted" milk.
            3. The `inset 0 1px 0 rgba(255,255,255,0.35)` box-shadow rim +
               1px translucent border draw the classic top-lit glass edge.
            Content sits inside at high opacity so the text/images stay
            crisp and readable against the frosted base. */}
        <div
          ref={card}
          // Wider layout (max-w-6xl) + tighter vertical rhythm so the whole
          // card fits on a laptop screen without scrolling. Native scrollbar
          // stays hidden as a safety net for smaller viewports (custom cursor
          // wouldn't survive a real scrollbar thumb).
          // max-h-full (not a vh cap) — the backdrop is inset-0 + p-4, so
          // "full" is exactly the VISIBLE viewport minus padding. 92vh
          // overshot the real viewport on iOS (vh ignores the toolbars),
          // pushing the card's top edge off-screen and unreachable.
          className="relative max-h-full w-full max-w-[68rem] overflow-y-auto overscroll-contain rounded-[28px] p-5 sm:p-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{
            background:
              "linear-gradient(160deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.06) 45%, rgba(13,79,138,0.35) 100%)",
            backdropFilter: "blur(40px) saturate(180%)",
            WebkitBackdropFilter: "blur(40px) saturate(180%)",
            border: "1px solid rgba(255,255,255,0.22)",
            boxShadow:
              "inset 0 1px 0 0 rgba(255,255,255,0.35), inset 0 -1px 0 0 rgba(255,255,255,0.06), 0 30px 80px rgba(0,0,0,0.55)",
            color: "#ffffff",
          }}
        >
          {/* Close — pill, gold on glass */}
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="font-arialblack absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-sm transition-transform duration-150 ease-out hover:scale-105 active:scale-95 sm:right-5 sm:top-5"
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.25)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              color: GOLD,
            }}
          >
            ✕
          </button>

          {/* ── Row 1: Header (left) + big stats strip (right) ──────────
              pr keeps the eyebrow + headline clear of the absolute ✕ button
              in the card's top-right corner (it was overlapping the title
              on narrower cards); the lg grid puts the stats between the
              header and the ✕ so the padding can relax there. */}
          <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr] lg:gap-8">
            <header className="flex items-start gap-4 pr-12 lg:pr-0">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.28)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4)",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/w4wcharity/w4w.png"
                  alt="Waves For Water Philippines"
                  className="h-full w-full object-contain p-1.5"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className="font-arialblack text-[10px] uppercase tracking-[0.32em] opacity-90 sm:text-xs"
                  style={{ color: GOLD }}
                >
                  Café Mama × Waves For Water
                </p>
                <h2
                  className="font-arialblack mt-2 text-3xl leading-[0.9] tracking-tight sm:text-[2.65rem]"
                  style={{ textShadow: "0 2px 20px rgba(0,0,0,0.35)" }}
                >
                  Get clean water to everyone who needs it.
                </h2>
              </div>
            </header>

            {/* Impact stats — 2x2 mini grid so it doesn't tower on desktop */}
            <div
              className="grid grid-cols-2 gap-0 overflow-hidden rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.18)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25)",
              }}
            >
              {[
                { n: "2M+", label: "Filipino lives impacted" },
                { n: "33,178", label: "Filters implemented" },
                { n: "82", label: "Provinces reached" },
                { n: "1,394", label: "Handwashing stations" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex flex-col justify-between p-3.5 sm:p-4"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.08)", borderLeft: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <span
                    className="font-arialblack text-2xl leading-none tracking-tight sm:text-[1.75rem]"
                    style={{ color: GOLD }}
                  >
                    {s.n}
                  </span>
                  <span className="mt-1.5 text-[10px] uppercase tracking-[0.15em] opacity-80 sm:text-[11px]">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Row 2: Intro paragraph (kept tight) ───────────────────── */}
          <p className="mt-5 max-w-3xl text-sm leading-relaxed opacity-95 sm:text-[15px]">
            Waves For Water is a global humanitarian non-profit that delivers
            clean-water, sanitation and hygiene solutions where they&apos;re
            needed most. In the Philippines they&apos;ve been on the ground
            since Typhoon Yolanda in 2013 — every peso we send keeps a filter
            running.{" "}
            <a
              href="https://www.canva.com/design/DAGLLQJIxf4/yV5Luo_zexcI7-6WW-fhbA/view?utm_content=DAGLLQJIxf4&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h64793d6800"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline underline-offset-2 transition-opacity hover:opacity-75"
              style={{ color: GOLD }}
            >
              See the full W4W deck for more information →
            </a>
          </p>

          {/* ── Row 3: Problem / System — two columns, tight rhythm ───── */}
          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            <section>
              <h3
                className="font-arialblack text-[11px] uppercase tracking-[0.28em]"
                style={{ color: GOLD }}
              >
                The problem
              </h3>
              <ul className="mt-2 space-y-1.5 text-[13px] leading-relaxed opacity-95">
                <li className="flex gap-3">
                  <span className="opacity-60">·</span>
                  <span>
                    <strong>1 in 4</strong> people globally lack safe drinking
                    water.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="opacity-60">·</span>
                  <span>
                    <strong>1 in 10</strong> Filipinos still lack improved water
                    sources.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="opacity-60">·</span>
                  <span>
                    Acute watery diarrhea was a top-10 cause of death in the
                    Philippines in 2016 — <strong>139,000+</strong> lives lost.
                  </span>
                </li>
              </ul>
            </section>

            <section>
              <h3
                className="font-arialblack text-[11px] uppercase tracking-[0.28em]"
                style={{ color: GOLD }}
              >
                The system
              </h3>
              <ul className="mt-2 space-y-1.5 text-[13px] leading-relaxed opacity-95">
                <li className="flex gap-3">
                  <span className="opacity-60">·</span>
                  <span>Point-of-use bucket filter, gravity-fed, no electricity.</span>
                </li>
                <li className="flex gap-3">
                  <span className="opacity-60">·</span>
                  <span>
                    <strong>~3 million litres</strong> per filter over{" "}
                    <strong>5+ years</strong>.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="opacity-60">·</span>
                  <span>
                    <strong>99.99%</strong> removal of bacteria &amp; protozoan
                    cysts — exceeds EPA.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="opacity-60">·</span>
                  <span>
                    <strong style={{ color: GOLD }}>PHP 3,450</strong> funds one
                    Clean Water System.
                  </span>
                </li>
              </ul>
            </section>
          </div>

          {/* ── Row 4: How Café Mama helps + Donate CTA ────────────────
              A wide callout with the W4W field photo on the left and the
              50p-per-sando pledge + big gold donate button on the right. This
              is the reason the card exists, so it earns the biggest visual
              weight at the bottom of the layout. */}
          <section
            className="mt-6 grid gap-0 overflow-hidden rounded-2xl md:grid-cols-[minmax(0,1.05fr)_minmax(0,1.4fr)]"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.2)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.28)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/w4wcharity/DSC05407-web.jpg"
              alt="W4W beneficiaries in the Philippines with their new clean-water bucket filters"
              className="h-52 w-full object-cover md:h-full"
            />
            <div className="flex flex-col justify-between gap-4 p-5 sm:p-6">
              <div>
                <h3
                  className="font-arialblack text-[11px] uppercase tracking-[0.28em]"
                  style={{ color: GOLD }}
                >
                  How Café Mama helps
                </h3>
                <p className="mt-2 font-arialblack text-xl leading-[1.05] tracking-tight sm:text-2xl">
                  For every{" "}
                  <span style={{ color: GOLD }}>monthly special sando</span>{" "}
                  sold, we donate{" "}
                  <span style={{ color: GOLD }}>50p</span> to Waves For Water
                  Philippines.
                </p>
                <p className="mt-2 text-[13px] leading-relaxed opacity-90">
                  Every ~<strong>PHP 3,450</strong> raised funds a full Clean
                  Water System — 3 million litres, 5+ years, one family at a
                  time. Add a monthly special to your order, or chip in directly
                  →
                </p>
              </div>

              {/* Very obvious donate CTA — bright gold, thick border, tall
                  target. This is the primary action of the whole card. */}
              <a
                href={DONATE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-between gap-4 rounded-2xl px-6 py-4 transition-transform duration-150 ease-out hover:scale-[1.015] active:scale-[0.98]"
                style={{
                  background: GOLD,
                  color: "#0d3e6d",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.65), 0 12px 26px rgba(244,195,60,0.35), 0 0 0 1px rgba(255,255,255,0.25)",
                }}
              >
                <span className="font-arialblack text-base uppercase leading-none tracking-[0.15em] sm:text-lg">
                  Donate to Waves For Water
                </span>
                <span
                  aria-hidden
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg leading-none transition-transform group-hover:translate-x-0.5"
                  style={{ background: "#0d3e6d", color: GOLD }}
                >
                  →
                </span>
              </a>
            </div>
          </section>

          {/* ── Footer tagline ────────────────────────────────────────── */}
          <p
            className="font-arialblack mt-5 text-center text-[10px] uppercase tracking-[0.32em] opacity-90 sm:text-xs"
            style={{ color: GOLD, textShadow: "0 2px 12px rgba(0,0,0,0.35)" }}
          >
            Do what you love + help along the way.
          </p>
        </div>
      </div>
    </>
  );
}
