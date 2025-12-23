import { defineConfig, devices } from "@playwright/test";
import { getEnvironment } from "./configs/env";

const environment = getEnvironment();

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    baseURL: environment.baseURL,
  },

  projects: [
    {
      name: "API",
      testMatch: /api\/.*\.spec\.ts/,
      use: {
        baseURL: environment.apiURL,
      },
    },

    {
      name: "UI - Chromium",
      testMatch: /ui\/.*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },

    {
      name: "UI - Firefox",
      testMatch: /ui\/.*\.spec\.ts/,
      use: { ...devices["Desktop Firefox"] },
    },

    {
      name: "UI - Webkit",
      testMatch: /ui\/.*\.spec\.ts/,
      use: { ...devices["Desktop Safari"] },
    },
  ],
});
