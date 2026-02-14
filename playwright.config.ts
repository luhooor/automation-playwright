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
            slowMo: 200
        }
    },

    projects: [
        {
            name: "chromium",
            testMatch: /ui\/.*\.spec\.ts/,
            use: {
                ...devices["Desktop Chrome"], channel: "chrome", launchOptions: {
                    args: [
                        "--disable-features=WebAuthentication",
                        "--disable-blink-features=PublicKeyCredential",
                    ],
                }
            },
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
            use: {
                ...devices["Pixel 7"], launchOptions: {
                    args: [
                        "--disable-features=WebAuthentication",
                        "--disable-blink-features=PublicKeyCredential",
                    ],
                }
            },
        },
        {
            name: "mobile-safari",
            testMatch: /ui\/.*\.spec\.ts/,
            use: { ...devices["iPhone 15"] },
        },
    ],
    timeout: 30000,
});
