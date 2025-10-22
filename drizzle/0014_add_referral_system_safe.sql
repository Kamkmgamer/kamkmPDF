-- Safe migration: Add referral system with existing data handling

-- Step 1: Add referral_code column WITHOUT unique constraint first
ALTER TABLE "pdfprompt_user_subscription" ADD COLUMN IF NOT EXISTS "referral_code" text;

-- Step 2: Populate existing rows with unique referral codes
-- This uses a combination of user_id hash and row number to ensure uniqueness
DO $$
DECLARE
    rec RECORD;
    new_code TEXT;
    hash_val BIGINT;
    code_base TEXT;
    timestamp_part TEXT;
BEGIN
    FOR rec IN 
        SELECT user_id 
        FROM pdfprompt_user_subscription 
        WHERE referral_code IS NULL
    LOOP
        -- Generate hash from user_id
        hash_val := 0;
        FOR i IN 1..length(rec.user_id) LOOP
            hash_val := ((hash_val << 5) - hash_val) + ascii(substring(rec.user_id, i, 1));
        END LOOP;
        
        -- Create base code from hash
        code_base := upper(substring(to_hex(abs(hash_val)::bigint), 1, 8));
        
        -- Add timestamp component
        timestamp_part := upper(substring(to_hex(extract(epoch from now())::bigint), -4));
        
        -- Combine to create unique code
        new_code := 'REF' || code_base || timestamp_part;
        
        -- Update the row
        UPDATE pdfprompt_user_subscription 
        SET referral_code = new_code 
        WHERE user_id = rec.user_id;
        
        -- Small delay to ensure timestamp uniqueness
        PERFORM pg_sleep(0.001);
    END LOOP;
END $$;

-- Step 3: Now add the unique constraint
ALTER TABLE "pdfprompt_user_subscription" 
ADD CONSTRAINT "pdfprompt_user_subscription_referral_code_unique" UNIQUE("referral_code");

-- Step 4: Create referrals table
CREATE TABLE IF NOT EXISTS "pdfprompt_referral" (
	"id" text PRIMARY KEY NOT NULL,
	"referrer_id" text NOT NULL,
	"referred_user_id" text NOT NULL,
	"referral_code" text NOT NULL,
	"status" varchar(32) DEFAULT 'pending' NOT NULL,
	"completed_at" timestamp with time zone,
	"rewarded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "pdfprompt_referral_referred_user_id_unique" UNIQUE("referred_user_id")
);

-- Step 5: Create referral_rewards table
CREATE TABLE IF NOT EXISTS "pdfprompt_referral_reward" (
	"id" text PRIMARY KEY NOT NULL,
	"referral_id" text NOT NULL,
	"user_id" text NOT NULL,
	"credits_awarded" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Step 6: Add foreign key constraint
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'pdfprompt_referral_reward_referral_id_pdfprompt_referral_id_fk'
    ) THEN
        ALTER TABLE "pdfprompt_referral_reward" 
        ADD CONSTRAINT "pdfprompt_referral_reward_referral_id_pdfprompt_referral_id_fk" 
        FOREIGN KEY ("referral_id") REFERENCES "pdfprompt_referral"("id") 
        ON DELETE no action ON UPDATE no action;
    END IF;
END $$;

-- Step 7: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "referral_referrer_idx" ON "pdfprompt_referral" ("referrer_id");
CREATE INDEX IF NOT EXISTS "referral_status_idx" ON "pdfprompt_referral" ("status");
CREATE INDEX IF NOT EXISTS "referral_reward_user_idx" ON "pdfprompt_referral_reward" ("user_id");

-- Verify migration
DO $$
DECLARE
    null_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO null_count 
    FROM pdfprompt_user_subscription 
    WHERE referral_code IS NULL;
    
    IF null_count > 0 THEN
        RAISE EXCEPTION 'Migration incomplete: % rows still have NULL referral_code', null_count;
    ELSE
        RAISE NOTICE 'Migration successful: All users have referral codes';
    END IF;
END $$;
