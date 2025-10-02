import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

// Library build configuration
export default defineConfig({
  plugins: [dts({ rollupTypes: true })],
  build: {
    lib: {
      entry: "src/index.ts",
      name: "MaplibreGlMockGeolocate",
      fileName: "maplibre-gl-mock-geolocate",
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
