import { defineConfig, devices } from "@playwright/test";
import "dotenv/config";

process.env.E2E ??= "true";
process.env.ADMIN_EMAIL ??= "admin@threadline.com";
process.env.ADMIN_PASSWORD ??= "test-admin-password";
process.env.ADMIN_JWT_SECRET ??= "test-admin-secret";
process.env.JWT_SECRET ??= "secret";
process.env.NEXT_PUBLIC_ADMIN_URL ??= "http://localhost:3002";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["list"]],
  use: {
    trace: "on-first-retry",
    testIdAttribute: "data-test-id",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "web-chromium",
      testDir: "./tests/web",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "http://localhost:3001",
      },
    },
    {
      name: "admin-chromium",
      testDir: "./tests/admin",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "http://localhost:3002",
      },
    },
  ],
  webServer: [
    {
      command: "pnpm --filter @repo/web exec next start -p 3001",
      reuseExistingServer: true,
      timeout: 120_000,
      url: "http://localhost:3001",
    },
    {
      command: "pnpm --filter @repo/admin exec next start -p 3002",
      reuseExistingServer: true,
      timeout: 120_000,
      url: "http://localhost:3002",
    },
  ],
});
