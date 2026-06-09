"use client";

import { useEffect, useState } from "react";

/**
 * Full-screen retro broadcast hero. There is no TV casing in Cafe_Mama_2 —
 * the picture fills the entire screen. On the glass we drop the channel title
 * plus film-style subtitles: the English line and its Tagalog translation
 * appear together, then the pair cross-fades to the next caption.
 */
const SUBTITLES: { en: string; tl: string }[] = [
  {
    en: "♪ …now showing on channel three ♪",
    tl: "♪ …palabas na ngayon sa channel tres ♪",
  },
  {
    en: "Welcome to Cafe Mama & Sons.",
    tl: "Maligayang pagdating sa Cafe Mama & Sons.",
  },
  {
    en: "Honey Peach Mango. Ube Matcha. Spanish Latté.",
    tl: "Mga paborito: pulot-peach-mangga, ube matcha, Spanish latte.",
  },
  {
    en: "Sandos, meal deals & little Filipino luxuries.",
    tl: "Mga sando, meal deals, at maliliit na luho ng Pinoy.",
  },
  {
    en: "83 Kentish Town Road. Pull up a stripey chair.",
    tl: "83 Kentish Town Road. Umupo ka sa may-guhit na silya.",
  },
];

const SCREEN_INSET: React.CSSProperties = {
  top: "var(--bz)",
  left: "var(--bz)",
  right: "var(--bz)",
  bottom: "var(--bz-b)",
};

export default function TvHero({
  videoSrc,
  poster = "/media/shopfront.jpg",
}: {
  videoSrc?: string;
  poster?: string;
}) {
  const [line, setLine] = useState(0);

  useEffect(() => {
    // Hold each caption long enough to read both lines, then advance.
    const { en, tl } = SUBTITLES[line];
    const longest = Math.max(en.length, tl.length);
    const hold = setTimeout(
      () => setLine((l) => (l + 1) % SUBTITLES.length),
      Math.max(3200, longest * 70),
    );
    return () => clearTimeout(hold);
  }, [line]);

  return (
    <section
      id="top"
      className="fixed inset-0 z-[40] h-full w-full overflow-hidden bg-black"
    >
      {/* Soft warm sun glow rising behind the broadcast */}
      <div className="pointer-events-none absolute left-1/2 top-[34%] h-[60vw] w-[60vw] max-h-[520px] max-w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(240,169,43,0.45)_0%,rgba(232,155,118,0.35)_45%,transparent_70%)] opacity-60" />

      {/* The picture tube broadcast, gently fish-eyed */}
      <div className="power-on absolute inset-0 crt-fisheye">
        {videoSrc ? (
          <video
            className="h-full w-full scale-[1.06] object-cover"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster={poster}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={poster}
            alt="Cafe Mama & Sons shopfront on Kentish Town Road"
            className="h-full w-full scale-[1.06] object-cover"
          />
        )}
        {/* Light broadcast grade — kept subtle so the video reads clearly */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25" />
      </div>

      {/* On-screen UI, aligned to the (full-screen) window */}
      <div className="pointer-events-none absolute z-20" style={SCREEN_INSET}>
        {/* Channel title */}
        {/* <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="font-body text-[11px] font-bold uppercase tracking-[0.4em] text-cream/80">
            Kentish Town · NW1 · CH&nbsp;03
          </p>
          <h1 className="mt-3 font-display text-[16vw] leading-[0.82] text-cream drop-shadow-[0_3px_0_rgba(0,0,0,0.4)] sm:text-[12vw] lg:text-[150px]">
            CAFE&nbsp;MAMA
          </h1>
          <p className="font-hand -mt-2 text-4xl text-peach drop-shadow-[0_2px_0_rgba(0,0,0,0.4)] sm:text-5xl lg:text-6xl">
            &amp; sons
          </p>
        </div> */}

        {/* Film subtitles — English + Tagalog appear together, then cross-fade */}
        {/* <div
          key={line}
          className="absolute inset-x-0 bottom-4 animate-[caption-in_0.6s_ease-out] px-6 text-center sm:bottom-7"
        >
          <p className="subtitle mx-auto block max-w-3xl text-balance text-lg leading-snug sm:text-2xl">
            {SUBTITLES[line].en}
          </p>
          <p className="subtitle-tl mx-auto mt-1.5 block max-w-2xl text-balance text-sm leading-snug sm:text-lg">
            {SUBTITLES[line].tl}
          </p>
        </div> */}
      </div>
    </section>
  );
}
