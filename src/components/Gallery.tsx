import Image from "next/image";

/**
 * Retro photo-wall gallery. Images are optimized crops generated from the
 * shopfront photo and the cafe's print menus/posters. Add more by dropping
 * files in /public/media and extending PHOTOS.
 */
const PHOTOS: {
  src: string;
  alt: string;
  caption: string;
  w: number;
  h: number;
  span?: string;
}[] = [
  {
    src: "/media/g-shopfront-full.jpg",
    alt: "Cafe Mama & Sons peach shopfront with stripey chairs",
    caption: "The corner shop · NW1",
    w: 1000,
    h: 1517,
    span: "row-span-2",
  },
  {
    src: "/media/g-sando-matcha.jpg",
    alt: "A sando and an iced ube matcha",
    caption: "Sando + ube matcha",
    w: 1400,
    h: 474,
    span: "sm:col-span-2",
  },
  {
    src: "/media/g-longanisa-meal.jpg",
    alt: "Longanisa meal deal with tater-tots and a drink",
    caption: "Longanisa meal deal · £10.75",
    w: 1400,
    h: 937,
    span: "sm:col-span-2",
  },
  {
    src: "/media/g-shopfront-sign.jpg",
    alt: "Cafe Mama & Sons hand-painted sign",
    caption: "Coffee · Sandos · Matcha",
    w: 850,
    h: 683,
  },
  {
    src: "/media/g-mealdeals-poster.jpg",
    alt: "Meal deals poster",
    caption: "Meal deals from £14",
    w: 900,
    h: 1272,
  },
  {
    src: "/media/g-longanisa-poster.jpg",
    alt: "Longanisa meal deal poster",
    caption: "Pinoy comfort, to go",
    w: 900,
    h: 1273,
  },
];

export default function Gallery() {
  return (
    <section
      id="gallery"
      className="relative py-20 text-cream sm:py-28"
      style={{
        background:
          "radial-gradient(130% 120% at 50% 0%, #2e2114 0%, #221a12 55%, #140f08 100%)",
      }}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="text-center">
          <p className="font-body text-xs font-bold uppercase tracking-[0.4em] text-peach">
            On the reel
          </p>
          <h2 className="mt-3 font-display text-6xl leading-[0.85] sm:text-7xl lg:text-8xl">
            THE GALLERY
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-cream/70">
            Snaps from the shop floor. Follow{" "}
            <a
              href="https://www.instagram.com/cafe_mama_sons/"
              target="_blank"
              rel="noreferrer"
              className="underline decoration-peach underline-offset-4 hover:text-peach"
            >
              @cafe_mama_sons
            </a>{" "}
            for the full feed.
          </p>
        </div>

        <div className="mt-12 grid auto-rows-[200px] grid-cols-2 gap-3 sm:auto-rows-[230px] sm:grid-cols-4 sm:gap-4">
          {PHOTOS.map((p, i) => (
            <figure
              key={p.src}
              className={`group relative overflow-hidden rounded-lg border border-cream/10 bg-black ${
                p.span ?? ""
              }`}
            >
              <Image
                src={p.src}
                alt={p.alt}
                width={p.w}
                height={p.h}
                sizes="(max-width: 640px) 50vw, 25vw"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                priority={i === 0}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <figcaption className="absolute bottom-0 left-0 right-0 p-3 font-body text-xs font-semibold uppercase tracking-widest text-cream/90">
                {p.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
