/**
 * Safe migration script for referral system
 * This script adds referral codes to existing users before applying schema changes
 */

import { db } from "../src/server/db";
import { sql } from "drizzle-orm";

/**
 * Generate a unique referral code based on user ID
 */
function generateReferralCode(userId: string): string {
  const hash = userId.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);
  
  const code = Math.abs(hash).toString(36).toUpperCase().slice(0, 8);
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
  
  return `REF${code}${timestamp}`;
}

async function migrateReferralCodes() {
  console.log("🚀 Starting referral system migration...\n");

  try {
    // Step 1: Check if referral_code column exists
    console.log("📋 Step 1: Checking database schema...");
    const columnExists = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'pdfprompt_user_subscription' 
      AND column_name = 'referral_code'
    `);

    if (Array.isArray(columnExists) && columnExists.length === 0) {
      console.log("   Adding referral_code column...");
      await db.execute(sql`
        ALTER TABLE pdfprompt_user_subscription 
        ADD COLUMN referral_code text
      `);
      console.log("   ✅ Column added successfully\n");
    } else {
      console.log("   ✅ Column already exists\n");
    }

    // Step 2: Get all users without referral codes
    console.log("📋 Step 2: Finding users without referral codes...");
    const usersWithoutCodes = await db.execute(sql`
      SELECT "userId" 
      FROM pdfprompt_user_subscription 
      WHERE referral_code IS NULL
    `);

    const usersList = Array.isArray(usersWithoutCodes) ? usersWithoutCodes : [];
    console.log(`   Found ${usersList.length} users without referral codes\n`);

    if (usersList.length === 0) {
      console.log("✅ All users already have referral codes!\n");
    } else {
      // Step 3: Generate and assign referral codes
      console.log("📋 Step 3: Generating referral codes...");
      let updated = 0;

      for (const user of usersList) {
        const userId = (user as any).userId as string;
        const referralCode = generateReferralCode(userId);
        
        await db.execute(sql`
          UPDATE pdfprompt_user_subscription 
          SET referral_code = ${referralCode}
          WHERE "userId" = ${userId}
        `);

        updated++;
        
        // Add small delay to ensure timestamp uniqueness
        await new Promise(resolve => setTimeout(resolve, 10));
        
        if (updated % 10 === 0) {
          console.log(`   Progress: ${updated}/${usersList.length} users updated`);
        }
      }

      console.log(`   ✅ Updated ${updated} users with referral codes\n`);
    }

    // Step 4: Add unique constraint if it doesn't exist
    console.log("📋 Step 4: Adding unique constraint...");
    const constraintExists = await db.execute(sql`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'pdfprompt_user_subscription' 
      AND constraint_name = 'pdfprompt_user_subscription_referral_code_unique'
    `);

    if (Array.isArray(constraintExists) && constraintExists.length === 0) {
      await db.execute(sql`
        ALTER TABLE pdfprompt_user_subscription 
        ADD CONSTRAINT pdfprompt_user_subscription_referral_code_unique 
        UNIQUE (referral_code)
      `);
      console.log("   ✅ Unique constraint added\n");
    } else {
      console.log("   ✅ Unique constraint already exists\n");
    }

    // Step 5: Verify migration
    console.log("📋 Step 5: Verifying migration...");
    const nullCount = await db.execute(sql`
      SELECT COUNT(*) as count 
      FROM pdfprompt_user_subscription 
      WHERE referral_code IS NULL
    `);

    const count = Array.isArray(nullCount) && nullCount.length > 0 
      ? Number((nullCount[0] as any)?.count ?? 0) 
      : 0;
    
    if (count > 0) {
      throw new Error(`Migration incomplete: ${count} users still have NULL referral_code`);
    }

    console.log("   ✅ All users have valid referral codes\n");
    console.log("🎉 Migration completed successfully!\n");
    console.log("Next step: Run 'pnpm db:push' to create the referral tables");

  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}

// Run migration
migrateReferralCodes()
  .then(() => {
    console.log("✅ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
