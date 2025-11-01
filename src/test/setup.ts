// Vitest setup file
import { beforeAll, afterAll, afterEach } from "vitest";

// Setup before all tests
beforeAll(() => {
  // Test environment setup
  // Environment variables should be set externally via .env.test
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
