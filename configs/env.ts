/**
 * Environment configuration.
 * 
 * Set the ENVIRONMENT variable to switch environments:
 *   ENVIRONMENT=staging npm test
 *   ENVIRONMENT=preprod npm test
 *   ENVIRONMENT=production npm test
 * 
 * Or use the npm scripts: npm run test:staging, npm run test:preprod, npm run test:prod
 */

export interface EnvConfig {
    name: string;
    baseURL: string;
    apiURL: string;
}

export const environments: Record<string, EnvConfig> = {
  staging: {
    name: "staging",
    baseURL: process.env.STAGING_BASE_URL || "https://gatotkaca.tiket.com",
    apiURL: process.env.STAGING_API_URL || "https://gatotkaca.tiket.com",
  },
  preprod: {
    name: "preprod",
    baseURL: process.env.PREPROD_BASE_URL || "https://preprod.tiket.com",
    apiURL: process.env.PREPROD_API_URL || "https://preprod.tiket.com",
  },
  production: {
    name: "production",
    baseURL: process.env.PRODUCTION_BASE_URL || "https://tiket.com",
    apiURL: process.env.PRODUCTION_API_URL || "https://tiket.com",
  }
};

export const getEnvironment = (): EnvConfig => {
  const environment = process.env.ENVIRONMENT || "preprod";
  if (!environments[environment]) {
    throw new Error(`Environment "${environment}" is not defined. Available: ${Object.keys(environments).join(", ")}`);
  }
  return environments[environment];
};