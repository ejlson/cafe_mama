"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cldUrl } from "@/lib/cloudinary";

gsap.registerPlugin(useGSAP);

/**
 * £14 meal-deal poster collage — video oval backdrop with the tray, drinks
 * and word-art layered around it. Scrolling the banner's centre past the
 * trigger line pops every piece with a "rizz" sfx, once per approach.
 */
export default function MealDealBanner() {
  const root = useRef<HTMLDivElement>(null);
  const sfx = useRef<HTMLAudioElement>(null);
  const vidRef = useRef<HTMLVideoElement>(null);

  // The oval backdrop video autoplays but only needs to decode while the
  // banner is on screen — pause it (and its battery/CPU cost) otherwise.
  useEffect(() => {
    const v = vidRef.current;
    if (!v) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) v.play().catch(() => {});
      else v.pause();
    });
    io.observe(v);
    return () => io.disconnect();
  }, []);

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
          ref={vidRef}
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
          className="pointer-events-none absolute bottom-[-45%] right-[-12.5%] z-10 w-[62.5%] rotate-[3deg] drop-shadow-[0_12px_18px_rgba(0,0,0,0.4)] sm:bottom-[-60%]"
        />
        <img
          data-md-item
          src={cldUrl("/media/mealdeal/spanishlatte_clear-web.png")}
          alt="Spanish latte"
          loading="lazy"
          decoding="async"
          className="pointer-events-none absolute bottom-[-17.5%] left-[-17.5%] z-20 w-[45%] -rotate-[8deg] drop-shadow-[0_12px_16px_rgba(0,0,0,0.4)] sm:bottom-[-32.5%]"
        />
        <img
          data-md-item
          src={cldUrl("/media/mealdeal/jonas-web.jpg")}
          alt="Jonas portrait"
          loading="lazy"
          decoding="async"
          className="pointer-events-none absolute bottom-[-12.5%] left-[55%] z-50 aspect-square w-[15%] rounded-full object-cover -rotate-[-8deg] drop-shadow-[0_12px_16px_rgba(0,0,0,0.4)] sm:bottom-[-27.5%]"
        />
        <img
          data-md-item
          src={cldUrl("/media/mealdeal/jerkchicken-web.png")}
          alt="Toasted sando"
          loading="lazy"
          decoding="async"
          className="pointer-events-none absolute bottom-[-55%] left-[-2.5%] z-40 w-[60%] drop-shadow-[0_12px_16px_rgba(0,0,0,0.4)] sm:bottom-[-70%]"
        />
        <img
          data-md-item
          src={cldUrl("/media/mealdeal/flatwhite-web.png")}
          alt="Flat white"
          loading="lazy"
          decoding="async"
          className="pointer-events-none absolute bottom-[-32.5%] left-[52.5%] z-30 w-[40%] -translate-x-1/2 -rotate-[-4deg] drop-shadow-[0_12px_16px_rgba(0,0,0,0.4)] sm:bottom-[-47.5%]"
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
