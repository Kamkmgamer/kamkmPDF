import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "~/env";
import * as schema from "./schema";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

// Connection pool configuration for scalability
const connectionConfig: postgres.Options<Record<string, never>> = {
  max: Number(process.env.DATABASE_MAX_CONNECTIONS ?? 20), // Max connections per instance
  idle_timeout: Number(process.env.DATABASE_IDLE_TIMEOUT ?? 20), // Close idle after 20s
  connect_timeout: Number(process.env.DATABASE_CONNECT_TIMEOUT ?? 10), // Connection timeout 10s
  prepare: false, // Disable prepared statements for better pooling
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onnotice: () => {}, // Silence PostgreSQL notices
};

const conn = globalForDb.conn ?? postgres(env.DATABASE_URL, connectionConfig);
if (env.NODE_ENV !== "production") globalForDb.conn = conn;

export const db = drizzle(conn, { schema });
export const pg = conn;

// Log connection pool stats in production
if (env.NODE_ENV === "production") {
  console.log(
    `[db] Connection pool configured: max=${connectionConfig.max}, idle_timeout=${connectionConfig.idle_timeout}s`,
  );
}
