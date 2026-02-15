/**
 * Barrel export for utility modules.
 *
 * Usage:
 *   import { test, expect, logger, annotations, getBaseUrl } from "#utils";
 */

export { test, expect } from "#utils/fixtures";
export type { TestFixtures, TestSuite } from "#utils/fixtures";

export { logger, annotations } from "#utils/logger";

export {
    getSheetData,
    getAllTestData,
    getTestDataById,
    shouldRunTest,
} from "#utils/google-sheets";
export type { TestData, TestRow } from "#utils/google-sheets";

export {
    getBaseUrl,
    getEnvironmentName,
    getCurrentEnvironment,
} from "#utils/test-helpers";

export {
    generatePhoneNumber,
    generateFullName,
    generateEmail,
} from "#utils/common-functions";
