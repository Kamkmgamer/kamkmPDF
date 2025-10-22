-- Add referral code column to user_subscription table
ALTER TABLE "pdfprompt_user_subscription" ADD COLUMN "referral_code" text;
ALTER TABLE "pdfprompt_user_subscription" ADD CONSTRAINT "pdfprompt_user_subscription_referral_code_unique" UNIQUE("referral_code");

-- Create referrals table
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

-- Create referral_rewards table
CREATE TABLE IF NOT EXISTS "pdfprompt_referral_reward" (
	"id" text PRIMARY KEY NOT NULL,
	"referral_id" text NOT NULL,
	"user_id" text NOT NULL,
	"credits_awarded" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Add foreign key constraint
ALTER TABLE "pdfprompt_referral_reward" ADD CONSTRAINT "pdfprompt_referral_reward_referral_id_pdfprompt_referral_id_fk" FOREIGN KEY ("referral_id") REFERENCES "pdfprompt_referral"("id") ON DELETE no action ON UPDATE no action;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "referral_referrer_idx" ON "pdfprompt_referral" ("referrer_id");
CREATE INDEX IF NOT EXISTS "referral_status_idx" ON "pdfprompt_referral" ("status");
CREATE INDEX IF NOT EXISTS "referral_reward_user_idx" ON "pdfprompt_referral_reward" ("user_id");
