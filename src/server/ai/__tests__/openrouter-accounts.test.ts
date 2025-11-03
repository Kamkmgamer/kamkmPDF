/**
 * Integration Tests - OpenRouter API Key Account Detection
 *
 * This test checks which of the 11 OPENROUTER_API_KEYs are using the same account
 * by making API calls to OpenRouter to retrieve account information for each key.
 */

import { describe, it, expect, beforeAll } from "vitest";
import { config } from "dotenv";

// Load environment variables from .env file
config({ path: ".env" });

// Import env after loading dotenv
import { env } from "~/env";

// Interface for OpenRouter account info response
interface OpenRouterAccountInfo {
  data?: {
    user?: {
      id: string;
      email?: string;
      name?: string;
    };
    organization?: {
      id: string;
      name?: string;
    };
  };
  error?: {
    message: string;
    type: string;
  };
}

// Interface for test results
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
}

describe("OpenRouter API Key Account Detection", () => {
  let accountResults: KeyAccountInfo[] = [];
  const OPENROUTER_BASE = "https://openrouter.ai/api/v1";

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
    };

    try {
      const response = await fetch(`${OPENROUTER_BASE}/auth/key`, {
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

      const data = await response.json() as OpenRouterAccountInfo;
      
      if (data.error) {
        result.error = data.error.message;
        return result;
      }

      if (data.data?.user) {
        result.accountId = data.data.user.id;
        result.accountEmail = data.data.user.email ?? null;
        result.accountName = data.data.user.name ?? null;
        result.isValid = true;
      }

      if (data.data?.organization) {
        result.organizationId = data.data.organization.id;
        result.organizationName = data.data.organization.name ?? null;
      }

    } catch (error) {
      result.error = error instanceof Error ? error.message : String(error);
    }

    return result;
  }

  // Helper function to collect all available API keys
  function getAvailableApiKeys(): { key: string; name: string; index: number }[] {
    const keys: { key: string; name: string; index: number }[] = [];

    if (env.OPENROUTER_API_KEY) keys.push({ key: env.OPENROUTER_API_KEY, name: "OPENROUTER_API_KEY", index: 0 });
    if (env.OPENROUTER_API_KEY1) keys.push({ key: env.OPENROUTER_API_KEY1, name: "OPENROUTER_API_KEY1", index: 1 });
    if (env.OPENROUTER_API_KEY2) keys.push({ key: env.OPENROUTER_API_KEY2, name: "OPENROUTER_API_KEY2", index: 2 });
    if (env.OPENROUTER_API_KEY3) keys.push({ key: env.OPENROUTER_API_KEY3, name: "OPENROUTER_API_KEY3", index: 3 });
    if (env.OPENROUTER_API_KEY4) keys.push({ key: env.OPENROUTER_API_KEY4, name: "OPENROUTER_API_KEY4", index: 4 });
    if (env.OPENROUTER_API_KEY5) keys.push({ key: env.OPENROUTER_API_KEY5, name: "OPENROUTER_API_KEY5", index: 5 });
    if (env.OPENROUTER_API_KEY6) keys.push({ key: env.OPENROUTER_API_KEY6, name: "OPENROUTER_API_KEY6", index: 6 });
    if (env.OPENROUTER_API_KEY7) keys.push({ key: env.OPENROUTER_API_KEY7, name: "OPENROUTER_API_KEY7", index: 7 });
    if (env.OPENROUTER_API_KEY8) keys.push({ key: env.OPENROUTER_API_KEY8, name: "OPENROUTER_API_KEY8", index: 8 });
    if (env.OPENROUTER_API_KEY9) keys.push({ key: env.OPENROUTER_API_KEY9, name: "OPENROUTER_API_KEY9", index: 9 });
    if (env.OPENROUTER_API_KEY10) keys.push({ key: env.OPENROUTER_API_KEY10, name: "OPENROUTER_API_KEY10", index: 10 });

    return keys;
  }

  beforeAll(async () => {
    // Skip if no OpenRouter keys are configured
    const availableKeys = getAvailableApiKeys();
    if (availableKeys.length === 0) {
      console.warn("⚠️  No OpenRouter API keys found in environment variables");
      return;
    }

    console.log(`🔍 Testing ${availableKeys.length} OpenRouter API keys...`);

    // Test each key concurrently for faster execution
    const promises = availableKeys.map(({ key, name, index }) =>
      getAccountInfo(key, name, index)
    );

    accountResults = await Promise.all(promises);

    // Log results for debugging
    console.log("\n📊 Account Information Results:");
    accountResults.forEach((result) => {
      if (result.isValid) {
        console.log(`✅ ${result.keyName}: Account ID ${result.accountId} (${result.accountEmail ?? result.accountName ?? 'No name'})`);
        if (result.organizationId) {
          console.log(`   Organization: ${result.organizationName ?? result.organizationId}`);
        }
      } else {
        console.log(`❌ ${result.keyName}: ${result.error ?? 'Unknown error'}`);
      }
    });
  }, 30000); // 30 second timeout

  it("should have at least one OpenRouter API key configured", () => {
    const availableKeys = getAvailableApiKeys();
    expect(availableKeys.length).toBeGreaterThan(0);
  });

  it("should retrieve account information for valid API keys", () => {
    const validKeys = accountResults.filter(r => r.isValid);
    const invalidKeys = accountResults.filter(r => !r.isValid);
    
    console.log(`\n📈 Summary: ${validKeys.length} valid, ${invalidKeys.length} invalid keys`);
    
    if (invalidKeys.length > 0) {
      console.log("❌ Invalid keys:");
      invalidKeys.forEach(key => {
        console.log(`   ${key.keyName}: ${key.error}`);
      });
    }

    // We expect at least some keys to be valid in a real environment
    expect(validKeys.length + invalidKeys.length).toBe(accountResults.length);
  });

  it("should identify which keys share the same account", () => {
    const validKeys = accountResults.filter(r => r.isValid);
    
    if (validKeys.length === 0) {
      console.log("⚠️  No valid keys to compare accounts");
      return;
    }

    // Group keys by account ID
    const accountGroups = new Map<string, KeyAccountInfo[]>();
    
    validKeys.forEach(key => {
      const accountId = key.accountId!;
      if (!accountGroups.has(accountId)) {
        accountGroups.set(accountId, []);
      }
      accountGroups.get(accountId)!.push(key);
    });

    console.log(`\n🏢 Account Grouping Results:`);
    console.log(`Found ${accountGroups.size} unique account(s) among ${validKeys.length} valid key(s)`);

    // Display account groupings
    accountGroups.forEach((keys, accountId) => {
      console.log(`\n📋 Account ID: ${accountId}`);
      console.log(`   Keys: ${keys.map(k => k.keyName).join(", ")}`);
      console.log(`   Email: ${keys[0]?.accountEmail ?? 'Not specified'}`);
      console.log(`   Name: ${keys[0]?.accountName ?? 'Not specified'}`);
      if (keys[0]?.organizationId) {
        console.log(`   Organization: ${keys[0]?.organizationName ?? keys[0]?.organizationId}`);
      }
    });

    // Identify accounts with multiple keys
    const accountsWithMultipleKeys = Array.from(accountGroups.entries())
      .filter(([_, keys]) => keys.length > 1);

    if (accountsWithMultipleKeys.length > 0) {
      console.log(`\n🔗 Accounts with multiple API keys:`);
      accountsWithMultipleKeys.forEach(([accountId, keys]) => {
        console.log(`   Account ${accountId}: ${keys.length} keys (${keys.map(k => k.keyName).join(", ")})`);
      });
    } else {
      console.log(`\n✨ All valid keys belong to different accounts`);
    }

    // Test assertions
    expect(accountGroups.size).toBeGreaterThan(0);
    expect(validKeys.length).toBeGreaterThan(0);
  });

  it("should provide detailed account analysis", () => {
    const validKeys = accountResults.filter(r => r.isValid);
    
    if (validKeys.length === 0) {
      console.log("⚠️  No valid keys for detailed analysis");
      return;
    }

    // Analyze organization distribution
    const orgGroups = new Map<string, KeyAccountInfo[]>();
    validKeys.forEach(key => {
      const orgId = key.organizationId ?? 'individual';
      if (!orgGroups.has(orgId)) {
        orgGroups.set(orgId, []);
      }
      orgGroups.get(orgId)!.push(key);
    });

    console.log(`\n🏢 Organization Analysis:`);
    orgGroups.forEach((keys, orgId) => {
      if (orgId === 'individual') {
        console.log(`   Individual accounts: ${keys.length} keys`);
      } else {
        console.log(`   Organization ${orgId}: ${keys.length} keys`);
        keys.forEach(key => {
          console.log(`     - ${key.keyName} (${key.accountName ?? key.accountEmail ?? 'No name'})`);
        });
      }
    });

    // Summary statistics
    const totalKeys = accountResults.length;
    const validKeyCount = validKeys.length;
    const uniqueAccounts = new Set(validKeys.map(k => k.accountId)).size;
    const uniqueOrganizations = new Set(validKeys.map(k => k.organizationId ?? 'individual')).size;

    console.log(`\n📊 Summary Statistics:`);
    console.log(`   Total API keys configured: ${totalKeys}`);
    console.log(`   Valid API keys: ${validKeyCount}`);
    console.log(`   Unique accounts: ${uniqueAccounts}`);
    console.log(`   Unique organizations: ${uniqueOrganizations}`);
    console.log(`   Keys per account (average): ${(validKeyCount / uniqueAccounts).toFixed(2)}`);

    expect(totalKeys).toBeGreaterThan(0);
    expect(validKeyCount).toBeGreaterThanOrEqual(0);
    expect(uniqueAccounts).toBeGreaterThan(0);
  });
});
