import { defineConfig } from "vite";

// Library build configuration
export default defineConfig({
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
