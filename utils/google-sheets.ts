import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import { getEnvironment } from "../configs/env";
import "dotenv/config";

const SHEET_ID = process.env.SHEET_ID || "";
const SHEET_EMAIL = process.env.SHEET_EMAIL || "";
const SHEET_KEY = (process.env.SHEET_KEY || "").replace(/\\n/g, '\n');

let doc: GoogleSpreadsheet | null = null;

async function getDoc() {
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

export async function getSheetData() {
    const document = await getDoc();
    const sheet = document.sheetsByIndex[0];
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

function parseDataString(dataStr: string | undefined): TestData {
    if (!dataStr || dataStr === "-" || dataStr.trim() === "") return {};

    const data: TestData = {};
    const pairs = dataStr.split(",").map(p => p.trim());

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

    return rows.map((row: any) => {
        let dataStr = "";
        const envName = environment.name.toLowerCase();

        if (envName === "staging") {
            dataStr = row.get("Data - Staging");
        } else if (envName === "preprod") {
            dataStr = row.get("Data - Preprod");
        } else if (envName === "production" || envName === "prod") {
            dataStr = row.get("Data - Prod");
        }

        return {
            testId: row.get("Test ID"),
            description: row.get("Description"),
            dailyRun: row.get("Daily Run")?.toLowerCase() === "y",
            regression: row.get("Regression")?.toLowerCase() === "y",
            smokeTest: row.get("Smoke Test")?.toLowerCase() === "y",
            data: parseDataString(dataStr)
        };
    });
}

export async function getTestDataById(testId: string): Promise<TestRow | undefined> {
    const allData = await getAllTestData();
    const testData = allData.find(d => d.testId === testId);
    if (!testData) {
        throw new Error(`Test data for ${testId} not found in Google Sheet`);
    }
    console.log("Running test: ", testData.testId);
    console.log("Test data: ", testData.data);
    return testData;
}

export function shouldRunTest(testRow: TestRow | undefined, suite: 'regression' | 'smoke' | 'daily' | 'all' = 'all'): boolean {
    if (!testRow) return false;

    if (!testRow.dailyRun) return false;

    if (suite === 'regression') return testRow.regression;
    if (suite === 'smoke') return testRow.smokeTest;

    return true;
}
