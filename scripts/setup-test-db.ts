#!/usr/bin/env tsx
/**
 * Test Database Setup CLI
 *
 * Usage:
 *   pnpm tsx scripts/setup-test-db.ts setup    - Setup and migrate test database
 *   pnpm tsx scripts/setup-test-db.ts cleanup  - Clean all data from test database
 *   pnpm tsx scripts/setup-test-db.ts teardown - Close database connection
 */

import {
  setupTestDatabase,
  cleanupTestDatabase,
  teardownTestDatabase,
} from "../src/test/db-setup";

async function main() {
  const command = process.argv[2];

  switch (command) {
    case "setup":
      console.log("Setting up test database...");
      await setupTestDatabase();
      console.log("✓ Test database setup complete");
      await teardownTestDatabase();
      break;

    case "cleanup":
      console.log("Cleaning up test database...");
      await setupTestDatabase();
      await cleanupTestDatabase();
      console.log("✓ Test database cleaned");
      await teardownTestDatabase();
      break;

    case "teardown":
      console.log("Tearing down test database...");
      await teardownTestDatabase();
      console.log("✓ Test database connection closed");
      break;

    default:
      console.error("Unknown command:", command);
      console.log("\nUsage:");
      console.log("  pnpm tsx scripts/setup-test-db.ts setup");
      console.log("  pnpm tsx scripts/setup-test-db.ts cleanup");
      console.log("  pnpm tsx scripts/setup-test-db.ts teardown");
      process.exit(1);
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
