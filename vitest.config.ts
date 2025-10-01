import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test-setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "dist/",
        "demo-dist/",
        "**/*.config.*",
        "**/types.ts",
        "src/main.ts",
        "src/vite-env.d.ts",
        "src/test-setup.ts",
      ],
    },
  },
});
