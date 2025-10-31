import { randomBytesHex } from "~/lib/crypto-edge";

/**
 * Generate a secure random token for share links
 * @param length - Length of the token in bytes (default: 32)
 * @returns Hex string token
 */
export async function generateShareToken(length = 32): Promise<string> {
  return await randomBytesHex(length);
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
