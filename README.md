# Playwright Automation Framework

A TypeScript-based Playwright testing framework for UI and API testing with multi-environment support, Google Sheets test data integration, and comprehensive logging.

## Quick Start

### Prerequisites

- Node.js v18+
- npm

### Installation

```bash
npm install
npx playwright install
```

### Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

## Running Tests

### All Tests

```bash
npm test                    # Default (preprod)
npm run test:staging        # Staging environment
npm run test:preprod        # Preproduction environment
npm run test:prod           # Production environment
```

### UI Tests

```bash
npm run test:ui
npm run test:ui:staging
npm run test:ui:preprod
npm run test:ui:prod
```

### API Tests

```bash
npm run test:api
npm run test:api:staging
npm run test:api:preprod
npm run test:api:prod
```

### Debug & Development

```bash
npm run test:headed         # Run with visible browser
npm run test:debug          # Run in debug mode
npm run test:codegen        # Generate test code
npm run report              # View HTML report
```

### Run Specific Test

```bash
npm run test:chrome:case "test name"
npm run test:chrome:case:headed "test name"
```

## Code Quality

```bash
npm run typecheck           # TypeScript type checking
npm run lint                # ESLint
npm run lint:fix            # ESLint with auto-fix
npm run format              # Prettier formatting
npm run format:check        # Check formatting
```

## Project Structure

```
playwright-automation/
├── configs/
│   ├── env.ts              # Environment configuration
│   └── index.ts            # Barrel export
├── src/
│   ├── pages/
│   │   ├── ui/
│   │   │   └── tiket/
│   │   │       └── login.page.ts
│   │   └── index.ts        # Barrel export
│   ├── tests/
│   │   ├── api/
│   │   │   └── example.spec.ts
│   │   └── ui/
│   │       └── tiket/
│   │           └── login/
│   │               └── login.spec.ts
│   └── utils/
│       ├── fixtures.ts     # Custom test fixtures
│       ├── google-sheets.ts# Google Sheets integration
│       ├── logger.ts       # Winston logger with annotations
│       ├── test-helpers.ts # Environment helpers
│       └── index.ts        # Barrel export
├── logs/                   # Log files (auto-generated)
├── playwright-report/      # HTML reports (auto-generated)
├── test-results/           # Test artifacts (auto-generated)
├── .env.example            # Environment template
├── .prettierrc             # Prettier config
├── eslint.config.js        # ESLint config
├── playwright.config.ts    # Playwright config
└── tsconfig.json           # TypeScript config
```

## Import Aliases

The project uses Node.js subpath imports for clean paths:

```typescript
import { test, expect } from "#utils/fixtures";
import { LoginPage } from "#pages/ui/tiket/login.page";
import { getEnvironment } from "#configs/env";
```

| Alias        | Path          |
| ------------ | ------------- |
| `#utils/*`   | `src/utils/*` |
| `#pages/*`   | `src/pages/*` |
| `#configs/*` | `configs/*`   |

## Environment Configuration

### Supported Environments

| Environment | Base URL                    |
| ----------- | --------------------------- |
| staging     | https://gatotkaca.tiket.com |
| preprod     | https://preprod.tiket.com   |
| production  | https://tiket.com           |

### Setting Environment

```bash
# Via npm scripts
npm run test:staging

# Via environment variable
ENVIRONMENT=staging npm test

# Via .env file
ENVIRONMENT=staging
```

## Google Sheets Integration

Test data can be managed via Google Sheets. Configure in `.env`:

```bash
SHEET_ID=your-google-sheet-id
SHEET_EMAIL=your-service-account@project.iam.gserviceaccount.com
SHEET_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
```

### Test Data Format

Tests using the `testData` fixture must have titles starting with a Test ID:

```typescript
import { test } from "#utils/fixtures";

test("TIK001 - login with valid credentials", async ({ testData }) => {
    const { email, password } = testData.data;
});
```

### Expected Sheet Columns

| Column         | Description                                |
| -------------- | ------------------------------------------ |
| Test ID        | Unique identifier (e.g., TIK001)           |
| Description    | Test case description                      |
| Daily Run      | "Y" or "N"                                 |
| Regression     | "Y" or "N"                                 |
| Smoke Test     | "Y" or "N"                                 |
| Data - Staging | Test data (format: `key1:val1, key2:val2`) |
| Data - Preprod | Test data for preprod                      |
| Data - Prod    | Test data for production                   |

## Logging

The framework includes Winston logger with Playwright HTML report annotations:

```typescript
import { logger, annotations } from "#utils/logger";

logger.info("Regular log"); // Console + file only
annotations.info("Annotated log"); // Console + file + HTML report
```

## Test Reports

View the HTML report after test execution:

```bash
npm run report
```

Reports include:

- Test results with annotations
- Screenshots (on failure)
- Videos (on failure)
- Traces (on first retry)

## Writing Tests

### Page Object Model

```typescript
// src/pages/ui/example/example.page.ts
import { Page, Locator, expect } from "@playwright/test";

export class ExamplePage {
    readonly submitButton: Locator;

    constructor(private readonly page: Page) {
        this.submitButton = page.getByRole("button", { name: "Submit" });
    }

    async goto(): Promise<void> {
        await this.page.goto("/example");
    }

    async submit(): Promise<void> {
        await this.submitButton.click();
    }
}
```

### Test with Google Sheets Data

```typescript
import { test } from "#utils/fixtures";
import { ExamplePage } from "#pages/ui/example/example.page";

test("TIK001 - example test", async ({ page, testData }) => {
    const examplePage = new ExamplePage(page);
    const { username } = testData.data;

    await test.step("Navigate to page", async () => {
        await examplePage.goto();
    });

    await test.step("Submit form", async () => {
        await examplePage.submit();
    });
});
```

### Standard Playwright Test

```typescript
import { test, expect } from "@playwright/test";

test("example test", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Example/);
});
```
