-- Migration: Add tier-specific feature tables
-- Created: 2024-01-15
-- Description: Adds tables for version history, team collaboration, API keys, webhooks, and custom branding

-- Version history for PDF files
CREATE TABLE IF NOT EXISTS "pdfprompt_file_version" (
  "id" text PRIMARY KEY NOT NULL,
  "file_id" text NOT NULL,
  "user_id" text NOT NULL,
  "version_number" integer NOT NULL,
  "job_id" text,
  "prompt" text,
  "file_key" text NOT NULL,
  "file_url" text NOT NULL,
  "file_size" integer DEFAULT 0,
  "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Team members for Business+ tiers
CREATE TABLE IF NOT EXISTS "pdfprompt_team_member" (
  "id" text PRIMARY KEY NOT NULL,
  "team_owner_id" text NOT NULL,
  "member_user_id" text NOT NULL,
  "role" varchar(32) DEFAULT 'member' NOT NULL,
  "invite_email" text,
  "status" varchar(32) DEFAULT 'pending' NOT NULL,
  "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- API keys for Business+ tiers
CREATE TABLE IF NOT EXISTS "pdfprompt_api_key" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "name" varchar(128) NOT NULL,
  "key_hash" text NOT NULL UNIQUE,
  "key_prefix" text NOT NULL,
  "permissions" jsonb DEFAULT '[]',
  "last_used_at" timestamp with time zone,
  "expires_at" timestamp with time zone,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Webhooks for Enterprise tier
CREATE TABLE IF NOT EXISTS "pdfprompt_webhook" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "url" text NOT NULL,
  "events" jsonb NOT NULL,
  "secret" text NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "last_triggered_at" timestamp with time zone,
  "failure_count" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Custom branding settings for Business+ tiers
CREATE TABLE IF NOT EXISTS "pdfprompt_branding_setting" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL UNIQUE,
  "logo_url" text,
  "company_name" varchar(256),
  "primary_color" varchar(7),
  "secondary_color" varchar(7),
  "custom_domain" text,
  "hide_platform_branding" boolean DEFAULT false NOT NULL,
  "footer_text" text,
  "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" timestamp with time zone
);

-- Add foreign key constraints
DO $$ BEGIN
  ALTER TABLE "pdfprompt_file_version" ADD CONSTRAINT "pdfprompt_file_version_file_id_pdfprompt_file_id_fk" 
    FOREIGN KEY ("file_id") REFERENCES "pdfprompt_file"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "pdfprompt_file_version" ADD CONSTRAINT "pdfprompt_file_version_job_id_pdfprompt_job_id_fk" 
    FOREIGN KEY ("job_id") REFERENCES "pdfprompt_job"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "file_version_file_id_idx" ON "pdfprompt_file_version" ("file_id");
CREATE INDEX IF NOT EXISTS "file_version_user_id_idx" ON "pdfprompt_file_version" ("user_id");
CREATE INDEX IF NOT EXISTS "team_member_owner_id_idx" ON "pdfprompt_team_member" ("team_owner_id");
CREATE INDEX IF NOT EXISTS "team_member_user_id_idx" ON "pdfprompt_team_member" ("member_user_id");
CREATE INDEX IF NOT EXISTS "team_member_status_idx" ON "pdfprompt_team_member" ("status");
CREATE INDEX IF NOT EXISTS "api_key_user_id_idx" ON "pdfprompt_api_key" ("user_id");
CREATE INDEX IF NOT EXISTS "api_key_hash_idx" ON "pdfprompt_api_key" ("key_hash");
CREATE INDEX IF NOT EXISTS "webhook_user_id_idx" ON "pdfprompt_webhook" ("user_id");
CREATE INDEX IF NOT EXISTS "branding_user_id_idx" ON "pdfprompt_branding_setting" ("user_id");
