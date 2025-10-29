/**
 * Subscription Tier Configuration
 * Defines pricing, quotas, features, and model access for each tier
 */

export type SubscriptionTier =
  | "starter"
  | "classic"
  | "professional"
  | "pro_plus"
  | "business"
  | "enterprise";

export const modelsAgents: string[] = [
  "google/gemma-3-27b-it:free",
  "openai/gpt-oss-20b:free",
  "x-ai/grok-4-fast:free",
  "z-ai/glm-4.5-air:free",
  "qwen/qwen3-coder:free",

];

export interface TierConfig {
  id: SubscriptionTier;
  name: string;
  description: string;
  publiclyVisible: boolean; // Whether tier shows on pricing page
  price: {
    monthly: number;
    yearly: number;
  };
  quotas: {
    pdfsPerMonth: number;
    storageGB: number;
    maxFileSize: number; // in MB
    teamSeats: number;
    templatesAccess: "basic" | "premium" | "unlimited";
  };
  limits: {
    maxPromptCharacters: number;
  };
  features: {
    watermark: boolean;
    priorityProcessing: boolean;
    processingSpeed: string; // human-readable
    aiModel: "free" | "premium" | "custom";
    customBranding: boolean;
    apiAccess: boolean;
    teamCollaboration: boolean;
    versionHistory: number; // number of versions kept
    bulkGeneration: boolean;
    analytics: boolean;
    support: "community" | "email" | "priority" | "dedicated";
    storageRetention: number; // days, -1 for permanent
  };
  models: string[]; // OpenRouter model IDs
}

export const TIER_CONFIGS: Record<SubscriptionTier, TierConfig> = {
  starter: {
    id: "starter",
    name: "Free",
    description: "Perfect for testing and exploring",
    publiclyVisible: true,
    price: {
      monthly: 0,
      yearly: 0,
    },
    quotas: {
      pdfsPerMonth: 3,
      storageGB: 0.05, // 50 MB
      maxFileSize: 2, // 2 MB per PDF
      teamSeats: 1,
      templatesAccess: "basic",
    },
    limits: {
      maxPromptCharacters: 2000,
    },
    features: {
      watermark: true,
      priorityProcessing: false,
      processingSpeed: "2-5 minutes",
      aiModel: "free",
      customBranding: false,
      apiAccess: false,
      teamCollaboration: false,
      versionHistory: 0,
      bulkGeneration: false,
      analytics: false,
      support: "community",
      storageRetention: 30, // 30 days
    },
    models: modelsAgents,
  },
  classic: {
    id: "classic",
    name: "Classic",
    description: "Exclusive offer for our valued users",
    publiclyVisible: false, // Hidden tier - only accessible via email campaigns
    price: {
      monthly: 5,
      yearly: 50,
    },
    quotas: {
      pdfsPerMonth: 50,
      storageGB: 0.5, // 500 MB
      maxFileSize: 5, // 5 MB per PDF
      teamSeats: 1,
      templatesAccess: "premium",
    },
    limits: {
      maxPromptCharacters: 4000,
    },
    features: {
      watermark: false,
      priorityProcessing: true,
      processingSpeed: "<90 seconds",
      aiModel: "premium",
      customBranding: false,
      apiAccess: false,
      teamCollaboration: false,
      versionHistory: 5,
      bulkGeneration: false,
      analytics: false,
      support: "email",
      storageRetention: -1, // permanent
    },
    models: modelsAgents,
  },
  professional: {
    id: "professional",
    name: "Professional",
    description: "For freelancers and professionals who need quality",
    publiclyVisible: true,
    price: {
      monthly: 15,
      yearly: 150, // 17% discount
    },
    quotas: {
      pdfsPerMonth: 5000,
      storageGB: 2,
      maxFileSize: 10, // 10 MB per PDF
      teamSeats: 1,
      templatesAccess: "premium",
    },
    limits: {
      maxPromptCharacters: 8000,
    },
    features: {
      watermark: false,
      priorityProcessing: true,
      processingSpeed: "<60 seconds",
      aiModel: "premium",
      customBranding: false,
      apiAccess: false,
      teamCollaboration: false,
      versionHistory: 10,
      bulkGeneration: false,
      analytics: false,
      support: "email",
      storageRetention: -1, // permanent
    },
    models: modelsAgents,
  },
  pro_plus: {
    id: "pro_plus",
    name: "Pro+",
    description: "Best for power users who need maximum capacity",
    publiclyVisible: true,
    price: {
      monthly: 30,
      yearly: 300, // 17% discount
    },
    quotas: {
      pdfsPerMonth: 10000, // Double of Professional
      storageGB: 5, // 2.5x of Professional
      maxFileSize: 15, // 15 MB per PDF
      teamSeats: 1,
      templatesAccess: "unlimited",
    },
    limits: {
      maxPromptCharacters: 12000,
    },
    features: {
      watermark: false, // AI watermark removal
      priorityProcessing: true,
      processingSpeed: "<45 seconds", // Faster than Professional
      aiModel: "premium",
      customBranding: false,
      apiAccess: true, // API access included
      teamCollaboration: false,
      versionHistory: 25,
      bulkGeneration: true, // Bulk generation enabled
      analytics: true, // Analytics enabled
      support: "priority", // Priority support
      storageRetention: -1, // permanent
    },
    models: modelsAgents,
  },
  business: {
    id: "business",
    name: "Business",
    description: "For teams and small businesses",
    publiclyVisible: true,
    price: {
      monthly: 79,
      yearly: 790, // 17% discount
    },
    quotas: {
      pdfsPerMonth: 50000,
      storageGB: 50,
      maxFileSize: 25, // 25 MB per PDF
      teamSeats: 5,
      templatesAccess: "unlimited",
    },
    limits: {
      maxPromptCharacters: 16000,
    },
    features: {
      watermark: false,
      priorityProcessing: true,
      processingSpeed: "<30 seconds",
      aiModel: "premium",
      customBranding: true,
      apiAccess: true,
      teamCollaboration: true,
      versionHistory: 50,
      bulkGeneration: true,
      analytics: true,
      support: "priority",
      storageRetention: -1, // permanent
    },
    models: modelsAgents,
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    description: "Custom solutions for large organizations",
    publiclyVisible: true,
    price: {
      monthly: 500, // starting price, custom quotes
      yearly: 5000,
    },
    quotas: {
      pdfsPerMonth: -1, // unlimited
      storageGB: -1, // unlimited
      maxFileSize: 100, // 100 MB per PDF
      teamSeats: -1, // unlimited
      templatesAccess: "unlimited",
    },
    limits: {
      maxPromptCharacters: 32000,
    },
    features: {
      watermark: false,
      priorityProcessing: true,
      processingSpeed: "<15 seconds",
      aiModel: "custom",
      customBranding: true,
      apiAccess: true,
      teamCollaboration: true,
      versionHistory: -1, // unlimited
      bulkGeneration: true,
      analytics: true,
      support: "dedicated",
      storageRetention: -1, // permanent
    },
    models: modelsAgents,
  },
};

/**
 * Get tier configuration by tier ID
 */
export function getTierConfig(tier: SubscriptionTier): TierConfig {
  return TIER_CONFIGS[tier];
}

/**
 * Check if a user can perform an action based on their tier
 */
export function canPerformAction(
  tier: SubscriptionTier,
  action: keyof TierConfig["features"],
): boolean {
  const config = getTierConfig(tier);
  return Boolean(config.features[action]);
}

/**
 * Check if user has exceeded their quota
 */
export function hasExceededQuota(
  tier: SubscriptionTier,
  used: number,
  quotaType: keyof TierConfig["quotas"],
): boolean {
  const config = getTierConfig(tier);
  const limit = config.quotas[quotaType];

  // -1 means unlimited
  if (typeof limit === "number" && limit === -1) return false;
  if (typeof limit === "string") return false; // template access is not numeric

  return used >= limit;
}

/**
 * Get models for a specific tier
 */
export function getModelsForTier(tier: SubscriptionTier): string[] {
  return getTierConfig(tier).models;
}

/**
 * Calculate usage percentage
 */
export function getUsagePercentage(
  tier: SubscriptionTier,
  used: number,
  quotaType: keyof TierConfig["quotas"],
): number {
  const config = getTierConfig(tier);
  const limit = config.quotas[quotaType];

  if (typeof limit === "number" && limit === -1) return 0; // unlimited
  if (typeof limit === "string") return 0; // not numeric
  if (limit === 0) return 100;

  return Math.min(100, (used / limit) * 100);
}

/**
 * Get upgrade suggestions based on usage
 */
export function getUpgradeSuggestion(
  currentTier: SubscriptionTier,
  pdfsUsed: number,
  storageUsedGB: number,
): {
  shouldUpgrade: boolean;
  reason: string;
  suggestedTier: SubscriptionTier | null;
} {
  const config = getTierConfig(currentTier);

  // Check PDF quota
  if (
    config.quotas.pdfsPerMonth !== -1 &&
    pdfsUsed >= config.quotas.pdfsPerMonth * 0.8
  ) {
    const nextTier = getNextTier(currentTier);
    return {
      shouldUpgrade: true,
      reason: `You've used ${pdfsUsed} of ${config.quotas.pdfsPerMonth} PDFs this month`,
      suggestedTier: nextTier,
    };
  }

  // Check storage quota
  if (
    config.quotas.storageGB !== -1 &&
    storageUsedGB >= config.quotas.storageGB * 0.8
  ) {
    const nextTier = getNextTier(currentTier);
    return {
      shouldUpgrade: true,
      reason: `You've used ${storageUsedGB.toFixed(2)} GB of ${config.quotas.storageGB} GB storage`,
      suggestedTier: nextTier,
    };
  }

  return {
    shouldUpgrade: false,
    reason: "",
    suggestedTier: null,
  };
}

/**
 * Get the next tier for upgrade suggestions
 */
function getNextTier(currentTier: SubscriptionTier): SubscriptionTier | null {
  const tierOrder: SubscriptionTier[] = [
    "starter",
    "classic",
    "professional",
    "pro_plus",
    "business",
    "enterprise",
  ];
  const currentIndex = tierOrder.indexOf(currentTier);

  if (currentIndex === -1 || currentIndex === tierOrder.length - 1) {
    return null;
  }

  return tierOrder[currentIndex + 1] ?? null;
}

/**
 * Format price for display
 */
export function formatPrice(price: number): string {
  if (price === 0) return "Free";
  return `$${price}`;
}

/**
 * Get only publicly visible tiers for pricing page
 */
export function getPublicTiers(): TierConfig[] {
  return Object.values(TIER_CONFIGS).filter(tier => tier.publiclyVisible);
}

/**
 * Get all tiers including hidden ones (for admin/internal use)
 */
export function getAllTiers(): TierConfig[] {
  return Object.values(TIER_CONFIGS);
}
