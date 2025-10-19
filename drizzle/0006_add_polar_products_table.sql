-- Migration: Add polar_product table for storing Polar.sh product configurations
-- This table stores product IDs in the database instead of environment variables

CREATE TABLE IF NOT EXISTS "pdfprompt_polar_product" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "tier" VARCHAR(32) NOT NULL UNIQUE,
  "productId" TEXT NOT NULL,
  "name" VARCHAR(128) NOT NULL,
  "description" TEXT,
  "isActive" BOOLEAN DEFAULT TRUE NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE
);

-- Add comment
COMMENT ON TABLE "pdfprompt_polar_product" IS 'Polar.sh product configurations for subscription tiers';
COMMENT ON COLUMN "pdfprompt_polar_product"."tier" IS 'Subscription tier: professional, classic, business, or enterprise';
COMMENT ON COLUMN "pdfprompt_polar_product"."productId" IS 'Polar.sh product ID (e.g., xxxxx)';
