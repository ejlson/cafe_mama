import type { MetadataRoute } from "next";
import { BLOG_POSTS, SITE_URL } from "@/lib/blog";

// Sitemap for cafemamasons.com:
//   - Homepage (highest priority — canonical landing surface).
//   - /blog (index) and /blog/[slug] (one entry per post — each is its own
//     indexable URL with its own Article JSON-LD).
// In-page anchors (#menu / #location / etc.) are deliberately NOT listed:
// Google ignores fragments in sitemap entries, and listing them dilutes the
// surface signal.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...BLOG_POSTS.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.isoDate),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
