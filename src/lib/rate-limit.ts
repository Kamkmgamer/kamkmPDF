import { type NextRequest, NextResponse } from "next/server";
import { logger } from "./logger";

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (req: NextRequest) => string; // Function to generate rate limit key
  skipSuccessfulRequests?: boolean; // Skip rate limiting for successful requests
  skipFailedRequests?: boolean; // Skip rate limiting for failed requests
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
  totalRequests: number;
}

// In-memory store for rate limiting (use Redis in production)
class MemoryStore {
  private store = new Map<string, { count: number; resetTime: number }>();

  increment(
    key: string,
    windowMs: number,
  ): { count: number; resetTime: number } {
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

const store = new MemoryStore();

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
    const { count, resetTime } = store.increment(key, windowMs);

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

// User-specific rate limiter (requires user ID)
export function createUserRateLimit(userId: string, options: RateLimitOptions) {
  return createRateLimit({
    ...options,
    keyGenerator: () => `user:${userId}`,
  });
}
