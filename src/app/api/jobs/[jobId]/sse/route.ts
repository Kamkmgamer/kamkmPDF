import type { NextRequest } from "next/server";
import { createSSEResponse } from "~/lib/sse";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;

  if (!jobId) {
    return new Response("Job ID is required", { status: 400 });
  }

  // Validate job ID format (should be a UUID)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(jobId)) {
    return new Response("Invalid job ID format", { status: 400 });
  }

  try {
    // Create SSE response for this job
    const response = createSSEResponse(jobId);
    return response;
  } catch (error) {
    console.error("Failed to create SSE connection:", error);
    return new Response("Failed to create SSE connection", { status: 500 });
  }
}
