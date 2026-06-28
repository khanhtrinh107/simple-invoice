import { defineConfig } from "vitest/config";
// Side-effect import: registers the React Testing Library plugin with Vitest
// so React components are transformed correctly in test files.
import "@testing-library/react";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
      "@/*": path.resolve(__dirname, "./"),
    },
  },
});
