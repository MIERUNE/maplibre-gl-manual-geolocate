import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MockGeolocateControl',
      fileName: 'maplibre-gl-mock-geolocate'
    },
    rollupOptions: {
      // Externalize maplibre-gl so it's not bundled
      external: ['maplibre-gl'],
      output: {
        // Global variable name for UMD build
        globals: {
          'maplibre-gl': 'maplibregl'
        }
      }
    }
  }
})