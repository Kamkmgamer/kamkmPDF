-- Add generatedHtml column to store the HTML output for regeneration
ALTER TABLE "pdfprompt_job" ADD COLUMN "generatedHtml" text;

-- Add imageUrls column to store uploaded image references
ALTER TABLE "pdfprompt_job" ADD COLUMN "imageUrls" jsonb;

-- Add metadata column for regeneration tracking
ALTER TABLE "pdfprompt_job" ADD COLUMN "regenerationCount" integer DEFAULT 0 NOT NULL;
ALTER TABLE "pdfprompt_job" ADD COLUMN "parentJobId" text;
