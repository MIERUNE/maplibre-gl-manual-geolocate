import { describe, expect, it, vi } from "vitest";

// Mock MapLibre's heavy Map/Marker classes so createMap() below instantiates our
// lightweight stand-ins while still reusing the real geometry helpers.
vi.mock("maplibre-gl", async (importOriginal) => {
  const actual = await importOriginal<typeof import("maplibre-gl")>();

  type EventHandler = (...args: any[]) => void;

  class FakeMarker {
    private element: HTMLElement;
    private map?: FakeMap;

    constructor(options: any = {}) {
      this.element = options.element ?? document.createElement("div");
    }

    setLngLat(lngLat: import("maplibre-gl").LngLatLike) {
      actual.LngLat.convert(lngLat);
      return this;
    }

    addTo(map: FakeMap) {
      this.map = map;
      map.getContainer().appendChild(this.element);
      return this;
    }

    remove() {
      this.map = undefined;
      this.element.remove();
      return this;
    }

    getElement() {
      return this.element;
    }
  }

  class FakeMap {
    private container: HTMLDivElement;
    private maxBounds?: import("maplibre-gl").LngLatBounds;
    private events = new Map<string, Set<EventHandler>>();
    private fitBoundsRecords: Array<{
      bounds: import("maplibre-gl").LngLatBoundsLike;
      options?: import("maplibre-gl").FitBoundsOptions;
    }> = [];
    private bearing = 0;
    _removed = false;

    constructor(options: any = {}) {
      this.container = options.container ?? document.createElement("div");
      this.container.classList.add("maplibregl-map");
      if (!this.container.parentElement) {
        document.body.appendChild(this.container);
      }
    }

    addControl(control: any) {
      const node = control.onAdd(this as unknown as import("maplibre-gl").Map);
      this.container.appendChild(node);
      return this;
    }

    removeControl(control: any) {
      control.onRemove?.();
      return this;
    }

    remove() {
      this._removed = true;
      this.events.clear();
      this.container.remove();
      return this;
    }

    getContainer() {
      return this.container;
    }

    setBearing(value: number) {
      this.bearing = value;
      return this;
    }

    getBearing() {
      return this.bearing;
    }

    project(lngLat: import("maplibre-gl").LngLatLike) {
      const coord = actual.LngLat.convert(lngLat);
      return { x: coord.lng * 100, y: coord.lat * 100 };
    }

    unproject(point: [number, number]) {
      return new actual.LngLat(point[0] / 100, point[1] / 100);
    }

    fitBounds(
      bounds: import("maplibre-gl").LngLatBoundsLike,
      options?: import("maplibre-gl").FitBoundsOptions,
    ) {
      this.fitBoundsRecords.push({ bounds, options });
      return this;
    }

    getFitBoundsCalls() {
      return this.fitBoundsRecords;
    }

    on(event: string, handler: EventHandler) {
      if (!this.events.has(event)) {
        this.events.set(event, new Set());
      }
      this.events.get(event)!.add(handler);
      return this;
    }

    off(event: string, handler: EventHandler) {
      this.events.get(event)?.delete(handler);
      return this;
    }

    once(event: string, handler: EventHandler) {
      const wrapper: EventHandler = (...args) => {
        this.off(event, wrapper);
        handler(...args);
      };
      return this.on(event, wrapper);
    }

    loaded() {
      return true;
    }

    setMaxBounds(bounds: import("maplibre-gl").LngLatBoundsLike) {
      this.maxBounds = new actual.LngLatBounds(bounds as any);
      return this;
    }

    getMaxBounds() {
      return this.maxBounds;
    }
  }

  return {
    ...actual,
    Map: FakeMap as any,
    Marker: FakeMarker as any,
    LngLat: actual.LngLat,
    LngLatBounds: actual.LngLatBounds,
  };
});

import { ManualGeolocateControl } from "./ManualGeolocateControl";
// createMap() pulls Map from the mock above, giving the tests deterministic
// map behaviour without needing a real WebGL context.
import { cleanupMap, createMap } from "./test/util";
import type { ManualGeolocateControlOptions } from "./types";

describe("ManualGeolocateControl (Simple Tests)", () => {
  describe("initialization", () => {
    it("should create control with required position", () => {
      const control = new ManualGeolocateControl({
        position: { lng: 139.7, lat: 35.6 },
      });
      expect(control).toBeInstanceOf(ManualGeolocateControl);
    });

    it("should create control with custom options", () => {
      const options: ManualGeolocateControlOptions = {
        position: { lng: 139.7, lat: 35.6 },
        accuracy: 50,
        showAccuracyCircle: true,
        fitBoundsOptions: { maxZoom: 15 },
      };
      const control = new ManualGeolocateControl(options);
      expect(control).toBeInstanceOf(ManualGeolocateControl);
    });
  });

  describe("setPosition", () => {
    it("should accept position updates", () => {
      const control = new ManualGeolocateControl({
        position: { lng: 139.7, lat: 35.6 },
      });

      // Should not throw
      expect(() => {
        control.setPosition({ lng: 140.7, lat: 36.6 });
      }).not.toThrow();
    });
  });

  describe("setAccuracy", () => {
    it("should accept accuracy updates", () => {
      const control = new ManualGeolocateControl({
        position: { lng: 139.7, lat: 35.6 },
      });

      expect(() => {
        control.setAccuracy(50);
      }).not.toThrow();
    });
  });

  describe("setShowAccuracyCircle", () => {
    it("should accept show accuracy circle updates", () => {
      const control = new ManualGeolocateControl({
        position: { lng: 139.7, lat: 35.6 },
      });

      expect(() => {
        control.setShowAccuracyCircle(true);
        control.setShowAccuracyCircle(false);
      }).not.toThrow();
    });
  });

  describe("setFitBoundsOptions", () => {
    it("should accept fit bounds options updates", () => {
      const control = new ManualGeolocateControl({
        position: { lng: 139.7, lat: 35.6 },
      });

      expect(() => {
        control.setFitBoundsOptions({ maxZoom: 18, padding: 50 });
      }).not.toThrow();
    });
  });

  describe("event handling", () => {
    it("should support on/off for events", () => {
      const control = new ManualGeolocateControl({
        position: { lng: 139.7, lat: 35.6 },
      });
      const handler = vi.fn();

      // Add event listener
      control.on("geolocate", handler);

      // Remove event listener
      control.off("geolocate", handler);

      // Should not throw
      expect(() => {
        control.on("outofmaxbounds", handler);
        control.off("outofmaxbounds", handler);
      }).not.toThrow();
    });
  });
});

describe("ManualGeolocateControl (Map Integration)", () => {
  const defaultPosition = { lng: 139.7, lat: 35.6 };

  it("should add markers to the map and fit bounds when triggered", async () => {
    const map = createMap();

    try {
      const control = new ManualGeolocateControl({
        position: defaultPosition,
        accuracy: 75,
        showAccuracyCircle: true,
        fitBoundsOptions: { maxZoom: 16, padding: 8 },
      });

      map.addControl(control);

      const geolocateHandler = vi.fn();
      control.on("geolocate", geolocateHandler);

      control.trigger();

      expect(geolocateHandler).toHaveBeenCalledTimes(1);
      expect(geolocateHandler.mock.calls[0][0].coords).toMatchObject({
        latitude: defaultPosition.lat,
        longitude: defaultPosition.lng,
        accuracy: 75,
      });

      const fitBoundsCalls = (
        map as unknown as { getFitBoundsCalls: () => Array<{ options?: any }> }
      ).getFitBoundsCalls();
      expect(fitBoundsCalls).toHaveLength(1);
      expect(fitBoundsCalls[0].options).toMatchObject({
        maxZoom: 16,
        padding: 8,
      });

      const mapContainer = map.getContainer();
      const dotElement = mapContainer.querySelector(
        ".maplibregl-user-location-dot",
      ) as HTMLDivElement | null;
      const accuracyElement = mapContainer.querySelector(
        ".maplibregl-user-location-accuracy-circle",
      ) as HTMLDivElement | null;

      expect(dotElement).not.toBeNull();
      expect(accuracyElement).not.toBeNull();

      const width = accuracyElement
        ? parseFloat(accuracyElement.style.width)
        : 0;
      const height = accuracyElement
        ? parseFloat(accuracyElement.style.height)
        : 0;
      expect(width).toBeGreaterThan(0);
      expect(height).toBeGreaterThan(0);
    } finally {
      cleanupMap(map);
    }
  });

  it("should toggle accuracy circle visibility on demand", async () => {
    const map = createMap();

    try {
      const control = new ManualGeolocateControl({
        position: defaultPosition,
        accuracy: 50,
        showAccuracyCircle: true,
      });

      map.addControl(control);
      control.trigger();

      const mapContainer = map.getContainer();
      expect(
        mapContainer.querySelector(".maplibregl-user-location-accuracy-circle"),
      ).not.toBeNull();

      control.setShowAccuracyCircle(false);
      expect(
        mapContainer.querySelector(".maplibregl-user-location-accuracy-circle"),
      ).toBeNull();

      control.setShowAccuracyCircle(true);
      expect(
        mapContainer.querySelector(".maplibregl-user-location-accuracy-circle"),
      ).not.toBeNull();
    } finally {
      cleanupMap(map);
    }
  });

  it("should fire outofmaxbounds and skip map updates when outside max bounds", async () => {
    const map = createMap();

    try {
      map.setMaxBounds([
        [139.6, 35.4],
        [139.65, 35.45],
      ]);

      const control = new ManualGeolocateControl({
        position: defaultPosition,
        accuracy: 50,
      });

      const geolocateHandler = vi.fn();
      const outOfBoundsHandler = vi.fn();
      control.on("geolocate", geolocateHandler);
      control.on("outofmaxbounds", outOfBoundsHandler);

      map.addControl(control);

      control.trigger();

      expect(outOfBoundsHandler).toHaveBeenCalledTimes(1);
      expect(geolocateHandler).not.toHaveBeenCalled();
      const fitBoundsCalls = (
        map as unknown as { getFitBoundsCalls: () => any[] }
      ).getFitBoundsCalls();
      expect(fitBoundsCalls).toHaveLength(0);

      const mapContainer = map.getContainer();
      expect(
        mapContainer.querySelector(".maplibregl-user-location-dot"),
      ).toBeNull();
      expect(
        mapContainer.querySelector(".maplibregl-user-location-accuracy-circle"),
      ).toBeNull();
    } finally {
      cleanupMap(map);
    }
  });

  it("should recalculate accuracy circle size when accuracy changes", async () => {
    const map = createMap();

    try {
      const control = new ManualGeolocateControl({
        position: defaultPosition,
        accuracy: 50,
        showAccuracyCircle: true,
      });

      map.addControl(control);
      control.trigger();

      const mapContainer = map.getContainer();
      const accuracyElement = mapContainer.querySelector(
        ".maplibregl-user-location-accuracy-circle",
      ) as HTMLDivElement | null;
      expect(accuracyElement).not.toBeNull();

      const initialWidth = accuracyElement
        ? parseFloat(accuracyElement.style.width)
        : 0;
      control.setAccuracy(200);
      const updatedWidth = accuracyElement
        ? parseFloat(accuracyElement.style.width)
        : 0;

      expect(initialWidth).toBeGreaterThan(0);
      expect(updatedWidth).toBeGreaterThan(initialWidth);
    } finally {
      cleanupMap(map);
    }
  });
});
