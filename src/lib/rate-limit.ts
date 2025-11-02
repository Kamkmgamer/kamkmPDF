import { type NextRequest, NextResponse } from "next/server";
import { logger } from "./logger";
import { env } from "../env";

// Try to import Upstash Redis, fall back to memory store if not available
interface RedisClient {
  pipeline(): {
    incr(key: string): {
      expire(
        key: string,
        seconds: number,
      ): { exec(): Promise<Array<[Error | null, number]>> };
    };
  };
}

let redis: RedisClient | null = null;

async function initRedis() {
  try {
    const { Redis } = await import("@upstash/redis");
    if (env.REDIS_URL && env.REDIS_TOKEN) {
      redis = new Redis({
        url: env.REDIS_URL,
        token: env.REDIS_TOKEN,
      }) as unknown as RedisClient;
    }
  } catch {
    logger.warn("Upstash Redis not available, falling back to memory store");
  }
}

// Initialize Redis
void initRedis();

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (req: NextRequest) => string; // Function to generate rate limit key
  skipSuccessfulRequests?: boolean; // Skip rate limiting for successful requests
  skipFailedRequests?: boolean; // Skip rate limiting for failed requests
  tier?: "free" | "pro" | "enterprise"; // User tier for tier-based limits
  userId?: string; // User ID for user-specific limits
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
  totalRequests: number;
}

// In-memory store for rate limiting (fallback when Redis is not available)
class MemoryStore {
  private store = new Map<string, { count: number; resetTime: number }>();

  async increment(
    key: string,
    windowMs: number,
  ): Promise<{ count: number; resetTime: number }> {
    const now = Date.now();
    const existing = this.store.get(key);

    if (!existing || now > existing.resetTime) {
      // Reset or create new entry
      const resetTime = now + windowMs;
      this.store.set(key, { count: 1, resetTime });
      return { count: 1, resetTime };
    }

    // Increment existing entry
    existing.count += 1;
    this.store.set(key, existing);
    return { count: existing.count, resetTime: existing.resetTime };
  }

  cleanup() {
    const now = Date.now();
    for (const [key, value] of this.store.entries()) {
      if (now > value.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

const memoryStore = new MemoryStore();

// Redis store for production
class RedisStore {
  async increment(
    key: string,
    windowMs: number,
  ): Promise<{ count: number; resetTime: number }> {
    if (!redis) {
      return memoryStore.increment(key, windowMs);
    }

    const now = Date.now();
    const resetTime = now + windowMs;
    const windowSeconds = Math.ceil(windowMs / 1000);

    try {
      // Use Redis pipeline for atomic operations
      const result = await redis
        .pipeline()
        .incr(key)
        .expire(key, windowSeconds)
        .exec();

      const count = result?.[0]?.[1] ?? 1;
      return { count, resetTime };
    } catch (error) {
      logger.error({
        msg: "Redis rate limit error, falling back to memory store",
        error: String(error),
      });
      return memoryStore.increment(key, windowMs);
    }
  }
}

const redisStore = new RedisStore();

// Note: Automatic cleanup via setInterval is disabled for serverless compatibility
// In serverless environments, each function invocation is stateless and memory is
// automatically cleaned up after execution. For long-running servers, consider
// implementing cleanup via a scheduled cron job or on-demand cleanup.

export function createRateLimit(options: RateLimitOptions) {
  const {
    windowMs,
    maxRequests,
    keyGenerator = (req: NextRequest) => {
      // Default key generator: IP address
      const forwarded = req.headers.get("x-forwarded-for");
      const ip = forwarded
        ? forwarded.split(",")[0]
        : req.headers.get("x-real-ip");
      return ip ?? "anonymous";
    },
  } = options;

  return async function rateLimitMiddleware(
    req: NextRequest,
    handler: () => Promise<NextResponse>,
  ): Promise<NextResponse> {
    const key = keyGenerator(req);
    const store = redis ? redisStore : memoryStore;
    const { count, resetTime } = await store.increment(key, windowMs);

    const result: RateLimitResult = {
      success: count <= maxRequests,
      remaining: Math.max(0, maxRequests - count),
      resetTime,
      totalRequests: count,
    };

    // Set rate limit headers
    const response = await handler();

    response.headers.set("X-RateLimit-Limit", maxRequests.toString());
    response.headers.set("X-RateLimit-Remaining", result.remaining.toString());
    response.headers.set(
      "X-RateLimit-Reset",
      Math.ceil(resetTime / 1000).toString(),
    );
    response.headers.set("X-RateLimit-Used", count.toString());

    if (!result.success) {
      logger.warn(
        `Rate limit exceeded for key: ${key}, count: ${count}/${maxRequests}`,
      );

      return new NextResponse(
        JSON.stringify({
          error: "Too many requests",
          message: "Rate limit exceeded. Please try again later.",
          retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": Math.ceil(
              (resetTime - Date.now()) / 1000,
            ).toString(),
            ...Object.fromEntries(response.headers.entries()),
          },
        },
      );
    }

    // Log rate limit usage for monitoring
    if (count > maxRequests * 0.8) {
      logger.info(
        `High rate limit usage for key: ${key}, ${count}/${maxRequests} (${((count / maxRequests) * 100).toFixed(1)}%)`,
      );
    }

    return response;
  };
}

// Tier-based rate limits
function getTierLimits(tier: "free" | "pro" | "enterprise") {
  switch (tier) {
    case "free":
      return {
        pdfGeneration: 10, // 10 per minute
        apiCalls: 100, // 100 per minute
        fileUploads: 20, // 20 per minute
        jobCreation: 30, // 30 per minute
      };
    case "pro":
      return {
        pdfGeneration: 50, // 50 per minute
        apiCalls: 500, // 500 per minute
        fileUploads: 100, // 100 per minute
        jobCreation: 150, // 150 per minute
      };
    case "enterprise":
      return {
        pdfGeneration: 200, // 200 per minute
        apiCalls: 2000, // 2000 per minute
        fileUploads: 500, // 500 per minute
        jobCreation: 1000, // 1000 per minute
      };
    default:
      return {
        pdfGeneration: 10,
        apiCalls: 100,
        fileUploads: 20,
        jobCreation: 30,
      };
  }
}

// Pre-configured rate limiters
export const strictRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 requests per minute
});

export const moderateRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
});

export const lenientRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 120, // 120 requests per minute
});

// API-specific rate limiters
export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 auth attempts per 15 minutes
});

export const contactRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3, // 3 contact form submissions per hour
});

export const apiRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 API calls per minute
});

// PDF generation rate limits
export const pdfGenerationRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 per minute (free tier)
});

// File upload rate limits
export const fileUploadRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 20, // 20 per minute (free tier)
});

// Job creation rate limits
export const jobCreationRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30, // 30 per minute (free tier)
});

// User-specific rate limiter (requires user ID)
export function createUserRateLimit(
  userId: string,
  options: RateLimitOptions & { tier?: "free" | "pro" | "enterprise" },
) {
  // Adjust max requests based on tier and type
  const maxRequests = options.maxRequests;

  return createRateLimit({
    ...options,
    maxRequests,
    keyGenerator: () => `user:${userId}:${options.tier ?? "free"}`,
  });
}

// Tier-based rate limiters for authenticated users
export function createTieredRateLimit(
  tier: "free" | "pro" | "enterprise",
  type: "pdfGeneration" | "apiCalls" | "fileUploads" | "jobCreation",
) {
  const limits = getTierLimits(tier);
  const maxRequests = limits[type];

  return createRateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests,
    keyGenerator: (req) => {
      // For authenticated users, use user ID; for unauthenticated, use IP
      const userId = req.headers.get("x-user-id");
      const forwarded = req.headers.get("x-forwarded-for");
      const ip = forwarded
        ? forwarded.split(",")[0]
        : req.headers.get("x-real-ip");
      return userId ? `user:${userId}:${tier}` : (ip ?? "anonymous");
    },
  });
}

// Helper function to get user tier from request (implement based on your auth system)
export async function getUserTier(
  req: NextRequest,
): Promise<"free" | "pro" | "enterprise"> {
  // This is a placeholder - implement based on your user subscription system
  // You might get this from Clerk metadata, database lookup, etc.
  const userTier = req.headers.get("x-user-tier");
  return (userTier as "free" | "pro" | "enterprise") ?? "free";
}
