-- Add promptHash column to pdfprompt_job table for deduplication
ALTER TABLE "pdfprompt_job" ADD COLUMN "promptHash" varchar(64);

-- Add index for fast deduplication queries
CREATE INDEX "pdfprompt_job_prompt_hash_idx" ON "pdfprompt_job" USING btree ("promptHash");
