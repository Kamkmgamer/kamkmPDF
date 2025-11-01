// Vitest setup file
import { beforeAll, afterAll, afterEach } from "vitest";

// Set up test environment variables BEFORE any imports happen
// This must be at the top level, not inside beforeAll
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
process.env.CLERK_SECRET_KEY = "sk_test_mock_key_for_testing";
process.env.UPLOADTHING_TOKEN = "mock_uploadthing_token";
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_mock_key";
process.env.SKIP_ENV_VALIDATION = "true";

// Setup before all tests
beforeAll(() => {
  // Test environment setup
});

// Cleanup after each test
afterEach(() => {
  // Clear all mocks if needed
  // vi.clearAllMocks();
});

// Cleanup after all tests
afterAll(() => {
  // Cleanup resources if needed
});
