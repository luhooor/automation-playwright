/**
 * Google Sheets integration for test data management.
 *
 * Expected sheet columns:
 *   - Test ID: Unique identifier (e.g., TIK001)
 *   - Description: Test case description
 *   - Daily Run: "Y" or "N" - whether to run in daily suite
 *   - Regression: "Y" or "N" - whether to run in regression suite
 *   - Smoke Test: "Y" or "N" - whether to run in smoke suite
 *   - Data - Staging: Test data for staging (format: "key1:value1, key2:value2")
 *   - Data - Preprod: Test data for preprod
 *   - Data - Prod: Test data for production
 */

import { GoogleSpreadsheet, GoogleSpreadsheetRow } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import { getEnvironment } from "../../configs/env";
import "dotenv/config";
import { annotations } from "./logger";

const SHEET_ID = process.env.SHEET_ID || "";
const SHEET_EMAIL = process.env.SHEET_EMAIL || "";
const SHEET_KEY = (process.env.SHEET_KEY || "").replace(/\\n/g, "\n");

let doc: GoogleSpreadsheet | null = null;

async function getDoc(): Promise<GoogleSpreadsheet> {
    if (doc) return doc;

    const auth = new JWT({
        email: SHEET_EMAIL,
        key: SHEET_KEY,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    doc = new GoogleSpreadsheet(SHEET_ID, auth);
    await doc.loadInfo();
    return doc;
}

export async function getSheetData(): Promise<GoogleSpreadsheetRow[]> {
    const document = await getDoc();
    const sheet = document.sheetsByIndex[0];
    if (!sheet) {
        throw new Error("No sheet found at index 0");
    }
    const rows = await sheet.getRows();
    return rows;
}

export interface TestData {
    [key: string]: string;
}

export interface TestRow {
    testId: string;
    description: string;
    dailyRun: boolean;
    regression: boolean;
    smokeTest: boolean;
    data: TestData;
}

type TestSuite = "regression" | "smoke" | "daily" | "all";

function parseDataString(dataStr: string | undefined): TestData {
    if (!dataStr || dataStr === "-" || dataStr.trim() === "") return {};

    const data: TestData = {};
    const pairs = dataStr.split(",").map((p) => p.trim());

    for (const pair of pairs) {
        const separatorIndex = pair.indexOf(":");
        if (separatorIndex !== -1) {
            const key = pair.substring(0, separatorIndex).trim();
            const value = pair.substring(separatorIndex + 1).trim();
            if (key) {
                data[key] = value;
            }
        }
    }

    return data;
}

export async function getAllTestData(): Promise<TestRow[]> {
    const environment = getEnvironment();
    const rows = await getSheetData();

    return rows.map((row: GoogleSpreadsheetRow) => {
        let dataStr: string | undefined = "";
        const envName = environment.name.toLowerCase();

        if (envName === "staging") {
            dataStr = row.get("Data - Staging") as string | undefined;
        } else if (envName === "preprod") {
            dataStr = row.get("Data - Preprod") as string | undefined;
        } else if (envName === "production" || envName === "prod") {
            dataStr = row.get("Data - Prod") as string | undefined;
        }

        return {
            testId: (row.get("Test ID") as string) ?? "",
            description: (row.get("Description") as string) ?? "",
            dailyRun: (row.get("Daily Run") as string)?.toLowerCase() === "y",
            regression:
                (row.get("Regression") as string)?.toLowerCase() === "y",
            smokeTest: (row.get("Smoke Test") as string)?.toLowerCase() === "y",
            data: parseDataString(dataStr),
        };
    });
}

export async function getTestDataById(testId: string): Promise<TestRow> {
    const allData = await getAllTestData();
    const testData = allData.find((d) => d.testId === testId);
    if (!testData) {
        throw new Error(`Test data for ${testId} not found in Google Sheet`);
    }
    annotations.info(`Running Test ID: ${testData.testId}`);
    annotations.info(`Test Name: ${testData.description}`);
    annotations.info(`Test data:\n ${JSON.stringify(testData.data, null, 2)}`);
    return testData;
}

export function shouldRunTest(
    testRow: TestRow | undefined,
    suite: TestSuite = "all"
): boolean {
    if (!testRow) return false;

    if (!testRow.dailyRun) return false;

    if (suite === "regression") return testRow.regression;
    if (suite === "smoke") return testRow.smokeTest;

    return true;
}
