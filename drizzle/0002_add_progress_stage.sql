-- Add progress and stage columns for real-time generation tracking
ALTER TABLE "pdfprompt_job" ADD COLUMN IF NOT EXISTS "progress" integer DEFAULT 0 NOT NULL;
ALTER TABLE "pdfprompt_job" ADD COLUMN IF NOT EXISTS "stage" varchar(64);
