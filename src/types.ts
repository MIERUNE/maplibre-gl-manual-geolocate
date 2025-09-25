import type { FitBoundsOptions, LngLatLike } from "maplibre-gl";

/**
 * Options for the MockGeolocateControl
 */
export interface MockGeolocateControlOptions {
  /**
   * The mock coordinates to display.
   * Accepts various coordinate formats:
   * - `{lng: number, lat: number}` object
   * - `{lon: number, lat: number}` object
   * - `[lng, lat]` array
   * - `LngLat` instance
   */
  position: LngLatLike;

  /**
   * Accuracy circle radius in meters
   * @default 50
   */
  accuracy?: number;

  /**
   * Whether to show the transparent circle around the position indicating the accuracy
   * @default true
   */
  showAccuracyCircle?: boolean;

  /**
   * A `FitBoundsOptions` object to use when the map is panned and zoomed to the mock location.
   * The default is to use a `maxZoom` of 15 to limit how far the map will zoom in for very accurate locations.
   * @default {maxZoom: 15}
   */
  fitBoundsOptions?: FitBoundsOptions;
}

/**
 * Mock Position object that mimics the browser's GeolocationPosition interface.
 * This is the data structure passed to both 'geolocate' and 'outofmaxbounds' events,
 * matching the behavior of the original GeolocateControl.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/GeolocationPosition
 */
export interface MockPosition {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  timestamp: number;
}

/**
 * Event types supported by MockGeolocateControl
 */
export type MockGeolocateEventType = "geolocate" | "outofmaxbounds";

/**
 * Event handler function type
 */
export type EventHandler<T = any> = (event: T) => void;

/**
 * Map of event types to their handler functions
 */
export interface EventHandlers {
  geolocate?: EventHandler<MockPosition>[];
  outofmaxbounds?: EventHandler<MockPosition>[];
}
