import { EnvConfig, getEnvironment } from "../configs/env";

export function getBaseUrl(): string {
  return getEnvironment().baseURL;
}

export function getApiUrl(): string {
  return getEnvironment().apiURL;
}

export function getEnvironmentName(): string {
  return getEnvironment().name;
}

export function getCurrentEnvironment() {
  return getEnvironment();
}
