// Demo application for testing the library during development
import "./style.css";
import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";
import { MockGeolocateControl } from "./index";

// Initialize the map
const map = new maplibregl.Map({
  container: "map",
  style: "https://demotiles.maplibre.org/style.json",
  center: [139.74135747, 35.65809922], // Tokyo
  zoom: 14,
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

// Listen for events from the mock control
mockGeolocateControl.on("geolocate", (e) => {
  console.log("📍 Geolocate event fired:", e.coords);
});

mockGeolocateControl.on("outofmaxbounds", (e) => {
  console.warn("⚠️ Out of bounds event fired:", e.coords);
});

// Log when map is loaded and demonstrate features
// Create demo controls panel
const createDemoControls = () => {
  const panel = document.createElement("div");
  panel.className = "demo-controls";
  panel.innerHTML = `
    <h3>🎮 Demo Controls</h3>

    <div class="section">
      <label>Quick Actions</label>
      <button onclick="window.mockGeolocateControl.trigger()">
        📍 Trigger Geolocate
      </button>
    </div>

    <div class="section">
      <label>Preset Locations</label>
      <div class="preset-buttons">
        <button onclick="setLocation(139.74135747, 35.65809922, 'Tokyo')">🗼 Tokyo</button>
        <button onclick="setLocation(-74.006, 40.7128, 'New York')">🗽 New York</button>
        <button onclick="setLocation(-0.1276, 51.5074, 'London')">🇬🇧 London</button>
        <button onclick="setLocation(2.3522, 48.8566, 'Paris')">🗼 Paris</button>
        <button onclick="setLocation(151.2093, -33.8688, 'Sydney')">🇦🇺 Sydney</button>
        <button onclick="setLocation(-122.4194, 37.7749, 'San Francisco')">🌉 SF</button>
      </div>
    </div>

    <div class="section">
      <label>Accuracy: <span class="value-display" id="accuracy-value">50m</span></label>
      <input type="range" id="accuracy-slider" min="10" max="500" value="50" step="10">

      <div class="checkbox-wrapper">
        <input type="checkbox" id="show-accuracy" checked>
        <label for="show-accuracy" style="margin: 0;">Show accuracy circle</label>
      </div>
    </div>

    <div class="section">
      <label>Custom Position</label>
      <div style="display: flex; gap: 8px; margin-bottom: 8px;">
        <input type="number" id="custom-lng" placeholder="Longitude" step="0.0001" style="flex: 1; padding: 4px;">
        <input type="number" id="custom-lat" placeholder="Latitude" step="0.0001" style="flex: 1; padding: 4px;">
      </div>
      <button class="secondary" onclick="setCustomLocation()">Set Custom Location</button>
    </div>
  `;
  document.body.appendChild(panel);
};

// Helper functions for demo controls
(window as any).setLocation = (lng: number, lat: number, name: string) => {
  mockGeolocateControl.setPosition([lng, lat]);
  console.log(`📍 Position updated to ${name}: [${lng}, ${lat}]`);

  // Also move map to new location
  map.flyTo({
    center: [lng, lat],
    zoom: 14,
    duration: 1500,
  });
};

(window as any).setCustomLocation = () => {
  const lngInput = document.getElementById("custom-lng") as HTMLInputElement;
  const latInput = document.getElementById("custom-lat") as HTMLInputElement;

  const lng = parseFloat(lngInput.value);
  const lat = parseFloat(latInput.value);

  if (!isNaN(lng) && !isNaN(lat)) {
    mockGeolocateControl.setPosition([lng, lat]);
    console.log(`📍 Custom position set: [${lng}, ${lat}]`);
    map.flyTo({
      center: [lng, lat],
      zoom: 14,
      duration: 1500,
    });
  } else {
    alert("Please enter valid longitude and latitude values");
  }
};

// Setup event listeners for controls
const setupControlListeners = () => {
  // Accuracy slider
  const accuracySlider = document.getElementById(
    "accuracy-slider",
  ) as HTMLInputElement;
  const accuracyValue = document.getElementById("accuracy-value");

  accuracySlider?.addEventListener("input", (e) => {
    const value = parseInt((e.target as HTMLInputElement).value);
    mockGeolocateControl.setAccuracy(value);
    if (accuracyValue) {
      accuracyValue.textContent = `${value}m`;
    }
    console.log(`🎯 Accuracy updated: ${value}m`);
  });

  // Show/hide accuracy circle
  const showAccuracyCheckbox = document.getElementById(
    "show-accuracy",
  ) as HTMLInputElement;
  showAccuracyCheckbox?.addEventListener("change", (e) => {
    const checked = (e.target as HTMLInputElement).checked;
    mockGeolocateControl.setShowAccuracyCircle(checked);
    console.log(`👁️ Accuracy circle ${checked ? "shown" : "hidden"}`);
  });
};

// Listen for events from the mock control
mockGeolocateControl.on("geolocate", (e) => {
  console.log("📍 Geolocate event:", {
    lat: e.coords.latitude.toFixed(6),
    lng: e.coords.longitude.toFixed(6),
    accuracy: e.coords.accuracy,
  });
});

mockGeolocateControl.on("outofmaxbounds", (e) => {
  console.warn("⚠️ Out of bounds:", e.coords);
});

// Initialize when map is loaded
map.on("load", () => {
  console.log("✅ MockGeolocateControl Demo Ready!");
  console.log(
    "📍 Click the geolocate button (top-right) or use the demo controls",
  );

  // Create demo controls
  createDemoControls();
  setupControlListeners();

  // Make control available globally for testing
  (window as any).mockGeolocateControl = mockGeolocateControl;
  (window as any).map = map;
});
