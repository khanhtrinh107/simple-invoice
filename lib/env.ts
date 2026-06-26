import { env } from "process";

const required = [
  "AUTH_CLIENT_ID",
  "AUTH_CLIENT_SECRET",
  "AUTH_API_URL",
  "MEMBERSHIP_API_URL",
  "INVOICE_API_URL",
] as const;

type EnvKey = (typeof required)[number];

function getEnv(key: EnvKey): string {
  const value = env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const authConfig = {
  clientId: getEnv("AUTH_CLIENT_ID"),
  clientSecret: getEnv("AUTH_CLIENT_SECRET"),
  tokenUrl: getEnv("AUTH_API_URL"),
} as const;

export const membershipApiUrl = getEnv("MEMBERSHIP_API_URL");
export const invoiceApiUrl = getEnv("INVOICE_API_URL");
