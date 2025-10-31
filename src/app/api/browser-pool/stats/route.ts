import { NextResponse } from "next/server";
import { getBrowserPool } from "~/lib/browser-pool";

export const runtime = "nodejs";

export async function GET() {
  try {
    // Get browser pool stats directly to avoid Puppeteer imports
    // This route only returns browser pool stats, not PDF task stats
    const browserPool = getBrowserPool();
    const stats = browserPool.getStats();

    return NextResponse.json({
      success: true,
      stats: {
        ...stats,
        timestamp: new Date().toISOString(),
        // Note: PDF task stats (activePdfTasks, waitQueueLength) are not available
        // in Edge Runtime due to Puppeteer dependencies
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 },
    );
  }
}
