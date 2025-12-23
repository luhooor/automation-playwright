# Playwright Automation Framework

A comprehensive Playwright testing framework for both UI and API testing with multi-environment support (Staging, Preproduction, Production).

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository** (if applicable) or navigate to the project directory:

   ```bash
   cd playwright-automation
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Install Playwright browsers**:

   ```bash
   npx playwright install
   ```

4. **Configure environment variables** (optional):

   Create a `.env` file in the root directory (or set environment variables):

   ```bash
   # Default environment (if not set, defaults to preprod)
   ENVIRONMENT=preprod

   # Staging Environment URLs
   STAGING_BASE_URL=https://gatotkaca.tiket.com
   STAGING_API_URL=https://gatotkaca.tiket.com

   # Preproduction Environment URLs
   PREPROD_BASE_URL=https://preprod.tiket.com
   PREPROD_API_URL=https://preprod.tiket.com

   # Production Environment URLs
   PRODUCTION_BASE_URL=https://tiket.com
   PRODUCTION_API_URL=https://tiket.com
   ```

## 🧪 Running Tests

### Run All Tests

```bash
# Default environment (preprod)
npm test

# Specific environment
npm run test:staging
npm run test:preprod
npm run test:prod
```

### Run UI Tests Only

```bash
# Default environment
npm run test:ui

# Specific environment
npm run test:ui:staging
npm run test:ui:preprod
npm run test:ui:prod
```

### Run API Tests Only

```bash
# Default environment
npm run test:api

# Specific environment
npm run test:api:staging
npm run test:api:preprod
npm run test:api:prod
```

### Other Useful Commands

```bash
# Run tests in headed mode (see browser)
npm run test:headed

# Run tests in debug mode
npm run test:debug

# Generate test code using Playwright Codegen
npm run test:codegen

# View test report
npm run test:report
# or
npm run report
```

## 🌍 Environment Configuration

The project supports three environments:

- **Staging**: `https://gatotkaca.tiket.com`
- **Preproduction**: `https://preprod.tiket.com` (default)
- **Production**: `https://tiket.com`

### Setting Environment

You can set the environment in three ways:

1. **Using npm scripts** (recommended):

   ```bash
   npm run test:staging
   npm run test:preprod
   npm run test:prod
   ```

2. **Using environment variable**:

   ```bash
   ENVIRONMENT=staging npm test
   ENVIRONMENT=preprod npm test
   ENVIRONMENT=production npm test
   ```

3. **Using .env file**:
   ```bash
   ENVIRONMENT=staging
   ```

### Customizing Environment URLs

You can override the default URLs by setting environment variables:

```bash
# For staging
STAGING_BASE_URL=https://your-staging-url.com
STAGING_API_URL=https://api.your-staging-url.com

# For preproduction
PREPROD_BASE_URL=https://your-preprod-url.com
PREPROD_API_URL=https://api.your-preprod-url.com

# For production
PRODUCTION_BASE_URL=https://your-prod-url.com
PRODUCTION_API_URL=https://api.your-prod-url.com
```

## 📁 Project Structure

```
playwright-automation/
├── configs/
│   └── env.ts              # Environment configuration
├── utils/
│   └── test-helpers.ts     # Test utility functions
├── tests/
│   ├── ui/                 # UI test cases
│   │   ├── example.spec.ts
│   │   └── tiket/
│   │       └── common/
│   │           └── login.spec.ts
│   └── api/                # API test cases
│       └── example.spec.ts
├── screenshots/            # Screenshots from test runs
├── test-results/           # Test execution results
├── playwright-report/      # HTML test reports
├── playwright.config.ts    # Playwright configuration
├── package.json
├── tsconfig.json
└── README.md
```

## 📊 Test Reports

After running tests, view the HTML report:

```bash
npm run report
```

The report includes:

- Test execution results
- Screenshots (on failure)
- Videos (on failure)
- Traces (on first retry)

## 🎯 Best Practices

1. **Use environment helpers**: Always use `getBaseUrl()` and `getApiUrl()` instead of hardcoding URLs
2. **Environment-specific tests**: Use environment variables to conditionally run tests
3. **Page Object Model**: Consider using Page Object Model for complex UI tests
4. **Test isolation**: Each test should be independent and not rely on other tests
5. **Meaningful test names**: Use descriptive test names that explain what is being tested
