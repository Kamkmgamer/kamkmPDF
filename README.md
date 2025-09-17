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
   git clone <your-repo-url>
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
- **Cache/Queue**: Redis for session caching and job queuing
- **Deployment**: Vercel for hosting, with preview deployments

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
5. **Queue System**: Redis-backed queues for long-running PDF processing and AI inference to prevent timeouts.

### Key Flows
- **PDF Upload & Processing**:
  1. User uploads PDF via Clerk-authenticated session.
  2. Client-side parsing extracts text; server validates and stores metadata.
  3. Job queued in Redis; worker extracts full content and routes to AI.
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

# AI Providers (at least one required)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=...
# Add more as needed

# Next.js
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000

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

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub.
2. Connect repo in Vercel dashboard.
3. Add environment variables in Vercel project settings.
4. Deploy automatically on push to main.

Vercel handles:
- Serverless functions for API routes.
- Edge caching for static assets.
- Preview branches for PRs.

### Custom Deployment
- Build: `pnpm build`
- Start: `pnpm start`
- Ensure PostgreSQL and Redis are running (e.g., via Docker Compose).

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

This project is proprietary and not open source. All rights reserved.

## 🙌 Acknowledgments

- Built with love using open-source tools.
- Inspired by Notion's technical planning for AI-driven document processing.

---

*Last updated: September 17, 2025*
