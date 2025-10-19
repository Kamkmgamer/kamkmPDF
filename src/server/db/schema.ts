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
  // HTML storage for regeneration
  generatedHtml: d.text(),
  imageUrls: d.jsonb().$type<string[]>(),
  // Regeneration tracking
  regenerationCount: d.integer().default(0).notNull(),
  parentJobId: d.text(),
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
  polarSubscriptionId: d.text(), // Polar.sh subscription ID for paid tiers
  pdfsUsedThisMonth: d.real().default(0).notNull(), // Changed to real to support fractional credits (0.5)
  storageUsedBytes: d.bigint({ mode: "number" }).default(0).notNull(),
  creditsBalance: d.integer().default(0).notNull(), // One-time credit purchases that never expire
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

// Version history for PDF files (supports rollback and comparison)
export const fileVersions = createTable("file_version", (d) => ({
  id: d.text().primaryKey(),
  fileId: d
    .text()
    .references(() => files.id)
    .notNull(),
  userId: d.text().notNull(),
  versionNumber: d.integer().notNull(), // Sequential version number
  jobId: d.text().references(() => jobs.id), // Job that created this version
  prompt: d.text(), // The prompt used for this version
  fileKey: d.text().notNull(), // Storage key for this version
  fileUrl: d.text().notNull(), // URL to access this version
  fileSize: d.integer().default(0),
  createdAt: d
    .timestamp({ withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
}));

// Team members table for Business+ tiers
export const teamMembers = createTable("team_member", (d) => ({
  id: d.text().primaryKey(),
  teamOwnerId: d.text().notNull(), // User who owns the subscription
  memberUserId: d.text().notNull(), // User who is a team member
  role: d.varchar({ length: 32 }).default("member").notNull(), // admin, member, viewer
  inviteEmail: d.text(), // Email used for invitation
  status: d.varchar({ length: 32 }).default("pending").notNull(), // pending, active, revoked
  createdAt: d
    .timestamp({ withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
}));

// API keys for Business+ tiers
export const apiKeys = createTable("api_key", (d) => ({
  id: d.text().primaryKey(),
  userId: d.text().notNull(),
  name: d.varchar({ length: 128 }).notNull(), // User-defined name for the key
  keyHash: d.text().notNull().unique(), // Hashed API key
  keyPrefix: d.text().notNull(), // First 8 chars for display (e.g., "sk_live_...")
  permissions: d
    .jsonb()
    .$type<string[]>()
    .default(sql`'[]'`), // Array of permissions
  lastUsedAt: d.timestamp({ withTimezone: true }),
  expiresAt: d.timestamp({ withTimezone: true }),
  isActive: d.boolean().default(true).notNull(),
  createdAt: d
    .timestamp({ withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
}));

// Webhooks for Enterprise tier
export const webhooks = createTable("webhook", (d) => ({
  id: d.text().primaryKey(),
  userId: d.text().notNull(),
  url: d.text().notNull(),
  events: d.jsonb().$type<string[]>().notNull(), // Array of event types to listen for
  secret: d.text().notNull(), // For webhook signature verification
  isActive: d.boolean().default(true).notNull(),
  lastTriggeredAt: d.timestamp({ withTimezone: true }),
  failureCount: d.integer().default(0).notNull(),
  createdAt: d
    .timestamp({ withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
}));

// Custom branding settings for Business+ tiers
export const brandingSettings = createTable("branding_setting", (d) => ({
  id: d.text().primaryKey(),
  userId: d.text().notNull().unique(),
  logoUrl: d.text(),
  companyName: d.varchar({ length: 256 }),
  primaryColor: d.varchar({ length: 7 }), // Hex color code
  secondaryColor: d.varchar({ length: 7 }),
  customDomain: d.text(),
  hidePlatformBranding: d.boolean().default(false).notNull(),
  footerText: d.text(),
  createdAt: d
    .timestamp({ withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

// Polar.sh product configuration
export const polarProducts = createTable("polar_product", (d) => ({
  id: d.text().primaryKey(),
  tier: d.varchar({ length: 32 }).notNull().unique(), // professional, classic, business, enterprise
  productId: d.text().notNull(), // Polar product ID (e.g., prod_xxxxx)
  name: d.varchar({ length: 128 }).notNull(),
  description: d.text(),
  isActive: d.boolean().default(true).notNull(),
  createdAt: d
    .timestamp({ withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

// Credit packages for one-time purchases
export const creditProducts = createTable("credit_product", (d) => ({
  id: d.text().primaryKey(), // credits_50, credits_500, credits_1000
  name: d.varchar({ length: 255 }).notNull(),
  credits: d.integer().notNull(),
  productId: d.text().notNull().unique(), // Polar product ID
  price: d.real().notNull(), // Price in dollars
  isActive: d.boolean().default(true).notNull(),
  createdAt: d
    .timestamp({ withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));
