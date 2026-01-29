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
import { getTestDataById, shouldRunTest, TestRow } from "./google-sheets";

export type TestFixtures = {
    testData: TestRow;
};

export const test = base.extend<TestFixtures>({
    testData: async ({ }, use, testInfo) => {
        const match = testInfo.title.match(/^([A-Z0-9]+)\s*-/);
        const testId = match ? match[1] : null;

        if (!testId) {
            base.skip(true, `${testId} is not found in test data sheet`);
            return;
        }

        const row = await getTestDataById(testId);
        if (!row) {
            base.skip(true, `Test data for ${testId} not found in Google Sheet`);
            return;
        }

        const suite = (process.env.TEST_SUITE as any) || "all";
        const runStatus = shouldRunTest(row, suite);

        if (!runStatus) {
            base.skip(true, `Skipped ${testId}: Daily Run=${row.dailyRun}, ${suite}=${(row as any)[suite] ?? 'N/A'}`);
            return;
        }

        await use(row);
    },
});

export { expect } from "@playwright/test";
