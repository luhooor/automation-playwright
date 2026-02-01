/**
 * Custom test fixtures for Google Sheets integration.
 *
 * This fixture automatically fetches test data from Google Sheets based on the test ID.
 * Test titles MUST start with the Test ID pattern: "TIK001 - test description"
 *
 * Usage:
 *   import { test, expect } from "../utils/fixtures";
 *
 *   test("TIK001 - my test case", async ({ testData }) => {
 *       const { email, password } = testData.data;
 *       // ... your test code
 *   });
 *
 * If you don't need Google Sheets integration, use standard Playwright imports:
 *   import { test, expect } from "@playwright/test";
 */

import { test as base } from "@playwright/test";
import { getTestDataById, shouldRunTest, type TestRow } from "#utils/google-sheets";

export type TestSuite = "regression" | "smoke" | "daily" | "all";

export interface TestFixtures {
    testData: TestRow;
    disableWebAuthn: void;
}

/**
 * Script injected into pages to disable WebAuthn/Passkey functionality.
 * This prevents the native passkey dialog from appearing.
 */
const DISABLE_WEBAUTHN_SCRIPT = `
    // Override PublicKeyCredential to make it appear unsupported
    Object.defineProperty(window, 'PublicKeyCredential', {
        value: undefined,
        writable: false,
        configurable: false
    });
    
    // Override navigator.credentials methods
    if (navigator.credentials) {
        navigator.credentials.get = async () => null;
        navigator.credentials.create = async () => null;
        
        // Disable conditional mediation check
        if (navigator.credentials.conditionalMediationSupported) {
            navigator.credentials.conditionalMediationSupported = async () => false;
        }
    }
    
    // Override isConditionalMediationAvailable if it exists
    if (window.PublicKeyCredential?.isConditionalMediationAvailable) {
        window.PublicKeyCredential.isConditionalMediationAvailable = async () => false;
    }
`;

export const test = base.extend<TestFixtures>({
    disableWebAuthn: [async ({ context }, use) => {
        await context.addInitScript(DISABLE_WEBAUTHN_SCRIPT);
        await use();
    }, { auto: true }],

    testData: async ({}, use, testInfo) => {
        const match = testInfo.title.match(/^([A-Z0-9]+)\s*-/);
        const testId = match?.[1] ?? null;

        if (!testId) {
            base.skip(true, `Test ID not found in test title`);
            return;
        }

        const row = await getTestDataById(testId);
        if (!row) {
            base.skip(
                true,
                `Test data for ${testId} not found in Google Sheet`
            );
            return;
        }

        const suite = (process.env.TEST_SUITE as TestSuite) || "all";
        const runStatus = shouldRunTest(row, suite);

        if (!runStatus) {
            const suiteValue =
                suite === "regression"
                    ? row.regression
                    : suite === "smoke"
                        ? row.smokeTest
                        : suite === "daily"
                            ? row.dailyRun
                            : "N/A";
            base.skip(
                true,
                `Skipped ${testId}: Daily Run=${row.dailyRun}, ${suite}=${suiteValue}`
            );
            return;
        }

        await use(row);
    },
});

export { expect } from "@playwright/test";
