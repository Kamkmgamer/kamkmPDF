import {
  pgTable,
  index,
  integer,
  varchar,
  timestamp,
  text,
  foreignKey,
  unique,
  jsonb,
  bigint,
  boolean,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const pdfpromptPost = pgTable(
  "pdfprompt_post",
  {
    id: integer()
      .primaryKey()
      .generatedByDefaultAsIdentity({
        name: "pdfprompt_post_id_seq",
        startWith: 1,
        increment: 1,
        minValue: 1,
        maxValue: 2147483647,
        cache: 1,
      }),
    name: varchar({ length: 256 }),
    createdAt: timestamp({ withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ withTimezone: true, mode: "string" }),
  },
  (table) => [
    index("name_idx").using(
      "btree",
      table.name.asc().nullsLast().op("text_ops"),
    ),
  ],
);

export const pdfpromptJob = pgTable("pdfprompt_job", {
  id: text().primaryKey().notNull(),
  userId: text(),
  prompt: text(),
  status: varchar({ length: 32 }).default("queued").notNull(),
  attempts: integer().default(0).notNull(),
  resultFileId: text(),
  errorMessage: text(),
  createdAt: timestamp({ withTimezone: true, mode: "string" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp({ withTimezone: true, mode: "string" }),
  progress: integer().default(0).notNull(),
  stage: varchar({ length: 64 }),
});

export const pdfpromptFile = pgTable(
  "pdfprompt_file",
  {
    id: text().primaryKey().notNull(),
    jobId: text(),
    userId: text(),
    mimeType: varchar({ length: 128 }).default("application/pdf"),
    size: integer().default(0),
    createdAt: timestamp({ withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    fileKey: text().notNull(),
    fileUrl: text().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.jobId],
      foreignColumns: [pdfpromptJob.id],
      name: "pdfprompt_file_jobId_pdfprompt_job_id_fk",
    }),
  ],
);

export const pdfpromptShareLink = pgTable(
  "pdfprompt_share_link",
  {
    id: text().primaryKey().notNull(),
    fileId: text(),
    token: text().notNull(),
    expiresAt: timestamp({ withTimezone: true, mode: "string" }).notNull(),
    createdAt: timestamp({ withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.fileId],
      foreignColumns: [pdfpromptFile.id],
      name: "pdfprompt_share_link_fileId_pdfprompt_file_id_fk",
    }),
    unique("pdfprompt_share_link_token_unique").on(table.token),
  ],
);

export const pdfpromptUsageHistory = pgTable("pdfprompt_usage_history", {
  id: text().primaryKey().notNull(),
  userId: text().notNull(),
  action: varchar({ length: 64 }).notNull(),
  amount: integer().default(1).notNull(),
  metadata: jsonb(),
  createdAt: timestamp({ withTimezone: true, mode: "string" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const pdfpromptUserSubscription = pgTable(
  "pdfprompt_user_subscription",
  {
    id: text().primaryKey().notNull(),
    userId: text().notNull(),
    tier: varchar({ length: 32 }).default("starter").notNull(),
    status: varchar({ length: 32 }).default("active").notNull(),
    pdfsUsedThisMonth: integer().default(0).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    storageUsedBytes: bigint({ mode: "number" }).default(0).notNull(),
    periodStart: timestamp({ withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    periodEnd: timestamp({ withTimezone: true, mode: "string" }),
    cancelAtPeriodEnd: boolean().default(false).notNull(),
    createdAt: timestamp({ withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ withTimezone: true, mode: "string" }),
  },
  (table) => [
    unique("pdfprompt_user_subscription_userId_unique").on(table.userId),
  ],
);
