import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    TRPC_LOG_DEV_ERRORS: z.enum(["true", "false"]).default("false"),
    CLERK_SECRET_KEY: z.string().min(1),
    CLERK_WEBHOOK_SECRET: z.string().optional(),
    // UploadThing (required for external storage)
    UPLOADTHING_TOKEN: z.string().min(1),
    // OpenRouter (optional). When not provided, the system falls back to PDFKit-only generation.
    // Multiple keys supported for redundancy and scalability
    OPENROUTER_API_KEY: z.string().optional(),
    OPENROUTER_API_KEY1: z.string().optional(),
    OPENROUTER_API_KEY2: z.string().optional(),
    OPENROUTER_API_KEY3: z.string().optional(),
    OPENROUTER_API_KEY4: z.string().optional(),
    OPENROUTER_API_KEY5: z.string().optional(),
    OPENROUTER_API_KEY6: z.string().optional(),
    OPENROUTER_API_KEY7: z.string().optional(),
    OPENROUTER_API_KEY8: z.string().optional(),
    OPENROUTER_API_KEY9: z.string().optional(),
    OPENROUTER_API_KEY10: z.string().optional(),
    OPENROUTER_BASE_URL: z.string().url().optional(),
    // Worker/cron coordination (optional)
    PDFPROMPT_WORKER_SECRET: z.string().optional(),
    PDFPROMPT_MAX_JOBS_PER_INVOCATION: z.string().optional(),
    PDFPROMPT_MAX_MS_PER_INVOCATION: z.string().optional(),
    PDFPROMPT_BATCH_SIZE: z.string().optional(),
    PDFPROMPT_WORKER_CONCURRENCY: z.string().optional(),
    MAX_PDF_CONCURRENCY: z.string().optional(),
    PDFPROMPT_BYPASS_AI_FOR_RTL: z.string().optional(),
    // Database connection pooling
    DATABASE_MAX_CONNECTIONS: z.string().optional(),
    DATABASE_IDLE_TIMEOUT: z.string().optional(),
    DATABASE_CONNECT_TIMEOUT: z.string().optional(),
    // Browser pool scaling
    BROWSER_POOL_SIZE: z.string().optional(),
    BROWSER_IDLE_TIMEOUT: z.string().optional(),
    BROWSER_MAX_AGE_MS: z.string().optional(),
    // Redis configuration (for rate limiting)
    REDIS_URL: z.string().url().optional(),
    REDIS_TOKEN: z.string().optional(),
    // Polar.sh configuration (optional - only needed for subscriptions and credit purchases)
    POLAR_ACCESS_TOKEN: z.string().optional(),
    POLAR_WEBHOOK_SECRET: z.string().optional(),
    // Resend configuration (for sending emails)
    RESEND_API_KEY: z.string().min(1),
    RESEND_FROM_EMAIL: z.string().email().optional(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET,
    UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    OPENROUTER_API_KEY1: process.env.OPENROUTER_API_KEY1,
    OPENROUTER_API_KEY2: process.env.OPENROUTER_API_KEY2,
    OPENROUTER_API_KEY3: process.env.OPENROUTER_API_KEY3,
    OPENROUTER_API_KEY4: process.env.OPENROUTER_API_KEY4,
    OPENROUTER_API_KEY5: process.env.OPENROUTER_API_KEY5,
    OPENROUTER_API_KEY6: process.env.OPENROUTER_API_KEY6,
    OPENROUTER_API_KEY7: process.env.OPENROUTER_API_KEY7,
    OPENROUTER_API_KEY8: process.env.OPENROUTER_API_KEY8,
    OPENROUTER_API_KEY9: process.env.OPENROUTER_API_KEY9,
    OPENROUTER_API_KEY10: process.env.OPENROUTER_API_KEY10,
    OPENROUTER_BASE_URL: process.env.OPENROUTER_BASE_URL,
    PDFPROMPT_WORKER_SECRET: process.env.PDFPROMPT_WORKER_SECRET,
    PDFPROMPT_MAX_JOBS_PER_INVOCATION:
      process.env.PDFPROMPT_MAX_JOBS_PER_INVOCATION,
    PDFPROMPT_MAX_MS_PER_INVOCATION:
      process.env.PDFPROMPT_MAX_MS_PER_INVOCATION,
    PDFPROMPT_BATCH_SIZE: process.env.PDFPROMPT_BATCH_SIZE,
    PDFPROMPT_WORKER_CONCURRENCY: process.env.PDFPROMPT_WORKER_CONCURRENCY,
    MAX_PDF_CONCURRENCY: process.env.MAX_PDF_CONCURRENCY,
    PDFPROMPT_BYPASS_AI_FOR_RTL: process.env.PDFPROMPT_BYPASS_AI_FOR_RTL,
    DATABASE_MAX_CONNECTIONS: process.env.DATABASE_MAX_CONNECTIONS,
    DATABASE_IDLE_TIMEOUT: process.env.DATABASE_IDLE_TIMEOUT,
    DATABASE_CONNECT_TIMEOUT: process.env.DATABASE_CONNECT_TIMEOUT,
    BROWSER_POOL_SIZE: process.env.BROWSER_POOL_SIZE,
    BROWSER_IDLE_TIMEOUT: process.env.BROWSER_IDLE_TIMEOUT,
    BROWSER_MAX_AGE_MS: process.env.BROWSER_MAX_AGE_MS,
    REDIS_URL: process.env.REDIS_URL,
    REDIS_TOKEN: process.env.REDIS_TOKEN,
    POLAR_ACCESS_TOKEN: process.env.POLAR_ACCESS_TOKEN,
    POLAR_WEBHOOK_SECRET: process.env.POLAR_WEBHOOK_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
    TRPC_LOG_DEV_ERRORS: process.env.TRPC_LOG_DEV_ERRORS,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
