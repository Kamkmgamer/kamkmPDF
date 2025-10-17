-- Change pdfsUsedThisMonth from integer to real to support fractional credits
ALTER TABLE "pdfprompt_user_subscription" 
ALTER COLUMN "pdfsUsedThisMonth" TYPE real USING "pdfsUsedThisMonth"::real;
