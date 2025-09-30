-- Create user_subscription table
CREATE TABLE IF NOT EXISTS "pdfprompt_user_subscription" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"tier" varchar(32) DEFAULT 'starter' NOT NULL,
	"status" varchar(32) DEFAULT 'active' NOT NULL,
	"pdfsUsedThisMonth" integer DEFAULT 0 NOT NULL,
	"storageUsedBytes" bigint DEFAULT 0 NOT NULL,
	"periodStart" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"periodEnd" timestamp with time zone,
	"cancelAtPeriodEnd" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone,
	CONSTRAINT "pdfprompt_user_subscription_userId_unique" UNIQUE("userId")
);

-- Create usage_history table
CREATE TABLE IF NOT EXISTS "pdfprompt_usage_history" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"action" varchar(64) NOT NULL,
	"amount" integer DEFAULT 1 NOT NULL,
	"metadata" jsonb,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "user_subscription_userId_idx" ON "pdfprompt_user_subscription" ("userId");
CREATE INDEX IF NOT EXISTS "user_subscription_tier_idx" ON "pdfprompt_user_subscription" ("tier");
CREATE INDEX IF NOT EXISTS "usage_history_userId_idx" ON "pdfprompt_usage_history" ("userId");
CREATE INDEX IF NOT EXISTS "usage_history_action_idx" ON "pdfprompt_usage_history" ("action");
CREATE INDEX IF NOT EXISTS "usage_history_createdAt_idx" ON "pdfprompt_usage_history" ("createdAt");
