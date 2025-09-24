# PDF Prompt Generator

A Next.js application for generating structured prompts from PDFs, leveraging AI providers for intelligent content extraction and processing. Built with modern TypeScript tooling, tRPC for type-safe APIs, Drizzle ORM for database interactions, and Clerk for authentication.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL 14+ database
- Redis for caching and queue management
- API keys for AI providers (OpenAI, Anthropic, etc.)
- Clerk developer account for authentication

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Kamkmgamer/kamkmPDF
   cd pdfprompt
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables (see `.env.example`):

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

4. Database setup:
   - Run migrations:
     ```bash
     pnpm db:migrate
     ```
   - Or use the provided `start-database.sh` script for local setup.

### Database Options

You can use any PostgreSQL-compatible database. Here are detailed setup instructions for popular free options:

#### Option 1: Neon (Recommended - Free PostgreSQL)

Neon provides a free PostgreSQL database with 0.5 GB storage.

**Setup Steps:**

1. Go to [neon.com](https://neon.com) and sign up for a free account
2. Click "Create a project"
3. Choose your project name and select your preferred region
4. Click "Create project"
5. In your project dashboard, go to "Dashboard" → "Connection Details"
6. Copy the connection string (it will look like: `postgresql://username:password@hostname/database?sslmode=require`)
7. Create a `.env.local` file in your project root:
   ```bash
   cp .env.example .env.local
   ```
8. Add your Neon connection string to `.env.local`:
   ```env
   DATABASE_URL=postgresql://username:password@hostname/database?sslmode=require
   ```
9. Run database migrations:
   ```bash
   pnpm db:migrate
   ```

**Getting your Neon connection string:**

- After creating your project, click on "Dashboard" in the left sidebar
- Click on "Connection Details"
- Copy the full connection string from the "Connection string" field
- Make sure to include `?sslmode=require` at the end for secure connections

#### Option 2: Railway

Railway provides a free PostgreSQL database with 500MB storage.

**Setup Steps:**

1. Go to [railway.app](https://railway.app) and sign up for a free account
2. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```
3. Login to Railway:
   ```bash
   railway login
   ```
4. Create a new project:
   ```bash
   railway init
   ```
5. Add PostgreSQL database:
   ```bash
   railway add postgresql
   ```
6. Link your project:
   ```bash
   railway link
   ```
7. Get your database URL:
   ```bash
   railway variables
   ```
8. Copy the `DATABASE_URL` value
9. Add it to your `.env.local`:
   ```env
   DATABASE_URL=your-railway-database-url
   ```
10. Run migrations:
    ```bash
    pnpm db:migrate
    ```

#### Redis Setup

For Redis, you can use free options like:

**Railway Redis (Free):**

```bash
railway add redis
```

**Redis Cloud (Free tier):**

1. Go to [redis.com/try-free](https://redis.com/try-free)
2. Sign up and create a free database
3. Copy the connection string
4. Add to `.env.local`:

   ```env
   REDIS_URL=redis://username:password@hostname:port
   ```

5. Start the development server:
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the app.

## 🛠 Tech Stack

### Frontend

- **Next.js 14**: App Router, Server Components, and React 18
- **TypeScript**: Full type safety
- **Tailwind CSS**: Utility-first styling
- **tRPC**: End-to-end type-safe APIs
- **Clerk**: Authentication and user management

### Backend

- **tRPC**: Server-side API routes
- **Drizzle ORM**: Type-safe database queries with PostgreSQL
- **Zod**: Schema validation for inputs and APIs

### AI Integration

- **AI Router**: Dynamic routing to multiple providers (OpenAI, Anthropic, Grok, etc.)
- **PDF Processing**: PDF.js for client-side parsing, server-side extraction via libraries
- **Prompt Engineering**: Structured templates for PDF-to-prompt conversion

### Infrastructure

- **Database**: PostgreSQL for user data, prompts, and processing history
- **Queue**: DB-backed job queue (no persistent worker required on Vercel)
- **Deployment**: Vercel for hosting, with preview deployments
- **Storage**: UploadThing for persistent PDF storage (private by default)

### Development Tools

- **ESLint & Prettier**: Code linting and formatting
- **Husky**: Git hooks for pre-commit checks
- **TypeScript**: Strict mode enabled

## 🏗 Architecture

### High-Level Overview

The app follows a microservices-inspired architecture within a monorepo:

1. **Client Layer**: React components for PDF upload, prompt preview, and user interactions.
2. **API Layer**: tRPC routers handle requests, validate inputs, and orchestrate AI calls.
3. **AI Service Layer**: Router selects optimal AI provider based on availability, cost, and capabilities. Processes PDF text extraction and generates structured prompts.
4. **Data Layer**: Drizzle ORM manages schema for users, sessions, PDFs, and generated prompts.
5. **Queue System**: DB-backed job queue for long-running PDF processing and AI inference to prevent timeouts.

### Key Flows

- **PDF Upload & Processing**:
  1. User uploads PDF via Clerk-authenticated session.
  2. Client-side parsing extracts text; server validates and stores metadata.
  3. Job queued in DB; worker drains queue on Vercel via Cron.
  4. AI generates structured prompt (e.g., JSON schema for analysis tasks).

- **Prompt Generation**:
  1. User selects template (e.g., "Summarize", "Extract Key Points").
  2. tRPC query combines PDF content with template.
  3. AI router calls provider; response cached in Redis and stored in DB.

- **Authentication**:
  - Clerk handles OAuth, JWT sessions.
  - Server-side middleware verifies sessions for protected routes.

### Database Schema (Drizzle)

Defined in `src/server/db/schema.ts`:

- `users`: Clerk user integration (id, email, etc.)
- `pdfs`: Uploaded PDFs (userId, fileUrl, metadata)
- `prompts`: Generated prompts (pdfId, template, aiProvider, output)
- `sessions`: Active processing sessions with Redis sync

Example schema snippet:

```ts
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const pdfs = pgTable("pdfs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  fileUrl: text("file_url").notNull(),
  pageCount: integer("page_count"),
  extractedText: text("extracted_text"),
});
```

## 🔒 Security

- **Authentication**: Clerk provides secure sessions, MFA, and social logins.
- **API Security**: tRPC input validation with Zod; rate limiting via middleware.
- **Data Privacy**: PDFs processed server-side; no client-side AI calls to avoid key exposure.
- **CORS & Headers**: Next.js config enforces strict origins.
- **Secrets Management**: Environment variables via Vercel; never commit `.env.local`.

## 🌍 Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/pdfprompt

# Redis
REDIS_URL=redis://localhost:6379

# AI Providers (optional)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=...
# Add more as needed

# Next.js
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000

# UploadThing (required for PDF storage)
UPLOADTHING_TOKEN="ut7_..." # Get from UploadThing Dashboard (API Keys > V7)

# Optional: Vercel
VERCEL_ENV=development
```

## 🧪 Testing

### Unit Tests

- Run with Vitest (configured in `package.json`):
  ```bash
  pnpm test
  ```

### E2E Tests

- Using Playwright:
  ```bash
  pnpm e2e
  ```

### Linting & Formatting

```bash
pnpm lint
pnpm format
```

## 🔐 GitHub Repository Secrets (for CI/CD)

To enable automated builds and deployments, add these secrets to your GitHub repository settings:

**Required Secrets:**

- `DATABASE_URL` - PostgreSQL connection string
- `CLERK_SECRET_KEY` - Clerk authentication secret key
- `UPLOADTHING_TOKEN` - UploadThing API token (v7 format)
- `NEXT_PUBLIC_APP_URL` - Your production application URL
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key

**Optional Secrets (for AI features):**

- `OPENROUTER_API_KEY` - OpenRouter API key for AI processing
- `OPENROUTER_MODEL` - Default AI model to use
- `OPENROUTER_BASE_URL` - Custom OpenRouter base URL (if needed)
- `PDFPROMPT_WORKER_SECRET` - Secret for protecting worker endpoints
- `PDFPROMPT_MAX_JOBS_PER_INVOCATION` - Max jobs to process per worker run (default: 10)
- `PDFPROMPT_MAX_MS_PER_INVOCATION` - Max milliseconds per worker run (default: 30000)
- `PDFPROMPT_BATCH_SIZE` - Batch size for job processing (default: 5)

**How to add secrets:**

1. Go to your GitHub repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add each secret with the exact name shown above
4. The CI workflow will automatically use these secrets during builds

## � Deployment

### Vercel (Recommended)

1. Push to GitHub.
2. Connect repo in Vercel dashboard.
3. Add environment variables in Vercel project settings.
4. Ensure `vercel.json` is present to configure a Cron for the worker drain.
5. Deploy automatically on push to main.

Vercel handles:

- Serverless functions for API routes.
- Scheduled Cron hits to `/api/worker/drain` to process queued jobs.
- Edge caching for static assets.
- Preview branches for PRs.

### Custom Deployment

- Build: `pnpm build`
- Start: `pnpm start`
- Ensure PostgreSQL and Redis are running (e.g., via Docker Compose).

### Background Worker on Vercel

This project runs background processing on Vercel by exposing a serverless route `src/app/api/worker/drain/route.ts` that drains a bounded number of jobs per invocation.

- Endpoint: `/api/worker/drain`
- Defaults: up to `PDFPROMPT_MAX_JOBS_PER_INVOCATION` jobs or `PDFPROMPT_MAX_MS_PER_INVOCATION` milliseconds (see `.env.example`).
- Optional protection: set `PDFPROMPT_WORKER_SECRET` and call with header `x-worker-secret` or query `?key=`.

Automatic scheduling:

- `vercel.json` includes a Cron entry that runs the drain every minute:

  ```json
  {
    "crons": [{ "path": "/api/worker/drain", "schedule": "*/1 * * * *" }]
  }
  ```

On-demand kick-off:

- When a job is created (`src/server/api/routers/jobs.ts`), the app best-effort pings `/api/worker/drain` so processing starts immediately on Vercel.

Local development tips:

- Start Next.js: `pnpm dev`
- Manually drain: open `http://localhost:3000/api/worker/drain?maxJobs=5`
- Or run the persistent loop for load testing: `pnpm worker:dev`

### Docker (Optional)

Add `Dockerfile` and `docker-compose.yml` for containerization:

```yaml
# docker-compose.yml
services:
  db:
    image: postgres:14
    environment:
      POSTGRES_DB: pdfprompt
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
  redis:
    image: redis:alpine
  app:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - db
      - redis
    environment:
      DATABASE_URL: postgresql://user:pass@db:5432/pdfprompt
      REDIS_URL: redis://redis:6379
```

Run: `docker-compose up`

## 📊 Monitoring & Analytics

- **Logging**: Use Next.js built-in logging; integrate Sentry for errors.
- **Analytics**: Vercel Analytics for performance; add PostHog or similar for user tracking.
- **AI Usage**: Track provider costs via API dashboards; implement quotas in Clerk.

## 🤝 Contributing

1. Fork the repo and create a feature branch.
2. Install dependencies and run locally.
3. Commit changes and push.
4. Open a Pull Request.

Follow ESLint rules and add tests for new features.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙌 Acknowledgments

- Built with love using open-source tools.
- Inspired by Notion's technical planning for AI-driven document processing.

---

## 📦 UploadThing Integration

This project stores generated PDFs in UploadThing instead of the local filesystem.

What's implemented:

- PDF generation produces an in-memory `Buffer` and is uploaded to UploadThing on the server using `UTApi`.
- The database stores the `fileKey`, `fileUrl`, `userId`, `jobId`, and `size` for each PDF in the `files` table.
- Access control ensures only the PDF's creator can view or download the file. Signed URLs from UploadThing are generated server-side per request.
- The legacy local tmp-folder workflow has been removed from production paths.

Setup steps:

1. Create an UploadThing app and copy your V7 token from the dashboard.
2. Set `UPLOADTHING_TOKEN` in your `.env.local`.
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Apply database changes (adds `fileKey`, `fileUrl`, `userId` to `files` table):
   ```bash
   pnpm db:generate
   pnpm db:migrate
   ```
5. Start the app and (optionally) the worker locally:
   ```bash
   pnpm dev
   # Option A: hit the drain endpoint manually when you queue jobs
   #   http://localhost:3000/api/worker/drain?maxJobs=5
   # Option B: run the standalone worker loop (useful for local stress testing)
   pnpm worker:dev
   ```

Usage notes:

- Files are private by default; the app generates time-limited signed URLs with `UTApi.generateSignedURL`.
- Sharing uses server-generated tokens stored in `share_links`. Shared downloads go through the server route to validate the token, then redirect to a signed URL.
- No credentials are exposed to the client; uploads happen exclusively on the server.

Troubleshooting:

- If uploads fail, ensure `UPLOADTHING_TOKEN` is present and valid. As of UploadThing v7, `UPLOADTHING_SECRET` has been replaced by `UPLOADTHING_TOKEN`.
- Ensure your database schema is migrated after pulling changes.

---

_Last updated: September 22, 2025_
