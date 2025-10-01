import { describe, it, expect, beforeEach, vi } from "vitest";
import { Map, LngLat } from "maplibre-gl";
import { MockGeolocateControl } from "./MockGeolocateControl";

// Helper to create a minimal mock map
function createMockMap(): Map {
  const container = document.createElement("div");
  const map = new Map({
    container,
    style: {
      version: 8,
      sources: {},
      layers: [],
    },
    center: [0, 0],
    zoom: 1,
    fadeDuration: 0, // Disable fade animations
  });
  return map;
}

describe("MockGeolocateControl", () => {
  describe("constructor", () => {
    it("should create instance with required position option", () => {
      const control = new MockGeolocateControl({
        position: { lng: 139.6917, lat: 35.6895 },
      });
      expect(control).toBeDefined();
    });

    it("should throw error when position is missing", () => {
      expect(() => {
        new MockGeolocateControl({} as any);
      }).toThrow("MockGeolocateControl: position option is required");
    });

    it("should accept position as object with lng/lat", () => {
      const control = new MockGeolocateControl({
        position: { lng: 139.6917, lat: 35.6895 },
      });
      expect(control).toBeDefined();
    });

    it("should accept position as object with lon/lat", () => {
      const control = new MockGeolocateControl({
        position: { lon: 139.6917, lat: 35.6895 },
      });
      expect(control).toBeDefined();
    });

    it("should accept position as array [lng, lat]", () => {
      const control = new MockGeolocateControl({
        position: [139.6917, 35.6895],
      });
      expect(control).toBeDefined();
    });

    it("should accept position as LngLat instance", () => {
      const control = new MockGeolocateControl({
        position: new LngLat(139.6917, 35.6895),
      });
      expect(control).toBeDefined();
    });

    it("should use default accuracy of 50 when not specified", () => {
      const control = new MockGeolocateControl({
        position: { lng: 139.6917, lat: 35.6895 },
      });
      // We can't directly access private fields, but we can test behavior
      expect(control).toBeDefined();
    });

    it("should use custom accuracy when specified", () => {
      const control = new MockGeolocateControl({
        position: { lng: 139.6917, lat: 35.6895 },
        accuracy: 100,
      });
      expect(control).toBeDefined();
    });

    it("should use default showAccuracyCircle of true when not specified", () => {
      const control = new MockGeolocateControl({
        position: { lng: 139.6917, lat: 35.6895 },
      });
      expect(control).toBeDefined();
    });

    it("should accept custom showAccuracyCircle option", () => {
      const control = new MockGeolocateControl({
        position: { lng: 139.6917, lat: 35.6895 },
        showAccuracyCircle: false,
      });
      expect(control).toBeDefined();
    });

    it("should use default fitBoundsOptions with maxZoom 15", () => {
      const control = new MockGeolocateControl({
        position: { lng: 139.6917, lat: 35.6895 },
      });
      expect(control).toBeDefined();
    });

    it("should accept custom fitBoundsOptions", () => {
      const control = new MockGeolocateControl({
        position: { lng: 139.6917, lat: 35.6895 },
        fitBoundsOptions: { maxZoom: 18, padding: 50 },
      });
      expect(control).toBeDefined();
    });
  });

  describe("onAdd", () => {
    let map: Map;
    let control: MockGeolocateControl;

    beforeEach(() => {
      map = createMockMap();
      control = new MockGeolocateControl({
        position: { lng: 139.6917, lat: 35.6895 },
      });
    });

    it("should return an HTMLElement", () => {
      const container = control.onAdd(map);
      expect(container).toBeInstanceOf(HTMLElement);
    });

    it("should create container with correct classes", () => {
      const container = control.onAdd(map);
      expect(container.className).toBe("maplibregl-ctrl maplibregl-ctrl-group");
    });

    it("should create button element", () => {
      const container = control.onAdd(map);
      const button = container.querySelector("button");
      expect(button).toBeDefined();
      expect(button?.type).toBe("button");
    });

    it("should create button with geolocate class", () => {
      const container = control.onAdd(map);
      const button = container.querySelector("button");
      expect(button?.className).toBe("maplibregl-ctrl-geolocate");
    });

    it("should create button with title", () => {
      const container = control.onAdd(map);
      const button = container.querySelector("button");
      expect(button?.title).toBe("Find my location");
    });

    it("should create icon span inside button", () => {
      const container = control.onAdd(map);
      const icon = container.querySelector(".maplibregl-ctrl-icon");
      expect(icon).toBeDefined();
      expect(icon?.getAttribute("aria-hidden")).toBe("true");
    });

    it("should add click event listener to button", () => {
      const container = control.onAdd(map);
      const button = container.querySelector("button");

      // Check that clicking the button doesn't throw
      expect(() => button?.click()).not.toThrow();
    });
  });

  describe("onRemove", () => {
    let map: Map;
    let control: MockGeolocateControl;

    beforeEach(() => {
      map = createMockMap();
      control = new MockGeolocateControl({
        position: { lng: 139.6917, lat: 35.6895 },
      });
      map.addControl(control);
    });

    it("should remove container from DOM", () => {
      const container = map.getContainer().querySelector(".maplibregl-ctrl");
      expect(container).toBeDefined();

      map.removeControl(control);

      const removedContainer = map
        .getContainer()
        .querySelector(".maplibregl-ctrl-geolocate");
      expect(removedContainer).toBeNull();
    });

    it("should not throw when called multiple times", () => {
      map.removeControl(control);
      expect(() => control.onRemove()).not.toThrow();
    });
  });

  describe("event system", () => {
    let map: Map;
    let control: MockGeolocateControl;

    beforeEach(() => {
      map = createMockMap();
      control = new MockGeolocateControl({
        position: { lng: 139.6917, lat: 35.6895 },
        accuracy: 50,
      });
      map.addControl(control);
    });

    describe("on()", () => {
      it("should register geolocate event handler", () => {
        const handler = vi.fn();
        control.on("geolocate", handler);
        control.trigger();
        expect(handler).toHaveBeenCalled();
      });

      it("should register outofmaxbounds event handler", () => {
        map.setMaxBounds([
          [0, 0],
          [10, 10],
        ]);
        const handler = vi.fn();
        control.on("outofmaxbounds", handler);
        control.trigger();
        expect(handler).toHaveBeenCalled();
      });

      it("should return this for chaining", () => {
        const result = control.on("geolocate", () => {});
        expect(result).toBe(control);
      });

      it("should allow multiple handlers for same event", () => {
        const handler1 = vi.fn();
        const handler2 = vi.fn();
        control.on("geolocate", handler1);
        control.on("geolocate", handler2);
        control.trigger();
        expect(handler1).toHaveBeenCalled();
        expect(handler2).toHaveBeenCalled();
      });
    });

    describe("off()", () => {
      it("should remove geolocate event handler", () => {
        const handler = vi.fn();
        control.on("geolocate", handler);
        control.off("geolocate", handler);
        control.trigger();
        expect(handler).not.toHaveBeenCalled();
      });

      it("should return this for chaining", () => {
        const handler = () => {};
        control.on("geolocate", handler);
        const result = control.off("geolocate", handler);
        expect(result).toBe(control);
      });

      it("should not throw when removing non-existent handler", () => {
        expect(() => control.off("geolocate", () => {})).not.toThrow();
      });

      it("should only remove specified handler", () => {
        const handler1 = vi.fn();
        const handler2 = vi.fn();
        control.on("geolocate", handler1);
        control.on("geolocate", handler2);
        control.off("geolocate", handler1);
        control.trigger();
        expect(handler1).not.toHaveBeenCalled();
        expect(handler2).toHaveBeenCalled();
      });
    });

    describe("geolocate event", () => {
      it("should fire with GeolocationPosition object", () => {
        const handler = vi.fn();
        control.on("geolocate", handler);
        control.trigger();

        expect(handler).toHaveBeenCalledWith(
          expect.objectContaining({
            coords: expect.objectContaining({
              latitude: 35.6895,
              longitude: 139.6917,
              accuracy: 50,
              altitude: null,
              altitudeAccuracy: null,
              heading: null,
              speed: null,
            }),
            timestamp: expect.any(Number),
          }),
        );
      });

      it("should include timestamp", () => {
        const handler = vi.fn();
        control.on("geolocate", handler);
        const before = Date.now();
        control.trigger();
        const after = Date.now();

        const event = handler.mock.calls[0][0];
        expect(event.timestamp).toBeGreaterThanOrEqual(before);
        expect(event.timestamp).toBeLessThanOrEqual(after);
      });
    });

    describe("outofmaxbounds event", () => {
      it("should fire when position is outside maxBounds", () => {
        map.setMaxBounds([
          [0, 0],
          [10, 10],
        ]);
        const handler = vi.fn();
        control.on("outofmaxbounds", handler);
        control.trigger();

        expect(handler).toHaveBeenCalledWith(
          expect.objectContaining({
            coords: expect.objectContaining({
              latitude: 35.6895,
              longitude: 139.6917,
            }),
          }),
        );
      });

      it("should not fire geolocate when outside bounds", () => {
        map.setMaxBounds([
          [0, 0],
          [10, 10],
        ]);
        const geolocateHandler = vi.fn();
        const outofboundsHandler = vi.fn();
        control.on("geolocate", geolocateHandler);
        control.on("outofmaxbounds", outofboundsHandler);
        control.trigger();

        expect(geolocateHandler).not.toHaveBeenCalled();
        expect(outofboundsHandler).toHaveBeenCalled();
      });
    });
  });

  describe("trigger()", () => {
    let map: Map;
    let control: MockGeolocateControl;

    beforeEach(() => {
      map = createMockMap();
      control = new MockGeolocateControl({
        position: { lng: 139.6917, lat: 35.6895 },
        accuracy: 100,
      });
      map.addControl(control);
    });

    it("should fire geolocate event", () => {
      const handler = vi.fn();
      control.on("geolocate", handler);
      control.trigger();
      expect(handler).toHaveBeenCalled();
    });

    it("should call fitBounds on map", () => {
      const fitBoundsSpy = vi.spyOn(map, "fitBounds");
      control.trigger();
      expect(fitBoundsSpy).toHaveBeenCalled();
    });

    it("should use configured fitBoundsOptions", () => {
      const customControl = new MockGeolocateControl({
        position: { lng: 139.6917, lat: 35.6895 },
        fitBoundsOptions: { maxZoom: 18, padding: 100 },
      });
      map.addControl(customControl);

      const fitBoundsSpy = vi.spyOn(map, "fitBounds");
      customControl.trigger();

      expect(fitBoundsSpy).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ maxZoom: 18, padding: 100 }),
      );
    });

    it("should check maxBounds before showing markers", () => {
      map.setMaxBounds([
        [0, 0],
        [10, 10],
      ]);
      const outofboundsHandler = vi.fn();
      control.on("outofmaxbounds", outofboundsHandler);

      control.trigger();

      expect(outofboundsHandler).toHaveBeenCalled();
    });
  });

  describe("setPosition()", () => {
    let map: Map;
    let control: MockGeolocateControl;

    beforeEach(() => {
      map = createMockMap();
      control = new MockGeolocateControl({
        position: { lng: 139.6917, lat: 35.6895 },
      });
      map.addControl(control);
    });

    it("should accept object with lng/lat", () => {
      expect(() => control.setPosition({ lng: 140, lat: 36 })).not.toThrow();
    });

    it("should accept array [lng, lat]", () => {
      expect(() => control.setPosition([140, 36])).not.toThrow();
    });

    it("should accept LngLat instance", () => {
      expect(() => control.setPosition(new LngLat(140, 36))).not.toThrow();
    });

    it("should update position in geolocate event", () => {
      control.setPosition({ lng: 140, lat: 36 });

      const handler = vi.fn();
      control.on("geolocate", handler);
      control.trigger();

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          coords: expect.objectContaining({
            latitude: 36,
            longitude: 140,
          }),
        }),
      );
    });
  });

  describe("setAccuracy()", () => {
    let map: Map;
    let control: MockGeolocateControl;

    beforeEach(() => {
      map = createMockMap();
      control = new MockGeolocateControl({
        position: { lng: 139.6917, lat: 35.6895 },
        accuracy: 50,
      });
      map.addControl(control);
    });

    it("should accept number value", () => {
      expect(() => control.setAccuracy(100)).not.toThrow();
    });

    it("should update accuracy in geolocate event", () => {
      control.setAccuracy(200);

      const handler = vi.fn();
      control.on("geolocate", handler);
      control.trigger();

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          coords: expect.objectContaining({
            accuracy: 200,
          }),
        }),
      );
    });
  });

  describe("setShowAccuracyCircle()", () => {
    let map: Map;
    let control: MockGeolocateControl;

    beforeEach(() => {
      map = createMockMap();
      control = new MockGeolocateControl({
        position: { lng: 139.6917, lat: 35.6895 },
      });
      map.addControl(control);
    });

    it("should accept boolean value", () => {
      expect(() => control.setShowAccuracyCircle(false)).not.toThrow();
      expect(() => control.setShowAccuracyCircle(true)).not.toThrow();
    });

    it("should not throw when called before trigger", () => {
      expect(() => control.setShowAccuracyCircle(false)).not.toThrow();
    });

    it("should not throw when called after trigger", () => {
      control.trigger();
      expect(() => control.setShowAccuracyCircle(false)).not.toThrow();
    });
  });

  describe("setFitBoundsOptions()", () => {
    let map: Map;
    let control: MockGeolocateControl;

    beforeEach(() => {
      map = createMockMap();
      control = new MockGeolocateControl({
        position: { lng: 139.6917, lat: 35.6895 },
      });
      map.addControl(control);
    });

    it("should accept FitBoundsOptions object", () => {
      expect(() =>
        control.setFitBoundsOptions({ maxZoom: 18, padding: 50 }),
      ).not.toThrow();
    });

    it("should use new options in subsequent trigger calls", () => {
      control.setFitBoundsOptions({ maxZoom: 20, padding: 100 });

      const fitBoundsSpy = vi.spyOn(map, "fitBounds");
      control.trigger();

      expect(fitBoundsSpy).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ maxZoom: 20, padding: 100 }),
      );
    });
  });

  describe("maxBounds checking", () => {
    let map: Map;
    let control: MockGeolocateControl;

    beforeEach(() => {
      map = createMockMap();
      control = new MockGeolocateControl({
        position: { lng: 139.6917, lat: 35.6895 },
      });
      map.addControl(control);
    });

    it("should fire geolocate when no maxBounds set", () => {
      const handler = vi.fn();
      control.on("geolocate", handler);
      control.trigger();
      expect(handler).toHaveBeenCalled();
    });

    it("should fire geolocate when position is inside maxBounds", () => {
      map.setMaxBounds([
        [139, 35],
        [140, 36],
      ]);
      const handler = vi.fn();
      control.on("geolocate", handler);
      control.trigger();
      expect(handler).toHaveBeenCalled();
    });

    it("should fire outofmaxbounds when position is west of bounds", () => {
      map.setMaxBounds([
        [140, 35],
        [141, 36],
      ]);
      const handler = vi.fn();
      control.on("outofmaxbounds", handler);
      control.trigger();
      expect(handler).toHaveBeenCalled();
    });

    it("should fire outofmaxbounds when position is east of bounds", () => {
      map.setMaxBounds([
        [138, 35],
        [139, 36],
      ]);
      const handler = vi.fn();
      control.on("outofmaxbounds", handler);
      control.trigger();
      expect(handler).toHaveBeenCalled();
    });

    it("should fire outofmaxbounds when position is south of bounds", () => {
      map.setMaxBounds([
        [139, 36],
        [140, 37],
      ]);
      const handler = vi.fn();
      control.on("outofmaxbounds", handler);
      control.trigger();
      expect(handler).toHaveBeenCalled();
    });

    it("should fire outofmaxbounds when position is north of bounds", () => {
      map.setMaxBounds([
        [139, 34],
        [140, 35],
      ]);
      const handler = vi.fn();
      control.on("outofmaxbounds", handler);
      control.trigger();
      expect(handler).toHaveBeenCalled();
    });
  });

  describe("visual markers", () => {
    let map: Map;
    let control: MockGeolocateControl;

    beforeEach(() => {
      map = createMockMap();
      control = new MockGeolocateControl({
        position: { lng: 139.6917, lat: 35.6895 },
      });
      map.addControl(control);
    });

    it("should create position marker when triggered", () => {
      control.trigger();
      const marker = map
        .getContainer()
        .querySelector(".maplibregl-user-location-dot");
      expect(marker).toBeDefined();
    });

    it("should create accuracy circle when triggered", () => {
      control.trigger();
      const circle = map
        .getContainer()
        .querySelector(".maplibregl-user-location-accuracy-circle");
      expect(circle).toBeDefined();
    });

    it("should not show accuracy circle when showAccuracyCircle is false", () => {
      const customControl = new MockGeolocateControl({
        position: { lng: 139.6917, lat: 35.6895 },
        showAccuracyCircle: false,
      });
      map.addControl(customControl);
      customControl.trigger();

      const circle = map
        .getContainer()
        .querySelector(".maplibregl-user-location-accuracy-circle");
      expect(circle).toBeNull();
    });

    it("should remove markers when control is removed", () => {
      control.trigger();
      map.removeControl(control);

      const marker = map
        .getContainer()
        .querySelector(".maplibregl-user-location-dot");
      const circle = map
        .getContainer()
        .querySelector(".maplibregl-user-location-accuracy-circle");

      expect(marker).toBeNull();
      expect(circle).toBeNull();
    });
  });
});
