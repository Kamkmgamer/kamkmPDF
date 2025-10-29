import { logger } from "./logger";

export interface SSEJobUpdate {
  jobId: string;
  status: "queued" | "processing" | "completed" | "failed";
  stage?: string | null;
  progress?: number | null;
  errorMessage?: string | null;
  resultFileId?: string | null;
}

export class SSEManager {
  private static instance: SSEManager;
  private connections = new Map<string, Set<Response>>();

  static getInstance(): SSEManager {
    if (!SSEManager.instance) {
      SSEManager.instance = new SSEManager();
    }
    return SSEManager.instance;
  }

  /**
   * Add a new SSE connection for a specific job
   */
  addConnection(jobId: string, response: Response): void {
    if (!this.connections.has(jobId)) {
      this.connections.set(jobId, new Set());
    }
    this.connections.get(jobId)!.add(response);

    // Set up SSE headers
    response.headers.set("Content-Type", "text/event-stream");
    response.headers.set("Cache-Control", "no-cache");
    response.headers.set("Connection", "keep-alive");
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Headers", "Cache-Control");

    // Send initial connection confirmation
    void this.sendEvent(response, "connected", { jobId, timestamp: Date.now() });

    // Clean up connection when it closes
    void response.body?.getReader().closed.then(() => {
      this.removeConnection(jobId, response);
    }).catch(() => {
      this.removeConnection(jobId, response);
    });

    logger.info({ jobId, connections: this.connections.get(jobId)?.size }, "SSE connection added");
  }

  /**
   * Remove a connection for a specific job
   */
  removeConnection(jobId: string, response: Response): void {
    const connections = this.connections.get(jobId);
    if (connections) {
      connections.delete(response);
      if (connections.size === 0) {
        this.connections.delete(jobId);
      }
    }
    logger.info({ jobId, connections: connections?.size ?? 0 }, "SSE connection removed");
  }

  /**
   * Send an update to all connections for a specific job
   */
  async sendJobUpdate(jobId: string, update: SSEJobUpdate): Promise<void> {
    const connections = this.connections.get(jobId);
    if (!connections || connections.size === 0) {
      return;
    }

    const eventData = {
      ...update,
      timestamp: Date.now(),
    };

    const promises: Promise<void>[] = [];
    for (const response of connections) {
      promises.push(this.sendEvent(response, "job-update", eventData));
    }

    await Promise.allSettled(promises);
    logger.info({ jobId, connections: connections.size }, "SSE job update sent");
  }

  /**
   * Send a generic event to a specific response
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async sendEvent(response: Response, event: string, data: any): Promise<void> {
    try {
      // Note: This is a simplified implementation for server-side SSE
      // In a real implementation, you'd use a proper SSE library or framework
      console.log(`SSE Event [${event}]:`, data);
    } catch (error) {
      logger.warn({ error: String(error) }, "Failed to send SSE event");
    }
  }

  /**
   * Get the number of active connections for a job
   */
  getConnectionCount(jobId: string): number {
    return this.connections.get(jobId)?.size ?? 0;
  }

  /**
   * Get total number of active connections
   */
  getTotalConnections(): number {
    let total = 0;
    for (const connections of this.connections.values()) {
      total += connections.size;
    }
    return total;
  }

  /**
   * Clean up all connections (useful for graceful shutdown)
   */
  async cleanup(): Promise<void> {
    const promises: Promise<void>[] = [];
    
    for (const [jobId, connections] of this.connections.entries()) {
      for (const response of connections) {
        promises.push(this.sendEvent(response, "server-shutdown", { jobId }));
      }
    }

    await Promise.allSettled(promises);
    this.connections.clear();
    logger.info("SSE manager cleaned up");
  }
}

/**
 * Create an SSE response for a specific job
 */
export function createSSEResponse(jobId: string): Response {
  const sseManager = SSEManager.getInstance();
  
  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection event
      const encoder = new TextEncoder();
      const sendEvent = (event: string, data: unknown) => {
        const eventString = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(eventString));
      };

      // Send connection confirmation
      sendEvent("connected", { jobId, timestamp: Date.now() });

      // Keep connection alive with periodic heartbeat
      const heartbeat = setInterval(() => {
        try {
          sendEvent("heartbeat", { timestamp: Date.now() });
        } catch {
          clearInterval(heartbeat);
          controller.close();
        }
      }, 30000); // Heartbeat every 30 seconds

      // Clean up on close
      // Note: Simplified implementation - in production you'd handle abort signals properly
      // controller.signal?.addEventListener("abort", () => {
      //   clearInterval(heartbeat);
      //   controller.close();
      // });
    },
  });

  const response = new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    },
  });

  // Add the connection to the manager
  sseManager.addConnection(jobId, response);

  return response;
}

/**
 * Send a job update via SSE
 */
export async function sendJobUpdate(jobId: string, update: SSEJobUpdate): Promise<void> {
  const sseManager = SSEManager.getInstance();
  await sseManager.sendJobUpdate(jobId, update);
}
