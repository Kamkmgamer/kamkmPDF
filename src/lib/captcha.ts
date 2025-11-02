import { createHashSync } from "~/lib/crypto-edge";
import { audit } from "~/lib/logger";
import { env } from "~/env";

// Redis connection for CAPTCHA storage
interface RedisClient {
  setex(key: string, seconds: number, value: string): Promise<string>;
  get(key: string): Promise<string | null>;
  del(key: string): Promise<number>;
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
    audit.securityEvent("captcha_redis_unavailable", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// Initialize Redis on module load
void initRedis();

// In-memory fallback for development
const captchaStore = new Map<
  string,
  { answer: string; timestamp: number; attempts: number }
>();

// Configuration
const CAPTCHA_EXPIRY = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 3; // Maximum attempts per CAPTCHA
const CAPTCHA_DIFFICULTY = {
  MIN: 1,
  MAX: 50,
};

/**
 * Generate a simple math CAPTCHA
 */
export function generateMathCaptcha(): {
  question: string;
  answer: string;
  captchaId: string;
} {
  const operations = ["+", "-", "*"];
  const operation = operations[Math.floor(Math.random() * operations.length)];

  let num1: number;
  let num2: number;
  let answer: number;
  let question: string;

  switch (operation) {
    case "+":
      num1 =
        Math.floor(Math.random() * CAPTCHA_DIFFICULTY.MAX) +
        CAPTCHA_DIFFICULTY.MIN;
      num2 =
        Math.floor(Math.random() * CAPTCHA_DIFFICULTY.MAX) +
        CAPTCHA_DIFFICULTY.MIN;
      answer = num1 + num2;
      question = `What is ${num1} + ${num2}?`;
      break;

    case "-":
      num1 =
        Math.floor(Math.random() * CAPTCHA_DIFFICULTY.MAX) +
        CAPTCHA_DIFFICULTY.MIN;
      num2 = Math.floor(Math.random() * num1) + 1; // Ensure positive result
      answer = num1 - num2;
      question = `What is ${num1} - ${num2}?`;
      break;

    case "*":
      num1 = Math.floor(Math.random() * 12) + 1; // Keep multiplication simple
      num2 = Math.floor(Math.random() * 12) + 1;
      answer = num1 * num2;
      question = `What is ${num1} × ${num2}?`;
      break;

    default:
      throw new Error("Invalid operation");
  }

  const captchaId = createHashSync(
    "sha256",
    `${question}:${answer}:${Date.now()}:${Math.random()}`,
  );

  return {
    question,
    answer: answer.toString(),
    captchaId: captchaId.substring(0, 16), // Use first 16 chars
  };
}

/**
 * Store CAPTCHA in Redis or memory fallback
 */
export async function storeCaptcha(
  captchaId: string,
  answer: string,
  clientIP?: string,
): Promise<void> {
  const captchaData = {
    answer,
    timestamp: Date.now(),
    attempts: 0,
    clientIP,
  };

  if (!redis) {
    // Fallback to memory store
    captchaStore.set(captchaId, {
      answer,
      timestamp: Date.now(),
      attempts: 0,
    });
    return;
  }

  try {
    await redis.setex(
      `captcha:${captchaId}`,
      Math.ceil(CAPTCHA_EXPIRY / 1000),
      JSON.stringify(captchaData),
    );
  } catch (error) {
    // Fallback to memory store
    captchaStore.set(captchaId, {
      answer,
      timestamp: Date.now(),
      attempts: 0,
    });

    audit.securityEvent("captcha_storage_fallback", {
      captchaId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Verify CAPTCHA answer
 */
export async function verifyCaptcha(
  captchaId: string,
  providedAnswer: string,
  clientIP?: string,
): Promise<{
  isValid: boolean;
  error?: string;
  attemptsRemaining?: number;
}> {
  try {
    if (!redis) {
      // Use memory fallback
      const memoryData = captchaStore.get(captchaId);
      if (!memoryData) {
        return { isValid: false, error: "CAPTCHA expired or not found" };
      }
      return verifyMemoryCaptcha(captchaId, providedAnswer, memoryData);
    }

    const captchaData = await redis.get(`captcha:${captchaId}`);

    if (!captchaData) {
      // Try memory fallback
      const memoryData = captchaStore.get(captchaId);
      if (!memoryData) {
        return { isValid: false, error: "CAPTCHA expired or not found" };
      }

      return verifyMemoryCaptcha(captchaId, providedAnswer, memoryData);
    }

    const captcha = JSON.parse(captchaData) as {
      answer: string;
      timestamp: number;
      attempts: number;
      clientIP?: string;
    };

    // Check if expired
    if (Date.now() - captcha.timestamp > CAPTCHA_EXPIRY) {
      await redis.del(`captcha:${captchaId}`);
      return { isValid: false, error: "CAPTCHA expired" };
    }

    // Check attempts
    if (captcha.attempts >= MAX_ATTEMPTS) {
      await redis.del(`captcha:${captchaId}`);

      // Log excessive attempts
      audit.securityEvent("captcha_max_attempts", {
        captchaId,
        clientIP,
        attempts: captcha.attempts,
      });

      return { isValid: false, error: "Maximum attempts exceeded" };
    }

    // Increment attempts
    captcha.attempts++;
    await redis.setex(
      `captcha:${captchaId}`,
      Math.ceil(CAPTCHA_EXPIRY / 1000),
      JSON.stringify(captcha),
    );

    // Verify answer
    if (
      captcha.answer.toLowerCase().trim() ===
      providedAnswer.toLowerCase().trim()
    ) {
      // Correct answer - remove CAPTCHA
      await redis.del(`captcha:${captchaId}`);

      audit.userAction(null, "captcha_verified", {
        captchaId,
        clientIP,
      });

      return { isValid: true };
    } else {
      // Wrong answer
      audit.securityEvent("captcha_failed", {
        captchaId,
        clientIP,
        attempts: captcha.attempts,
        providedAnswer: providedAnswer.substring(0, 3) + "...", // Don't log full answer
      });

      return {
        isValid: false,
        error: "Incorrect answer",
        attemptsRemaining: MAX_ATTEMPTS - captcha.attempts,
      };
    }
  } catch {
    // Try memory fallback
    const memoryData = captchaStore.get(captchaId);
    if (!memoryData) {
      return { isValid: false, error: "CAPTCHA verification failed" };
    }

    return verifyMemoryCaptcha(captchaId, providedAnswer, memoryData);
  }
}

/**
 * Verify CAPTCHA from memory store
 */
function verifyMemoryCaptcha(
  captchaId: string,
  providedAnswer: string,
  memoryData: { answer: string; timestamp: number; attempts: number },
): { isValid: boolean; error?: string; attemptsRemaining?: number } {
  // Check if expired
  if (Date.now() - memoryData.timestamp > CAPTCHA_EXPIRY) {
    captchaStore.delete(captchaId);
    return { isValid: false, error: "CAPTCHA expired" };
  }

  // Check attempts
  if (memoryData.attempts >= MAX_ATTEMPTS) {
    captchaStore.delete(captchaId);
    return { isValid: false, error: "Maximum attempts exceeded" };
  }

  // Increment attempts
  memoryData.attempts++;
  captchaStore.set(captchaId, memoryData);

  // Verify answer
  if (
    memoryData.answer.toLowerCase().trim() ===
    providedAnswer.toLowerCase().trim()
  ) {
    captchaStore.delete(captchaId);
    return { isValid: true };
  } else {
    return {
      isValid: false,
      error: "Incorrect answer",
      attemptsRemaining: MAX_ATTEMPTS - memoryData.attempts,
    };
  }
}

/**
 * Check if CAPTCHA is required for a given IP/user
 */
export async function isCaptchaRequired(
  clientIP: string,
  _userId?: string,
): Promise<boolean> {
  try {
    if (!redis) {
      return false;
    }

    // Check if IP has recent violations
    const violationKey = `violations:${clientIP}`;
    const violationData = await redis.get(violationKey);

    if (violationData) {
      const violations = JSON.parse(violationData) as { count?: number };
      const recentViolations = violations.count ?? 0;

      // Require CAPTCHA if there are recent violations
      if (recentViolations >= 3) {
        return true;
      }
    }

    // Check rate limiting for unauthenticated requests
    const rateLimitKey = `unauth_requests:${clientIP}`;
    const requestCount = await redis.get(rateLimitKey);

    if (requestCount && parseInt(requestCount) > 5) {
      return true;
    }

    return false;
  } catch {
    // If we can't check, be conservative and require CAPTCHA
    return true;
  }
}

/**
 * Record unauthenticated request for rate limiting
 */
export async function recordUnauthenticatedRequest(
  clientIP: string,
): Promise<void> {
  try {
    if (!redis) return;

    const rateLimitKey = `unauth_requests:${clientIP}`;
    const redisWithIncr = redis as unknown as {
      incr(key: string): Promise<number>;
      expire(key: string, seconds: number): Promise<number>;
    };
    const current = await redisWithIncr.incr(rateLimitKey);

    if (current === 1) {
      // Set expiry on first request
      await redisWithIncr.expire(rateLimitKey, 300); // 5 minutes
    }
  } catch {
    // Ignore errors in rate limiting
  }
}

/**
 * Generate and store a new CAPTCHA
 */
export async function createCaptcha(clientIP?: string): Promise<{
  question: string;
  captchaId: string;
  expiresAt: number;
}> {
  const captcha = generateMathCaptcha();

  await storeCaptcha(captcha.captchaId, captcha.answer, clientIP);

  return {
    question: captcha.question,
    captchaId: captcha.captchaId,
    expiresAt: Date.now() + CAPTCHA_EXPIRY,
  };
}

/**
 * Clean up expired CAPTCHAs (for maintenance)
 */
export async function cleanupExpiredCaptchas(): Promise<void> {
  // This would typically be run as a scheduled job
  // For now, Redis handles expiry automatically
  // Memory store cleanup would require iterating through all entries
  const now = Date.now();

  for (const [captchaId, data] of captchaStore.entries()) {
    if (now - data.timestamp > CAPTCHA_EXPIRY) {
      captchaStore.delete(captchaId);
    }
  }
}

/**
 * Get CAPTCHA statistics for monitoring
 */
export async function getCaptchaStats(): Promise<{
  activeCaptchas: number;
  memoryFallbackCaptchas: number;
}> {
  try {
    if (!redis) {
      return {
        activeCaptchas: 0,
        memoryFallbackCaptchas: captchaStore.size,
      };
    }

    const keys = await redis.keys("captcha:*");
    const activeCaptchas = keys.length;
    const memoryFallbackCaptchas = captchaStore.size;

    return {
      activeCaptchas,
      memoryFallbackCaptchas,
    };
  } catch {
    return {
      activeCaptchas: 0,
      memoryFallbackCaptchas: captchaStore.size,
    };
  }
}
