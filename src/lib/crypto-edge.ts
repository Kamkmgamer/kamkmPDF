/**
 * Edge-compatible crypto utilities
 * Uses Web Crypto API which is available in Edge Runtime
 */

/**
 * Generate a UUID v4 compatible string
 * Uses Web Crypto API for Edge Runtime compatibility
 */
export function randomUUID(): string {
  // Web Crypto API is available in Edge Runtime
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback for environments without crypto.randomUUID
  // This should not happen in Edge Runtime, but provides safety
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generate random bytes (returns Uint8Array)
 * Uses Web Crypto API for Edge Runtime compatibility
 */
export async function randomBytes(length: number): Promise<Uint8Array> {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return array;
  }

  // Fallback (should not happen in Edge Runtime)
  const array = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    array[i] = Math.floor(Math.random() * 256);
  }
  return array;
}

/**
 * Generate random bytes and return as hex string
 */
export async function randomBytesHex(length: number): Promise<string> {
  const bytes = await randomBytes(length);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Create SHA-256 hash
 * Uses Web Crypto API for Edge Runtime compatibility
 */
export async function createHash(
  algorithm: string,
  data: string,
): Promise<string> {
  if (algorithm !== "sha256") {
    throw new Error(
      `Unsupported algorithm: ${algorithm}. Only sha256 is supported.`,
    );
  }

  if (typeof crypto !== "undefined" && crypto.subtle) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  throw new Error("Web Crypto API not available");
}

/**
 * Synchronous createHash for compatibility with existing code
 * Uses a simple hash function for cache keys (not cryptographically secure, but fast)
 * For cryptographic purposes, use async createHash() instead
 */
export function createHashSync(algorithm: string, data: string): string {
  if (algorithm !== "sha256") {
    throw new Error(
      `Unsupported algorithm: ${algorithm}. Only sha256 is supported.`,
    );
  }

  // Simple hash function for cache keys (non-cryptographic but fast)
  // This is suitable for cache key generation but NOT for security purposes
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Convert to hex string (simulating SHA-256 length)
  const hex = Math.abs(hash).toString(16);
  // Pad to 64 chars (SHA-256 hex length) by repeating and truncating
  return hex.repeat(Math.ceil(64 / hex.length)).substring(0, 64);
}

/**
 * Create HMAC-SHA256 hash (for signed URLs, API keys, etc.)
 * Uses Web Crypto API for Edge Runtime compatibility
 */
export async function createHmac(
  algorithm: string,
  secret: string,
  data: string,
): Promise<string> {
  if (algorithm !== "sha256") {
    throw new Error(
      `Unsupported algorithm: ${algorithm}. Only sha256 is supported.`,
    );
  }

  if (typeof crypto !== "undefined" && crypto.subtle) {
    // Import the secret key
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );

    // Sign the data
    const dataBuffer = encoder.encode(data);
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      cryptoKey,
      dataBuffer,
    );
    const signatureArray = Array.from(new Uint8Array(signatureBuffer));
    return signatureArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  throw new Error("Web Crypto API not available");
}

/**
 * Synchronous createHmac for compatibility with existing code
 * Note: This uses a simplified approach and may not be cryptographically secure
 * For production use, prefer async createHmac()
 */
export function createHmacSync(
  algorithm: string,
  secret: string,
  data: string,
): string {
  if (algorithm !== "sha256") {
    throw new Error(
      `Unsupported algorithm: ${algorithm}. Only sha256 is supported.`,
    );
  }

  // Simple HMAC-like function (not cryptographically secure, but works for non-security use cases)
  // For security-critical code, use async createHmac() instead
  let hash = 0;
  const combined = secret + data;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  const hex = Math.abs(hash).toString(16);
  return hex.repeat(Math.ceil(64 / hex.length)).substring(0, 64);
}
