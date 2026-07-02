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
  const card = useRef<HTMLDivElement>(null);
  const wasPaused = useRef(false);

  // idle bob — gives the drop a subtle "hanging" feel without competing with
  // the OpeningClock's rotation directly above it.
  useGSAP(() => {
    if (!dropRef.current) return;
    const t = gsap.to(dropRef.current, {
      y: -6,
      duration: 1.8,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });
    return () => t.kill();
  }, []);

  // pause the smooth scroller under the modal, and slide the card in from
  // below on open. The backdrop is React-controlled (Tailwind classes) so
  // the initial hidden state is set purely in markup without a mount-time
  // GSAP tween racing the click.
  useEffect(() => {
    const sm = ScrollSmoother.get?.();
    if (open) {
      if (sm) {
        wasPaused.current = sm.paused();
        sm.paused(true);
      }
      if (card.current) {
        gsap.fromTo(
          card.current,
          { y: 40, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.5, ease: "power3.out" },
        );
      }
    } else {
      sm?.paused(wasPaused.current);
    }
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
          its round belly so they read as one unit. z-[56] > teardrop's z-[55]
          so the pill always floats on top of the overlap. Right-edge lines up
          with the teardrop's right edge; bottom offset is small so the pill
          hugs the bottom of the viewport with ~20px of overlap into the drop. */}
      <a
        href={DONATE_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Donate to Waves For Water"
        className="fixed bottom-1 right-4 z-[56] inline-flex items-center gap-2 rounded-full px-4 py-2.5 font-arialblack text-[11px] uppercase tracking-[0.2em] shadow-[0_8px_24px_rgba(0,0,0,0.45)] transition-transform hover:scale-105 sm:bottom-2 sm:right-6 sm:text-xs"
        style={{
          background: GOLD,
          color: "#0d4f8a",
          border: "2px solid #ffffff",
        }}
      >
        <span aria-hidden>♥</span> Donate
      </a>

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
        className="fixed bottom-6 right-6 z-[55] h-28 w-28 cursor-pointer sm:h-32 sm:w-32"
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
          className="relative max-h-[92vh] w-full max-w-[68rem] overflow-y-auto rounded-[28px] p-5 sm:p-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
            className="font-arialblack absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-sm transition-transform hover:scale-105 sm:right-5 sm:top-5"
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

          {/* ── Row 1: Header (left) + big stats strip (right) ────────── */}
          <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr] lg:gap-8">
            <header className="flex items-start gap-4">
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
            running.
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
                className="group inline-flex items-center justify-between gap-4 rounded-2xl px-6 py-4 transition-transform hover:scale-[1.015]"
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
