-- Add performance indexes for PDF generation optimization
-- This migration adds critical indexes to improve query performance

-- Job table indexes for worker queue and user lookups
CREATE INDEX IF NOT EXISTS "pdfprompt_job_status_created_at_idx" ON "pdfprompt_job" ("status", "created_at");
CREATE INDEX IF NOT EXISTS "pdfprompt_job_user_id_idx" ON "pdfprompt_job" ("user_id");
CREATE INDEX IF NOT EXISTS "pdfprompt_job_status_idx" ON "pdfprompt_job" ("status");

-- File table indexes for job and user lookups
CREATE INDEX IF NOT EXISTS "pdfprompt_file_job_id_idx" ON "pdfprompt_file" ("job_id");
CREATE INDEX IF NOT EXISTS "pdfprompt_file_user_id_idx" ON "pdfprompt_file" ("user_id");

-- Share link indexes for file/token lookups and cleanup
CREATE INDEX IF NOT EXISTS "pdfprompt_share_link_file_token_idx" ON "pdfprompt_share_link" ("file_id", "token");
CREATE INDEX IF NOT EXISTS "pdfprompt_share_link_expires_at_idx" ON "pdfprompt_share_link" ("expires_at");

-- Usage history indexes for analytics and user queries
CREATE INDEX IF NOT EXISTS "pdfprompt_usage_history_user_id_idx" ON "pdfprompt_usage_history" ("user_id");
CREATE INDEX IF NOT EXISTS "pdfprompt_usage_history_action_idx" ON "pdfprompt_usage_history" ("action");
CREATE INDEX IF NOT EXISTS "pdfprompt_usage_history_created_at_idx" ON "pdfprompt_usage_history" ("created_at");
