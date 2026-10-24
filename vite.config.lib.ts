import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

// Library build configuration
export default defineConfig({
  plugins: [dts({ rollupTypes: true })],
  build: {
    lib: {
      entry: "src/index.ts",
      // maplibre-gl v6 is ESM-only, so this library ships ESM only as well
      formats: ["es"],
      fileName: "maplibre-gl-manual-geolocate",
    },
    rollupOptions: {
      external: ["maplibre-gl"],
    },
  },
});
