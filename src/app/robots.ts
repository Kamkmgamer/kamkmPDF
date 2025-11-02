import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://KamkmPDF.com";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: ["/dashboard", "/account", "/api", "/sign-in", "/sign-up"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
