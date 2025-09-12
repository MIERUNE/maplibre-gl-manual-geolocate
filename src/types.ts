import type { LngLatLike, FitBoundsOptions } from 'maplibre-gl';

/**
 * Configuration options for MockGeolocateControl
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
 * Coordinate information in geolocate event format
 */
export interface MockGeolocateCoords {
  /**
   * Latitude in decimal degrees
   */
  latitude: number;
  
  /**
   * Longitude in decimal degrees  
   */
  longitude: number;
  
  /**
   * Accuracy radius in meters
   */
  accuracy: number;
}

/**
 * Event data for geolocate events
 */
export interface MockGeolocateEvent {
  /**
   * The coordinate information
   */
  coords: MockGeolocateCoords;
}

/**
 * Event data for outofmaxbounds events
 */
export interface MockOutOfMaxBoundsEvent {
  /**
   * The coordinate information that is outside bounds
   */
  coords: MockGeolocateCoords;
}

/**
 * Normalized coordinate object used internally
 */
export interface NormalizedLngLat {
  lng: number;
  lat: number;
}