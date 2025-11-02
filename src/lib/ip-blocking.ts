import { audit } from "~/lib/logger";
import { env } from "~/env";

// Redis connection for IP blocking
interface RedisClient {
  get(key: string): Promise<string | null>;
  setex(key: string, seconds: number, value: string): Promise<string>;
  del(...keys: string[]): Promise<number>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
}

let redis: RedisClient | null = null;

// Initialize Redis asynchronously
const initRedis = async () => {
  try {
    // Dynamic import with string literal to avoid TypeScript resolution
    const redisModule = await import("@upstash/redis");
    const Redis = redisModule.Redis;
    redis = new Redis({
      url: env.REDIS_URL ?? "redis://localhost:6379",
      token: env.REDIS_TOKEN,
    }) as unknown as RedisClient;
  } catch (error) {
    // Redis not available, will use memory fallback
    audit.securityEvent("ip_blocking_redis_unavailable", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// Initialize Redis on module load
void initRedis();

// In-memory fallback for development
const blockedIPsMemory = new Set<string>();
const ipViolationCounts = new Map<
  string,
  { count: number; lastViolation: number; types: string[] }
>();

// Configuration
const VIOLATION_THRESHOLD = 10; // Number of violations before blocking
const VIOLATION_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds
const BLOCK_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const MAX_VIOLATIONS_PER_IP = 50; // Maximum violations before permanent block

/**
 * Get client IP address from request
 */
export function getClientIP(req: Request): string {
  // Check various headers for the real IP
  const forwardedFor = req.headers.get("x-forwarded-for");
  const realIP = req.headers.get("x-real-ip");
  const cfConnectingIP = req.headers.get("cf-connecting-ip"); // Cloudflare
  const xClientIP = req.headers.get("x-client-ip");

  if (forwardedFor) {
    // X-Forwarded-For can contain multiple IPs, take the first one
    const ips = forwardedFor.split(",");
    if (ips[0]) {
      return ips[0].trim();
    }
  }

  if (realIP) {
    return realIP.trim();
  }

  if (cfConnectingIP) {
    return cfConnectingIP.trim();
  }

  if (xClientIP) {
    return xClientIP.trim();
  }

  // Fallback to a default or throw error
  throw new Error("Unable to determine client IP address");
}

/**
 * Check if an IP is currently blocked
 */
export async function isIPBlocked(ip: string): Promise<boolean> {
  try {
    if (!redis) {
      return blockedIPsMemory.has(ip);
    }

    const blocked = await redis.get(`blocked_ip:${ip}`);
    if (blocked) {
      return true;
    }

    // Check memory fallback
    return blockedIPsMemory.has(ip);
  } catch {
    // Fallback to memory store
    return blockedIPsMemory.has(ip);
  }
}

/**
 * Block an IP address for a specified duration
 */
export async function blockIP(
  ip: string,
  duration = BLOCK_DURATION,
  reason = "security_violation",
): Promise<void> {
  const blockKey = `blocked_ip:${ip}`;
  const blockData = {
    blockedAt: new Date().toISOString(),
    reason,
    duration,
    expiresAt: new Date(Date.now() + duration).toISOString(),
  };

  if (!redis) {
    // Fallback to memory store
    blockedIPsMemory.add(ip);

    // Schedule removal from memory
    setTimeout(() => {
      blockedIPsMemory.delete(ip);
    }, duration);

    audit.securityEvent("ip_blocked_fallback", {
      ip,
      reason,
      duration,
    });
    return;
  }

  try {
    await redis.setex(
      blockKey,
      Math.ceil(duration / 1000),
      JSON.stringify(blockData),
    );

    // Log IP blocking
    audit.securityEvent("ip_blocked", {
      ip,
      reason,
      duration,
      blockData,
    });
  } catch (error) {
    // Fallback to memory store
    blockedIPsMemory.add(ip);

    // Schedule removal from memory (in a real implementation, you'd want a proper cleanup system)
    setTimeout(() => {
      blockedIPsMemory.delete(ip);
    }, duration);

    audit.securityEvent("ip_blocked_fallback", {
      ip,
      reason,
      duration,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Record a security violation for an IP
 */
export async function recordViolation(
  ip: string,
  violationType: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  if (!redis) {
    // Fallback to memory store
    const current = ipViolationCounts.get(ip) ?? {
      count: 0,
      lastViolation: Date.now(),
      types: [],
    };

    if (Date.now() - current.lastViolation > VIOLATION_WINDOW) {
      current.count = 0;
    }

    current.count++;
    current.lastViolation = Date.now();
    ipViolationCounts.set(ip, current);

    audit.securityEvent("ip_violation_fallback", {
      ip,
      violationType,
      violationCount: current.count,
      metadata,
    });

    if (current.count >= VIOLATION_THRESHOLD) {
      await blockIP(
        ip,
        BLOCK_DURATION,
        `too_many_violations: ${current.count}`,
      );
    }
    return;
  }

  try {
    const violationKey = `violations:${ip}`;
    const now = Date.now();

    // Get current violations
    const currentData = await redis.get(violationKey);
    let violations: { count: number; lastViolation: number; types: string[] } =
      currentData
        ? (JSON.parse(currentData) as {
            count: number;
            lastViolation: number;
            types: string[];
          })
        : { count: 0, lastViolation: now, types: [] };

    // Clean old violations outside the window
    if (now - violations.lastViolation > VIOLATION_WINDOW) {
      violations = { count: 0, lastViolation: now, types: [] };
    }

    // Add new violation
    violations.count++;
    violations.lastViolation = now;
    if (!violations.types.includes(violationType)) {
      violations.types.push(violationType);
    }

    // Store updated violations
    await redis.setex(
      violationKey,
      Math.ceil(VIOLATION_WINDOW / 1000),
      JSON.stringify(violations),
    );

    // Log violation
    audit.securityEvent("ip_violation_recorded", {
      ip,
      violationType,
      violationCount: violations.count,
      metadata,
    });

    // Check if IP should be blocked
    if (violations.count >= VIOLATION_THRESHOLD) {
      await blockIP(
        ip,
        BLOCK_DURATION,
        `too_many_violations: ${violations.count}`,
      );
    }

    // Check for permanent block
    if (violations.count >= MAX_VIOLATIONS_PER_IP) {
      await blockIP(
        ip,
        365 * 24 * 60 * 60 * 1000,
        "permanent_block_max_violations",
      ); // 1 year
    }
  } catch (error) {
    // Fallback to memory store
    const current = ipViolationCounts.get(ip) ?? {
      count: 0,
      lastViolation: Date.now(),
      types: [],
    };

    if (Date.now() - current.lastViolation > VIOLATION_WINDOW) {
      current.count = 0;
    }

    current.count++;
    current.lastViolation = Date.now();
    ipViolationCounts.set(ip, current);

    audit.securityEvent("ip_violation_fallback", {
      ip,
      violationType,
      violationCount: current.count,
      metadata,
      error: error instanceof Error ? error.message : String(error),
    });

    if (current.count >= VIOLATION_THRESHOLD) {
      await blockIP(
        ip,
        BLOCK_DURATION,
        `too_many_violations: ${current.count}`,
      );
    }
  }
}

/**
 * Get violation history for an IP
 */
export async function getViolationHistory(ip: string): Promise<{
  count: number;
  lastViolation: number;
  types: string[];
  isBlocked: boolean;
}> {
  try {
    if (!redis) {
      const violations = ipViolationCounts.get(ip) ?? {
        count: 0,
        lastViolation: 0,
        types: [],
      };
      const isBlocked = blockedIPsMemory.has(ip);

      return {
        ...violations,
        isBlocked,
      };
    }

    const violationKey = `violations:${ip}`;
    const blockKey = `blocked_ip:${ip}`;

    const [violationData, blockedData] = await Promise.all([
      redis.get(violationKey),
      redis.get(blockKey),
    ]);

    const violations = violationData
      ? (JSON.parse(violationData) as {
          count: number;
          lastViolation: number;
          types: string[];
        })
      : { count: 0, lastViolation: 0, types: [] };
    const isBlocked = !!blockedData;

    return {
      ...violations,
      isBlocked,
    };
  } catch {
    // Fallback to memory store
    const violations = ipViolationCounts.get(ip) ?? {
      count: 0,
      lastViolation: 0,
      types: [],
    };
    const isBlocked = blockedIPsMemory.has(ip);

    return {
      ...violations,
      isBlocked,
    };
  }
}

/**
 * Clear violations for an IP (admin function)
 */
export async function clearViolations(ip: string): Promise<void> {
  try {
    if (!redis) {
      // Clear from memory fallback
      ipViolationCounts.delete(ip);
      blockedIPsMemory.delete(ip);

      audit.securityEvent("ip_violations_cleared_fallback", { ip });
      return;
    }

    const violationKey = `violations:${ip}`;
    const blockKey = `blocked_ip:${ip}`;

    await Promise.all([redis.del(violationKey, blockKey)]);

    // Clear from memory fallback
    ipViolationCounts.delete(ip);
    blockedIPsMemory.delete(ip);

    audit.securityEvent("ip_violations_cleared", { ip });
  } catch (error) {
    // Clear from memory fallback
    ipViolationCounts.delete(ip);
    blockedIPsMemory.delete(ip);

    audit.securityEvent("ip_violations_cleared_fallback", {
      ip,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Middleware to check IP blocking status
 */
export async function checkIPBlocking(req: Request): Promise<{
  isBlocked: boolean;
  ip: string;
  blockReason?: string;
}> {
  try {
    const ip = getClientIP(req);
    const isBlocked = await isIPBlocked(ip);

    if (isBlocked) {
      // Get block reason
      try {
        if (!redis) {
          return {
            isBlocked: true,
            ip,
            blockReason: "security_violation",
          };
        }

        const blockKey = `blocked_ip:${ip}`;
        const blockData = await redis.get(blockKey);
        const blockInfo = blockData
          ? (JSON.parse(blockData) as { reason?: string })
          : null;

        audit.securityEvent("blocked_ip_attempt", {
          ip,
          blockInfo,
        });

        return {
          isBlocked: true,
          ip,
          blockReason: blockInfo?.reason ?? "security_violation",
        };
      } catch {
        return {
          isBlocked: true,
          ip,
          blockReason: "security_violation",
        };
      }
    }

    return { isBlocked: false, ip };
  } catch (error) {
    // If we can't get the IP, we should probably allow the request
    // but log it for investigation
    audit.securityEvent("ip_detection_failed", {
      error: error instanceof Error ? error.message : String(error),
      headers: Object.fromEntries(req.headers.entries()),
    });

    return { isBlocked: false, ip: "unknown" };
  }
}

/**
 * Types of violations that can trigger IP blocking
 */
export const VIOLATION_TYPES = {
  RATE_LIMIT_EXCEEDED: "rate_limit_exceeded",
  INVALID_API_KEY: "invalid_api_key",
  FORBIDDEN_ACCESS: "forbidden_access",
  SUSPICIOUS_REQUEST: "suspicious_request",
  BRUTE_FORCE_ATTEMPT: "brute_force_attempt",
  MALICIOUS_PAYLOAD: "malicious_payload",
  ABUSE_DETECTED: "abuse_detected",
} as const;

/**
 * Helper function to record common violations
 */
export async function recordCommonViolation(
  req: Request,
  violationType: keyof typeof VIOLATION_TYPES,
  metadata?: Record<string, unknown>,
): Promise<void> {
  try {
    const ip = getClientIP(req);
    await recordViolation(ip, VIOLATION_TYPES[violationType], metadata);
  } catch (error) {
    // If we can't get the IP, log it but don't crash
    audit.securityEvent("violation_recording_failed", {
      violationType,
      error: error instanceof Error ? error.message : String(error),
      metadata,
    });
  }
}
