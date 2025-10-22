-- Email campaigns for automated marketing funnels
CREATE TABLE IF NOT EXISTS "pdfprompt_email_campaign" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"campaign_type" varchar(64) NOT NULL,
	"email_type" varchar(64) NOT NULL,
	"scheduled_for" timestamp with time zone NOT NULL,
	"sent_at" timestamp with time zone,
	"status" varchar(32) DEFAULT 'scheduled' NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Email campaign events for tracking opens, clicks, conversions
CREATE TABLE IF NOT EXISTS "pdfprompt_email_campaign_event" (
	"id" text PRIMARY KEY NOT NULL,
	"campaign_id" text NOT NULL,
	"user_id" text NOT NULL,
	"event_type" varchar(64) NOT NULL,
	"event_data" jsonb,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- User email preferences and unsubscribe tracking
CREATE TABLE IF NOT EXISTS "pdfprompt_email_preference" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL UNIQUE,
	"unsubscribed_from_marketing" boolean DEFAULT false NOT NULL,
	"unsubscribed_from_product" boolean DEFAULT false NOT NULL,
	"unsubscribed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);

-- Add foreign key constraint
DO $$ BEGIN
 ALTER TABLE "pdfprompt_email_campaign_event" ADD CONSTRAINT "pdfprompt_email_campaign_event_campaign_id_pdfprompt_email_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."pdfprompt_email_campaign"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "email_campaign_user_idx" ON "pdfprompt_email_campaign" ("user_id");
CREATE INDEX IF NOT EXISTS "email_campaign_status_idx" ON "pdfprompt_email_campaign" ("status");
CREATE INDEX IF NOT EXISTS "email_campaign_scheduled_idx" ON "pdfprompt_email_campaign" ("scheduled_for");
CREATE INDEX IF NOT EXISTS "email_campaign_type_idx" ON "pdfprompt_email_campaign" ("campaign_type");

CREATE INDEX IF NOT EXISTS "email_event_campaign_idx" ON "pdfprompt_email_campaign_event" ("campaign_id");
CREATE INDEX IF NOT EXISTS "email_event_user_idx" ON "pdfprompt_email_campaign_event" ("user_id");
CREATE INDEX IF NOT EXISTS "email_event_type_idx" ON "pdfprompt_email_campaign_event" ("event_type");

CREATE INDEX IF NOT EXISTS "email_pref_user_idx" ON "pdfprompt_email_preference" ("user_id");
