/**
 * Subscription Caching Layer
 *
 * Reduces database load by caching frequently accessed subscription data.
 * Critical for scaling to 1000s of users.
 */

import { db } from "~/server/db";
import { userSubscriptions } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";

type Subscription = InferSelectModel<typeof userSubscriptions>;

// In-memory cache with TTL
interface CacheEntry {
  data: Subscription | null;
  expiresAt: number;
}

class SubscriptionCache {
  private cache = new Map<string, CacheEntry>();
  private readonly DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes
  private readonly CLEANUP_INTERVAL_MS = 60 * 1000; // 1 minute

  constructor() {
    // Periodic cleanup of expired entries
    if (typeof setInterval !== "undefined") {
      setInterval(() => this.cleanup(), this.CLEANUP_INTERVAL_MS);
    }
  }

  private cleanup() {
    const now = Date.now();
    let removed = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        this.cache.delete(key);
        removed++;
      }
    }
    if (removed > 0) {
      console.log(`[cache] Cleaned up ${removed} expired subscription entries`);
    }
  }

  async get(userId: string): Promise<Subscription | null> {
    // Check cache first
    const cached = this.cache.get(userId);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    // Cache miss - fetch from database
    try {
      const result = await db
        .select()
        .from(userSubscriptions)
        .where(eq(userSubscriptions.userId, userId))
        .limit(1);

      const subscription = result[0] ?? null;

      // Store in cache
      this.cache.set(userId, {
        data: subscription,
        expiresAt: Date.now() + this.DEFAULT_TTL_MS,
      });

      return subscription;
    } catch (error) {
      console.error(
        `[cache] Failed to fetch subscription for ${userId}:`,
        error,
      );
      // Return cached data even if expired, as fallback
      return cached?.data ?? null;
    }
  }

  /**
   * Invalidate cache entry when subscription changes
   */
  invalidate(userId: string) {
    this.cache.delete(userId);
  }

  /**
   * Clear all cache entries (use sparingly)
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Get cache statistics for monitoring
   */
  getStats() {
    const now = Date.now();
    let valid = 0;
    let expired = 0;

    for (const entry of this.cache.values()) {
      if (entry.expiresAt > now) {
        valid++;
      } else {
        expired++;
      }
    }

    return {
      size: this.cache.size,
      valid,
      expired,
    };
  }
}

// Global singleton instance
const subscriptionCache = new SubscriptionCache();

/**
 * Get user subscription with caching
 * Use this instead of direct database queries for better performance
 */
export async function getCachedSubscription(
  userId: string,
): Promise<Subscription | null> {
  return subscriptionCache.get(userId);
}

/**
 * Invalidate subscription cache after updates
 * Call this after updating subscription data
 */
export function invalidateSubscriptionCache(userId: string) {
  subscriptionCache.invalidate(userId);
}

/**
 * Get cache statistics for monitoring
 */
export function getSubscriptionCacheStats() {
  return subscriptionCache.getStats();
}

export { subscriptionCache };
