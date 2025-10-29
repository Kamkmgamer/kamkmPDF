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
  const maxReconnectAttempts = 5;
  const isConnectingRef = useRef(false);
  const isTerminalRef = useRef(false);
  const closedByUsRef = useRef(false);

  useEffect(() => {
    if (!jobId) return;
    isTerminalRef.current = false;

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
          setState(prev => ({
            ...prev,
            isConnected: true,
            error: null,
          }));
          reconnectAttempts.current = 0;
        };

        eventSource.onmessage = (event) => {
          try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
            const data = JSON.parse(event.data);
            console.log(`SSE message for job ${jobId}:`, data);
            
            setState(prev => ({
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
            
            setState(prev => ({
              ...prev,
              lastUpdate: data,
            }));

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
              setState(prev => ({
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
          } catch (error) {
            console.error("Failed to parse SSE heartbeat:", error);
          }
        });

        eventSource.onerror = (error) => {
          // If we intentionally closed or the job reached a terminal state, ignore
          if (isTerminalRef.current || closedByUsRef.current) {
            return;
          }

          console.error(`SSE error for job ${jobId}:`, error);
          isConnectingRef.current = false;

          setState(prev => ({
            ...prev,
            isConnected: false,
            error: "Connection lost",
          }));

          // Close the current connection
          if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
          }

          // Attempt to reconnect with exponential backoff
          if (!isTerminalRef.current && reconnectAttempts.current < maxReconnectAttempts) {
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
            reconnectAttempts.current++;
            
            console.log(`Reconnecting SSE for job ${jobId} in ${delay}ms (attempt ${reconnectAttempts.current})`);
            
            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, delay);
          } else {
            console.error(`Max reconnection attempts reached for job ${jobId}`);
            setState(prev => ({
              ...prev,
              error: "Connection failed after multiple attempts",
            }));
          }
        };

      } catch (error) {
        console.error(`Failed to create SSE connection for job ${jobId}:`, error);
        isConnectingRef.current = false;
        setState(prev => ({
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
