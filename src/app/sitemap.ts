import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/blog";

// Single-page site: only the home URL is canonical. The blog section is part of
// the home page (in-page scroll), not a separate route.
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
