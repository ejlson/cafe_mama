"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { BLOG_POSTS, type BlogPost } from "@/lib/blog";
import { cldUrl } from "@/lib/cloudinary";
import FullRule from "@/components/menu/FullRule";

gsap.registerPlugin(useGSAP, ScrollSmoother);

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

  // Freeze the page while the post is open. ScrollSmoother is paused in the
  // open tween above (desktop); this covers native scrolling (mobile) and
  // restores whatever overflow value was there before (the hero lock also
  // drives <html> overflow). The dark backdrop itself never scrolls — long
  // posts scroll INSIDE the sheet (overscroll-contain stops the chain).
  useEffect(() => {
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, []);

  return createPortal(
    <div
      ref={backdrop}
      onClick={close}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm sm:p-6"
    >
      <article
        ref={sheet}
        onClick={(e) => e.stopPropagation()}
        className="no-scrollbar relative max-h-[88vh] w-full max-w-2xl overflow-y-auto overscroll-contain rounded-2xl bg-cream text-pine shadow-[0_30px_80px_rgba(0,0,0,0.5)]"
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
          src={cldUrl(post.img, { transform: "w_1200,c_limit" })}
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
// full-bleed breakout). Post data lives in src/lib/blog.ts so the indexable
// /blog and /blog/[slug] routes render the same articles.
export default function BlogSection({ accent }: { accent: string }) {
  const [openPost, setOpenPost] = useState<BlogPost | null>(null);
  const stripRef = useRef<HTMLUListElement>(null);

  // BLOG_POSTS is sorted newest-first in src/lib/blog.ts.
  const [featured, ...older] = BLOG_POSTS;

  // The older-posts strip scrolls natively on touch (pan-x), but on desktop
  // ScrollSmoother owns the wheel and a mouse can't drag a native overflow
  // container — so the strip felt completely stuck. Two fixes:
  //  1. Mouse drag-to-scroll with pointer capture; scroll-snap is suspended
  //     during the drag (mandatory snap fights scrollLeft) and a click that
  //     ends a drag is swallowed so cards don't open mid-scrub.
  //  2. Horizontal wheel/trackpad deltas over the strip scroll IT, not the
  //     page (stopPropagation keeps them away from ScrollSmoother).
  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;

    let down = false;
    let dragging = false;
    let startX = 0;
    let startLeft = 0;
    let pointerId = 0;

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return; // touch pans natively
      down = true;
      dragging = false;
      startX = e.clientX;
      startLeft = el.scrollLeft;
      pointerId = e.pointerId;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (!dragging && Math.abs(dx) > 4) {
        dragging = true;
        el.setPointerCapture(pointerId);
        el.style.scrollSnapType = "none";
        el.style.cursor = "grabbing";
      }
      if (dragging) el.scrollLeft = startLeft - dx;
    };
    const endDrag = () => {
      if (!down) return;
      down = false;
      if (dragging) {
        try {
          el.releasePointerCapture(pointerId);
        } catch {}
        el.style.scrollSnapType = "";
        el.style.cursor = "";
      }
    };
    // Capture-phase click guard — a drag release must not open the card
    // under the pointer. `dragging` resets on the NEXT pointerdown.
    const onClickCapture = (e: MouseEvent) => {
      if (dragging) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return; // vertical → page
      el.scrollLeft += e.deltaX;
      e.preventDefault();
      e.stopPropagation();
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", endDrag);
    el.addEventListener("pointercancel", endDrag);
    el.addEventListener("click", onClickCapture, true);
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", endDrag);
      el.removeEventListener("pointercancel", endDrag);
      el.removeEventListener("click", onClickCapture, true);
      el.removeEventListener("wheel", onWheel);
    };
  }, []);

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
            {/* Hover timings per the animation standards: the lift answers the
                pointer (250ms), the zoom settles just behind it (400ms). The
                old 500/700ms read as laggy. */}
            <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl transition-transform duration-250 ease-out group-hover:-translate-y-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cldUrl(featured.img, { transform: "w_1400,c_limit" })}
                alt={featured.alt}
                loading="eager"
                draggable={false}
                className="h-full w-full object-cover transition-transform duration-400 ease-out group-hover:scale-[1.03]"
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
              cleanly. Cards have a fixed width so they read as a strip.
              touch-action pan-x keeps horizontal swipes on the strip while
              vertical swipes still scroll the page; cursor-grab signals the
              desktop drag-to-scroll wired up in the effect above. */}
          <ul
            ref={stripRef}
            className="no-scrollbar mt-5 flex cursor-grab snap-x snap-mandatory gap-5 overflow-x-auto pb-1 [touch-action:pan-x_pan-y] sm:gap-7"
          >
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
                      src={cldUrl(p.img, { transform: "w_800,c_limit" })}
                      alt={p.alt}
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]"
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
