import { test as base } from "@playwright/test";
import { getTestDataById, shouldRunTest, TestRow } from "./google-sheets";
import { logger } from "./logger";

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
