import { pino } from "pino";

export const logger = pino({
  level: process.env.NODE_ENV === "development" ? "debug" : "info",
  // transport is disabled in dev to avoid worker thread issues with Next.js
  transport: undefined,
});

// Audit logger for security and compliance events
export const auditLogger = pino({
  level: "info",
  transport: undefined, // Disabled to avoid worker thread issues in serverless environments
});

// Helper functions for audit logging
export const audit = {
  userAction: (
    userId: string | null,
    action: string,
    details: Record<string, unknown>,
  ) => {
    auditLogger.info({
      type: "USER_ACTION",
      userId,
      action,
      details,
      timestamp: new Date().toISOString(),
    });
  },

  authEvent: (
    userId: string | null,
    event: string,
    details: Record<string, unknown>,
  ) => {
    auditLogger.info({
      type: "AUTH_EVENT",
      userId,
      event,
      details,
      timestamp: new Date().toISOString(),
    });
  },

  dataChange: (
    userId: string,
    table: string,
    operation: string,
    recordId: string,
    changes: Record<string, unknown>,
  ) => {
    auditLogger.info({
      type: "DATA_CHANGE",
      userId,
      table,
      operation,
      recordId,
      changes,
      timestamp: new Date().toISOString(),
    });
  },

  securityEvent: (event: string, details: Record<string, unknown>) => {
    auditLogger.warn({
      type: "SECURITY_EVENT",
      event,
      details,
      timestamp: new Date().toISOString(),
    });
  },

  error: (error: Error, context: Record<string, unknown>) => {
    auditLogger.error({
      type: "ERROR",
      error: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
    });
  },
};
