import type { FitBoundsOptions, LngLatLike } from "maplibre-gl";

/**
 * State of the geolocate control.
 *
 * - `OFF`: Control is inactive, no location shown
 * - `WAITING_ACTIVE`: Transitioning to active state (shows loading animation)
 * - `ACTIVE_LOCK`: Control is active, showing location and tracking
 */
export type WatchState = "OFF" | "WAITING_ACTIVE" | "ACTIVE_LOCK";

/**
 * Configuration options for MockGeolocateControl.
 * Only `position` is required; all other options have sensible defaults.
 */
export interface MockGeolocateControlOptions {
  /**
   * The mock location coordinates.
   *
   * @required
   * Accepts various coordinate formats:
   * - Object: `{lng: number, lat: number}` or `{lon: number, lat: number}`
   * - Array: `[longitude, latitude]`
   * - Instance: MapLibre `LngLat` object
   *
   * @example
   * position: { lng: 139.7413, lat: 35.6580 }  // Tokyo
   * position: [-74.0060, 40.7128]              // New York (array format)
   */
  position: LngLatLike;

  /**
   * Radius of the accuracy circle in meters.
   * Represents GPS accuracy - larger values show less precise location.
   * @default 50
   */
  accuracy?: number;

  /**
   * Controls visibility of the semi-transparent accuracy circle.
   * Set to `false` for a cleaner look or when accuracy isn't relevant.
   * @default true
   */
  showAccuracyCircle?: boolean;

  /**
   * Options for map.fitBounds() when centering on the mock location.
   * Controls zoom level, padding, animation duration, etc.
   *
   * @default {maxZoom: 15}
   * @see https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/FitBoundsOptions/
   *
   * @example
   * fitBoundsOptions: {
   *   maxZoom: 18,
   *   padding: { top: 50, bottom: 50, left: 50, right: 50 },
   *   duration: 1000 // 1 second animation
   * }
   */
  fitBoundsOptions?: FitBoundsOptions;
}

/**
 * Event data for successful geolocation.
 * Structure matches MapLibre's native GeolocateControl for compatibility.
 */
export interface GeolocateEventData {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
}

/**
 * Event data when position is outside map's maxBounds.
 * Fired instead of 'geolocate' when location is out of bounds.
 */
export interface OutOfMaxBoundsEventData extends GeolocateEventData {}

/**
 * Available event types for MockGeolocateControl.
 * Use with `on()` and `off()` methods to handle control events.
 */
export type MockGeolocateEventType = "geolocate" | "outofmaxbounds";

/**
 * Generic event handler function signature.
 * @internal
 */
export type EventHandler<T = any> = (event: T) => void;

/**
 * Internal mapping of event types to their registered handlers.
 * @internal
 */
export interface EventHandlers {
  geolocate?: EventHandler<GeolocateEventData>[];
  outofmaxbounds?: EventHandler<OutOfMaxBoundsEventData>[];
}
