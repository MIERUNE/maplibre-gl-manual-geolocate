import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

// Library build configuration
export default defineConfig({
  plugins: [dts({ rollupTypes: true })],
  build: {
    lib: {
      entry: {
        index: "src/index.ts",
        "index.ssr": "src/index.ssr.ts",
      },
      name: "MaplibreGlManualGeolocate",
      fileName: (format, entryName) => {
        if (entryName === "index.ssr") {
          return format === "es"
            ? "maplibre-gl-manual-geolocate.ssr.js"
            : "maplibre-gl-manual-geolocate.ssr.cjs";
        }
        return format === "es"
          ? "maplibre-gl-manual-geolocate.js"
          : "maplibre-gl-manual-geolocate.umd.cjs";
      },
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
