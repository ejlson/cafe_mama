"use client";

/**
 * Footer — original SVG-shaped footer with the curved top edge and the
 * --foot-a/--foot-b gradient that Menu.tsx drives per active tab. The
 * elastic bounce-on-scroll-in has been removed; the curve is now a static
 * permanent shape. Brand is the square Cafe Mama & Sons logo.
 */

// Path from the original GSAP footer-bounce demo. CENTER is the flat
// resting state (the position the original bounce settled to) — used here
// statically so the footer fills as a clean rectangle with no transparent
// dip at the top. DOWN (the curved hanging state) is kept as a reference
// but no longer rendered.
const CENTER =
  "M0-0.3C0-0.3,464,0,1139,0s1139-0.3,1139-0.3V683H0V-0.3z";

export default function Footer() {
  return (
    <footer
      // Footer's colour comes from --foot-a / --foot-b which Menu.tsx
      // updates per active tab. No more negative-margin overlap with the
      // section above — that was for the morphing curve, which is gone.
      className="relative z-20 text-cream"
    >
      {/* curved top edge — deep-warm gradient, no animation */}
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
            {/* Colours follow the active menu tab (set by Menu via --foot-*) */}
            <stop offset="0" style={{ stopColor: "var(--foot-a, #ff7a2f)" }} />
            <stop offset="1" style={{ stopColor: "var(--foot-b, #e8362b)" }} />
          </linearGradient>
        </defs>
        <path id="bouncy-path" fill="url(#footGrad)" d={CENTER} />
      </svg>

      <div className="relative z-10 flex flex-col items-start gap-y-6 px-4 pb-40 pt-10 sm:gap-y-8 sm:px-8 sm:pb-48 sm:pt-14">
        {/* Brand — horizontal Cafe Mama & Sons mirror logo, anchored to the
            top-left. Recoloured via CSS mask so it matches the active
            menu tab's background colour (--wave-f0). The PNG is the alpha
            mask; the visible "ink" comes from backgroundColor. */}
        <a
          href="#top"
          aria-label="Cafe Mama & Sons — back to top"
          className="block"
        >
          <span
            aria-hidden
            className="block w-[80vw] max-w-5xl"
            style={{
              aspectRatio: "7024 / 970",
              // --foot-brand is the brand-contrast colour per tab (gold on
              // food's pink footer, deep purple on drinks' yellow footer) —
              // higher contrast than --wave-f0 against the footer bg.
              backgroundColor: "var(--foot-brand, #f4c33c)",
              WebkitMaskImage: "url('/media/logo/CAFELOGOMIRROR.png')",
              maskImage: "url('/media/logo/CAFELOGOMIRROR.png')",
              WebkitMaskSize: "contain",
              maskSize: "contain",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskPosition: "left center",
              maskPosition: "left center",
            }}
          />
        </a>

        {/* Links sit directly under the logo, stacked in a single
            left-aligned column. */}
        <div className="flex flex-col items-start gap-y-3">
          <a
            href={`https://www.google.com/search?q=${encodeURIComponent(
              "Cafe Mama & Sons, 83 Kentish Town Rd, London NW1 8NY",
            )}#lrd=`}
            target="_blank"
            rel="noreferrer"
            aria-label="Leave us a Google review"
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] [color:var(--foot-brand,#f4c33c)] transition-opacity hover:opacity-70"
          >
            <span aria-hidden className="text-sm leading-none">★★★★★</span>
            Review us on Google
          </a>
          <a
            href="#blog"
            className="text-[11px] font-semibold uppercase tracking-[0.15em] [color:var(--foot-brand,#f4c33c)] transition-opacity hover:opacity-70"
          >
            Blog
          </a>
          <a
            href="https://www.instagram.com/cafe_mama_sons/"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="[color:var(--foot-brand,#f4c33c)] transition-opacity hover:opacity-70"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-5 w-5"
              aria-hidden
            >
              <rect x="2" y="2" width="20" height="20" rx="5.5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.6" cy="6.4" r="1.1" fill="currentColor" stroke="none" />
            </svg>
          </a>
          <a
            href="mailto:hello@cafemamasons.com"
            className="text-[11px] font-semibold uppercase tracking-[0.15em] [color:var(--foot-brand,#f4c33c)] transition-opacity hover:opacity-70"
          >
            hello@cafemamasons.com
          </a>
        </div>
      </div>
    </footer>
  );
}
