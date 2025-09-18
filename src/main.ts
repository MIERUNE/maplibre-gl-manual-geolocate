// Demo application for testing the library during development
// This file is loaded by `/index.html` when running the dev server
// Usage: `pnpm dev` then open http://localhost:5173
import "./style.css";
import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";
import { MockGeolocateControl } from "./index";

// Initialize the map
const map = new maplibregl.Map({
  container: 'map',
  style: 'https://api.protomaps.com/styles/v2/light.json', // Protomaps Light - clean, free, no API key needed
  center: [139.74135747, 35.65809922], // Tokyo Station
  zoom: 14 // Slightly closer for better detail
});

// Create mock geolocate control
const mockGeolocateControl = new MockGeolocateControl({
  position: { lng: 139.74135747, lat: 35.65809922 }, // Tokyo coordinates
  accuracy: 50 // 50-meter accuracy circle
});

// Add control to map
map.addControl(mockGeolocateControl, 'top-right');

// Add navigation control for comparison
map.addControl(new maplibregl.NavigationControl(), 'top-right');

// Add scale control
map.addControl(new maplibregl.ScaleControl(), 'bottom-left');

// Log when map is loaded
map.on('load', () => {
  console.log('Map loaded! MockGeolocateControl is in the top-right corner.');
  console.log('Try clicking the geolocate button to see the placeholder log.');
});
