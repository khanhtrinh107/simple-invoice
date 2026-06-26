import { defineConfig } from "vitest/config";
import react from "@testing-library/react";
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
