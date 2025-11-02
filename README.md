# PDF Prompt Generator

A Next.js application that turns PDF uploads into structured, reusable prompts. The app pairs a modern React front end with a typed API layer, Drizzle ORM, UploadThing storage, and optional AI-powered rendering through OpenRouter.

## Overview

- **Frontend**: Next.js App Router with React Server Components, Tailwind CSS, and Clerk-powered auth UI.
- **API Layer**: tRPC routers with Zod validation for type-safe client/server contracts.
- **Data**: PostgreSQL via Drizzle ORM (`src/server/db/`) storing jobs, generated files, and temporary share links.
- **Workers**: A Postgres-backed queue processed by `src/server/jobs/worker.ts`, deployable as a Vercel cron drain or long-running process.
- **Output**: PDFs stored with UploadThing (`src/server/uploadthing.ts`) and accessible through signed URLs.

## Quick Start

### Prerequisites

- **Node.js 18+** with **pnpm** (project uses `packageManager: pnpm@10.x`).
- **PostgreSQL 14+** (local or hosted).
- **Clerk** developer account for authentication keys.
- **UploadThing V7 token** for persistent PDF storage.
- **Optional** OpenRouter API key if you want AI-authored PDF content instead of the static fallback.

### Installation

1. **Clone and install**

   ```bash
   git clone https://github.com/Kamkmgamer/KamkmPDF
   cd pdfprompt
   pnpm install
   ```

2. **Configure environment** (see [Environment Variables](#environment-variables)).

3. **Run database migrations**

   ```bash
   pnpm db:migrate
   ```

4. **Start the development server**
   ```bash
   pnpm dev
   ```
   Visit `http://localhost:3000`.

## Environment Variables

Environment validation lives in `src/env.js`. Copy the example file and fill in required values:

```bash
cp .env.example .env.local
```

```env
# Database and runtime
DATABASE_URL=postgresql://user:pass@localhost:5432/pdfprompt
NODE_ENV=development

# Clerk authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# UploadThing storage
UPLOADTHING_TOKEN=ut7_...

# Public application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional AI configuration
# Multiple keys supported for redundancy and load distribution
OPENROUTER_API_KEY=...
OPENROUTER_API_KEY1=...
OPENROUTER_API_KEY2=...
# ... up to OPENROUTER_API_KEY10
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# Optional worker tuning
PDFPROMPT_WORKER_SECRET=...
PDFPROMPT_MAX_JOBS_PER_INVOCATION=10
PDFPROMPT_MAX_MS_PER_INVOCATION=30000
PDFPROMPT_BATCH_SIZE=5
PDFPROMPT_WORKER_CONCURRENCY=3       # Number of jobs to process in parallel per worker cycle
MAX_PDF_CONCURRENCY=8                # Maximum concurrent PDF generations across all workers

# Optional worker polling override (local worker only)
PDFPROMPT_POLL_MS=2000
```

Client-side keys **must** be prefixed with `NEXT_PUBLIC_`. Do not commit `.env.local`.

### Model selection

- The OpenRouter model list is now **hardcoded** in `src/server/ai/openrouter.ts` as a prioritized set (1 primary + 12 backups). The code will automatically try each in order until one succeeds.
- You can still override models per call by passing `model` (single slug or comma-separated list) to `generateHtmlFromPrompt()`.

### Multiple API Keys for Redundancy

- Configure up to 11 OpenRouter API keys (`OPENROUTER_API_KEY`, `OPENROUTER_API_KEY1` through `OPENROUTER_API_KEY10`) for improved reliability and scalability.
- The system uses **round-robin distribution** to balance load across keys.
- **Automatic failover**: If a request fails due to rate limiting (429), authentication (401), or authorization (403) errors, the system automatically retries with the next available key.
- This provides multiple points of failure protection and allows for higher throughput.

## Project Structure Highlights

- **`src/app/`** – Next.js routes, layouts, and React components.
- **`src/server/api/`** – tRPC routers orchestrating uploads, jobs, and prompt generation.
- **`src/server/jobs/worker.ts`** – Queue consumer with UploadThing integration.
- **`src/server/jobs/pdf.ts`** – PDF generation pipeline (OpenRouter ➝ Puppeteer ➝ PDFKit fallbacks).
- **`src/server/uploadthing.ts`** – Single `UTApi` instance configured with the UploadThing token.
- **`src/server/db/schema.ts`** – Drizzle models for jobs, files, and share links.
- **`vercel.json`** – Vercel cron schedule hitting `/api/worker/drain` every minute.

## Running the App

- **Development server**

  ```bash
  pnpm dev
  ```

- **Type checking + lint**

  ```bash
  pnpm typecheck
  pnpm lint
  ```

- **Formatting**

  ```bash
  pnpm format:write
  ```

- **Unit tests (Vitest)**

  ```bash
  pnpm test
  ```

- **Worker loop (local debugging)**
  ```bash
  pnpm worker:dev
  ```
  The worker reads from the same Postgres instance, so ensure `DATABASE_URL` is available.

## Background Processing

### Queue Mechanics

- **Enqueue**: App routes add rows to the `pdfprompt_job` table via Drizzle.
- **Drain**: `drain()` in `src/server/jobs/worker.ts` claims jobs in batches using `FOR UPDATE SKIP LOCKED`.
- **Generation**: `generatePdfBuffer()` in `src/server/jobs/pdf.ts` tries OpenRouter first, then Puppeteer, then PDFKit.
- **Upload**: PDFs stream to UploadThing with `UTApi.uploadFiles`, and metadata is stored in `pdfprompt_file`.
- **Completion**: Jobs are marked `completed` with a `resultFileId`; failures capture an error message for retry visibility.

### Deployment Options

- **Vercel Cron (default)**
  - `vercel.json` schedules `/api/worker/drain` every minute.
  - Protect the endpoint by setting `PDFPROMPT_WORKER_SECRET`; the handler enforces the shared key.

- **Dedicated Worker Process**
  - Run `pnpm worker` on a long-lived host if you need higher throughput.
  - Tune `PDFPROMPT_MAX_*`, `PDFPROMPT_BATCH_SIZE`, and concurrency settings without redeploying.

- **Manual Debugging**
  - Visit `http://localhost:3000/api/worker/drain?maxJobs=5&maxMs=20000` during development.

### Concurrency Control

The worker supports **parallel job processing** for improved throughput:

- **`PDFPROMPT_WORKER_CONCURRENCY`** (default: `3`) – Number of jobs processed concurrently per worker cycle
- **`MAX_PDF_CONCURRENCY`** (default: `8`) – Global limit on simultaneous PDF generations across all workers
- **`PDFPROMPT_BATCH_SIZE`** (default: `5`) – Number of jobs claimed per database query

**How it works:**

1. Worker claims `PDFPROMPT_WORKER_CONCURRENCY` jobs atomically using `FOR UPDATE SKIP LOCKED`
2. All claimed jobs are processed in parallel using `Promise.allSettled()`
3. PDF generation respects the `MAX_PDF_CONCURRENCY` semaphore to prevent resource exhaustion
4. Multiple workers can run concurrently without conflicts

**Performance tips:**

- Increase `PDFPROMPT_WORKER_CONCURRENCY` to 5-8 for high-volume workloads
- Set `MAX_PDF_CONCURRENCY` based on available memory (each browser instance uses ~100-200MB)
- For serverless (Vercel), keep `PDFPROMPT_WORKER_CONCURRENCY` low (2-3) due to execution time limits
- For dedicated workers, scale up both settings to match available CPU/memory

## Scaling to Production

### Quick Start for 1000+ Users

See **[SCALING_GUIDE.md](./SCALING_GUIDE.md)** for comprehensive scaling documentation.

**Immediate optimizations (< 30 minutes):**

1. **Add Database Indexes**

   ```bash
   psql $DATABASE_URL < scripts/add-indexes.sql
   ```

   _Impact: 10-100x faster queries_

2. **Enable Connection Pooling**

   ```env
   DATABASE_MAX_CONNECTIONS=20
   DATABASE_IDLE_TIMEOUT=20
   ```

   _Impact: Prevents connection exhaustion_

3. **Scale Worker Concurrency**
   ```env
   PDFPROMPT_WORKER_CONCURRENCY=8
   MAX_PDF_CONCURRENCY=12
   BROWSER_POOL_SIZE=10
   ```
   _Impact: 3-8x more throughput_

**Expected Results:**

- ✅ Support 1,000-2,000 concurrent users
- ✅ Generate 500-1,000 PDFs/hour
- ✅ < 5 second response times (p95)
- ✅ 70% reduction in database load (with caching)

**Production Configuration:**
See `.env.production.template` for full production setup with recommended values for different scales.

**Multi-Worker Setup:**
Deploy 3-5 worker instances for horizontal scaling:

```bash
# Worker 1, 2, 3 on separate servers/containers
PDFPROMPT_WORKER_CONCURRENCY=10 pnpm worker
```

**Monitoring & Metrics:**

- Track queue depth: `SELECT COUNT(*) FROM pdfprompt_job WHERE status='queued'`
- Monitor cache hit rate: Check subscription cache stats
- Database connections: Monitor pg_stat_activity
- Worker throughput: PDFs completed per hour

## UploadThing Integration

- **Storage**: File records live in the `pdfprompt_file` table, linked to jobs and users.
- **Access control**: Downloads require authenticated access; signed URLs are generated server-side per request.
- **Sharing**: Temporary tokens in `pdfprompt_share_link` enable optional share flows without exposing raw URLs.

## Tech Stack

- **Next.js 15 / React 19** – App Router, Server Components, Streaming.
- **TypeScript** – Strict mode throughout the repo.
- **tRPC 11** – End-to-end type safety for API calls.
- **Drizzle ORM** – SQL-first schema & migrations with `drizzle-kit` scripts.
- **Clerk** – Authentication, session management, and user data syncing.
- **UploadThing v7** – File storage and signed delivery.
- **Vitest** – Unit testing framework configured via `pnpm test`.
- **Puppeteer & PDFKit** – HTML-to-PDF rendering and fallbacks.
- **Tailwind CSS 4** – Utility-first styling.

## Deployment

### Vercel (Recommended)

1. **Push to GitHub** and connect the repo in Vercel.
2. **Configure environment variables** in the Vercel dashboard (use the list above).
3. **Ensure cron scheduling** – `vercel.json` already ships with the `*/1 * * * *` drain.
4. **Deploy** – each push to `main` triggers a production build; PRs create preview deployments.

### Cloudflare Pages

1. **Push to GitHub** and connect the repo in Cloudflare Pages.
2. **Configure build settings** in Cloudflare Pages dashboard:
   - **Build command**: `pnpm run cf:build`
   - **Build output directory**: `.open-next` (or leave empty, auto-detected from `wrangler.toml`)
   - **Deploy command**: Leave **empty** (Pages deploys automatically after build)
     - If you must set a deploy command, use: `npx wrangler pages deploy .open-next`
     - ⚠️ **Do NOT use** `npx wrangler deploy` (that's for Workers, not Pages)
3. **Configure environment variables** in the Cloudflare Pages dashboard.
4. **Deploy** – each push to `main` triggers a production build.

### Production Worker

- **Serverless-only**: rely on the cron route. Provide `PDFPROMPT_WORKER_SECRET` and include the header `x-worker-secret` when invoking manually.
- **Container or VM**: run `pnpm worker:prod` (after building with `pnpm build`) for a persistent loop.

### Custom Hosting

- Build once: `pnpm build`.
- Start app: `pnpm start`.
- Start worker (optional): `pnpm worker:prod`.

## GitHub Secrets Checklist

- **DATABASE_URL** – Postgres connection string.
- **CLERK_SECRET_KEY** – Backend Clerk key.
- **NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY** – Frontend Clerk key.
- **NEXT_PUBLIC_APP_URL** – Fully qualified public URL.
- **UPLOADTHING_TOKEN** – UploadThing V7 token.
- **Optional** – `OPENROUTER_API_KEY` (and `OPENROUTER_API_KEY1-10` for redundancy), `OPENROUTER_BASE_URL`, `PDFPROMPT_WORKER_SECRET`, `PDFPROMPT_MAX_*`, `PDFPROMPT_BATCH_SIZE`.

## Contributing

- **Fork & branch** – Follow conventional commit practices.
- **Install & test** – `pnpm install`, `pnpm lint`, `pnpm test`.
- **Open PRs** – Include screenshots or logs when updating worker flows or AI output.

## License

Released under the [MIT](LICENSE) license.

---

_Last updated: September 25, 2025_
