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
    // UploadThing (required for external storage)
    UPLOADTHING_TOKEN: z.string().min(1),
    // OpenRouter (optional). When not provided, the system falls back to PDFKit-only generation.
    OPENROUTER_API_KEY: z.string().optional(),
    OPENROUTER_BASE_URL: z.string().url().optional(),
    // Worker/cron coordination (optional)
    PDFPROMPT_WORKER_SECRET: z.string().optional(),
    PDFPROMPT_MAX_JOBS_PER_INVOCATION: z.string().optional(),
    PDFPROMPT_MAX_MS_PER_INVOCATION: z.string().optional(),
    PDFPROMPT_BATCH_SIZE: z.string().optional(),
    // Polar.sh configuration (optional - only needed for subscriptions and credit purchases)
    POLAR_ACCESS_TOKEN: z.string().optional(),
    POLAR_WEBHOOK_SECRET: z.string().optional(),
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
    UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    OPENROUTER_BASE_URL: process.env.OPENROUTER_BASE_URL,
    PDFPROMPT_WORKER_SECRET: process.env.PDFPROMPT_WORKER_SECRET,
    PDFPROMPT_MAX_JOBS_PER_INVOCATION:
      process.env.PDFPROMPT_MAX_JOBS_PER_INVOCATION,
    PDFPROMPT_MAX_MS_PER_INVOCATION:
      process.env.PDFPROMPT_MAX_MS_PER_INVOCATION,
    PDFPROMPT_BATCH_SIZE: process.env.PDFPROMPT_BATCH_SIZE,
    POLAR_ACCESS_TOKEN: process.env.POLAR_ACCESS_TOKEN,
    POLAR_WEBHOOK_SECRET: process.env.POLAR_WEBHOOK_SECRET,
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
