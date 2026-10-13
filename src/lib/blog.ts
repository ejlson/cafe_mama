// Cafe Mama & Sons blog posts, consumed by the homepage Blog section (the
// featured card, the strip and the fold-in modal).
//
// SINCE 2026-10-13 THEY ARE EDITED IN THE CMS, not here: the Maginhawa
// Group's shared Sanity Studio (github.com/ejlson/maginhawa-cms), posts of
// kind "Our own post" tagged Café Mama & Sons. scripts/pull-cms.mjs saves
// them, photos and all, into src/lib/cms-blog.json before every `npm run dev`
// and `npm run build`; this file only turns that snapshot into BlogPost.
// Build with `npm run build`, never bare `next build`: without the snapshot
// the import below fails.
//
// `body` paragraphs accept inline link segments so each post can backlink to
// the press coverage that mentioned us — those external dofollow links signal
// authority back to cafemamasons.com.

import snapshot from "./cms-blog.json";

export const SITE_URL = "https://cafemamasons.com";

export type BlogSegment = string | { text: string; href: string };
export type BlogParagraph = string | BlogSegment[];

export type BlogPost = {
  slug: string;
  title: string;
  date: string; // human-readable, e.g. "17 April 2026"
  isoDate: string; // ISO 8601 for <time>/JSON-LD/sitemap lastmod
  img: string;
  alt: string;
  excerpt: string;
  keywords: string[];
  // small rotation used by the layered card row on the homepage
  r: number;
  body: BlogParagraph[];
  author?: string;
};

export const AUTHOR = "Cafe Mama & Sons";

/* ---- One post as scripts/pull-cms.mjs saved it (Portable Text) ---- */
type Span = { text?: string; marks?: string[] };
type CmsBlock = {
  _type: string;
  style?: string;
  listItem?: string;
  children?: Span[];
  markDefs?: { _key: string; href?: string }[];
  text?: string;
  who?: string;
};
type CmsPost = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  author?: string | null;
  keywords?: string[] | null;
  featured: boolean;
  image: { src: string; alt: string };
  body?: CmsBlock[] | null;
};

/* The modal sets every block as a paragraph, so that is what each becomes:
   text with its links kept, bold and italic dropped (the modal has never
   styled them). A pull quote is set in quotation marks with who said it.
   Photos and films in the text are skipped: the modal shows one photo. */
function paragraph(b: CmsBlock): BlogParagraph | null {
  if (b._type === "pullQuote") {
    return b.text ? `“${b.text}”${b.who ? ` — ${b.who}` : ""}` : null;
  }
  if (b._type !== "block") return null;
  const links = new Map((b.markDefs ?? []).map((d) => [d._key, d.href]));
  const segs: BlogSegment[] = (b.children ?? [])
    .filter((s) => s.text)
    .map((s) => {
      const href = (s.marks ?? []).map((m) => links.get(m)).find(Boolean);
      return href ? { text: s.text!, href } : s.text!;
    });
  if (!segs.length) return null;
  return segs.every((x) => typeof x === "string") ? segs.join("") : segs;
}

/* "17 April 2026". UTC, so a build machine behind UTC cannot date a post
   the day before. */
const LONG_DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/* The small card rotations the hand-typed list carried, reused in order so
   the strip keeps its scattered look whatever is published. */
const ROTATIONS = [3, -3, 4, 2, -2, -1, 1, 3, -4, 2, -3, 1];

function toPost(p: CmsPost, i: number): BlogPost {
  return {
    slug: p.slug,
    title: p.title,
    date: LONG_DATE.format(new Date(`${p.date}T00:00:00Z`)),
    isoDate: p.date,
    img: p.image.src,
    alt: p.image.alt,
    excerpt: p.summary,
    keywords: p.keywords ?? [],
    r: ROTATIONS[i % ROTATIONS.length],
    body: (p.body ?? []).map(paragraph).filter((x): x is BlogParagraph => x !== null),
    author: p.author || AUTHOR,
  };
}

/* Newest first, except that the newest post ticked "Feature at the top of
   the blog on: Café Mama & Sons" in the Studio leads, since BlogSection
   makes the first post the big featured card. */
const cmsPosts = (snapshot.posts as CmsPost[]).slice();
const lead = cmsPosts.findIndex((p) => p.featured);
if (lead > 0) cmsPosts.unshift(...cmsPosts.splice(lead, 1));

export const BLOG_POSTS: BlogPost[] = cmsPosts.map(toPost);

export const POSTS_BY_SLUG: Record<string, BlogPost> = Object.fromEntries(
  BLOG_POSTS.map((p) => [p.slug, p]),
);

export function getPost(slug: string): BlogPost | undefined {
  return POSTS_BY_SLUG[slug];
}
