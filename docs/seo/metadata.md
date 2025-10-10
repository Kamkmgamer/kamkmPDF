# Optimized Metadata Setup

- **[Global metadata]** In `src/app/layout.tsx` we set:
  - `metadataBase` from `NEXT_PUBLIC_SITE_URL`
  - Canonical via `alternates.canonical`
  - Open Graph and Twitter cards
  - Organization + SaaSProduct JSON-LD via `<Script>`
- **[Per-page metadata]** Segment layouts created:
  - `src/app/pricing/layout.tsx` (with FAQPage JSON-LD)
  - `src/app/{about,contact,security,gdpr,privacy,terms,help,status,stats,cookies}/layout.tsx`
- **[Robots/Sitemap]**
  - `src/app/robots.ts` disallows private routes and points to sitemap
  - `src/app/sitemap.ts` lists core marketing pages

## Required assets

- **[OG images]** Place images under `public/og/`:
  - `/og/home.png`
  - `/og/pricing.png`
  - Optional: `/og/{about,contact,security,gdpr,privacy,terms,help,status,stats,cookies}.png`

## Canonical host

- Choose canonical domain (non-www recommended). Enforce host redirect at your edge (Vercel Project Settings → Redirects).
