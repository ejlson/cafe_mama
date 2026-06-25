"use client";

import { useRef } from "react";

const ADDRESS = "83 Kentish Town Rd, London NW1 8NY";
const MAPS_QUERY = encodeURIComponent(
  "Cafe Mama & Sons, 83 Kentish Town Rd, London NW1 8NY",
);
const DIRECTIONS = `https://www.google.com/maps/search/?api=1&query=${MAPS_QUERY}`;
// TODO: replace with the exact write-review link once the Google Business
// Profile place ID is to hand:
//   https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID
// Until then, the search-by-name URL lands users on our Business panel where
// "Write a review" is one tap away.
const REVIEW_URL = `https://www.google.com/search?q=${MAPS_QUERY}#lrd=`;
const INSTAGRAM_URL = "https://www.instagram.com/cafe_mama_sons/";

// Section palette — driven by the same --loc-* CSS variables the menu uses
// for its per-tab theme, so the LOCATION panel re-tints smoothly with the
// active tab (food = yellow + red, drinks = purple + yellow). The fallbacks
// are the food-tab values so the panel renders correctly before Menu's
// useGSAP effect installs the live values on first mount.
const YELLOW = "var(--loc-card, #f4c33c)";
const RED = "var(--loc-text, #FF1353)";
const BLUE = "#2463C3";

/**
 * Location section — Japanese magazine / manga-inspired layout. A red strap
 * carries the LOCATION title across the top of a vertically-striped yellow
 * field, with a two-column body underneath: map on the left, headline +
 * description + CTAs on the right.
 *
 * TODO: swap the embed iframe for Google Maps JavaScript API's photorealistic
 * 3D view once an API key is in place
 * (developers.google.com/maps/documentation/javascript/3d-maps-overview).
 * The 2D embed below is the visual fallback.
 */
export default function Location() {
  const root = useRef<HTMLDivElement>(null);

  return (
    <div ref={root} id="location" className="relative">
      {/* LOCATION title — same poster treatment as MENU and BLOG: the title
          in the accent colour on the menu section's natural gradient, with
          a single horizontal rule below. The line ABOVE comes from the
          FullRule rendered under CollabMarquee in Menu.tsx, so we don't
          repeat one here (a double rule was reading as a heavy bar). */}
      <h2
        aria-label="Location"
        style={{ color: RED }}
        // Two variants: the mobile one is plain "LOCATION" so it can scale
        // up dramatically without the inter-letter spaces eating width; the
        // desktop one keeps the justified-spread "L O C A T I O N" so the
        // letters fill the wrapper rail-to-rail. title-shadow is applied
        // PER SPAN (not on the h2) because the text-shadow uses em units —
        // it has to be calculated against the span's own large font-size,
        // not the h2's default 16px.
        className="block w-full whitespace-nowrap font-poster leading-none [text-box:trim-both_cap_alphabetic] pt-[0.035em] pb-[0.08em] text-center"
      >
        {/* sr-only text so crawlers / screen readers always read the proper
            word "Location" even when the visible content is space-separated
            (which some user agents render letter-by-letter). */}
        <span className="sr-only">Location</span>
        <span
          aria-hidden
          className="title-shadow block text-[17vw] sm:hidden"
        >
          LOCATION
        </span>
        <span
          aria-hidden
          className="title-shadow hidden w-full text-justify [text-align-last:justify] text-[clamp(2rem,8.5vw,9.5rem)] sm:block"
        >
          L O C A T I O N
        </span>
      </h2>
      <div
        aria-hidden
        style={{ backgroundColor: RED }}
        className="relative left-1/2 mt-[5px] h-px w-[calc(100%+2rem)] -translate-x-1/2"
      />

      {/* Two-column body — map on the left, content (headline + 2-col
          description + CTAs) on the right. Map stretches to the right
          column's height so its bottom edge lines up with the last CTA. */}
      <div className="grid items-stretch gap-6 pb-8 pt-3 sm:grid-cols-[42%_1fr] sm:gap-10 sm:pb-12 sm:pt-4">
        {/* Map — TODO: swap for the Google Maps JS 3D photorealistic view.
            Aspect-square on mobile, stretched to grid row height on desktop
            (sm:!aspect-auto forces the override). */}
        <div
          className="relative aspect-square overflow-hidden rounded-2xl bg-[#dcd5cf] sm:!aspect-auto sm:h-full sm:min-h-[480px]"
        >
          <iframe
            title="Map to Cafe Mama & Sons"
            className="h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://maps.google.com/maps?q=${MAPS_QUERY}&z=17&output=embed`}
          />
          {/* Inset-shadow overlay — pointer-events-none so the iframe stays
              interactive underneath. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{ boxShadow: "inset 0 0 36px rgba(0,0,0,0.45)" }}
          />
        </div>

        {/* Right column — headline, two-column description, CTAs */}
        <div className="flex flex-col" style={{ color: RED }}>
          <h3 className="font-cheee font-arialblack uppercase leading-[0.92] text-left sm:text-right">
            <span className="block text-[9vw] sm:text-[7rem]">Where</span>
            <span className="block text-[9vw] sm:text-[7rem]">are we?</span>
          </h3>

          {/* Two-column description — left col is the address + hours, right
              col is the brand copy. Body type matches the menu's allergen /
              category-blurb pattern: Archivo (the page body font),
              text-[11px] sm:text-xs, font-semibold, uppercase, tracking-wide,
              opacity-70. */}
          <div className="mt-5 grid gap-4 text-[11px] font-semibold uppercase leading-snug tracking-wide opacity-90 sm:mt-8 sm:grid-cols-2 sm:gap-7 sm:text-xs">
            <div className="space-y-3 sm:space-y-4">
              <p>
                {ADDRESS}. A corner spot between Camden Lock and Kentish Town
                Station — the bright shopfront is hard to miss.
              </p>
              <p>
                Open Monday to Friday from 8am, Saturday and Sunday from 9am.
                Kitchen serves all-day breakfast meals and sandos until close.
              </p>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <p>
                Filipino-Japanese sandos, all-day pandesal breakfast meals,
                house drinks, and freshly-baked goods. Made by mama, served
                by the sons.
              </p>
              <p>
                Drop in for a quick coffee or stay the morning — there&apos;s
                always a corner seat with your name on it.
              </p>
            </div>
          </div>

          {/* CTAs — Get Directions (outlined, narrower) + Instagram (filled,
              wider) on top, Leave a Review spans the row below. */}
          <div className="mt-5 grid grid-cols-1 gap-3 sm:mt-10 sm:grid-cols-[1fr_1.5fr] sm:gap-4">
            <a
              href={DIRECTIONS}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border-[3px] px-5 py-3 text-center font-arialblack text-xs uppercase tracking-[0.18em] transition-transform hover:-translate-y-0.5 sm:text-sm"
              style={{ borderColor: RED, color: RED }}
            >
              Get Directions
            </a>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border-[3px] px-5 py-3 text-center font-arialblack text-xs uppercase tracking-[0.18em] transition-transform hover:-translate-y-0.5 sm:text-sm"
              style={{
                backgroundColor: RED,
                borderColor: BLUE,
                color: YELLOW,
              }}
            >
              @cafe_mama_sons
            </a>
            <a
              href={REVIEW_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border-[3px] px-5 py-3 text-center font-arialblack text-xs uppercase tracking-[0.18em] transition-transform hover:-translate-y-0.5 sm:col-span-2 sm:text-sm"
              style={{ borderColor: RED, color: RED }}
            >
              Leave a Review on Google
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * PREVIOUS LOCATION SECTION — the GSAP swipe-slider style two-panel reveal with
 * the progress dots on the right. Kept here (commented out) in case we want to
 * switch back. To restore: delete the active component above and uncomment this.
 * https://demos.gsap.com/demo/swipe-slider/
 * -------------------------------------------------------------------------- */
/*
// A heading split into per-character spans for the stagger reveal.
function Chars({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className}>
      {[...text].map((c, i) => (
        <span key={i} className="loc-char inline-block whitespace-pre">
          {c === " " ? " " : c}
        </span>
      ))}
    </span>
  );
}

export default function Location() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const slides = gsap.utils.toArray<HTMLElement>(".loc-slide");
      const N = slides.length;
      const bgs = slides.map((s) => s.querySelector<HTMLElement>(".loc-bg")!);
      const outers = slides.map((s) => s.querySelector<HTMLElement>(".loc-outer")!);
      const inners = slides.map((s) => s.querySelector<HTMLElement>(".loc-inner")!);
      const chars = slides.map((s) => s.querySelectorAll<HTMLElement>(".loc-char"));
      const dots = gsap.utils.toArray<HTMLElement>(".loc-dot");

      // Reduced motion → just three full-screen panels you scroll past normally.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(slides, { position: "relative" });
        gsap.set(el, { height: "auto" });
        return;
      }

      // stack the panels and clip every one but the first off-screen
      slides.forEach((s, i) => gsap.set(s, { zIndex: i }));
      gsap.set(outers, { yPercent: 100 });
      gsap.set(inners, { yPercent: -100 });
      gsap.set([outers[0], inners[0]], { yPercent: 0 });
      gsap.set(bgs.slice(1), { yPercent: 6 });
      chars.forEach((cs, i) => {
        if (i > 0) gsap.set(cs, { autoAlpha: 0, yPercent: 140 });
      });
      gsap.set(dots[0], { backgroundColor: "#fbd400", scale: 1.6 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "+=" + (N - 1) * 100 + "%",
          pin: true,
          scrub: 0.6,
          snap: { snapTo: 1 / (N - 1), duration: 0.35, ease: "power1.inOut" },
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const idx = Math.round(self.progress * (N - 1));
            dots.forEach((d, i) =>
              gsap.to(d, {
                backgroundColor: i === idx ? "#fbd400" : "rgba(34,26,18,0.3)",
                scale: i === idx ? 1.6 : 1,
                duration: 0.3,
                overwrite: true,
              }),
            );
          },
        },
      });

      for (let i = 1; i < N; i++) {
        const at = i - 1;
        tl.to(bgs[i - 1], { yPercent: -6, ease: "none", duration: 1 }, at)
          .to(outers[i], { yPercent: 0, ease: "power2.inOut", duration: 1 }, at)
          .to(inners[i], { yPercent: 0, ease: "power2.inOut", duration: 1 }, at)
          .to(bgs[i], { yPercent: 0, ease: "power2.inOut", duration: 1 }, at)
          .to(
            chars[i],
            {
              autoAlpha: 1,
              yPercent: 0,
              ease: "power2",
              duration: 0.7,
              stagger: { each: 0.02, from: "random" },
            },
            at + 0.25,
          );
      }
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      id="location"
      className="relative h-screen w-full overflow-hidden text-ink"
    >
      // progress dots
      <div className="pointer-events-none absolute right-5 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-3 sm:right-8">
        {[0, 1].map((i) => (
          <span
            key={i}
            className="loc-dot h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: "rgba(34,26,18,0.3)" }}
          />
        ))}
      </div>

      // ---- Slide 1 — full-bleed Google map ----
      <section className="loc-slide absolute inset-0">
        <div className="loc-outer absolute inset-0 overflow-hidden">
          <div className="loc-inner relative h-full w-full overflow-hidden bg-cream-deep">
            <div className="loc-bg absolute -top-[6%] left-0 h-[112%] w-full">
              <iframe
                title="Map to Cafe Mama & Sons"
                className="pointer-events-none h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=${MAPS_QUERY}&z=16&output=embed`}
                style={{ filter: "saturate(1.08) sepia(0.12) brightness(1.01)" }}
              />
            </div>
            // overlay (not parallaxed)
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-between py-24">
              <h2
                className="font-arialblack text-6xl uppercase leading-[0.82] text-sun sm:text-7xl lg:text-8xl"
              >
                <Chars text="WE'RE HERE" />
              </h2>
              <div
                className="pointer-events-auto max-w-md rounded-2xl border-4 border-ink bg-cream/95 px-6 py-4 text-center"
                style={{ boxShadow: "6px 6px 0 #221a12" }}
              >
                <p className="font-body text-[0.7rem] font-bold uppercase tracking-[0.4em] text-tomato">
                  The corner spot
                </p>
                <p className="mt-1 font-arialblack text-lg uppercase leading-tight sm:text-xl">
                  {ADDRESS}
                </p>
                <a
                  href={DIRECTIONS}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block rounded-full bg-ink px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-cream transition-opacity hover:opacity-80"
                >
                  Get directions
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      // ---- Slide 2 — hours + directions ----
      <section className="loc-slide absolute inset-0">
        <div className="loc-outer absolute inset-0 overflow-hidden">
          <div className="loc-inner h-full w-full overflow-hidden">
            <div
              className="loc-bg absolute -top-[6%] left-0 flex h-[112%] w-full items-center justify-center"
              style={{ background: "#6c4a8f" }}
            >
              <div className="mx-auto grid w-full max-w-5xl items-center gap-10 px-6 sm:px-12 lg:grid-cols-2">
                <div>
                  <p className="font-body text-xs font-bold uppercase tracking-[0.5em] text-sun">
                    Opening hours
                  </p>
                  <h3
                    className="mt-3 font-arialblack text-6xl uppercase leading-[0.85] text-cream sm:text-7xl"
                  >
                    <Chars text="DROP BY" />
                  </h3>
                  <dl className="mt-8 max-w-sm divide-y divide-cream/20 border-y border-cream/20 text-cream">
                    {HOURS.map((h) => (
                      <div key={h.day} className="flex items-center justify-between py-3">
                        <dt className="text-sm font-semibold uppercase tracking-widest">
                          {h.day}
                        </dt>
                        <dd className="font-arialblack text-lg tracking-tight text-sun">
                          {h.time}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div
                  className="rounded-3xl border-4 border-ink bg-cream p-8"
                  style={{ boxShadow: "8px 8px 0 #221a12" }}
                >
                  <p className="font-arialblack text-2xl uppercase leading-tight">
                    {ADDRESS}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                    Coffee, sandos &amp; pastries — made by mama, served by the
                    sons.
                  </p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <a
                      href={DIRECTIONS}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-ink px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-cream transition-opacity hover:opacity-80"
                    >
                      Get directions
                    </a>
                    <a
                      href="https://www.instagram.com/cafe_mama_sons/"
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border-2 border-ink px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:bg-ink hover:text-cream"
                    >
                      @cafe_mama_sons
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
*/
