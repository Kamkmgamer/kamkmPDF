import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { preWarmBrowserPool } from "~/lib/pdf-generator";
import { verifyApiKey, hasPermission, API_PERMISSIONS } from "~/server/api/middleware/apiKeyAuth";

export const runtime = "nodejs";

/**
 * POST /api/v1/prewarm
 * Pre-warm the browser pool to eliminate cold starts for upcoming API requests
 * Useful for high-volume API users who want to minimize latency
 */
export async function POST(req: NextRequest) {
  try {
    // Get API key from header
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid Authorization header" },
        { status: 401 },
      );
    }

    const apiKey = authHeader.replace("Bearer ", "");

    // Verify API key
    const { permissions } = await verifyApiKey(apiKey);

    // Check permission (only Pro/Enterprise users can pre-warm)
    if (!hasPermission(permissions, API_PERMISSIONS.PDF_CREATE)) {
      return NextResponse.json(
        { error: "API key does not have pdf:create permission" },
        { status: 403 },
      );
    }

    // Pre-warm the browser pool
    await preWarmBrowserPool();

    return NextResponse.json(
      {
        success: true,
        message: "Browser pool pre-warmed successfully",
        tip: "Subsequent PDF generation requests will be faster (no cold start)",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Pre-warm error:", error);

    if (error instanceof Error && error.message.includes("UNAUTHORIZED")) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to pre-warm browser pool" },
      { status: 500 },
    );
  }
}
