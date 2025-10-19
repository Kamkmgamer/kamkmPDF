-- Migration: Add credits system
-- Adds credits_balance column and credit_product table for one-time credit purchases

-- Add credits_balance column to user_subscription table
ALTER TABLE "pdfprompt_user_subscription" 
ADD COLUMN IF NOT EXISTS "credits_balance" INTEGER DEFAULT 0 NOT NULL;

-- Add comment
COMMENT ON COLUMN "pdfprompt_user_subscription"."credits_balance" IS 'One-time credit purchases that never expire';

-- Create credit_product table for storing credit package configurations
CREATE TABLE IF NOT EXISTS "pdfprompt_credit_product" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "credits" INTEGER NOT NULL,
  "product_id" TEXT NOT NULL UNIQUE,
  "price" REAL NOT NULL,
  "is_active" BOOLEAN DEFAULT TRUE NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE
);

-- Add comments
COMMENT ON TABLE "pdfprompt_credit_product" IS 'Credit package configurations for one-time purchases';
COMMENT ON COLUMN "pdfprompt_credit_product"."id" IS 'Package ID: credits_50, credits_500, credits_1000';
COMMENT ON COLUMN "pdfprompt_credit_product"."product_id" IS 'Polar.sh product ID for checkout';
COMMENT ON COLUMN "pdfprompt_credit_product"."credits" IS 'Number of credits in this package';
COMMENT ON COLUMN "pdfprompt_credit_product"."price" IS 'Price in USD';
