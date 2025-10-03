// Demo application for testing the library during development
// This file is loaded by `/index.html` when running the dev server
// Usage: `pnpm dev` then open http://localhost:5173
import "./style.css";
import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";
import { MockGeolocateControl } from "./index";

type LocationPreset = {
  id: string;
  label: string;
  lng: number;
  lat: number;
  accuracy?: number;
};

const LOCATION_PRESETS: LocationPreset[] = [
  { id: "berlin", label: "Berlin, Germany", lng: 13.405, lat: 52.52 },
  { id: "buenos-aires", label: "Buenos Aires, Argentina", lng: -58.3816, lat: -34.6037 },
  { id: "cairo", label: "Cairo, Egypt", lng: 31.2357, lat: 30.0444 },
  { id: "cape-town", label: "Cape Town, South Africa", lng: 18.4241, lat: -33.9249 },
  { id: "hong-kong", label: "Hong Kong", lng: 114.1694, lat: 22.3193 },
  { id: "london", label: "London, United Kingdom", lng: -0.1276, lat: 51.5074 },
  { id: "moscow", label: "Moscow, Russia", lng: 37.6173, lat: 55.7558 },
  { id: "new-delhi", label: "New Delhi, India", lng: 77.209, lat: 28.6139 },
  { id: "new-york", label: "New York, United States", lng: -74.006, lat: 40.7128 },
  { id: "san-francisco", label: "San Francisco, United States", lng: -122.4194, lat: 37.7749 },
  { id: "seoul", label: "Seoul, South Korea", lng: 126.978, lat: 37.5665 },
  { id: "singapore", label: "Singapore", lng: 103.8198, lat: 1.3521 },
  { id: "sydney", label: "Sydney, Australia", lng: 151.2093, lat: -33.8688 },
  { id: "tokyo", label: "Tokyo, Japan", lng: 139.741357, lat: 35.658099 },
];

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

function fillInputs({ lng, lat }: { lng: number; lat: number }) {
  const lngInput = document.querySelector<HTMLInputElement>("#lng-input");
  const latInput = document.querySelector<HTMLInputElement>("#lat-input");

  if (!lngInput || !latInput) {
    return;
  }

  lngInput.value = lng.toFixed(6);
  latInput.value = lat.toFixed(6);
}

function updateControlFromInputs() {
  const lngInput = document.querySelector<HTMLInputElement>("#lng-input");
  const latInput = document.querySelector<HTMLInputElement>("#lat-input");

  if (!lngInput || !latInput) {
    return null;
  }

  const lng = Number(lngInput.value);
  const lat = Number(latInput.value);

  if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
    return null;
  }

  if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
    return null;
  }

  mockGeolocateControl.setPosition({ lng, lat });

  return { lng, lat };
}

function populatePresetSelect() {
  const select = document.querySelector<HTMLSelectElement>("#preset-select");
  if (!select) return;

  LOCATION_PRESETS.forEach((preset) => {
    const option = document.createElement("option");
    option.value = preset.id;
    option.textContent = preset.label;
    select.appendChild(option);
  });

  if (LOCATION_PRESETS.some((preset) => preset.id === "tokyo")) {
    select.value = "tokyo";
  }

  select.addEventListener("change", () => {
    if (select.value === "custom") {
      return;
    }

    const preset = LOCATION_PRESETS.find((item) => item.id === select.value);
    if (!preset) {
      return;
    }

    const accuracy = preset.accuracy ?? 50;
    fillInputs({ lng: preset.lng, lat: preset.lat });
    mockGeolocateControl.setPosition({ lng: preset.lng, lat: preset.lat });
    mockGeolocateControl.setAccuracy(accuracy);
  });
}

function setupFormHandlers() {
  const form = document.querySelector<HTMLFormElement>("#coordinate-form");
  const triggerButton = document.querySelector<HTMLButtonElement>("#trigger-button");
  const presetSelect = document.querySelector<HTMLSelectElement>("#preset-select");

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const result = updateControlFromInputs();
    if (result) {
      console.log("Updated mock coordinates:", result);
      if (presetSelect) {
        presetSelect.value = "custom";
      }
    } else {
      console.warn("Invalid coordinate input.");
    }
  });

  triggerButton?.addEventListener("click", () => {
    const result = updateControlFromInputs();
    if (!result) {
      console.warn("Cannot center map: invalid coordinate input.");
      return;
    }

    if (presetSelect) {
      presetSelect.value = "custom";
    }

    mockGeolocateControl.trigger();
  });
}

populatePresetSelect();
fillInputs({
  lng: 139.741357,
  lat: 35.658099,
});
setupFormHandlers();
