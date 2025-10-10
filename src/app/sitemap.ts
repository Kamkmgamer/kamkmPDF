import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kamkmpdf.com";
  const now = new Date();
  const pages = [
    "",
    "pricing",
    "about",
    "contact",
    "privacy",
    "terms",
    "gdpr",
    "security",
    "help",
    "status",
    "stats",
    "cookies",
  ];

  return pages.map((p) => ({
    url: `${base}/${p}`.replace(/\/$/, "/"),
    lastModified: now,
    changeFrequency: p === "" ? "daily" : "weekly",
    priority: p === "" ? 1.0 : 0.6,
  }));
}
