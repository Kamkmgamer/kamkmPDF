# Performance Tracking & Reporting Guide

## Tools

- Google Search Console: verify domain, submit sitemap.xml
- Google Analytics 4: define conversions (signup, create doc, export PDF, upgrade)
- Ahrefs/SEMrush/Ubersuggest: rank tracking and Site Audit
- Looker Studio: GA4 + GSC dashboard

## GA4 conversions (recommended)

- sign_up (sign up success)
- create_document (first doc created)
- export_pdf (export action)
- upgrade_plan (pricing upgrade)

## Dashboard (Looker Studio)

- Organic sessions, users, conversions
- Top landing pages (GSC clicks/impressions)
- Queries by cluster
- CWV (PageSpeed API or GSC core web vitals by URL)

## Monthly report template

- Overview: wins, blockers, next month focus
- Visibility: impressions, clicks, avg position (GSC)
- Rankings: cluster-level movements (Ahrefs/SEMrush)
- Content: pages/posts published, internal links added
- Technical: CWV by device, crawl issues resolved
- Off-page: new/lost referring domains
- Conversions: signups, trial starts, upgrades; organic-assisted conversions

## Setup checklist

- Add verified domain in GSC; submit `https://<domain>/sitemap.xml`
- Install GA4 (via Tag Manager or app integration)
- Define GA4 events and mark conversions
- Create Looker Studio dashboard with GA4 + GSC connectors
