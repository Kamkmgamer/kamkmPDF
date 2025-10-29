CREATE TABLE "pdfprompt_api_key" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"name" varchar(128) NOT NULL,
	"keyHash" text NOT NULL,
	"keyPrefix" text NOT NULL,
	"permissions" jsonb DEFAULT '[]',
	"lastUsedAt" timestamp with time zone,
	"expiresAt" timestamp with time zone,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "pdfprompt_api_key_keyHash_unique" UNIQUE("keyHash")
);
--> statement-breakpoint
CREATE TABLE "pdfprompt_branding_setting" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"logoUrl" text,
	"companyName" varchar(256),
	"primaryColor" varchar(7),
	"secondaryColor" varchar(7),
	"customDomain" text,
	"hidePlatformBranding" boolean DEFAULT false NOT NULL,
	"footerText" text,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone,
	CONSTRAINT "pdfprompt_branding_setting_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "pdfprompt_credit_product" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"credits" integer NOT NULL,
	"productId" text NOT NULL,
	"price" real NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone,
	CONSTRAINT "pdfprompt_credit_product_productId_unique" UNIQUE("productId")
);
--> statement-breakpoint
CREATE TABLE "pdfprompt_email_campaign_event" (
	"id" text PRIMARY KEY NOT NULL,
	"campaignId" text NOT NULL,
	"userId" text NOT NULL,
	"eventType" varchar(64) NOT NULL,
	"eventData" jsonb,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pdfprompt_email_campaign" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"campaignType" varchar(64) NOT NULL,
	"emailType" varchar(64) NOT NULL,
	"scheduledFor" timestamp with time zone NOT NULL,
	"sentAt" timestamp with time zone,
	"status" varchar(32) DEFAULT 'scheduled' NOT NULL,
	"metadata" jsonb,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pdfprompt_email_preference" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"unsubscribedFromMarketing" boolean DEFAULT false NOT NULL,
	"unsubscribedFromProduct" boolean DEFAULT false NOT NULL,
	"unsubscribedAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone,
	CONSTRAINT "pdfprompt_email_preference_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "pdfprompt_file_version" (
	"id" text PRIMARY KEY NOT NULL,
	"fileId" text NOT NULL,
	"userId" text NOT NULL,
	"versionNumber" integer NOT NULL,
	"jobId" text,
	"prompt" text,
	"fileKey" text NOT NULL,
	"fileUrl" text NOT NULL,
	"fileSize" integer DEFAULT 0,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pdfprompt_polar_product" (
	"id" text PRIMARY KEY NOT NULL,
	"tier" varchar(32) NOT NULL,
	"billingCycle" varchar(16) DEFAULT 'monthly' NOT NULL,
	"productId" text NOT NULL,
	"name" varchar(128) NOT NULL,
	"description" text,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "pdfprompt_referral_reward" (
	"id" text PRIMARY KEY NOT NULL,
	"referralId" text NOT NULL,
	"userId" text NOT NULL,
	"creditsAwarded" integer NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pdfprompt_referral" (
	"id" text PRIMARY KEY NOT NULL,
	"referrerId" text NOT NULL,
	"referredUserId" text NOT NULL,
	"referralCode" text NOT NULL,
	"status" varchar(32) DEFAULT 'pending' NOT NULL,
	"completedAt" timestamp with time zone,
	"rewardedAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "pdfprompt_referral_referredUserId_unique" UNIQUE("referredUserId")
);
--> statement-breakpoint
CREATE TABLE "pdfprompt_team_member" (
	"id" text PRIMARY KEY NOT NULL,
	"teamOwnerId" text NOT NULL,
	"memberUserId" text NOT NULL,
	"role" varchar(32) DEFAULT 'member' NOT NULL,
	"inviteEmail" text,
	"status" varchar(32) DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pdfprompt_webhook" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"url" text NOT NULL,
	"events" jsonb NOT NULL,
	"secret" text NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"lastTriggeredAt" timestamp with time zone,
	"failureCount" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pdfprompt_user_subscription" ALTER COLUMN "pdfsUsedThisMonth" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "pdfprompt_job" ADD COLUMN "generatedHtml" text;--> statement-breakpoint
ALTER TABLE "pdfprompt_job" ADD COLUMN "imageUrls" jsonb;--> statement-breakpoint
ALTER TABLE "pdfprompt_job" ADD COLUMN "regenerationCount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "pdfprompt_job" ADD COLUMN "parentJobId" text;--> statement-breakpoint
ALTER TABLE "pdfprompt_user_subscription" ADD COLUMN "polarSubscriptionId" text;--> statement-breakpoint
ALTER TABLE "pdfprompt_user_subscription" ADD COLUMN "creditsBalance" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "pdfprompt_user_subscription" ADD COLUMN "referralCode" text NOT NULL;--> statement-breakpoint
ALTER TABLE "pdfprompt_email_campaign_event" ADD CONSTRAINT "pdfprompt_email_campaign_event_campaignId_pdfprompt_email_campaign_id_fk" FOREIGN KEY ("campaignId") REFERENCES "public"."pdfprompt_email_campaign"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pdfprompt_file_version" ADD CONSTRAINT "pdfprompt_file_version_fileId_pdfprompt_file_id_fk" FOREIGN KEY ("fileId") REFERENCES "public"."pdfprompt_file"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pdfprompt_file_version" ADD CONSTRAINT "pdfprompt_file_version_jobId_pdfprompt_job_id_fk" FOREIGN KEY ("jobId") REFERENCES "public"."pdfprompt_job"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pdfprompt_referral_reward" ADD CONSTRAINT "pdfprompt_referral_reward_referralId_pdfprompt_referral_id_fk" FOREIGN KEY ("referralId") REFERENCES "public"."pdfprompt_referral"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "tier_billing_idx" ON "pdfprompt_polar_product" USING btree ("tier","billingCycle");--> statement-breakpoint
ALTER TABLE "pdfprompt_user_subscription" ADD CONSTRAINT "pdfprompt_user_subscription_referralCode_unique" UNIQUE("referralCode");