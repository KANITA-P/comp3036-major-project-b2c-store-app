import { defineConfig, devices } from "@playwright/test";
import { config as loadEnv } from "dotenv";
import path from "node:path";

loadEnv({ path: path.resolve(process.cwd(), "../../.env") });

process.env.E2E ??= "true";
process.env.ADMIN_EMAIL ??= "admin@threadline.com";
process.env.ADMIN_PASSWORD ??= "test-admin-password";
process.env.ADMIN_JWT_SECRET ??= "test-admin-secret";
process.env.JWT_SECRET ??= "secret";
process.env.NEXT_PUBLIC_ADMIN_URL ??= "http://localhost:3002";
process.env.NEXT_PUBLIC_WEB_URL ??= "http://localhost:3001";

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
      name: "test-1",
      testDir: "./tests/test-1",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "http://localhost:3001",
      },
    },
    {
      name: "test-2",
      testDir: "./tests/test-2",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "http://localhost:3002",
      },
    },
    {
      name: "test-3",
      testDir: "./tests/test-3",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "http://localhost:3001",
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
