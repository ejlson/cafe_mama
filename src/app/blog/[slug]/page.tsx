import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AUTHOR,
  BLOG_POSTS,
  POSTS_BY_SLUG,
  SITE_URL,
  type BlogParagraph,
  type BlogPost,
  type BlogSegment,
} from "@/lib/blog";
import { cldUrl } from "@/lib/cloudinary";

/**
 * /blog/[slug] — individual blog post page. Statically generated for every
 * slug in BLOG_POSTS (so each post becomes its own indexable URL with full
 * Article JSON-LD, OG card, breadcrumb and canonical).
 */

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = POSTS_BY_SLUG[slug];
  if (!post) return {};
  const url = `${SITE_URL}/blog/${post.slug}`;
  const image = cldUrl(post.img);
  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.keywords,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.excerpt,
      images: [{ url: image, alt: post.alt }],
      publishedTime: post.isoDate,
      authors: [post.author ?? AUTHOR],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [image],
      creator: "@cafe_mama_sons",
      site: "@cafe_mama_sons",
    },
  };
}

function renderParagraph(p: BlogParagraph, key: number) {
  if (typeof p === "string") {
    return (
      <p key={key} className="mt-5 max-w-prose text-base leading-relaxed opacity-90 sm:text-lg">
        {p}
      </p>
    );
  }
  return (
    <p key={key} className="mt-5 max-w-prose text-base leading-relaxed opacity-90 sm:text-lg">
      {p.map((seg: BlogSegment, i) =>
        typeof seg === "string" ? (
          <span key={i}>{seg}</span>
        ) : (
          <Link
            key={i}
            href={seg.href}
            // Internal anchors (/#…) stay in-tab; external press links open in
            // a new tab and carry no referrer (privacy + signal-cleanliness).
            {...(seg.href.startsWith("http")
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            className="underline underline-offset-4 hover:opacity-80"
          >
            {seg.text}
          </Link>
        ),
      )}
    </p>
  );
}

function articleJsonLd(post: BlogPost) {
  const url = `${SITE_URL}/blog/${post.slug}`;
  const image = cldUrl(post.img);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: post.title,
    description: post.excerpt,
    image: [image],
    datePublished: post.isoDate,
    dateModified: post.isoDate,
    inLanguage: "en-GB",
    keywords: post.keywords.join(", "),
    author: { "@type": "Organization", name: post.author ?? AUTHOR, url: SITE_URL },
    publisher: { "@id": `${SITE_URL}/#restaurant` },
    isPartOf: { "@id": `${SITE_URL}/blog#collection` },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
  };
}

function breadcrumbJsonLd(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `${SITE_URL}/blog/${post.slug}`,
      },
    ],
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = POSTS_BY_SLUG[slug];
  if (!post) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-8 sm:py-20">
      <nav
        aria-label="Breadcrumb"
        className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] opacity-70"
      >
        <Link href="/" className="hover:opacity-100">
          Home
        </Link>{" "}
        <span aria-hidden>›</span>{" "}
        <Link href="/blog" className="hover:opacity-100">
          Blog
        </Link>{" "}
        <span aria-hidden>›</span>{" "}
        <span aria-current="page">{post.title}</span>
      </nav>

      <article>
        <time
          dateTime={post.isoDate}
          className="block text-[11px] font-semibold uppercase tracking-[0.3em] opacity-70"
        >
          {post.date}
        </time>
        <h1 className="mt-3 font-arialblack text-3xl uppercase leading-[0.95] tracking-tight sm:text-5xl">
          {post.title}
        </h1>

        <figure className="mt-8">
          <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl">
            <Image
              src={cldUrl(post.img)}
              alt={post.alt}
              fill
              priority
              sizes="(min-width: 768px) 768px, 100vw"
              className="object-cover"
            />
          </div>
          <figcaption className="sr-only">{post.alt}</figcaption>
        </figure>

        <div className="mt-2">
          {post.body.map((p, i) => renderParagraph(p, i))}
        </div>
      </article>

      <div className="mt-12 border-t border-current/10 pt-6 text-sm opacity-80">
        <Link href="/blog" className="underline underline-offset-4 hover:opacity-100">
          ← Back to all posts
        </Link>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd(post)).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd(post)).replace(/</g, "\\u003c"),
        }}
      />
    </main>
  );
}
