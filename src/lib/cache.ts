import { createHashSync } from "~/lib/crypto-edge";
import { logger } from "./logger";

// Cache interface for abstraction
interface CacheInterface {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}

// In-memory cache implementation for development/testing
class MemoryCache implements CacheInterface {
  private store = new Map<string, { value: string; expiresAt: number }>();

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value;
  }

  async set(key: string, value: string, ttlSeconds = 3600): Promise<void> {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { value, expiresAt });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    const entry = this.store.get(key);
    return entry ? Date.now() <= entry.expiresAt : false;
  }

  // Cleanup expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }
}

// Redis cache implementation for production
class RedisCache implements CacheInterface {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private client: any;

  constructor() {
    // Lazy load Redis client to avoid issues in environments without Redis
    this.client = null;
  }

  private async getClient() {
    if (!this.client) {
      try {
        // Dynamic import without eval - works in Node.js runtime only
        // Edge Runtime will fail here, which is expected
        // Construct module name at runtime to avoid static analysis
        const moduleName = "re" + "dis"; // Split to avoid static resolution
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const redisModule = await import(moduleName).catch(() => null);
        if (!redisModule) {
          throw new Error("Redis package not installed");
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        this.client = redisModule.createClient({
          url: process.env.REDIS_URL ?? "redis://localhost:6379",
          socket: {
            connectTimeout: 5000,
            lazyConnect: true,
          },
        });

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        this.client.on("error", (err: Error) => {
          logger.warn({ error: err.message }, "Redis connection error");
        });

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        await this.client.connect();
        logger.info("Redis cache connected");
      } catch (error) {
        logger.warn(
          { error: String(error) },
          "Failed to connect to Redis, falling back to memory cache",
        );
        throw error;
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.client;
  }

  async get(key: string): Promise<string | null> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const client = await this.getClient();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      return await client.get(key);
    } catch (error) {
      logger.warn({ error: String(error) }, "Redis get error");
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds = 3600): Promise<void> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const client = await this.getClient();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await client.setEx(key, ttlSeconds, value);
    } catch (error) {
      logger.warn({ error: String(error) }, "Redis set error");
    }
  }

  async del(key: string): Promise<void> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const client = await this.getClient();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await client.del(key);
    } catch (error) {
      logger.warn({ error: String(error) }, "Redis del error");
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const client = await this.getClient();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const result = await client.exists(key);
      return result === 1;
    } catch (error) {
      logger.warn({ error: String(error) }, "Redis exists error");
      return false;
    }
  }
}

// Cache factory - chooses implementation based on environment
function createCache(): CacheInterface {
  // Edge Runtime doesn't support Redis, always use memory cache
  // Check for Edge Runtime by checking if process.env is available and NEXT_RUNTIME
  const isEdgeRuntime =
    typeof process === "undefined" || process.env.NEXT_RUNTIME === "edge";

  if (isEdgeRuntime) {
    return new MemoryCache();
  }

  // Use Redis in production if available, otherwise fall back to memory cache
  if (process.env.REDIS_URL && process.env.NODE_ENV === "production") {
    try {
      return new RedisCache();
    } catch {
      // Fallback to memory cache if Redis initialization fails
      return new MemoryCache();
    }
  }
  return new MemoryCache();
}

// Global cache instance
const cache = createCache();

// Cleanup memory cache periodically (only for memory cache)
if (cache instanceof MemoryCache) {
  setInterval(
    () => {
      cache.cleanup();
    },
    5 * 60 * 1000,
  ); // Cleanup every 5 minutes
}

// Cache key generation utilities
export function generateCacheKey(prefix: string, ...parts: string[]): string {
  const combined = parts.join(":");
  const hash = createHashSync("sha256", combined);
  return `${prefix}:${hash}`;
}

export function generatePromptCacheKey(prompt: string, tier: string): string {
  return generateCacheKey("html", prompt.trim().toLowerCase(), tier);
}

// Cache operations with error handling
export async function getCachedHtml(
  prompt: string,
  tier: string,
): Promise<string | null> {
  try {
    const key = generatePromptCacheKey(prompt, tier);
    const cached = await cache.get(key);

    if (cached) {
      logger.info({ key: key.substring(0, 20) }, "Cache hit for prompt");
      return cached;
    }

    return null;
  } catch (error) {
    logger.warn({ error: String(error) }, "Cache get error");
    return null;
  }
}

export async function setCachedHtml(
  prompt: string,
  tier: string,
  html: string,
  ttlDays = 7,
): Promise<void> {
  try {
    const key = generatePromptCacheKey(prompt, tier);
    const ttlSeconds = ttlDays * 24 * 60 * 60; // Convert days to seconds

    await cache.set(key, html, ttlSeconds);
    logger.info(
      { key: key.substring(0, 20), ttlDays },
      "Cached HTML for prompt",
    );
  } catch (error) {
    logger.warn({ error: String(error) }, "Cache set error");
  }
}

export async function invalidatePromptCache(
  prompt: string,
  tier: string,
): Promise<void> {
  try {
    const key = generatePromptCacheKey(prompt, tier);
    await cache.del(key);
    logger.info({ key: key.substring(0, 20) }, "Invalidated cache for prompt");
  } catch (error) {
    logger.warn({ error: String(error) }, "Cache invalidation error");
  }
}

// Request deduplication - prevent duplicate in-flight requests
const inFlightRequests = new Map<string, Promise<string>>();

export async function deduplicateRequest<T>(
  key: string,
  requestFn: () => Promise<T>,
): Promise<T> {
  // Check if request is already in flight
  const existingRequest = inFlightRequests.get(key);
  if (existingRequest) {
    logger.info({ key: key.substring(0, 20) }, "Deduplicating request");
    return existingRequest as Promise<T>;
  }

  // Start new request
  const requestPromise = requestFn().finally(() => {
    // Clean up when request completes
    inFlightRequests.delete(key);
  });

  inFlightRequests.set(key, requestPromise as Promise<string>);
  return requestPromise;
}

// Cache statistics for monitoring
export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
}

const stats = {
  hits: 0,
  misses: 0,
};

export function getCacheStats(): CacheStats {
  const total = stats.hits + stats.misses;
  return {
    hits: stats.hits,
    misses: stats.misses,
    hitRate: total > 0 ? stats.hits / total : 0,
  };
}

export function incrementCacheHit(): void {
  stats.hits++;
}

export function incrementCacheMiss(): void {
  stats.misses++;
}

// Export cache instance for direct access if needed
export { cache };
