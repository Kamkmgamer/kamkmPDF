import { useEffect, useRef, useState } from "react";

export interface SSEJobUpdate {
  jobId: string;
  status: "queued" | "processing" | "completed" | "failed";
  stage?: string | null;
  progress?: number | null;
  errorMessage?: string | null;
  resultFileId?: string | null;
  timestamp: number;
}

export interface SSEConnectionState {
  isConnected: boolean;
  lastUpdate: SSEJobUpdate | null;
  error: string | null;
}

export function useSSEJobUpdates(jobId: string) {
  const [state, setState] = useState<SSEConnectionState>({
    isConnected: false,
    lastUpdate: null,
    error: null,
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const totalReconnectAttempts = useRef(0); // Persistent counter that doesn't reset
  const maxReconnectAttempts = 5;
  const maxTotalReconnectAttempts = 10; // Max attempts across all reconnection cycles
  const isConnectingRef = useRef(false);
  const isTerminalRef = useRef(false);
  const closedByUsRef = useRef(false);
  const lastHeartbeatTime = useRef<number | null>(null);
  const lastKnownStatusRef = useRef<string | null>(null);

  useEffect(() => {
    if (!jobId) return;
    isTerminalRef.current = false;
    // Reset total attempts only when jobId changes (new job)
    totalReconnectAttempts.current = 0;
    reconnectAttempts.current = 0;
    lastHeartbeatTime.current = null;
    lastKnownStatusRef.current = null;

    const connect = () => {
      // Prevent multiple simultaneous connection attempts
      if (isConnectingRef.current) {
        return;
      }

      try {
        isConnectingRef.current = true;

        // Close existing connection
        if (eventSourceRef.current) {
          closedByUsRef.current = true;
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }

        const eventSource = new EventSource(`/api/jobs/${jobId}/sse`);
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          console.log(`SSE connected for job ${jobId}`);
          isConnectingRef.current = false;
          closedByUsRef.current = false;
          lastHeartbeatTime.current = Date.now();
          setState((prev) => ({
            ...prev,
            isConnected: true,
            error: null,
          }));
          // Reset only the current cycle attempts, not total attempts
          reconnectAttempts.current = 0;
        };

        eventSource.onmessage = (event) => {
          try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
            const data = JSON.parse(event.data);
            console.log(`SSE message for job ${jobId}:`, data);

            // Track status if available
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if (data.status) {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
              lastKnownStatusRef.current = data.status;
            }

            setState((prev) => ({
              ...prev,
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              lastUpdate: data,
            }));
          } catch (error) {
            console.error("Failed to parse SSE message:", error);
          }
        };

        eventSource.addEventListener("job-update", (event) => {
          try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            const data = JSON.parse(event.data) as SSEJobUpdate;
            console.log(`SSE job update for ${jobId}:`, data);

            setState((prev) => ({
              ...prev,
              lastUpdate: data,
            }));

            lastKnownStatusRef.current = data.status;

            if (data.status === "completed" || data.status === "failed") {
              isTerminalRef.current = true;
              closedByUsRef.current = true;
              if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
              }
              if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
              }
              setState((prev) => ({
                ...prev,
                isConnected: false,
                error: null,
              }));
            }
          } catch (error) {
            console.error("Failed to parse SSE job update:", error);
          }
        });

        eventSource.addEventListener("connected", (event) => {
          try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
            const data = JSON.parse(event.data);
            console.log(`SSE connection confirmed for job ${jobId}:`, data);
          } catch (error) {
            console.error("Failed to parse SSE connection event:", error);
          }
        });

        eventSource.addEventListener("heartbeat", (event) => {
          try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
            const data = JSON.parse(event.data);
            console.log(`SSE heartbeat for job ${jobId}:`, data);
            lastHeartbeatTime.current = Date.now();
            // Reset cycle attempts on successful heartbeat (connection is healthy)
            reconnectAttempts.current = 0;
          } catch (error) {
            console.error("Failed to parse SSE heartbeat:", error);
          }
        });

        eventSource.onerror = (error) => {
          // If we intentionally closed or the job reached a terminal state, ignore
          if (isTerminalRef.current || closedByUsRef.current) {
            return;
          }

          // Check if job is already in terminal state from lastUpdate (use ref to avoid closure issues)
          const currentStatus = lastKnownStatusRef.current;
          if (currentStatus === "completed" || currentStatus === "failed") {
            isTerminalRef.current = true;
            console.log(
              `SSE error ignored - job ${jobId} has reached terminal state: ${currentStatus}`,
            );
            return;
          }

          // Check connection readyState to determine error type
          const readyState = eventSource.readyState;
          const isClosed = readyState === EventSource.CLOSED;
          const isConnecting = readyState === EventSource.CONNECTING;

          console.error(`SSE error for job ${jobId}:`, {
            error,
            readyState,
            isClosed,
            isConnecting,
            reconnectAttempts: reconnectAttempts.current,
            totalReconnectAttempts: totalReconnectAttempts.current,
            lastHeartbeat: lastHeartbeatTime.current
              ? Date.now() - lastHeartbeatTime.current
              : null,
          });

          isConnectingRef.current = false;

          setState((prev) => ({
            ...prev,
            isConnected: false,
            error: "Connection lost",
          }));

          // Close the current connection if not already closed
          if (eventSourceRef.current && !isClosed) {
            closedByUsRef.current = true;
            eventSourceRef.current.close();
            eventSourceRef.current = null;
          }

          // Only reconnect if:
          // 1. Job is not in terminal state
          // 2. We haven't exceeded per-cycle max attempts
          // 3. We haven't exceeded total max attempts across all cycles
          // 4. Connection is actually closed (not just connecting)
          const shouldReconnect =
            !isTerminalRef.current &&
            reconnectAttempts.current < maxReconnectAttempts &&
            totalReconnectAttempts.current < maxTotalReconnectAttempts &&
            isClosed;

          if (shouldReconnect) {
            const delay = Math.min(
              1000 * Math.pow(2, reconnectAttempts.current),
              30000, // Max 30 second delay
            );
            reconnectAttempts.current++;
            totalReconnectAttempts.current++;

            console.log(
              `Reconnecting SSE for job ${jobId} in ${delay}ms (cycle attempt ${reconnectAttempts.current}/${maxReconnectAttempts}, total ${totalReconnectAttempts.current}/${maxTotalReconnectAttempts})`,
            );

            reconnectTimeoutRef.current = setTimeout(() => {
              closedByUsRef.current = false;
              connect();
            }, delay);
          } else {
            const reason = isTerminalRef.current
              ? "job in terminal state"
              : reconnectAttempts.current >= maxReconnectAttempts
                ? "max cycle attempts reached"
                : totalReconnectAttempts.current >= maxTotalReconnectAttempts
                  ? "max total attempts reached"
                  : "connection not closed";
            console.error(
              `SSE reconnection stopped for job ${jobId}: ${reason}`,
            );
            setState((prev) => ({
              ...prev,
              error:
                totalReconnectAttempts.current >= maxTotalReconnectAttempts
                  ? "Connection failed after multiple attempts. Please refresh the page."
                  : "Connection lost",
            }));
          }
        };
      } catch (error) {
        console.error(
          `Failed to create SSE connection for job ${jobId}:`,
          error,
        );
        isConnectingRef.current = false;
        setState((prev) => ({
          ...prev,
          error: "Failed to connect",
        }));
      }
    };

    connect();

    return () => {
      isConnectingRef.current = false;
      isTerminalRef.current = false;
      closedByUsRef.current = true;
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [jobId]);

  return state;
}
