// Demo application for testing the library during development
// This file is loaded by `/index.html` when running the dev server
// Usage: `pnpm dev` then open http://localhost:5173
import "./style.css";
import { Map, NavigationControl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MockGeolocateControl } from "./index";
import type { MockGeolocateEvent, MockOutOfMaxBoundsEvent } from "./index";

// Create map container
const mapContainer = document.createElement("div");
mapContainer.id = "map";
mapContainer.style.width = "100vw";
mapContainer.style.height = "100vh";
document.body.appendChild(mapContainer);

// Initialize MapLibre GL JS map
const map = new Map({
  container: "map",
  style:
    "https://mierune.github.io/rekichizu-style/styles/street-omt/style.json",
  center: [139.74136111, 35.68111667], // Tokyo
  zoom: 12,
});

// Create MockGeolocateControl with Tokyo coordinates
const mockGeolocateControl = new MockGeolocateControl({
  position: { lng: 139.6917, lat: 35.6895 }, // Tokyo coordinates
  accuracy: 100, // 50-meter accuracy circle
  showAccuracyCircle: true,
});

// Demo event listeners
mockGeolocateControl.on("geolocate", (event: MockGeolocateEvent) => {
  console.log("Mock geolocate triggered!", event.coords);
  console.log(
    `Location: ${event.coords.latitude}, ${event.coords.longitude} (±${event.coords.accuracy}m)`,
  );
});

mockGeolocateControl.on("outofmaxbounds", (event: MockOutOfMaxBoundsEvent) => {
  console.warn("Position outside map bounds:", event.coords);
});

// Demo buttons for testing different positions
const createDemoButtons = () => {
  const buttonContainer = document.createElement("div");
  buttonContainer.className = "demo-buttons";

  const createButton = (text: string, onClick: () => void) => {
    const btn = document.createElement("button");
    btn.textContent = text;
    btn.className = "demo-button";
    btn.addEventListener("click", onClick);
    return btn;
  };

  // Tokyo button
  buttonContainer.appendChild(
    createButton("📍 Tokyo", () => {
      mockGeolocateControl.setPosition({ lng: 139.6917, lat: 35.6895 });
      mockGeolocateControl.setAccuracy(25);
      mockGeolocateControl.trigger();
    }),
  );

  // New York button
  buttonContainer.appendChild(
    createButton("🗽 New York", () => {
      mockGeolocateControl.setPosition([-74.006, 40.7128]);
      mockGeolocateControl.setAccuracy(100);
      mockGeolocateControl.trigger();
    }),
  );

  // London button
  buttonContainer.appendChild(
    createButton("🇬🇧 London", () => {
      mockGeolocateControl.setPosition([-0.1276, 51.5074]);
      mockGeolocateControl.setAccuracy(75);
      mockGeolocateControl.trigger();
    }),
  );

  // Toggle accuracy circle
  let showAccuracy = true;
  buttonContainer.appendChild(
    createButton("👁️ Toggle Accuracy", () => {
      showAccuracy = !showAccuracy;
      mockGeolocateControl.setShowAccuracyCircle(showAccuracy);
    }),
  );

  document.body.appendChild(buttonContainer);
};

// Initialize demo buttons and control when map loads
map.on("load", () => {
  // Add navigation control for zoom and rotation
  map.addControl(new NavigationControl(), "top-right");

  // Add mock geolocate control after style is loaded
  map.addControl(mockGeolocateControl, "top-right");

  createDemoButtons();
  console.log("🗺️ MockGeolocateControl Demo Ready!");
  console.log("• Click the location button in top-right to center on Tokyo");
  console.log("• Use demo buttons to test different cities");
  console.log("• Toggle accuracy circle visibility");
});
