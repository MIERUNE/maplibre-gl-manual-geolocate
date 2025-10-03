// Demo application for testing the library during development
// This file is loaded by `/index.html` when running the dev server
// Usage: `pnpm dev` then open http://localhost:5173
import "./style.css";
import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl, { type FitBoundsOptions } from "maplibre-gl";
import { MockGeolocateControl } from "./index";

const DEFAULT_ACCURACY = 50;
const DEFAULT_FIT_BOUNDS: FitBoundsOptions = {
  maxZoom: 15,
  padding: 20,
  offset: [0, 0],
  linear: false,
};

let currentFitBoundsOptions: FitBoundsOptions = {
  ...DEFAULT_FIT_BOUNDS,
};

type PositionPreset = {
  id: string;
  label: string;
  lng: number;
  lat: number;
  accuracy?: number;
};

const POSITION_PRESETS: PositionPreset[] = [
  { id: "berlin", label: "Berlin, Germany", lng: 13.405, lat: 52.52 },
  {
    id: "buenos-aires",
    label: "Buenos Aires, Argentina",
    lng: -58.3816,
    lat: -34.6037,
  },
  { id: "cairo", label: "Cairo, Egypt", lng: 31.2357, lat: 30.0444 },
  {
    id: "cape-town",
    label: "Cape Town, South Africa",
    lng: 18.4241,
    lat: -33.9249,
  },
  { id: "hong-kong", label: "Hong Kong", lng: 114.1694, lat: 22.3193 },
  { id: "london", label: "London, United Kingdom", lng: -0.1276, lat: 51.5074 },
  { id: "moscow", label: "Moscow, Russia", lng: 37.6173, lat: 55.7558 },
  { id: "new-delhi", label: "New Delhi, India", lng: 77.209, lat: 28.6139 },
  {
    id: "new-york",
    label: "New York, United States",
    lng: -74.006,
    lat: 40.7128,
  },
  {
    id: "san-francisco",
    label: "San Francisco, United States",
    lng: -122.4194,
    lat: 37.7749,
  },
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
  zoom: 4,
});

// Create mock geolocate control
const mockGeolocateControl = new MockGeolocateControl({
  position: { lng: 139.74135747, lat: 35.65809922 }, // Tokyo
  accuracy: DEFAULT_ACCURACY,
  showAccuracyCircle: true,
});
mockGeolocateControl.setFitBoundsOptions(currentFitBoundsOptions);

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

function setAccuracySliderValue(accuracy: number) {
  const slider = document.querySelector<HTMLInputElement>("#accuracy-slider");
  if (slider) {
    slider.value = Math.round(accuracy).toString();
  }
}

function updateAccuracyLabel(accuracy: number) {
  const label = document.querySelector<HTMLSpanElement>("#accuracy-value");
  if (label) {
    label.textContent = `${Math.round(accuracy)} m`;
  }
}

function syncAccuracyUI(accuracy: number) {
  setAccuracySliderValue(accuracy);
  updateAccuracyLabel(accuracy);
}

function syncFitBoundsUI(options: FitBoundsOptions) {
  const maxZoomInput = document.querySelector<HTMLInputElement>(
    "#fitbounds-maxzoom",
  );
  const paddingInput = document.querySelector<HTMLInputElement>(
    "#fitbounds-padding",
  );
  const offsetXInput = document.querySelector<HTMLInputElement>(
    "#fitbounds-offset-x",
  );
  const offsetYInput = document.querySelector<HTMLInputElement>(
    "#fitbounds-offset-y",
  );
  const linearInput = document.querySelector<HTMLInputElement>(
    "#fitbounds-linear",
  );

  if (maxZoomInput) {
    maxZoomInput.value =
      options.maxZoom !== undefined ? options.maxZoom.toString() : "";
  }

  if (paddingInput) {
    const paddingValue =
      typeof options.padding === "number" ? options.padding : 0;
    paddingInput.value = paddingValue.toString();
  }

  const offset = Array.isArray(options.offset)
    ? options.offset
    : typeof options.offset === "number"
      ? [options.offset, options.offset]
      : [0, 0];

  if (offsetXInput) {
    offsetXInput.value = offset[0].toString();
  }

  if (offsetYInput) {
    offsetYInput.value = offset[1].toString();
  }

  if (linearInput) {
    linearInput.checked = Boolean(options.linear);
  }
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

  POSITION_PRESETS.forEach((preset) => {
    const option = document.createElement("option");
    option.value = preset.id;
    option.textContent = preset.label;
    select.appendChild(option);
  });

  if (POSITION_PRESETS.some((preset) => preset.id === "tokyo")) {
    select.value = "tokyo";
  }

  select.addEventListener("change", () => {
    if (select.value === "custom") {
      return;
    }

    const preset = POSITION_PRESETS.find((item) => item.id === select.value);
    if (!preset) {
      return;
    }

    const accuracy = preset.accuracy ?? DEFAULT_ACCURACY;
    syncAccuracyUI(accuracy);
    fillInputs({ lng: preset.lng, lat: preset.lat });
    mockGeolocateControl.setPosition({ lng: preset.lng, lat: preset.lat });
    mockGeolocateControl.setAccuracy(accuracy);
    mockGeolocateControl.trigger();
  });
}

function setupFormHandlers() {
  const form = document.querySelector<HTMLFormElement>("#coordinate-form");
  const presetSelect =
    document.querySelector<HTMLSelectElement>("#preset-select");
  const lngInput = document.querySelector<HTMLInputElement>("#lng-input");
  const latInput = document.querySelector<HTMLInputElement>("#lat-input");

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const result = updateControlFromInputs();
    if (result) {
      console.log("Updated mock coordinates:", result);
      if (presetSelect) {
        presetSelect.value = "custom";
      }
      mockGeolocateControl.trigger();
    } else {
      console.warn("Invalid coordinate input.");
    }
  });

  const handleFieldChange = () => {
    const result = updateControlFromInputs();
    if (!result) {
      return;
    }

    if (presetSelect) {
      presetSelect.value = "custom";
    }

    mockGeolocateControl.trigger();
  };

  lngInput?.addEventListener("change", handleFieldChange);
  latInput?.addEventListener("change", handleFieldChange);
  lngInput?.addEventListener("blur", handleFieldChange);
  latInput?.addEventListener("blur", handleFieldChange);
}

function setupAccuracyControls() {
  const toggle = document.querySelector<HTMLInputElement>("#accuracy-toggle");
  const slider = document.querySelector<HTMLInputElement>("#accuracy-slider");
  const presetSelect =
    document.querySelector<HTMLSelectElement>("#preset-select");

  const applyAccuracy = (value: number, markCustom = false) => {
    const accuracy = Number(value);
    if (!Number.isFinite(accuracy)) {
      return;
    }

    updateAccuracyLabel(accuracy);
    mockGeolocateControl.setAccuracy(accuracy);

    if (markCustom && presetSelect) {
      presetSelect.value = "custom";
    }
  };

  slider?.addEventListener("input", () => {
    applyAccuracy(Number(slider.value));
  });

  slider?.addEventListener("change", () => {
    applyAccuracy(Number(slider.value), true);
  });

  toggle?.addEventListener("change", () => {
    const checked = toggle.checked;
    mockGeolocateControl.setShowAccuracyCircle(checked);
    if (checked) {
      applyAccuracy(Number(slider?.value ?? DEFAULT_ACCURACY));
    }
  });

  syncAccuracyUI(Number(slider?.value ?? DEFAULT_ACCURACY));
}

function setupFitBoundsControls() {
  const presetSelect =
    document.querySelector<HTMLSelectElement>("#preset-select");
  const maxZoomInput = document.querySelector<HTMLInputElement>(
    "#fitbounds-maxzoom",
  );
  const paddingInput = document.querySelector<HTMLInputElement>(
    "#fitbounds-padding",
  );
  const offsetXInput = document.querySelector<HTMLInputElement>(
    "#fitbounds-offset-x",
  );
  const offsetYInput = document.querySelector<HTMLInputElement>(
    "#fitbounds-offset-y",
  );
  const linearInput = document.querySelector<HTMLInputElement>(
    "#fitbounds-linear",
  );

  const commit = (
    partial: Partial<FitBoundsOptions>,
    markCustom = false,
  ) => {
    currentFitBoundsOptions = {
      ...currentFitBoundsOptions,
      ...partial,
    };
    mockGeolocateControl.setFitBoundsOptions(currentFitBoundsOptions);

    if (markCustom && presetSelect) {
      presetSelect.value = "custom";
    }

    syncFitBoundsUI(currentFitBoundsOptions);
  };

  const readOffset = (): [number, number] => {
    const rawX = Number(offsetXInput?.value ?? 0);
    const rawY = Number(offsetYInput?.value ?? 0);
    const x = Number.isFinite(rawX) ? rawX : 0;
    const y = Number.isFinite(rawY) ? rawY : 0;
    return [x, y];
  };

  maxZoomInput?.addEventListener("input", () => {
    const value = Number(maxZoomInput.value);
    if (Number.isFinite(value)) {
      commit({ maxZoom: value });
    }
  });

  maxZoomInput?.addEventListener("change", () => {
    const value = Number(maxZoomInput.value);
    if (Number.isFinite(value)) {
      commit({ maxZoom: value }, true);
    } else {
      syncFitBoundsUI(currentFitBoundsOptions);
    }
  });

  paddingInput?.addEventListener("input", () => {
    const value = Number(paddingInput.value);
    if (Number.isFinite(value)) {
      commit({ padding: value });
    }
  });

  paddingInput?.addEventListener("change", () => {
    const value = Number(paddingInput.value);
    if (Number.isFinite(value)) {
      commit({ padding: value }, true);
    } else {
      syncFitBoundsUI(currentFitBoundsOptions);
    }
  });

  const handleOffsetInput = (markCustom: boolean) => {
    const [x, y] = readOffset();
    commit({ offset: [x, y] }, markCustom);
  };

  offsetXInput?.addEventListener("input", () => handleOffsetInput(false));
  offsetYInput?.addEventListener("input", () => handleOffsetInput(false));
  offsetXInput?.addEventListener("change", () => handleOffsetInput(true));
  offsetYInput?.addEventListener("change", () => handleOffsetInput(true));

  linearInput?.addEventListener("change", () => {
    const checked = Boolean(linearInput.checked);
    commit({ linear: checked }, true);
  });

  syncFitBoundsUI(currentFitBoundsOptions);
}

populatePresetSelect();
fillInputs({
  lng: 139.741357,
  lat: 35.658099,
});
setupFormHandlers();
setupAccuracyControls();
syncAccuracyUI(DEFAULT_ACCURACY);
setupFitBoundsControls();
