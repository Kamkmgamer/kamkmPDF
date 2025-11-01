import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("should load successfully", async ({ page }) => {
    await page.goto("/");

    // Wait for the page to load
    await page.waitForLoadState("networkidle");

    // Check if the page title contains expected text
    await expect(page).toHaveTitle(/PDF/i);
  });

  test("should have main navigation", async ({ page }) => {
    await page.goto("/");

    // Check for common navigation elements
    const nav = page.locator("nav, header");
    await expect(nav).toBeVisible();
  });
});
