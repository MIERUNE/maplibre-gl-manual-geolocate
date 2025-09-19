import { defineConfig } from "vite";

// Demo/GitHub Pages build configuration
export default defineConfig({
  base: "/maplibre-gl-mock-geolocate/",
  build: {
    outDir: "demo-dist",
  },
});
