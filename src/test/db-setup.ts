/**
 * Test Database Setup
 *
 * This script sets up a test database for running tests.
 * It creates a separate database instance and runs migrations.
 */

import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as schema from "~/server/db/schema";

// Use a separate test database URL
const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;

let testDb: ReturnType<typeof drizzle>;
let testConn: postgres.Sql;

/**
 * Initialize the test database connection and run migrations
 */
export async function setupTestDatabase() {
  if (!TEST_DATABASE_URL) {
    throw new Error(
      "TEST_DATABASE_URL or DATABASE_URL must be set for test database setup",
    );
  }

  testConn = postgres(TEST_DATABASE_URL, { max: 1 });
  testDb = drizzle(testConn, { schema });

  // Run migrations
  await migrate(testDb, { migrationsFolder: "./drizzle" });

  return { db: testDb, conn: testConn };
}

/**
 * Clean up test database - truncate all tables
 */
export async function cleanupTestDatabase() {
  if (!testDb) {
    throw new Error("Test database not initialized");
  }

  // Truncate all tables in the correct order (respecting foreign keys)
  const tableNames = Object.keys(schema).filter((key) =>
    key.startsWith("pdfprompt_"),
  );

  for (const tableName of tableNames) {
    try {
      await testConn`TRUNCATE TABLE ${testConn(tableName)} CASCADE`;
    } catch (error) {
      console.error(`Error truncating table ${tableName}:`, error);
    }
  }
}

/**
 * Close the test database connection
 */
export async function teardownTestDatabase() {
  if (testConn) {
    await testConn.end();
  }
}

/**
 * Get the test database instance
 */
export function getTestDb() {
  if (!testDb) {
    throw new Error(
      "Test database not initialized. Call setupTestDatabase() first",
    );
  }
  return testDb;
}
