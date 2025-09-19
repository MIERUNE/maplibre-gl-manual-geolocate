import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
  // Check if we're building the demo (for GitHub Pages)
  const isDemo = mode === "demo";

  if (isDemo) {
    // Configuration for demo site (GitHub Pages)
    return {
      base: "/maplibre-gl-mock-geolocate/", // Repository name for GitHub Pages
      build: {
        outDir: "demo-dist", // Separate output directory for demo
      },
    };
  }

  // Default configuration for library mode
  return {
    // Library Mode
    // https://vite.dev/guide/build.html#library-mode
    build: {
      lib: {
        entry: "src/index.ts",
        name: "MaplibreGlMockGeolocate", // Global variable name for UMD builds
        fileName: "maplibre-gl-mock-geolocate", // Base name for output files
      },
      rollupOptions: {
        external: ["maplibre-gl"], // Exclude them from the bundle
        output: {
          globals: {
            "maplibre-gl": "maplibregl", // Maps "maplibre-gl" imports to `window.maplibregl`
          },
        },
      },
    },
  };
});
