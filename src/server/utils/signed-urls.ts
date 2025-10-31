import { createHmacSync } from "~/lib/crypto-edge";
import { env } from "~/env";

/**
 * Generate a signed URL for secure file access
 * @param fileId - The file ID
 * @param expiresInSeconds - How long the URL should be valid (e.g., 3600 for 1 hour)
 * @returns Object containing the signed URL and expiration time
 */
export function generateSignedUrl(
  fileId: string,
  expiresInSeconds: number,
): { url: string; expiresAt: string } {
  const expiresAt = Date.now() + expiresInSeconds * 1000;
  const payload = `${fileId}:${expiresAt}`;

  // Create HMAC signature using validated environment variable
  const signature = createHmacSync("sha256", env.CLERK_SECRET_KEY, payload);

  const signedUrl = `/api/files/${fileId}/download?token=${signature}&expires=${expiresAt}`;

  return {
    url: signedUrl,
    expiresAt: new Date(expiresAt).toISOString(),
  };
}

/**
 * Verify a signed URL token
 * @param fileId - The file ID from the URL
 * @param token - The signature token from the URL
 * @param expires - The expiration timestamp from the URL
 * @param secret - Secret key for verification
 * @returns boolean indicating if the signature is valid and not expired
 */
export function verifySignedUrl(
  fileId: string,
  token: string,
  expires: string,
): boolean {
  const expirationTime = parseInt(expires);

  // Check if expired
  if (Date.now() > expirationTime) {
    return false;
  }

  const payload = `${fileId}:${expirationTime}`;

  // Verify signature using validated environment variable
  const expectedSignature = createHmacSync(
    "sha256",
    env.CLERK_SECRET_KEY,
    payload,
  );

  return token === expectedSignature;
}
