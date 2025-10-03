import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

// Library build configuration
export default defineConfig({
  plugins: [dts({ rollupTypes: true })],
  build: {
    lib: {
      entry: "src/index.ts",
      name: "MaplibreGlManualGeolocate",
      fileName: "maplibre-gl-manual-geolocate",
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
