import { audit } from "~/lib/logger";
import { env } from "~/env";
import { getClientIP, blockIP, recordViolation } from "~/lib/ip-blocking";

// Redis connection for DDoS protection
interface RedisClient {
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
  keys(pattern: string): Promise<string[]>;
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
    audit.securityEvent("ddos_redis_unavailable", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// Initialize Redis on module load
void initRedis();

// In-memory fallback for development
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const suspiciousPatterns = new Map<
  string,
  { count: number; lastSeen: number }
>();

// DDoS Protection Configuration
const DDOS_CONFIG = {
  // Request rate limits
  GLOBAL_RPS_LIMIT: 1000, // Requests per second across all IPs
  IP_RPS_LIMIT: 10, // Requests per second per IP
  IP_BURST_LIMIT: 50, // Max requests in a 10-second burst per IP

  // Time windows (in milliseconds)
  SECOND_WINDOW: 1000,
  MINUTE_WINDOW: 60 * 1000,
  HOUR_WINDOW: 60 * 60 * 1000,

  // Blocking thresholds
  VIOLATION_THRESHOLD: 5, // Violations before temporary block
  SUSPICIOUS_THRESHOLD: 3, // Suspicious patterns before CAPTCHA requirement

  // Block durations
  TEMPORARY_BLOCK: 5 * 60 * 1000, // 5 minutes
  EXTENDED_BLOCK: 30 * 60 * 1000, // 30 minutes
  PERMANENT_BLOCK: 24 * 60 * 60 * 1000, // 24 hours
};

/**
 * Check global request rate (across all IPs)
 */
async function checkGlobalRateLimit(): Promise<boolean> {
  try {
    if (!redis) return true;

    const currentSecond = Math.floor(Date.now() / 1000);
    const globalKey = `global_requests:${currentSecond}`;

    const current = await redis.incr(globalKey);

    if (current === 1) {
      // Set expiry on first request in this second
      await redis.expire(globalKey, 10); // Keep for 10 seconds for monitoring
    }

    return current <= DDOS_CONFIG.GLOBAL_RPS_LIMIT;
  } catch {
    // If Redis fails, allow requests but log the error
    audit.securityEvent("ddos_global_rate_limit_failed", {});
    return true;
  }
}

/**
 * Check per-IP request rate
 */
async function checkIPRateLimit(clientIP: string): Promise<{
  allowed: boolean;
  blocked: boolean;
  requiresCaptcha: boolean;
}> {
  try {
    if (!redis) {
      return checkIPRateLimitMemory(clientIP);
    }

    const now = Date.now();
    const currentSecond = Math.floor(now / 1000);

    // Check per-second rate
    const secondKey = `ip_requests:${clientIP}:${currentSecond}`;
    const secondCount = await redis.incr(secondKey);

    if (secondCount === 1) {
      await redis.expire(secondKey, 10);
    }

    // Check burst rate (10-second window)
    const burstKey = `ip_burst:${clientIP}:${Math.floor(now / 10000)}`;
    const burstCount = await redis.incr(burstKey);

    if (burstCount === 1) {
      await redis.expire(burstKey, 20);
    }

    // Determine action based on rate limits
    if (secondCount > DDOS_CONFIG.IP_RPS_LIMIT * 2) {
      // Excessive rate - block IP
      await blockIP(
        clientIP,
        DDOS_CONFIG.TEMPORARY_BLOCK,
        "excessive_request_rate",
      );
      return { allowed: false, blocked: true, requiresCaptcha: false };
    }

    if (burstCount > DDOS_CONFIG.IP_BURST_LIMIT) {
      // Burst detected - require CAPTCHA
      return { allowed: true, blocked: false, requiresCaptcha: true };
    }

    if (secondCount > DDOS_CONFIG.IP_RPS_LIMIT) {
      // Rate limit exceeded - require CAPTCHA
      return { allowed: true, blocked: false, requiresCaptcha: true };
    }

    return { allowed: true, blocked: false, requiresCaptcha: false };
  } catch {
    // Fallback to memory store
    return checkIPRateLimitMemory(clientIP);
  }
}

/**
 * Memory fallback for IP rate limiting
 */
function checkIPRateLimitMemory(clientIP: string): {
  allowed: boolean;
  blocked: boolean;
  requiresCaptcha: boolean;
} {
  const now = Date.now();
  const current = requestCounts.get(clientIP) ?? {
    count: 0,
    resetTime: now + DDOS_CONFIG.SECOND_WINDOW,
  };

  // Reset if window expired
  if (now > current.resetTime) {
    current.count = 0;
    current.resetTime = now + DDOS_CONFIG.SECOND_WINDOW;
  }

  current.count++;
  requestCounts.set(clientIP, current);

  if (current.count > DDOS_CONFIG.IP_RPS_LIMIT * 2) {
    return { allowed: false, blocked: true, requiresCaptcha: false };
  }

  if (current.count > DDOS_CONFIG.IP_RPS_LIMIT) {
    return { allowed: true, blocked: false, requiresCaptcha: true };
  }

  return { allowed: true, blocked: false, requiresCaptcha: false };
}

/**
 * Detect suspicious request patterns
 */
async function detectSuspiciousPatterns(
  req: Request,
  clientIP: string,
): Promise<{
  isSuspicious: boolean;
  riskScore: number;
  patterns: string[];
}> {
  const patterns: string[] = [];
  let riskScore = 0;

  // Check user agent
  const userAgent = req.headers.get("user-agent") ?? "";
  if (!userAgent || userAgent.length < 10) {
    patterns.push("missing_or_short_user_agent");
    riskScore += 20;
  }

  // Check for bot patterns
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /java/i,
  ];

  if (botPatterns.some((pattern) => pattern.test(userAgent))) {
    patterns.push("bot_user_agent");
    riskScore += 30;
  }

  // Check request size
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
    // 10MB
    patterns.push("large_request");
    riskScore += 25;
  }

  // Check for suspicious headers
  const suspiciousHeaders = [
    "x-forwarded-for",
    "x-real-ip",
    "x-originating-ip",
    "x-remote-ip",
    "x-remote-addr",
  ];

  let proxyCount = 0;
  suspiciousHeaders.forEach((header) => {
    if (req.headers.get(header)) {
      proxyCount++;
    }
  });

  if (proxyCount > 2) {
    patterns.push("multiple_proxy_headers");
    riskScore += 15;
  }

  // Check for rapid requests from same IP
  const now = Date.now();
  try {
    if (redis) {
      const rapidKey = `rapid_requests:${clientIP}`;
      const rapidCount = await redis.incr(rapidKey);

      if (rapidCount === 1) {
        await redis.expire(rapidKey, 60); // 1 minute window
      }

      if (rapidCount > 30) {
        // More than 30 requests in a minute
        patterns.push("rapid_requests");
        riskScore += 40;
      }
    }
  } catch {
    // Ignore Redis errors for pattern detection
  }

  // Check request method distribution
  const method = req.method;
  if (method !== "GET" && method !== "POST") {
    patterns.push("unusual_http_method");
    riskScore += 10;
  }

  const isSuspicious = riskScore >= 50; // Threshold for suspicious activity

  if (isSuspicious) {
    // Record suspicious pattern
    try {
      const currentPatterns = suspiciousPatterns.get(clientIP) ?? {
        count: 0,
        lastSeen: now,
      };

      currentPatterns.count++;
      currentPatterns.lastSeen = now;
      suspiciousPatterns.set(clientIP, currentPatterns);

      if (currentPatterns.count >= DDOS_CONFIG.SUSPICIOUS_THRESHOLD) {
        await recordViolation(clientIP, "suspicious_pattern_detected", {
          patterns,
          riskScore,
          userAgent: userAgent.substring(0, 100),
        });
      }
    } catch {
      // Ignore errors
    }
  }

  return { isSuspicious, riskScore, patterns };
}

/**
 * Main DDoS protection check
 */
export async function checkDDoSProtection(req: Request): Promise<{
  allowed: boolean;
  blocked: boolean;
  requiresCaptcha: boolean;
  reason?: string;
  riskScore?: number;
}> {
  try {
    // Get client IP
    const clientIP = getClientIP(req);

    // Check global rate limit
    const globalAllowed = await checkGlobalRateLimit();
    if (!globalAllowed) {
      audit.securityEvent("ddos_global_rate_limit_exceeded", { clientIP });
      return {
        allowed: false,
        blocked: true,
        requiresCaptcha: false,
        reason: "Global rate limit exceeded",
      };
    }

    // Check per-IP rate limit
    const ipCheck = await checkIPRateLimit(clientIP);
    if (!ipCheck.allowed) {
      return {
        allowed: false,
        blocked: ipCheck.blocked,
        requiresCaptcha: false,
        reason: "IP rate limit exceeded",
      };
    }

    // Detect suspicious patterns
    const patternCheck = await detectSuspiciousPatterns(req, clientIP);
    if (patternCheck.isSuspicious) {
      audit.securityEvent("suspicious_request_pattern", {
        clientIP,
        patterns: patternCheck.patterns,
        riskScore: patternCheck.riskScore,
      });

      return {
        allowed: true,
        blocked: false,
        requiresCaptcha: true,
        reason: "Suspicious request patterns detected",
        riskScore: patternCheck.riskScore,
      };
    }

    // If IP rate limit suggests CAPTCHA, require it
    if (ipCheck.requiresCaptcha) {
      return {
        allowed: true,
        blocked: false,
        requiresCaptcha: true,
        reason: "Rate limit approaching threshold",
      };
    }

    return {
      allowed: true,
      blocked: false,
      requiresCaptcha: false,
    };
  } catch (error) {
    // If DDoS protection fails, allow request but log error
    audit.securityEvent("ddos_protection_failed", {
      error: error instanceof Error ? error.message : String(error),
    });

    return {
      allowed: true,
      blocked: false,
      requiresCaptcha: false,
    };
  }
}

/**
 * Middleware function for Next.js routes
 */
export function createDDoSMiddleware() {
  return async (req: Request) => {
    const protection = await checkDDoSProtection(req);

    if (!protection.allowed) {
      return {
        blocked: true,
        status: protection.blocked ? 403 : 429,
        message: protection.reason ?? "Request blocked by DDoS protection",
      };
    }

    return {
      blocked: false,
      requiresCaptcha: protection.requiresCaptcha,
      riskScore: protection.riskScore,
    };
  };
}

/**
 * Get DDoS protection statistics
 */
export async function getDDoSStats(): Promise<{
  globalRequests: number;
  blockedIPs: number;
  suspiciousPatterns: number;
}> {
  try {
    if (redis) {
      const [globalKeys, blockedKeys, suspiciousKeys] = await Promise.all([
        redis.keys("global_requests:*"),
        redis.keys("blocked_ip:*"),
        redis.keys("suspicious_patterns:*"),
      ]);

      return {
        globalRequests: globalKeys.length,
        blockedIPs: blockedKeys.length,
        suspiciousPatterns: suspiciousKeys.length,
      };
    }
  } catch {
    // Ignore Redis errors
  }

  return {
    globalRequests: 0,
    blockedIPs: 0,
    suspiciousPatterns: suspiciousPatterns.size,
  };
}

/**
 * Cleanup old data (for maintenance)
 */
export async function cleanupDDoSData(): Promise<void> {
  // Redis handles most cleanup automatically with expirations
  // Memory cleanup would require iterating through maps
  const now = Date.now();

  // Clean old request counts
  for (const [ip, data] of requestCounts.entries()) {
    if (now > data.resetTime) {
      requestCounts.delete(ip);
    }
  }

  // Clean old suspicious patterns
  for (const [ip, data] of suspiciousPatterns.entries()) {
    if (now - data.lastSeen > DDOS_CONFIG.HOUR_WINDOW) {
      suspiciousPatterns.delete(ip);
    }
  }
}
