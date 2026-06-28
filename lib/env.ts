import { env } from "process";

// `requiredEnvKeys` is a runtime array of strings used to drive both the
// `EnvKey` type *and* the `getEnv` validator. We mark it explicitly so future
// readers don't strip it as "unused".
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const requiredEnvKeys = [
  "AUTH_CLIENT_ID",
  "AUTH_CLIENT_SECRET",
  "AUTH_API_URL",
  "MEMBERSHIP_API_URL",
  "INVOICE_API_URL",
] as const satisfies readonly string[];

type EnvKey = (typeof requiredEnvKeys)[number];

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
