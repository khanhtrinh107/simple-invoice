import "@testing-library/jest-dom/vitest";

// Provide dummy env values so modules that read `process.env` at import
// time (e.g. `lib/env.ts`) don't throw `Missing required environment variable`
// during unit tests. Real values are not needed because these tests never
// make live network calls.
process.env.AUTH_CLIENT_ID ??= "test-client-id";
process.env.AUTH_CLIENT_SECRET ??= "test-client-secret";
process.env.AUTH_API_URL ??= "https://example.test/oauth2/token";
process.env.MEMBERSHIP_API_URL ??= "https://example.test/membership-service";
process.env.INVOICE_API_URL ??= "https://example.test/invoice-service";