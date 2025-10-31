export const runtime = "edge";

export async function GET() {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kamkmpdf.com";
  const policy = [
    "# LLMs crawl policy for kamkmPDF",
    "",
    "# Mirrors key allow/disallow rules from robots.txt and points to sitemap",
    "",
    "User-agent: GPTBot",
    "Allow: /",
    "Disallow: /dashboard",
    "Disallow: /account",
    "Disallow: /api",
    "Disallow: /sign-in",
    "Disallow: /sign-up",
    "",
    "User-agent: Google-Extended",
    "Allow: /",
    "Disallow: /dashboard",
    "Disallow: /account",
    "Disallow: /api",
    "Disallow: /sign-in",
    "Disallow: /sign-up",
    "",
    "User-agent: CCBot",
    "Allow: /",
    "Disallow: /dashboard",
    "Disallow: /account",
    "Disallow: /api",
    "Disallow: /sign-in",
    "Disallow: /sign-up",
    "",
    "User-agent: ClaudeBot",
    "Allow: /",
    "Disallow: /dashboard",
    "Disallow: /account",
    "Disallow: /api",
    "Disallow: /sign-in",
    "Disallow: /sign-up",
    "",
    `Sitemap: ${base}/sitemap.xml`,
  ].join("\n");

  return new Response(policy, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
