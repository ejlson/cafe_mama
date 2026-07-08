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

  return createPortal(
    <div
      ref={backdrop}
      onClick={close}
      className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-black/60 px-4 py-[8vh] backdrop-blur-sm"
    >
      <article
        ref={sheet}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-cream text-pine shadow-[0_30px_80px_rgba(0,0,0,0.5)]"
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

  // BLOG_POSTS is sorted newest-first in src/lib/blog.ts.
  const [featured, ...older] = BLOG_POSTS;

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
            <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl transition-transform duration-500 group-hover:-translate-y-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cldUrl(featured.img, { transform: "w_1400,c_limit" })}
                alt={featured.alt}
                loading="eager"
                draggable={false}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
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
              cleanly. Cards have a fixed width so they read as a strip. */}
          <ul className="no-scrollbar mt-5 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-1 sm:gap-7">
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
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
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
