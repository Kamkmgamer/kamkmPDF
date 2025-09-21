import { randomBytes } from "crypto";

/**
 * Generate a secure random token for share links
 * @param length - Length of the token in bytes (default: 32)
 * @returns Hex string token
 */
export function generateShareToken(length = 32): string {
  return randomBytes(length).toString("hex");
}

/**
 * Create a shareable URL for a file
 * @param fileId - The file ID
 * @param token - The share token
 * @returns Shareable URL
 */
export function createShareUrl(fileId: string, token: string): string {
  return `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/shared/${fileId}?token=${token}`;
}
