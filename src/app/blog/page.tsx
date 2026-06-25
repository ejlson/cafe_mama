import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BLOG_POSTS, SITE_URL } from "@/lib/blog";

/**
 * /blog — the indexable blog index. Lists every post with date, title and
 * excerpt, linking out to /blog/[slug] for the full article. Lightweight
 * page (no SmoothScroll / CRT / cursor overlays) so crawlers and weak
 * devices both render it fast.
 */

export const metadata: Metadata = {
  title: "Blog — press, launches and stories",
  description:
    "News, press coverage and stories from Cafe Mama & Sons — Filipino-Japanese cafe and bakery on Kentish Town Road, London NW1.",
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/blog`,
    title: "Blog · Cafe Mama & Sons",
    description:
      "News, press coverage and stories from Cafe Mama & Sons — Filipino-Japanese cafe and bakery on Kentish Town Road.",
    images: [
      {
        url: "/media/shopfront.jpg",
        width: 1200,
        height: 630,
        alt: "Cafe Mama & Sons shopfront on Kentish Town Road, London NW1",
      },
    ],
  },
};

// CollectionPage + BreadcrumbList give Google a clear understanding that
// /blog is the parent for every /blog/[slug] article underneath.
const COLLECTION_JSONLD = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": `${SITE_URL}/blog#collection`,
  name: "Cafe Mama & Sons — Blog",
  url: `${SITE_URL}/blog`,
  isPartOf: { "@id": `${SITE_URL}/#website` },
  about: { "@id": `${SITE_URL}/#restaurant` },
  hasPart: BLOG_POSTS.map((p) => ({
    "@type": "BlogPosting",
    "@id": `${SITE_URL}/blog/${p.slug}#article`,
    headline: p.title,
    datePublished: p.isoDate,
    url: `${SITE_URL}/blog/${p.slug}`,
    image: p.img.startsWith("http") ? p.img : `${SITE_URL}${p.img}`,
  })),
};

const BREADCRUMB_JSONLD = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: SITE_URL,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Blog",
      item: `${SITE_URL}/blog`,
    },
  ],
};

export default function BlogIndexPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-8 sm:py-20">
      <nav aria-label="Breadcrumb" className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] opacity-70">
        <Link href="/" className="hover:opacity-100">
          Home
        </Link>{" "}
        <span aria-hidden>›</span>{" "}
        <span aria-current="page">Blog</span>
      </nav>

      <h1 className="font-arialblack text-4xl uppercase leading-[0.95] tracking-tight sm:text-6xl">
        Blog
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed opacity-85 sm:text-lg">
        Press, launches and stories from the Cafe Mama &amp; Sons kitchen on
        Kentish Town Road. Browse the lineup below or jump back to the{" "}
        <Link href="/" className="underline underline-offset-4">
          menu
        </Link>
        .
      </p>

      <ul className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-10">
        {BLOG_POSTS.map((post) => (
          <li key={post.slug}>
            <article>
              <Link
                href={`/blog/${post.slug}`}
                className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-current"
              >
                <div className="relative aspect-[3/2] w-full overflow-hidden rounded-xl">
                  <Image
                    src={post.img}
                    alt={post.alt}
                    fill
                    sizes="(min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <time
                  dateTime={post.isoDate}
                  className="mt-4 block text-[11px] font-semibold uppercase tracking-[0.25em] opacity-70"
                >
                  {post.date}
                </time>
                <h2 className="mt-2 font-arialblack text-xl uppercase leading-tight tracking-tight sm:text-2xl">
                  {post.title}
                </h2>
                <p className="mt-3 max-w-prose text-sm leading-relaxed opacity-85 sm:text-base">
                  {post.excerpt}
                </p>
                <span className="mt-4 inline-flex items-center gap-2 font-arialblack text-xs uppercase tracking-[0.2em] underline-offset-4 group-hover:underline">
                  Read full article
                  <span aria-hidden>→</span>
                </span>
              </Link>
            </article>
          </li>
        ))}
      </ul>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(COLLECTION_JSONLD).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(BREADCRUMB_JSONLD).replace(/</g, "\\u003c"),
        }}
      />
    </main>
  );
}
