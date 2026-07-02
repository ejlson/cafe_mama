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
const RED = "var(--loc-text, #FF1353)";
const YELLOW = "var(--loc-card, #f4c33c)";

/**
 * Glowing gold pill CTA — two-layer SVG construction matching the artwork
 * the user supplied in /public/buttons:
 *   - Rectangle 151 (507×122): gold→dark-gold gradient with heavy blur,
 *     placed BEHIND the pill at a 25 px overhang on each side so the natural
 *     12.5 stdDev gaussian halo isn't squashed by the button's content box.
 *   - Rectangle 152 (481×96): solid gold pill with lighter blur, sized to a
 *     12 px overhang so its softer edge sits cleanly on top of the halo.
 * The pill itself is 457×72 (rx 36) — that's the shared inner geometry inside
 * each SVG frame, so the button's "content area" is 72 px tall and the SVGs
 * are sized proportionally around it via calc(100% + 2×margin). Hot pink text
 * (--loc-text) lives on the top layer, dead-centred.
 */
function PillCTA({
  href,
  children,
  className = "",
  variant = "gold",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  // gold = card-coloured pill, accent-text label (Get Directions / Leave a
  //        Review on the food tab → gold pill + hot-pink text; drinks tab →
  //        dark-purple pill + yellow text).
  // pink = swapped — accent-coloured pill, card-coloured label
  //        (@cafe_mama_sons: pink pill + gold text on food; yellow pill +
  //        dark-purple text on drinks).
  // Both variants resolve through --loc-card / --loc-text so the buttons
  // re-tint with the active menu tab without needing per-tab asset swaps.
  variant?: "gold" | "pink";
}) {
  // `variant` is retained on the public API so future callers can ask for a
  // visually different pill, but both options currently render the same
  // artwork — the gold/pink distinction was dropped in favour of a single
  // theme-driven look.
  void variant;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      // Interactive feedback:
      //  • hover  → lifts 4 px and brightens the pill 8 % so the pointer feels
      //             obviously over a clickable element (the soft blur otherwise
      //             swallows tiny translates).
      //  • active → mashes 3 px down, scales to 96 %, brightness back down 10 %
      //             — reads as a physical press-in.
      //  • focus-visible → 2 px ring in the brand colour for keyboard users.
      // `cursor-pointer` is explicit so the cursor doesn't fall back to the
      // CustomCursor's `data-cursor-target` default mid-hover. `isolate`
      // scopes the inner z-stack so the halo's blur stays contained within
      // this button's stacking context.
      data-cursor-target
      className={`relative isolate block h-[72px] cursor-pointer text-center outline-none transition duration-150 ease-out hover:-translate-y-1 hover:brightness-[1.08] active:translate-y-[3px] active:scale-[0.96] active:brightness-90 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:[--tw-ring-color:var(--foot-brand,#f4c33c)] focus-visible:[--tw-ring-offset-color:transparent] ${className}`}
    >
      {/* Bottom layer: vertical gradient halo using --foot-brand at top and
          a 50% darker mix at the bottom. 9 pt blur, shifted 2 px below the
          face so the dark portion peeks out as a drop-shadow. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-x-0 -bottom-1 top-1 rounded-full blur-[9px]"
        style={{
          background:
            "linear-gradient(to bottom, var(--foot-brand, #f4c33c) 0%, color-mix(in srgb, var(--foot-brand, #f4c33c) 50%, black) 100%)",
        }}
      />
      {/* Top layer: solid pill face in the brand colour, 3 pt blur for the
          soft glassy edge. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full blur-[3px]"
        style={{ background: "var(--foot-brand, #f4c33c)" }}
      />
      {/* Crisp inset stroke — sits above the blurred face so it stays sharp,
          painted in the label colour so it defines the pill shape against
          any background tint (especially when --foot-brand ~= page bg).
          Positioned with inset-[8px] so the stroke floats inside the pill
          edge rather than tracing it. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-[8px] rounded-full border-2"
        style={{ borderColor: "var(--loc-text, #FF1353)" }}
      />
      {/* Label — sits above both blurred layers, stays sharp. Mobile drops
          to 10px + tighter tracking so "@cafe_mama_sons" fits a half-width
          (~160px) pill without clipping. */}
      <span
        className="relative inline-flex h-full items-center justify-center whitespace-nowrap font-arialblack text-[10px] uppercase tracking-[0.1em] sm:text-sm sm:tracking-[0.18em]"
        style={{ color: RED }}
      >
        {children}
      </span>
    </a>
  );
}

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
        className="block w-full whitespace-nowrap font-arialblack leading-none text-center"
      >
        <span className="sr-only">Location</span>
        {/* letter-spacing AND padding live here, NOT on the h2 — em values
            on the h2 would compute against the inherited 16px instead of
            this span's big poster font-size and collapse to nothing. The
            pt/pb adds visible breathing room above and below the cap-height
            trim so the title doesn't kiss the horizontal rules. */}
        <span
          aria-hidden
          // The tracked-out word is wider than its block container, so
          // `text-align: center` has nothing to do — the line overflows from
          // its left edge instead of straddling the centre. A small leftward
          // translate (in em so it scales with the title font-size) nudges
          // the visible ink back to true centre relative to the horizontal
          // rule beneath. Adjust the value if a viewport change shifts it.
          // LOCATION is 8 letters — twice as many glyphs as MENU/BLOG. Its
          // mobile size has to be smaller than the 17vw the other titles use
          // or "LOCATION" overflows the viewport (was clipping at ~22vw). 13vw
          // × 8 letters × ~0.7em glyph width fits inside 90vw with breathing
          // room. Desktop clamp is unchanged.
          className="title-shadow block tracking-[0.04em] -translate-x-[calc(0.15em-3px)] [text-box:trim-both_cap_alphabetic] pt-[7px] pb-[17px] text-[13vw] sm:text-[clamp(3rem,13vw,14rem)]"
        >
          LOCATION
        </span>
      </h2>
      <div
        aria-hidden
        style={{ backgroundColor: RED }}
        className="relative left-1/2 h-px w-[calc(100%+2rem)] -translate-x-1/2"
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
          {/* "Where are we?" — one line on mobile (7.5vw fits the full phrase
              inside a 375px viewport), two stacked lines from sm: up where the
              7rem poster size needs the split. */}
          <h3 className="font-arialblack uppercase leading-[0.92] text-left sm:text-right">
            <span className="block whitespace-nowrap text-[7.5vw] sm:hidden">
              Where are we?
            </span>
            <span className="hidden sm:block sm:text-[7rem]">Where</span>
            <span className="hidden sm:block sm:text-[7rem]">are we?</span>
          </h3>

          {/* Two-column description — left col is the address + hours, right
              col is the brand copy. Mobile shows a single condensed pair of
              lines (address+hours / one-liner) so the section doesn't run the
              full screen; the extended copy appears from sm: up. */}
          <div className="mt-4 grid gap-3 text-[11px] font-semibold uppercase leading-snug tracking-wide opacity-90 sm:mt-8 sm:grid-cols-2 sm:gap-7 sm:text-xs">
            <div className="space-y-2 sm:space-y-4">
              <p>
                {ADDRESS}. A corner spot between Camden Lock and Kentish Town
                Station — the bright shopfront is hard to miss.
              </p>
              <p className="hidden sm:block">
                Open Monday to Friday from 8am, Saturday and Sunday from 9am.
                Kitchen serves all-day breakfast meals and sandos until close.
              </p>
              <p className="sm:hidden">
                Open Mon–Fri from 8am, Sat–Sun from 9am.
              </p>
            </div>
            <div className="hidden space-y-4 sm:block">
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

          {/* CTAs — Get Directions (gold pill, glowing) + Instagram (filled
              red) on top, Leave a Review spans the row below as a second gold
              pill. The gold pills layer two SVGs: Rectangle 151 supplies the
              wide gradient halo behind, Rectangle 152 the brighter face on
              top, both sized proportionally beyond the button's content box so
              the natural blur margins aren't squashed. */}
          {/* Column gap is larger than row gap because each PillCTA carries a
              25px glow halo on every side — a tight column gap makes the two
              top buttons' halos overlap into one continuous smear. */}
          {/* Two columns on every viewport: Get Directions + @cafe_mama_sons
              side by side, Leave a Review spanning the full row beneath.
              Mobile column gap is tight (the pills' glow halos are scaled by
              the button size, which is smaller on phones). */}
          <div className="mt-5 grid grid-cols-2 items-center gap-x-4 gap-y-3 sm:mt-10 sm:gap-x-16 sm:gap-y-4">
            <PillCTA href={DIRECTIONS}>Get Directions</PillCTA>
            <PillCTA href={INSTAGRAM_URL} variant="pink">
              @cafe_mama_sons
            </PillCTA>
            <PillCTA href={REVIEW_URL} className="col-span-2">
              Leave a Review on Google
            </PillCTA>
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
