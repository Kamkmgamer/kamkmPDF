import { NextResponse } from "next/server";
import { getBrowserPoolStats } from "~/lib/pdf-generator";

export const runtime = "edge";

export async function GET() {
  try {
    const stats = getBrowserPoolStats();

    return NextResponse.json({
      success: true,
      stats: {
        ...stats,
        timestamp: new Date().toISOString(),
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
