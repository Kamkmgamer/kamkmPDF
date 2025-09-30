CREATE TABLE "pdfprompt_usage_history" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"action" varchar(64) NOT NULL,
	"amount" integer DEFAULT 1 NOT NULL,
	"metadata" jsonb,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pdfprompt_user_subscription" (
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
--> statement-breakpoint
ALTER TABLE "pdfprompt_file" ADD COLUMN "userId" text;--> statement-breakpoint
ALTER TABLE "pdfprompt_file" ADD COLUMN "fileKey" text NOT NULL;--> statement-breakpoint
ALTER TABLE "pdfprompt_file" ADD COLUMN "fileUrl" text NOT NULL;--> statement-breakpoint
ALTER TABLE "pdfprompt_job" ADD COLUMN "progress" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "pdfprompt_job" ADD COLUMN "stage" varchar(64);--> statement-breakpoint
ALTER TABLE "pdfprompt_file" DROP COLUMN "path";