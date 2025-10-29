import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    browser: {
      provider: "playwright", // or 'webdriverio'
      enabled: true,
      name: "chromium", // browser name is required
      headless: true,
    },
    coverage: {
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/test/",
        "*.config.ts",
        "src/main.ts",
        "src/vite-env.d.ts",
      ],
    },
  },
});
