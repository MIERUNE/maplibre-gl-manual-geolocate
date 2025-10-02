import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "dist/",
        "demo-dist/",
        "tests/",
        "**/*.config.*",
        "**/types.ts",
        "src/main.ts",
        "src/vite-env.d.ts",
      ],
    },
  },
});
