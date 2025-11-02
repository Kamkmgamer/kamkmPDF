import { TRPCError } from "@trpc/server";
import { createHashSync } from "~/lib/crypto-edge";
import { eq, and } from "drizzle-orm";
import { db } from "~/server/db";
import { apiKeys } from "~/server/db/schema";
import { audit } from "~/lib/logger";

// Permission constants for API key scoping
export const API_PERMISSIONS = {
  // PDF operations
  PDF_CREATE: "pdf:create",
  PDF_READ: "pdf:read",
  PDF_DELETE: "pdf:delete",

  // Job operations
  JOB_READ: "job:read",
  JOB_DELETE: "job:delete",

  // API key management
  APIKEY_CREATE: "apikey:create",
  APIKEY_READ: "apikey:read",
  APIKEY_UPDATE: "apikey:update",
  APIKEY_DELETE: "apikey:delete",

  // Usage and analytics
  USAGE_READ: "usage:read",

  // Subscription management
  SUBSCRIPTION_READ: "subscription:read",

  // Admin permissions
  ADMIN: "admin",

  // Wildcard for all permissions
  ALL: "*",
} as const;

// Permission groups for easier assignment
export const PERMISSION_GROUPS = {
  READ_ONLY: [
    API_PERMISSIONS.PDF_READ,
    API_PERMISSIONS.JOB_READ,
    API_PERMISSIONS.USAGE_READ,
    API_PERMISSIONS.SUBSCRIPTION_READ,
  ],

  PDF_GENERATOR: [
    API_PERMISSIONS.PDF_CREATE,
    API_PERMISSIONS.PDF_READ,
    API_PERMISSIONS.JOB_READ,
    API_PERMISSIONS.USAGE_READ,
  ],

  BUSINESS: [
    API_PERMISSIONS.PDF_CREATE,
    API_PERMISSIONS.PDF_READ,
    API_PERMISSIONS.PDF_DELETE,
    API_PERMISSIONS.JOB_READ,
    API_PERMISSIONS.JOB_DELETE,
    API_PERMISSIONS.APIKEY_CREATE,
    API_PERMISSIONS.APIKEY_READ,
    API_PERMISSIONS.APIKEY_UPDATE,
    API_PERMISSIONS.APIKEY_DELETE,
    API_PERMISSIONS.USAGE_READ,
    API_PERMISSIONS.SUBSCRIPTION_READ,
  ],

  ENTERPRISE: [API_PERMISSIONS.ALL],
} as const;

type Permission = (typeof API_PERMISSIONS)[keyof typeof API_PERMISSIONS];

/**
 * Verify API key and return user ID with enhanced security
 */
export async function verifyApiKey(key: string): Promise<{
  userId: string;
  permissions: string[];
  keyId: string;
  keyName: string;
}> {
  if (!key?.startsWith("sk_live_")) {
    // Log failed API key attempt
    audit.securityEvent("invalid_api_key_format", {
      keyPrefix: key?.substring(0, 12) + "...",
    });

    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid API key format",
    });
  }

  // Hash the provided key
  const keyHash = createHashSync("sha256", key);

  // Look up the key in the database
  const apiKey = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.keyHash, keyHash), eq(apiKeys.isActive, true)))
    .limit(1);

  if (!apiKey[0]) {
    // Log failed API key attempt
    audit.securityEvent("invalid_api_key", {
      keyHash: keyHash.substring(0, 16) + "...",
    });

    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid or inactive API key",
    });
  }

  // Check if key is expired
  if (apiKey[0].expiresAt && new Date() > apiKey[0].expiresAt) {
    audit.securityEvent("expired_api_key_used", {
      keyId: apiKey[0].id,
      userId: apiKey[0].userId,
    });

    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "API key has expired",
    });
  }

  // Update last used timestamp
  await db
    .update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, apiKey[0].id));

  // Log successful API key usage
  audit.userAction(apiKey[0].userId, "api_key_used", {
    keyId: apiKey[0].id,
    keyName: apiKey[0].name,
    permissions: apiKey[0].permissions,
  });

  return {
    userId: apiKey[0].userId,
    permissions: apiKey[0].permissions ?? [],
    keyId: apiKey[0].id,
    keyName: apiKey[0].name,
  };
}

/**
 * Check if API key has specific permission
 */
export function hasPermission(
  permissions: string[],
  required: string,
): boolean {
  return (
    permissions.includes(required) || permissions.includes(API_PERMISSIONS.ALL)
  );
}

/**
 * Check if API key has any of the specified permissions
 */
export function hasAnyPermission(
  permissions: string[],
  requiredPermissions: string[],
): boolean {
  if (permissions.includes(API_PERMISSIONS.ALL)) {
    return true;
  }
  return requiredPermissions.some((permission) =>
    permissions.includes(permission),
  );
}

/**
 * Check if API key has all of the specified permissions
 */
export function hasAllPermissions(
  permissions: string[],
  requiredPermissions: string[],
): boolean {
  if (permissions.includes(API_PERMISSIONS.ALL)) {
    return true;
  }
  return requiredPermissions.every((permission) =>
    permissions.includes(permission),
  );
}

/**
 * Get permission level for analytics
 */
export function getPermissionLevel(
  permissions: string[],
): "read" | "write" | "admin" {
  if (
    permissions.includes(API_PERMISSIONS.ALL) ||
    permissions.includes(API_PERMISSIONS.ADMIN)
  ) {
    return "admin";
  }

  const writePermissions: string[] = [
    API_PERMISSIONS.PDF_CREATE,
    API_PERMISSIONS.PDF_DELETE,
    API_PERMISSIONS.JOB_DELETE,
    API_PERMISSIONS.APIKEY_CREATE,
    API_PERMISSIONS.APIKEY_UPDATE,
    API_PERMISSIONS.APIKEY_DELETE,
    API_PERMISSIONS.PDF_READ, // Include read permissions for write level
    API_PERMISSIONS.JOB_READ,
    API_PERMISSIONS.USAGE_READ,
    API_PERMISSIONS.SUBSCRIPTION_READ,
  ];

  if (permissions.some((p) => writePermissions.includes(p))) {
    return "write";
  }

  return "read";
}

/**
 * Validate permission string format
 */
export function isValidPermission(permission: string): boolean {
  return Object.values(API_PERMISSIONS).includes(permission as Permission);
}

/**
 * Get all available permissions for UI display
 */
export function getAllPermissions(): Array<{
  value: string;
  label: string;
  description: string;
  category: string;
}> {
  return [
    {
      value: API_PERMISSIONS.PDF_CREATE,
      label: "Create PDFs",
      description: "Generate new PDF documents",
      category: "PDF Operations",
    },
    {
      value: API_PERMISSIONS.PDF_READ,
      label: "Read PDFs",
      description: "View and download PDF documents",
      category: "PDF Operations",
    },
    {
      value: API_PERMISSIONS.PDF_DELETE,
      label: "Delete PDFs",
      description: "Delete PDF documents",
      category: "PDF Operations",
    },
    {
      value: API_PERMISSIONS.JOB_READ,
      label: "Read Jobs",
      description: "View job status and history",
      category: "Job Operations",
    },
    {
      value: API_PERMISSIONS.JOB_DELETE,
      label: "Delete Jobs",
      description: "Delete job records",
      category: "Job Operations",
    },
    {
      value: API_PERMISSIONS.APIKEY_CREATE,
      label: "Create API Keys",
      description: "Generate new API keys",
      category: "API Key Management",
    },
    {
      value: API_PERMISSIONS.APIKEY_READ,
      label: "Read API Keys",
      description: "View existing API keys",
      category: "API Key Management",
    },
    {
      value: API_PERMISSIONS.APIKEY_UPDATE,
      label: "Update API Keys",
      description: "Modify existing API keys",
      category: "API Key Management",
    },
    {
      value: API_PERMISSIONS.APIKEY_DELETE,
      label: "Delete API Keys",
      description: "Delete API keys",
      category: "API Key Management",
    },
    {
      value: API_PERMISSIONS.USAGE_READ,
      label: "Read Usage",
      description: "View usage statistics and analytics",
      category: "Analytics",
    },
    {
      value: API_PERMISSIONS.SUBSCRIPTION_READ,
      label: "Read Subscription",
      description: "View subscription details",
      category: "Account",
    },
    {
      value: API_PERMISSIONS.ADMIN,
      label: "Administrator",
      description: "Full administrative access",
      category: "System",
    },
    {
      value: API_PERMISSIONS.ALL,
      label: "All Permissions",
      description: "Access to all features (Enterprise only)",
      category: "System",
    },
  ];
}
