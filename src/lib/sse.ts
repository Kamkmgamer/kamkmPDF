import { logger } from "./logger";
import type { GenerationStage } from "~/types/pdf";

export interface SSEJobUpdate {
  jobId: string;
  status: "queued" | "processing" | "completed" | "failed";
  stage?: GenerationStage | null;
  progress?: number;
  errorMessage?: string | null;
  resultFileId?: string | null;
}

interface SSEConnection {
  controller: ReadableStreamDefaultController<Uint8Array>;
  encoder: TextEncoder;
  heartbeat: NodeJS.Timeout;
}

export class SSEManager {
  private static instance: SSEManager;
  private connections = new Map<string, Map<string, SSEConnection>>();

  static getInstance(): SSEManager {
    if (!SSEManager.instance) {
      SSEManager.instance = new SSEManager();
    }
    return SSEManager.instance;
  }

  addConnection(jobId: string, connectionId: string, connection: SSEConnection) {
    if (!this.connections.has(jobId)) {
      this.connections.set(jobId, new Map());
    }
    this.connections.get(jobId)?.set(connectionId, connection);

    logger.info({ jobId, connectionId, connections: this.connections.get(jobId)?.size }, "SSE connection added");
  }

  removeConnection(jobId: string, connectionId: string) {
    const jobConnections = this.connections.get(jobId);
    if (jobConnections) {
      const connection = jobConnections.get(connectionId);
      if (connection) {
        clearInterval(connection.heartbeat);
        try {
          connection.controller.close();
        } catch (error) {
          logger.warn({ error: String(error) }, "Failed to close SSE connection");
        }
      }
      jobConnections.delete(connectionId);
      if (jobConnections.size === 0) {
        this.connections.delete(jobId);
      }
    }
    logger.info({ jobId, connectionId, connections: this.connections.get(jobId)?.size }, "SSE connection removed");
  }

  async sendJobUpdate(jobId: string, update: SSEJobUpdate) {
    const jobConnections = this.connections.get(jobId);
    if (!jobConnections) return;

    const promises: Promise<void>[] = [];
    for (const [_connectionId, connection] of jobConnections.entries()) {
      promises.push(this.sendEvent(connection, "job-update", update));
    }

    await Promise.allSettled(promises);
    logger.info({ jobId, connections: jobConnections.size }, "SSE job update sent");
  }

  private async sendEvent(connection: SSEConnection, event: string, data: unknown): Promise<void> {
    try {
      const eventString = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
      connection.controller.enqueue(connection.encoder.encode(eventString));
    } catch (error) {
      logger.warn({ error: String(error) }, "Failed to send SSE event");
    }
  }

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
    for (const [jobId, jobConnections] of this.connections.entries()) {
      for (const [_connectionId, connection] of jobConnections.entries()) {
        try {
          await this.sendEvent(connection, "server-shutdown", { jobId });
        } catch (error) {
          logger.warn({ error: String(error) }, "Failed to send shutdown event");
        }
        clearInterval(connection.heartbeat);
        try {
          connection.controller.close();
        } catch (error) {
          logger.warn({ error: String(error) }, "Failed to close connection during cleanup");
        }
      }
    }
    this.connections.clear();
    logger.info("SSE manager cleaned up");
  }
}

const sseManager = SSEManager.getInstance();

/**
 * Create an SSE response for a specific job
 */
export function createSSEResponse(jobId: string): Response {
  const connectionId = `${jobId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      
      const sendEvent = (event: string, data: unknown) => {
        try {
          const eventString = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(eventString));
        } catch (error) {
          logger.warn({ error: String(error) }, "Failed to send SSE event");
        }
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

      // Store the connection
      const connection: SSEConnection = {
        controller: controller as ReadableStreamDefaultController<Uint8Array>,
        encoder,
        heartbeat,
      };
      
      sseManager.addConnection(jobId, connectionId, connection);

      // Clean up on close
      const cleanup = () => {
        clearInterval(heartbeat);
        sseManager.removeConnection(jobId, connectionId);
        try {
          controller.close();
        } catch (error) {
          logger.warn({ error: String(error) }, "Failed to close controller");
        }
      };

      // Handle abort signal
      if (controller.signal) {
        controller.signal.addEventListener("abort", cleanup);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    },
  });
}

export async function sendJobUpdate(jobId: string, update: SSEJobUpdate) {
  await sseManager.sendJobUpdate(jobId, update);
}