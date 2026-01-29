/**
 * Helper functions for accessing environment config in tests.
 * 
 * Usage:
 *   import { getBaseUrl, getApiUrl } from "../utils/test-helpers";
 *   const url = getBaseUrl(); // returns the baseURL for current environment
 */

import { getEnvironment, EnvConfig } from "../../configs/env";

export function getBaseUrl(): string {
  return getEnvironment().baseURL;
}

export function getApiUrl(): string {
  return getEnvironment().apiURL;
}

export function getEnvironmentName(): string {
  return getEnvironment().name;
}

/** Returns the full environment config object */
export function getCurrentEnvironment(): EnvConfig {
  return getEnvironment();
}
