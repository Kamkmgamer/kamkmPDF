// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import { index, pgTableCreator } from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `pdfprompt_${name}`);

export const posts = createTable(
  "post",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    name: d.varchar({ length: 256 }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [index("name_idx").on(t.name)],
);

// Jobs table for PDF generation jobs
export const jobs = createTable("job", (d) => ({
  id: d.text().primaryKey(), // use UUID string
  userId: d.text(),
  prompt: d.text(),
  status: d
    .varchar({ length: 32 })
    .default(sql`'queued'`)
    .notNull(),
  attempts: d.integer().default(0).notNull(),
  resultFileId: d.text(),
  errorMessage: d.text(),
  // Live progress tracking (0-100) and current stage label
  progress: d.integer().default(0).notNull(),
  stage: d.varchar({ length: 64 }),
  createdAt: d
    .timestamp({ withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

// Files table to reference stored PDFs
export const files = createTable("file", (d) => ({
  id: d.text().primaryKey(),
  jobId: d.text().references(() => jobs.id),
  userId: d.text(),
  fileKey: d.text().notNull(),
  fileUrl: d.text().notNull(),
  mimeType: d.varchar({ length: 128 }).default("application/pdf"),
  size: d.integer().default(0),
  createdAt: d
    .timestamp({ withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
}));

// Share links table for temporary file sharing
export const shareLinks = createTable("share_link", (d) => ({
  id: d.text().primaryKey(),
  fileId: d.text().references(() => files.id),
  token: d.text().unique().notNull(),
  expiresAt: d.timestamp({ withTimezone: true }).notNull(),
  createdAt: d
    .timestamp({ withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
}));

// User subscriptions table
export const userSubscriptions = createTable("user_subscription", (d) => ({
  id: d.text().primaryKey(),
  userId: d.text().notNull().unique(),
  tier: d.varchar({ length: 32 }).default("starter").notNull(), // starter, professional, business, enterprise
  status: d.varchar({ length: 32 }).default("active").notNull(), // active, cancelled, expired
  paypalSubscriptionId: d.text(), // PayPal subscription ID for paid tiers
  pdfsUsedThisMonth: d.integer().default(0).notNull(),
  storageUsedBytes: d.bigint({ mode: "number" }).default(0).notNull(),
  periodStart: d
    .timestamp({ withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  periodEnd: d.timestamp({ withTimezone: true }),
  cancelAtPeriodEnd: d.boolean().default(false).notNull(),
  createdAt: d
    .timestamp({ withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

// Usage history for analytics and quota tracking
export const usageHistory = createTable("usage_history", (d) => ({
  id: d.text().primaryKey(),
  userId: d.text().notNull(),
  action: d.varchar({ length: 64 }).notNull(), // pdf_generated, storage_added, etc.
  amount: d.integer().default(1).notNull(),
  metadata: d.jsonb(), // flexible field for additional data
  createdAt: d
    .timestamp({ withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
}));
