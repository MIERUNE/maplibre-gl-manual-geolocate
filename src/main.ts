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
  style:
    "https://mierune.github.io/rekichizu-style/styles/street-omt/style.json",
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

// Event logging utility
function logEvent(type: string, data: any, isError = false) {
  const eventLog = document.getElementById("eventLog");
  if (!eventLog) return;

  const time = new Date().toLocaleTimeString();
  const item = document.createElement("div");
  item.className = `event-log-item ${isError ? "error" : ""}`;

  if (type === "geolocate") {
    item.textContent = `[${time}] ${type}: lat=${data.coords.latitude.toFixed(5)}, lng=${data.coords.longitude.toFixed(5)}, accuracy=${data.coords.accuracy}m`;
  } else if (type === "outofmaxbounds") {
    item.textContent = `[${time}] ${type}: Position is outside map bounds`;
  } else {
    item.textContent = `[${time}] ${type}: ${JSON.stringify(data)}`;
  }

  eventLog.insertBefore(item, eventLog.firstChild);

  // Keep only last 10 events
  while (eventLog.children.length > 10) {
    eventLog.removeChild(eventLog.lastChild!);
  }
}

// Setup event listeners for MockGeolocateControl
mockGeolocateControl.on("geolocate", (e) => {
  console.log("📍 Geolocate event fired:", e.coords);
  logEvent("geolocate", e);
});

mockGeolocateControl.on("outofmaxbounds", (e) => {
  console.warn("⚠️ Out of max bounds event fired:", e.coords);
  logEvent("outofmaxbounds", e, true);
});

// Setup interactive controls
map.on("load", () => {
  console.log(
    "Map loaded! Use the control panel to interact with MockGeolocateControl.",
  );

  // Position update button
  const updatePositionBtn = document.getElementById("updatePosition");
  const latInput = document.getElementById("lat") as HTMLInputElement;
  const lngInput = document.getElementById("lng") as HTMLInputElement;

  updatePositionBtn?.addEventListener("click", () => {
    const lat = parseFloat(latInput.value);
    const lng = parseFloat(lngInput.value);

    if (!isNaN(lat) && !isNaN(lng)) {
      mockGeolocateControl.setPosition({ lat, lng });
      logEvent("setPosition", { lat, lng });
    }
  });

  // Preset locations dropdown
  const presetSelect = document.getElementById(
    "presetLocations",
  ) as HTMLSelectElement;
  presetSelect?.addEventListener("change", () => {
    if (presetSelect.value) {
      const [lat, lng] = presetSelect.value.split(",").map(Number);
      latInput.value = lat.toString();
      lngInput.value = lng.toString();
      mockGeolocateControl.setPosition({ lat, lng });
      map.flyTo({ center: [lng, lat], zoom: 14 });
      logEvent("setPosition", {
        lat,
        lng,
        preset: presetSelect.selectedOptions[0].text,
      });
    }
  });

  // Accuracy slider
  const accuracySlider = document.getElementById(
    "accuracy",
  ) as HTMLInputElement;
  const accuracyValue = document.getElementById("accuracyValue");

  accuracySlider?.addEventListener("input", () => {
    const accuracy = parseInt(accuracySlider.value);
    if (accuracyValue) accuracyValue.textContent = accuracy.toString();
    mockGeolocateControl.setAccuracy(accuracy);
    logEvent("setAccuracy", { accuracy });
  });

  // Show/hide accuracy circle checkbox
  const showAccuracyCheckbox = document.getElementById(
    "showAccuracy",
  ) as HTMLInputElement;
  showAccuracyCheckbox?.addEventListener("change", () => {
    mockGeolocateControl.setShowAccuracyCircle(showAccuracyCheckbox.checked);
    logEvent("setShowAccuracyCircle", { show: showAccuracyCheckbox.checked });
  });

  // Trigger control button
  const triggerBtn = document.getElementById("triggerControl");
  triggerBtn?.addEventListener("click", () => {
    mockGeolocateControl.trigger();
    logEvent("trigger", {});
  });

  // Clear log button
  const clearLogBtn = document.getElementById("clearLog");
  const eventLog = document.getElementById("eventLog");
  clearLogBtn?.addEventListener("click", () => {
    if (eventLog) eventLog.innerHTML = "";
  });
});
