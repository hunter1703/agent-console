import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev",
    url: baseURL,
    reuseExistingServer: true,
    env: {
      NEXT_PUBLIC_MOCK_MODE: "false",
      NEXT_PUBLIC_API_BASE_URL: "/api",
      BACKEND_URL: process.env.BACKEND_URL || "http://localhost:18080",
    },
  },
  projects: [
    {
      name: "chromium-mock",
      use: { ...devices["Desktop Chrome"] },
      grepInvert: /@live/,
    },
    {
      name: "chromium-mobile-mock",
      use: { ...devices["iPhone 13"], browserName: "chromium" },
      grepInvert: /@live/,
    },
    {
      name: "chromium-live-smoke",
      use: { ...devices["Desktop Chrome"] },
      grep: /@live/,
    },
  ],
});
