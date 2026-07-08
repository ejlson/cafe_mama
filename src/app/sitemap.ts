import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/blog";

// Sitemap for cafemamasons.com — the site is a single canonical surface (the
// standalone /blog routes were removed; posts live in the homepage Blog
// section). In-page anchors (#menu / #location / etc.) are deliberately NOT
// listed: Google ignores fragments in sitemap entries, and listing them
// dilutes the surface signal.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
