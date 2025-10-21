-- Add billing cycle support to polar_products table
-- This allows separate products for monthly and yearly billing

-- Add billingCycle column with default 'monthly'
ALTER TABLE "pdfprompt_polar_product" ADD COLUMN "billingCycle" varchar(16) DEFAULT 'monthly' NOT NULL;

-- Drop the old unique constraint on tier
ALTER TABLE "pdfprompt_polar_product" DROP CONSTRAINT IF EXISTS "pdfprompt_polar_product_tier_unique";

-- Create unique index on tier + billingCycle combination
CREATE UNIQUE INDEX IF NOT EXISTS "tier_billing_idx" ON "pdfprompt_polar_product" ("tier", "billingCycle");

-- Update existing records to have 'monthly' billing cycle explicitly
UPDATE "pdfprompt_polar_product" SET "billingCycle" = 'monthly' WHERE "billingCycle" IS NULL;
