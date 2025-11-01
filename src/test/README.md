# Test Setup Guide

This directory contains testing utilities and configuration for the PDFPrompt project.

## Setup

### 1. Environment Variables

Create a `.env.test` file in the project root with test-specific environment variables. You can use `env.test.template` as a starting point:

```bash
cp env.test.template .env.test
```

Edit `.env.test` and fill in the test credentials. **Important:** Use a separate test database to avoid affecting production or development data.

### 2. Test Database

The test database needs to be set up before running tests:

```bash
# Setup and migrate test database
pnpm tsx scripts/setup-test-db.ts setup

# Clean test database (remove all data)
pnpm tsx scripts/setup-test-db.ts cleanup
```

## Running Tests

### Unit Tests (Vitest)

```bash
# Run all unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### E2E Tests (Playwright)

```bash
# Run E2E tests
pnpm test:e2e

# Run E2E tests in UI mode
pnpm test:e2e:ui

# Run E2E tests in debug mode
pnpm test:e2e:debug
```

## Test Files

- `setup.ts` - Global test setup and configuration
- `db-setup.ts` - Database utilities for testing
- `README.md` - This file

## Writing Tests

### Unit Tests

Create test files with `.test.ts` or `.spec.ts` extension:

```typescript
import { describe, it, expect } from "vitest";

describe("MyComponent", () => {
  it("should work", () => {
    expect(true).toBe(true);
  });
});
```

### E2E Tests

Create test files in `src/e2e/` directory with `.spec.ts` extension:

```typescript
import { test, expect } from "@playwright/test";

test("my test", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Expected Title/);
});
```

## Best Practices

1. **Isolation**: Each test should be independent and not rely on other tests
2. **Cleanup**: Clean up test data after each test
3. **Mock External Services**: Use mocks for external APIs and services
4. **Use Test Database**: Always use a separate test database
5. **Coverage**: Aim for >70% code coverage overall, >90% for critical paths
