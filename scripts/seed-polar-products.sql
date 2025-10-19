-- Seed script for Polar.sh product configurations
-- Run this after setting up your Polar products
-- Replace the UUID placeholders with your actual Polar product IDs
-- Product IDs are UUIDs in format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

-- Insert product configurations
INSERT INTO "pdfprompt_polar_product" ("id", "tier", "productId", "name", "description", "isActive", "createdAt")
VALUES
  (
    'prod-config-professional',
    'professional',
    '24424dd6-52ff-4df2-a0ee-5b937c13cc91', 
    'Professional Plan',
    'Full access to all professional features',
    true,
    CURRENT_TIMESTAMP
  ),
  (
    'prod-config-classic',
    'classic',
    '0246f64d-c711-4188-8b54-bc46796ca4be', 
    'Classic Plan',
    'Classic tier with essential features',
    true,
    CURRENT_TIMESTAMP
  ),
  (
    'prod-config-business',
    'business',
    '155a49a9-c8d3-4db6-8e52-c7acdafc128e', 
    'Business Plan',
    'Advanced features for growing businesses',
    true,
    CURRENT_TIMESTAMP
  ),
  (
    'prod-config-enterprise',
    'enterprise',
    'e0e5a552-6ea7-4241-9215-112b7cbd334e', 
    'Enterprise Plan',
    'Complete solution for large organizations',
    true,
    CURRENT_TIMESTAMP
  )
ON CONFLICT ("tier") DO UPDATE
SET
  "productId" = EXCLUDED."productId",
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "isActive" = EXCLUDED."isActive",
  "updatedAt" = CURRENT_TIMESTAMP;
