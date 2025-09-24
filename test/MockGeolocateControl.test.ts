import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import maplibregl from "maplibre-gl";
import { MockGeolocateControl } from "../src/MockGeolocateControl";

// Mock MapLibre GL
vi.mock("maplibre-gl", () => ({
  default: {
    Map: vi.fn(),
    Marker: vi.fn(() => ({
      setLngLat: vi.fn().mockReturnThis(),
      addTo: vi.fn().mockReturnThis(),
      remove: vi.fn(),
      getElement: vi.fn(() => ({
        style: {},
      })),
    })),
    LngLat: {
      convert: vi.fn((coords) => ({
        lng: coords.lng || coords[0],
        lat: coords.lat || coords[1],
        distanceTo: vi.fn(() => 100),
      })),
    },
    LngLatBounds: {
      fromLngLat: vi.fn((center, radius) => ({
        getCenter: () => center,
        _ne: { lng: center.lng + 0.001, lat: center.lat + 0.001 },
        _sw: { lng: center.lng - 0.001, lat: center.lat - 0.001 },
      })),
    },
  },
}));

describe("MockGeolocateControl", () => {
  let control: MockGeolocateControl;
  let mockMap: any;

  beforeEach(() => {
    // Create mock map
    mockMap = {
      project: vi.fn(() => ({ x: 100, y: 100 })),
      unproject: vi.fn(() => ({
        lng: 139.75,
        lat: 35.66,
        distanceTo: vi.fn(() => 100),
      })),
      on: vi.fn(),
      off: vi.fn(),
      fitBounds: vi.fn(),
      getMaxBounds: vi.fn(() => null),
    };

    control = new MockGeolocateControl({
      position: { lng: 139.74135747, lat: 35.65809922 },
      accuracy: 50,
    });
  });

  describe("constructor", () => {
    it("should create instance with required position", () => {
      expect(control).toBeDefined();
    });

    it("should throw error if position is missing", () => {
      expect(() => {
        new MockGeolocateControl({} as any);
      }).toThrow("position option is required");
    });

    it("should use default values for optional properties", () => {
      const minimalControl = new MockGeolocateControl({
        position: { lng: 0, lat: 0 },
      });
      expect(minimalControl).toBeDefined();
    });
  });

  describe("onAdd", () => {
    it("should create container element", () => {
      const container = control.onAdd(mockMap);
      expect(container).toBeInstanceOf(HTMLElement);
      expect(container.className).toContain("maplibregl-ctrl");
    });

    it("should create button element", () => {
      const container = control.onAdd(mockMap);
      const button = container.querySelector("button");
      expect(button).toBeDefined();
      expect(button?.className).toContain("maplibregl-ctrl-geolocate");
    });
  });

  describe("onRemove", () => {
    it("should clean up resources", () => {
      control.onAdd(mockMap);
      expect(() => control.onRemove()).not.toThrow();
    });
  });

  describe("trigger", () => {
    beforeEach(() => {
      control.onAdd(mockMap);
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should transition from OFF to ACTIVE_LOCK state", () => {
      const geolocateHandler = vi.fn();
      control.on("geolocate", geolocateHandler);

      control.trigger();
      vi.advanceTimersByTime(300);

      expect(geolocateHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          coords: expect.objectContaining({
            latitude: expect.any(Number),
            longitude: expect.any(Number),
            accuracy: 50,
          }),
        }),
      );
    });

    it("should fire outofmaxbounds event if position is outside bounds", () => {
      mockMap.getMaxBounds = vi.fn(() => ({
        getWest: () => 139,
        getEast: () => 140,
        getSouth: () => 35,
        getNorth: () => 36,
      }));

      const outOfBoundsControl = new MockGeolocateControl({
        position: { lng: 150, lat: 40 },
        accuracy: 50,
      });
      outOfBoundsControl.onAdd(mockMap);

      const outOfBoundsHandler = vi.fn();
      outOfBoundsControl.on("outofmaxbounds", outOfBoundsHandler);

      outOfBoundsControl.trigger();
      vi.advanceTimersByTime(300);

      expect(outOfBoundsHandler).toHaveBeenCalled();
    });

    it("should toggle off when triggered while active", () => {
      control.trigger();
      vi.advanceTimersByTime(300);

      // Should be active now
      control.trigger();

      // Should be off now
      const button = control["_button"];
      expect(
        button?.classList.contains("maplibregl-ctrl-geolocate-active"),
      ).toBe(false);
    });
  });

  describe("setPosition", () => {
    beforeEach(() => {
      control.onAdd(mockMap);
    });

    it("should update position", () => {
      const newPosition = { lng: 140, lat: 36 };
      control.setPosition(newPosition);

      // Should update internal position
      expect(maplibregl.LngLat.convert).toHaveBeenCalledWith(newPosition);
    });

    it("should fire geolocate event if active", () => {
      vi.useFakeTimers();

      // Activate control first
      control.trigger();
      vi.advanceTimersByTime(300);

      const geolocateHandler = vi.fn();
      control.on("geolocate", geolocateHandler);

      const newPosition = { lng: 140, lat: 36 };
      control.setPosition(newPosition);

      expect(geolocateHandler).toHaveBeenCalled();

      vi.useRealTimers();
    });
  });

  describe("setAccuracy", () => {
    beforeEach(() => {
      control.onAdd(mockMap);
    });

    it("should update accuracy", () => {
      const newAccuracy = 100;
      control.setAccuracy(newAccuracy);

      // Verify accuracy is updated (we can't directly check private property)
      // But we can verify no errors occur
      expect(() => control.setAccuracy(newAccuracy)).not.toThrow();
    });

    it("should fire geolocate event if active", () => {
      vi.useFakeTimers();

      // Activate control first
      control.trigger();
      vi.advanceTimersByTime(300);

      const geolocateHandler = vi.fn();
      control.on("geolocate", geolocateHandler);

      control.setAccuracy(100);

      expect(geolocateHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          coords: expect.objectContaining({
            accuracy: 100,
          }),
        }),
      );

      vi.useRealTimers();
    });
  });

  describe("setShowAccuracyCircle", () => {
    beforeEach(() => {
      control.onAdd(mockMap);
    });

    it("should toggle accuracy circle visibility", () => {
      control.setShowAccuracyCircle(false);
      expect(() => control.setShowAccuracyCircle(false)).not.toThrow();

      control.setShowAccuracyCircle(true);
      expect(() => control.setShowAccuracyCircle(true)).not.toThrow();
    });
  });

  describe("setFitBoundsOptions", () => {
    it("should update fit bounds options", () => {
      const newOptions = { maxZoom: 18 };
      control.setFitBoundsOptions(newOptions);

      // Verify no errors occur
      expect(() => control.setFitBoundsOptions(newOptions)).not.toThrow();
    });
  });

  describe("getter methods", () => {
    it("should get current position", () => {
      const position = control.getPosition();
      expect(position).toBeDefined();
      expect(position.lng).toBe(139.74135747);
      expect(position.lat).toBe(35.65809922);
    });

    it("should get current accuracy", () => {
      const accuracy = control.getAccuracy();
      expect(accuracy).toBe(50);
    });

    it("should get current watch state", () => {
      const state = control.getWatchState();
      expect(state).toBe("OFF");
    });

    it("should return updated values after setters", () => {
      control.setPosition({ lng: 140, lat: 36 });
      const position = control.getPosition();
      expect(position.lng).toBe(140);
      expect(position.lat).toBe(36);

      control.setAccuracy(100);
      const accuracy = control.getAccuracy();
      expect(accuracy).toBe(100);
    });

    it("should return updated state after trigger", () => {
      control.onAdd(mockMap);
      vi.useFakeTimers();

      control.trigger();
      expect(control.getWatchState()).toBe("WAITING_ACTIVE");

      vi.advanceTimersByTime(300);
      expect(control.getWatchState()).toBe("ACTIVE_LOCK");

      control.trigger();
      expect(control.getWatchState()).toBe("OFF");

      vi.useRealTimers();
    });
  });

  describe("event system", () => {
    it("should register and fire geolocate events", () => {
      const handler = vi.fn();
      control.on("geolocate", handler);

      // Manually fire event to test event system
      control["_fire"]("geolocate", {
        coords: {
          latitude: 35.65,
          longitude: 139.74,
          accuracy: 50,
        },
      });

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          coords: expect.objectContaining({
            latitude: 35.65,
            longitude: 139.74,
            accuracy: 50,
          }),
        }),
      );
    });

    it("should unregister events with off", () => {
      const handler = vi.fn();
      control.on("geolocate", handler);
      control.off("geolocate", handler);

      control["_fire"]("geolocate", {
        coords: {
          latitude: 35.65,
          longitude: 139.74,
          accuracy: 50,
        },
      });

      expect(handler).not.toHaveBeenCalled();
    });

    it("should support multiple handlers", () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      control.on("geolocate", handler1);
      control.on("geolocate", handler2);

      control["_fire"]("geolocate", {
        coords: {
          latitude: 35.65,
          longitude: 139.74,
          accuracy: 50,
        },
      });

      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });
  });
});
