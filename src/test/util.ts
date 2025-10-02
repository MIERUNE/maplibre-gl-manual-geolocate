import { Map } from 'maplibre-gl';
import { vi } from 'vitest';

/**
 * Creates a test map instance with sensible defaults for testing
 * Inspired by MapLibre GL JS test utilities
 */
export function createMap(options?: any): Map {
  const container = document.createElement('div');
  container.style.width = '200px';
  container.style.height = '200px';
  document.body.appendChild(container);

  const defaultOptions = {
    container,
    interactive: false,
    attributionControl: false,
    trackResize: true,
    style: {
      version: 8,
      sources: {},
      layers: [],
    },
    ...options,
  };

  return new Map(defaultOptions);
}

/**
 * Wait for an event to be fired on an event emitter
 */
export function waitForEvent(emitter: any, event: string): Promise<any> {
  return new Promise((resolve) => {
    emitter.once(event, (data?: any) => {
      resolve(data);
    });
  });
}

/**
 * Sleep for a specified number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Creates a mock GeolocationPosition object
 */
export function createMockPosition(lng: number, lat: number, accuracy = 10): GeolocationPosition {
  return {
    coords: {
      latitude: lat,
      longitude: lng,
      accuracy,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
    },
    timestamp: Date.now(),
  };
}

/**
 * Creates a mock GeolocationPositionError
 */
export function createMockPositionError(code: number, message: string): GeolocationPositionError {
  const error = new Error(message) as GeolocationPositionError;
  error.code = code;
  error.message = message;
  error.PERMISSION_DENIED = 1;
  error.POSITION_UNAVAILABLE = 2;
  error.TIMEOUT = 3;
  return error;
}

/**
 * Cleanup function to remove map and restore mocks
 */
export function cleanupMap(map: Map): void {
  if (map && !map._removed) {
    map.remove();
  }
  // Remove any remaining DOM elements
  const containers = document.querySelectorAll('div');
  containers.forEach((container) => {
    if (container.classList.contains('maplibregl-map') ||
        container.classList.contains('mapboxgl-map')) {
      container.remove();
    }
  });
  vi.clearAllMocks();
}