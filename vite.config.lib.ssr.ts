import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

// SSR-safe library build configuration
export default defineConfig({
  plugins: [dts({ rollupTypes: true })],
  build: {
    lib: {
      entry: "src/index.ssr.ts",
      name: "MaplibreGlManualGeolocate",
      fileName: "maplibre-gl-manual-geolocate.ssr",
    },
    rollupOptions: {
      external: ["maplibre-gl"],
      output: {
        globals: {
          "maplibre-gl": "maplibregl",
        },
      },
    },
  },
});
