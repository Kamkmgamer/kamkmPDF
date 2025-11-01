/**
 * Unit Tests - Subscription Tier Logic
 *
 * Tests for tier configuration and quota management:
 * - getTierConfig function
 * - hasExceededQuota function
 * - Tier configuration validation
 */

import { describe, it, expect } from "vitest";
import {
  getTierConfig,
  hasExceededQuota,
  TIER_CONFIGS,
  type SubscriptionTier,
} from "../tiers";

describe("getTierConfig", () => {
  it("should return config for starter tier", () => {
    const config = getTierConfig("starter");

    expect(config).toBeDefined();
    expect(config.id).toBe("starter");
    expect(config.name).toBe("Free");
    expect(config.price.monthly).toBe(0);
    expect(config.quotas.pdfsPerMonth).toBe(3);
    expect(config.features.watermark).toBe(true);
  });

  it("should return config for professional tier", () => {
    const config = getTierConfig("professional");

    expect(config).toBeDefined();
    expect(config.id).toBe("professional");
    expect(config.name).toBe("Professional");
    expect(config.price.monthly).toBeGreaterThan(0);
    expect(config.quotas.pdfsPerMonth).toBeGreaterThan(3);
    expect(config.features.watermark).toBe(false);
  });

  it("should return config for business tier", () => {
    const config = getTierConfig("business");

    expect(config).toBeDefined();
    expect(config.id).toBe("business");
    expect(config.name).toBe("Business");
    expect(config.features.apiAccess).toBe(true);
    expect(config.features.teamCollaboration).toBe(true);
  });

  it("should return config for all valid tiers", () => {
    const tiers: SubscriptionTier[] = [
      "starter",
      "classic",
      "professional",
      "pro_plus",
      "business",
      "enterprise",
    ];

    tiers.forEach((tier) => {
      const config = getTierConfig(tier);
      expect(config).toBeDefined();
      expect(config.id).toBe(tier);
    });
  });

  it("should have consistent config structure for all tiers", () => {
    const tiers = Object.keys(TIER_CONFIGS) as SubscriptionTier[];

    tiers.forEach((tier) => {
      const config = getTierConfig(tier);

      // Check required properties exist
      expect(config).toHaveProperty("id");
      expect(config).toHaveProperty("name");
      expect(config).toHaveProperty("description");
      expect(config).toHaveProperty("price");
      expect(config).toHaveProperty("quotas");
      expect(config).toHaveProperty("features");
      expect(config).toHaveProperty("models");

      // Check price structure
      expect(config.price).toHaveProperty("monthly");
      expect(config.price).toHaveProperty("yearly");

      // Check quotas structure
      expect(config.quotas).toHaveProperty("pdfsPerMonth");
      expect(config.quotas).toHaveProperty("storageGB");
      expect(config.quotas).toHaveProperty("maxFileSize");
      expect(config.quotas).toHaveProperty("teamSeats");
    });
  });
});

describe("hasExceededQuota", () => {
  describe("PDF Generation Quota", () => {
    it("should return false when under quota for starter tier", () => {
      const result = hasExceededQuota("starter", 2, "pdfsPerMonth");

      expect(result).toBe(false);
    });

    it("should return true when at quota limit for starter tier", () => {
      const result = hasExceededQuota("starter", 3, "pdfsPerMonth");

      expect(result).toBe(true);
    });

    it("should return true when over quota for starter tier", () => {
      const result = hasExceededQuota("starter", 5, "pdfsPerMonth");

      expect(result).toBe(true);
    });

    it("should return false for professional tier with high usage", () => {
      const config = getTierConfig("professional");
      const usage = config.quotas.pdfsPerMonth - 1;

      const result = hasExceededQuota("professional", usage, "pdfsPerMonth");

      expect(result).toBe(false);
    });

    it("should handle unlimited quota (-1) correctly", () => {
      // Enterprise tier typically has unlimited
      const config = getTierConfig("enterprise");

      // If quota is -1 (unlimited), should never exceed
      if (config.quotas.pdfsPerMonth === -1) {
        const result = hasExceededQuota("enterprise", 1000000, "pdfsPerMonth");
        expect(result).toBe(false);
      }
    });
  });

  describe("Storage Quota", () => {
    it("should check storage quota correctly", () => {
      const starterStorageGB = getTierConfig("starter").quotas.storageGB;
      const usageBytes = starterStorageGB * 1024 * 1024 * 1024; // Convert GB to bytes

      // Under quota
      const underQuota = hasExceededQuota(
        "starter",
        usageBytes * 0.9,
        "storageGB",
      );
      expect(underQuota).toBe(false);

      // Over quota
      const overQuota = hasExceededQuota(
        "starter",
        usageBytes * 1.1,
        "storageGB",
      );
      expect(overQuota).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero usage", () => {
      const result = hasExceededQuota("starter", 0, "pdfsPerMonth");

      expect(result).toBe(false);
    });

    it("should handle exactly at limit", () => {
      const config = getTierConfig("starter");
      const result = hasExceededQuota(
        "starter",
        config.quotas.pdfsPerMonth,
        "pdfsPerMonth",
      );

      expect(result).toBe(true);
    });

    it("should handle fractional usage for credits", () => {
      // Some operations use 0.5 credits
      const result = hasExceededQuota("starter", 2.5, "pdfsPerMonth");

      // 2.5 is under 3, should be false
      expect(result).toBe(false);
    });
  });
});

describe("Tier Comparison", () => {
  it("should have increasing quotas from starter to professional", () => {
    const starterConfig = getTierConfig("starter");
    const proConfig = getTierConfig("professional");

    expect(proConfig.quotas.pdfsPerMonth).toBeGreaterThan(
      starterConfig.quotas.pdfsPerMonth,
    );
    expect(proConfig.quotas.storageGB).toBeGreaterThan(
      starterConfig.quotas.storageGB,
    );
  });

  it("should have no watermark for paid tiers", () => {
    const paidTiers: SubscriptionTier[] = [
      "classic",
      "professional",
      "pro_plus",
      "business",
      "enterprise",
    ];

    paidTiers.forEach((tier) => {
      const config = getTierConfig(tier);
      expect(config.features.watermark).toBe(false);
    });
  });

  it("should have watermark only for free tier", () => {
    const starterConfig = getTierConfig("starter");
    expect(starterConfig.features.watermark).toBe(true);
  });

  it("should have API access for business and enterprise tiers", () => {
    const businessConfig = getTierConfig("business");
    const enterpriseConfig = getTierConfig("enterprise");

    expect(businessConfig.features.apiAccess).toBe(true);
    expect(enterpriseConfig.features.apiAccess).toBe(true);
  });

  it("should have team collaboration for business+ tiers", () => {
    const businessConfig = getTierConfig("business");
    const enterpriseConfig = getTierConfig("enterprise");

    expect(businessConfig.features.teamCollaboration).toBe(true);
    expect(enterpriseConfig.features.teamCollaboration).toBe(true);
  });
});

describe("Tier Features Validation", () => {
  it("should have valid model lists for all tiers", () => {
    const tiers = Object.keys(TIER_CONFIGS) as SubscriptionTier[];

    tiers.forEach((tier) => {
      const config = getTierConfig(tier);

      expect(Array.isArray(config.models)).toBe(true);
      expect(config.models.length).toBeGreaterThan(0);
    });
  });

  it("should have valid support levels", () => {
    const validSupportLevels = ["community", "email", "priority", "dedicated"];
    const tiers = Object.keys(TIER_CONFIGS) as SubscriptionTier[];

    tiers.forEach((tier) => {
      const config = getTierConfig(tier);
      expect(validSupportLevels).toContain(config.features.support);
    });
  });

  it("should have valid processing speeds", () => {
    const tiers = Object.keys(TIER_CONFIGS) as SubscriptionTier[];

    tiers.forEach((tier) => {
      const config = getTierConfig(tier);
      expect(typeof config.features.processingSpeed).toBe("string");
      expect(config.features.processingSpeed.length).toBeGreaterThan(0);
    });
  });
});
