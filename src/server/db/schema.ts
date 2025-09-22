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
