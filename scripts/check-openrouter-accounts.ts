#!/usr/bin/env tsx

/**
 * OpenRouter API Key Account Checker Script
 * 
 * This script checks which of the 11 OPENROUTER_API_KEYs are using the same account
 * by making API calls to OpenRouter to retrieve account information for each key.
 * 
 * Usage: npx tsx scripts/check-openrouter-accounts.ts
 */

import { config } from "dotenv";
import { readFileSync } from "fs";

// Load environment variables from .env file
config({ path: ".env" });

// Interface for OpenRouter account info response
interface OpenRouterAccountInfo {
  data?: {
    label?: string;
    user?: {
      id: string;
      email?: string;
      name?: string;
    };
    organization?: {
      id: string;
      name?: string;
    };
    is_provisioning_key?: boolean;
    usage?: number;
    is_free_tier?: boolean;
  };
  error?: {
    message: string;
    type: string;
  };
}

// Interface for key account info
interface KeyAccountInfo {
  keyName: string;
  keyIndex: number;
  accountId: string | null;
  accountEmail: string | null;
  accountName: string | null;
  organizationId: string | null;
  organizationName: string | null;
  error: string | null;
  isValid: boolean;
  rawKeyId: string | null; // Add raw key pattern for secondary detection
  usage?: number; // Usage amount for pattern detection
  isFreeTier?: boolean; // Free tier status for pattern detection
}

// Helper function to get account info for a single API key
async function getAccountInfo(apiKey: string, keyName: string, keyIndex: number): Promise<KeyAccountInfo> {
  const result: KeyAccountInfo = {
    keyName,
    keyIndex,
    accountId: null,
    accountEmail: null,
    accountName: null,
    organizationId: null,
    organizationName: null,
    error: null,
    isValid: false,
    rawKeyId: null,
    usage: undefined,
    isFreeTier: undefined,
  };

  try {
    const response = await fetch("https://openrouter.ai/api/v1/auth/key", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      result.error = `HTTP ${response.status}: ${errorText}`;
      return result;
    }

    const data: OpenRouterAccountInfo = await response.json();
    
    if (data.error) {
      result.error = data.error.message;
      return result;
    }

    if (data.data) {
      // Extract account identifier from the key label
      // The label appears to be consistent pattern: "sk-or-v1-xxx...yyy"
      // For better account detection, we'll use the first 12 characters after "sk-or-v1-"
      if (data.data.label) {
        // Extract the first 12 characters after "sk-or-v1-" as account identifier
        const labelMatch = data.data.label.match(/sk-or-v1-([a-f0-9]+)/);
        if (labelMatch && labelMatch[1]) {
          result.accountId = labelMatch[1].substring(0, 12); // Use first 12 chars for better accuracy
        }
      }
      
      // Also extract raw key pattern for secondary detection
      const keyMatch = apiKey.match(/sk-or-v1-([a-f0-9]+)/);
      if (keyMatch && keyMatch[1]) {
        result.rawKeyId = keyMatch[1].substring(0, 12); // Use first 12 chars of actual key
      }
      
      // Extract usage and tier information for pattern detection
      result.usage = data.data.usage;
      result.isFreeTier = data.data.is_free_tier;
      
      // Use other metrics as additional identifiers
      result.accountName = data.data.label || 'Unknown';
      result.isValid = true;
      
      // Check if it's a provisioning key (might indicate organization)
      if (data.data.is_provisioning_key) {
        result.organizationId = "provisioning";
        result.organizationName = "Provisioning Account";
      }
    }

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    result.error = errorMsg;
  }

  return result;
}

// Helper function to collect all available API keys
function getAvailableApiKeys(): { key: string; name: string; index: number }[] {
  const keys: { key: string; name: string; index: number }[] = [];

  // Read from process.env
  if (process.env.OPENROUTER_API_KEY) keys.push({ key: process.env.OPENROUTER_API_KEY, name: "OPENROUTER_API_KEY", index: 0 });
  if (process.env.OPENROUTER_API_KEY1) keys.push({ key: process.env.OPENROUTER_API_KEY1, name: "OPENROUTER_API_KEY1", index: 1 });
  if (process.env.OPENROUTER_API_KEY2) keys.push({ key: process.env.OPENROUTER_API_KEY2, name: "OPENROUTER_API_KEY2", index: 2 });
  if (process.env.OPENROUTER_API_KEY3) keys.push({ key: process.env.OPENROUTER_API_KEY3, name: "OPENROUTER_API_KEY3", index: 3 });
  if (process.env.OPENROUTER_API_KEY4) keys.push({ key: process.env.OPENROUTER_API_KEY4, name: "OPENROUTER_API_KEY4", index: 4 });
  if (process.env.OPENROUTER_API_KEY5) keys.push({ key: process.env.OPENROUTER_API_KEY5, name: "OPENROUTER_API_KEY5", index: 5 });
  if (process.env.OPENROUTER_API_KEY6) keys.push({ key: process.env.OPENROUTER_API_KEY6, name: "OPENROUTER_API_KEY6", index: 6 });
  if (process.env.OPENROUTER_API_KEY7) keys.push({ key: process.env.OPENROUTER_API_KEY7, name: "OPENROUTER_API_KEY7", index: 7 });
  if (process.env.OPENROUTER_API_KEY8) keys.push({ key: process.env.OPENROUTER_API_KEY8, name: "OPENROUTER_API_KEY8", index: 8 });
  if (process.env.OPENROUTER_API_KEY9) keys.push({ key: process.env.OPENROUTER_API_KEY9, name: "OPENROUTER_API_KEY9", index: 9 });
  if (process.env.OPENROUTER_API_KEY10) keys.push({ key: process.env.OPENROUTER_API_KEY10, name: "OPENROUTER_API_KEY10", index: 10 });

  return keys;
}

// Main function
async function main() {
  console.log("🔍 OpenRouter API Key Account Checker");
  console.log("=" .repeat(50));

  const availableKeys = getAvailableApiKeys();
  
  if (availableKeys.length === 0) {
    console.log("❌ No OpenRouter API keys found in environment variables");
    console.log("\nMake sure your .env file contains OPENROUTER_API_KEY variables");
    process.exit(1);
  }

  console.log(`📋 Found ${availableKeys.length} OpenRouter API key(s) to check...\n`);

  // Test each key concurrently for faster execution
  console.log("🔄 Checking account information for each key...");
  const promises = availableKeys.map(({ key, name, index }) =>
    getAccountInfo(key, name, index)
  );

  const accountResults = await Promise.all(promises);

  // Display individual results
  console.log("\n📊 Individual Key Results:");
  console.log("-".repeat(50));
  
  accountResults.forEach((result) => {
    if (result.isValid) {
      console.log(`✅ ${result.keyName}:`);
      console.log(`   Label Account ID: ${result.accountId}`);
      console.log(`   Raw Key ID: ${result.rawKeyId}`);
      console.log(`   Usage: ${result.usage || 'N/A'} (${result.isFreeTier ? 'Free Tier' : 'Paid Tier'})`);
      console.log(`   Email: ${result.accountEmail || 'Not specified'}`);
      console.log(`   Name: ${result.accountName || 'Not specified'}`);
      if (result.organizationId) {
        console.log(`   Organization: ${result.organizationName || result.organizationId}`);
      }
    } else {
      console.log(`❌ ${result.keyName}: ${result.error || 'Unknown error'}`);
    }
    console.log();
  });

  // Group by account
  const validKeys = accountResults.filter(r => r.isValid);
  const invalidKeys = accountResults.filter(r => !r.isValid);

  if (validKeys.length === 0) {
    console.log("❌ No valid keys found to analyze accounts");
    process.exit(1);
  }

  // Enhanced account grouping with multiple detection methods
  const accountGroups = new Map<string, KeyAccountInfo[]>();
  const potentialDuplicates: Array<{keys: KeyAccountInfo[], reason: string}> = [];
  
  // Method 1: Exact label ID match
  const labelGroups = new Map<string, KeyAccountInfo[]>();
  validKeys.forEach(key => {
    const labelId = key.accountId || 'unknown';
    if (!labelGroups.has(labelId)) {
      labelGroups.set(labelId, []);
    }
    labelGroups.get(labelId)!.push(key);
  });
  
  // Method 2: Raw key pattern similarity
  const rawKeyGroups = new Map<string, KeyAccountInfo[]>();
  validKeys.forEach(key => {
    const rawKeyId = key.rawKeyId || 'unknown';
    if (!rawKeyGroups.has(rawKeyId)) {
      rawKeyGroups.set(rawKeyId, []);
    }
    rawKeyGroups.get(rawKeyId)!.push(key);
  });
  
  // Method 3: Usage pattern analysis (keys from same account might have similar usage patterns)
  const usageGroups = new Map<string, KeyAccountInfo[]>();
  validKeys.forEach(key => {
    if (key.usage !== undefined) {
      // Group by usage rounded to 3 decimal places
      const usageKey = key.isFreeTier ? `free_${Math.round(key.usage * 1000) / 1000}` : `paid_${Math.round(key.usage * 1000) / 1000}`;
      if (!usageGroups.has(usageKey)) {
        usageGroups.set(usageKey, []);
      }
      usageGroups.get(usageKey)!.push(key);
    }
  });
  
  // Combine all methods - start with label groups as primary
  labelGroups.forEach((keys, groupId) => {
    accountGroups.set(`label_${groupId}`, keys);
  });
  
  // Check for potential duplicates using different methods
  console.log("\n🔍 Duplicate Account Analysis:");
  console.log("-".repeat(50));
  
  // Check raw key groups for duplicates
  rawKeyGroups.forEach((keys, rawKeyId) => {
    if (keys.length > 1) {
      potentialDuplicates.push({
        keys,
        reason: `Same raw key pattern: ${rawKeyId}`
      });
    }
  });
  
  // Check usage groups for potential duplicates
  usageGroups.forEach((keys, usageKey) => {
    if (keys.length > 1) {
      potentialDuplicates.push({
        keys,
        reason: `Same usage pattern: ${usageKey}`
      });
    }
  });
  
  if (potentialDuplicates.length > 0) {
    console.log("⚠️  Potential duplicate accounts found:");
    potentialDuplicates.forEach((dup, index) => {
      console.log(`\n${index + 1}. ${dup.reason}`);
      dup.keys.forEach(key => {
        console.log(`   - ${key.keyName} (Label ID: ${key.accountId}, Raw ID: ${key.rawKeyId})`);
      });
    });
  } else {
    console.log("✅ No obvious duplicate patterns detected");
  }

  // Display account groupings
  console.log("🏢 Account Grouping Results:");
  console.log("-".repeat(50));
  console.log(`Found ${accountGroups.size} unique account(s) among ${validKeys.length} valid key(s)\n`);

  accountGroups.forEach((keys, accountId) => {
    console.log(`📋 Account ID: ${accountId}`);
    console.log(`   Keys (${keys.length}): ${keys.map(k => k.keyName).join(", ")}`);
    console.log(`   Email: ${keys[0]?.accountEmail || 'Not specified'}`);
    console.log(`   Name: ${keys[0]?.accountName || 'Not specified'}`);
    if (keys[0]?.organizationId) {
      console.log(`   Organization: ${keys[0]?.organizationName || keys[0]?.organizationId}`);
    }
    console.log();
  });

  // Identify accounts with multiple keys
  const accountsWithMultipleKeys = Array.from(accountGroups.entries())
    .filter(([_, keys]) => keys.length > 1);

  if (accountsWithMultipleKeys.length > 0) {
    console.log("🔗 Accounts with Multiple API Keys:");
    console.log("-".repeat(50));
    accountsWithMultipleKeys.forEach(([accountId, keys]) => {
      console.log(`📋 Account ${accountId}: ${keys.length} keys`);
      console.log(`   Keys: ${keys.map(k => k.keyName).join(", ")}`);
      console.log(`   Email: ${keys[0]?.accountEmail || 'Not specified'}`);
      console.log();
    });
  } else {
    console.log("✨ All valid keys belong to different accounts");
  }

  // Analyze organization distribution
  const orgGroups = new Map<string, KeyAccountInfo[]>();
  validKeys.forEach(key => {
    const orgId = key.organizationId || 'individual';
    if (!orgGroups.has(orgId)) {
      orgGroups.set(orgId, []);
    }
    orgGroups.get(orgId)!.push(key);
  });

  console.log("🏢 Organization Analysis:");
  console.log("-".repeat(50));
  orgGroups.forEach((keys, orgId) => {
    if (orgId === 'individual') {
      console.log(`👤 Individual accounts: ${keys.length} keys`);
      keys.forEach(key => {
        console.log(`   - ${key.keyName} (${key.accountName || key.accountEmail || 'No name'})`);
      });
    } else {
      console.log(`🏢 Organization ${orgId}: ${keys.length} keys`);
      keys.forEach(key => {
        console.log(`   - ${key.keyName} (${key.accountName || key.accountEmail || 'No name'})`);
      });
    }
    console.log();
  });

  // Summary statistics
  const totalKeys = accountResults.length;
  const validKeyCount = validKeys.length;
  const uniqueAccounts = new Set(validKeys.map(k => k.accountId)).size;
  const uniqueOrganizations = new Set(validKeys.map(k => k.organizationId || 'individual')).size;

  console.log("📊 Summary Statistics:");
  console.log("-".repeat(50));
  console.log(`   Total API keys configured: ${totalKeys}`);
  console.log(`   Valid API keys: ${validKeyCount}`);
  console.log(`   Invalid API keys: ${invalidKeys.length}`);
  console.log(`   Unique accounts: ${uniqueAccounts}`);
  console.log(`   Unique organizations: ${uniqueOrganizations}`);
  console.log(`   Keys per account (average): ${(validKeyCount / uniqueAccounts).toFixed(2)}`);
  
  if (accountsWithMultipleKeys.length > 0) {
    console.log(`   ⚠️  ${accountsWithMultipleKeys.length} account(s) have multiple keys`);
  }

  console.log("\n✅ Analysis complete!");
}

// Error handling
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Run the script
main().catch((error) => {
  console.error("❌ Script failed:", error);
  process.exit(1);
});
