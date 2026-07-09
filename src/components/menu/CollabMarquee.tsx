"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Smooothy, { damp } from "smooothy";
import { cldUrl } from "@/lib/cloudinary";

gsap.registerPlugin(useGSAP);

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

// Full-bleed band of press / collab logos in a draggable, continuously-scrolling
// strip. smooothy (github.com/vallafederico/smooothy) drives the infinite track;
// we nudge its `target` every frame for the auto-scroll and skip that nudge while
// the user is dragging, so on release it eases back to the steady cruising speed.
export default function CollabMarquee({ accent }: { accent: string }) {
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = track.current;
      if (!el) return;
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      // The proximity scale-up reads every logo's bounding rect per frame —
      // fine on desktop, needless jank on phones (and there's no cursor to
      // chase the centre anyway).
      const fine = window.matchMedia(
        "(hover: hover) and (pointer: fine)",
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

          if (reduce || !fine) return;
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
      // The whole per-frame loop (smooothy lerp + parallax + per-logo
      // getBoundingClientRect scaling) only runs while the strip is actually
      // on screen — it used to burn main-thread time from page load onward,
      // even behind the hero.
      let visible = false;
      const io = new IntersectionObserver(
        ([entry]) => {
          visible = entry?.isIntersecting ?? false;
        },
        { rootMargin: "100px" },
      );
      io.observe(el);

      const SPEED = 0.008;
      const tick = () => {
        if (!visible) return;
        if (!reduce && !slider.isDragging) slider.target += SPEED;
        slider.update();
      };
      gsap.ticker.add(tick);

      return () => {
        io.disconnect();
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
              {/* Shadow is sm+ only — iOS Safari mis-rasterises drop-shadow
                  filters on elements inside a continuously-transformed
                  container (the smooothy track), clipping them to stale
                  boxes. It's also per-frame filter work the phone GPU can
                  skip; on the flat gold band the logos read fine without. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                data-logo
                src={cldUrl(logo.src, { transform: "w_400,c_limit" })}
                alt={logo.alt}
                loading="lazy"
                draggable={false}
                className="max-h-full max-w-full rounded-2xl object-contain sm:drop-shadow-[0_8px_14px_rgba(0,0,0,0.28)]"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
