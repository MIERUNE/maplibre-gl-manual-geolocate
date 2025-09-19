// Demo application for testing the library during development
// This file is loaded by `/index.html` when running the dev server
// Usage: `pnpm dev` then open http://localhost:5173
import "./style.css";
import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";
import { MockGeolocateControl } from "./index";

// Initialize the map
const map = new maplibregl.Map({
  container: "map",
  style: "https://demotiles.maplibre.org/style.json", // MapLibre demo tiles - officially free for demos
  center: [139.74135747, 35.65809922], // Tokyo
  zoom: 14, // Slightly closer for better detail
});

// Create mock geolocate control
const mockGeolocateControl = new MockGeolocateControl({
  position: { lng: 139.74135747, lat: 35.65809922 }, // Tokyo
  accuracy: 50, // 50-meter accuracy circle
});

// Add navigation control for comparison
map.addControl(new maplibregl.NavigationControl(), "top-right");

// Add scale control
map.addControl(new maplibregl.ScaleControl(), "bottom-left");

// Add control to map
map.addControl(mockGeolocateControl, "top-right");

// Test event system (will be enhanced in later PR)
mockGeolocateControl.on("geolocate", (e) => {
  console.log("📍 Geolocate event fired:", e.coords);
});

// Log when map is loaded
map.on("load", () => {
  console.log("Map loaded! MockGeolocateControl is in the top-right corner.");
  console.log("Try clicking the geolocate button to see:");
  console.log("  - Blue position marker with white border");
  console.log("  - Semi-transparent accuracy circle");
  console.log("  - Event logs in console");
});
