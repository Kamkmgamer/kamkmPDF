-- Migration: Rename paypalSubscriptionId to polarSubscriptionId
-- This migration renames the column to reflect the change from PayPal to Polar.sh

-- Rename the column
ALTER TABLE "pdfprompt_user_subscription" 
RENAME COLUMN "paypalSubscriptionId" TO "polarSubscriptionId";

-- Add a comment
COMMENT ON COLUMN "pdfprompt_user_subscription"."polarSubscriptionId" 
IS 'Polar.sh subscription ID for paid tier subscriptions';
