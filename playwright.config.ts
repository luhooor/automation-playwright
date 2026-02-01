import { defineConfig, devices } from "@playwright/test";
import { getEnvironment } from "#configs/env";
import "dotenv/config";

const environment = getEnvironment();

export default defineConfig({
    testDir: "./src/tests",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: [["html", { open: "never" }]],
    use: {
        trace: "on-first-retry",
        screenshot: "only-on-failure",
        video: "retain-on-failure",
        baseURL: environment.baseURL,
        launchOptions: {
            args: [
                "--disable-features=WebAuthentication",
                "--disable-blink-features=PublicKeyCredential",
            ],
        },
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
            name: "chromium",
            testMatch: /ui\/.*\.spec\.ts/,
            use: { ...devices["Desktop Chrome"], channel: "chrome" },
        },

        {
            name: "firefox",
            testMatch: /ui\/.*\.spec\.ts/,
            use: { ...devices["Desktop Firefox"] },
        },

        {
            name: "webkit",
            testMatch: /ui\/.*\.spec\.ts/,
            use: { ...devices["Desktop Safari"] },
        },
        {
            name: "mobile-chrome",
            testMatch: /ui\/.*\.spec\.ts/,
            use: { ...devices["Pixel 7"] },
        },
        {
            name: "mobile-safari",
            testMatch: /ui\/.*\.spec\.ts/,
            use: { ...devices["iPhone 15"] },
        },
    ],
    timeout: 30000,
});
