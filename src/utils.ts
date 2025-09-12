import type { LngLatLike } from 'maplibre-gl';
import { LngLat } from 'maplibre-gl';
import type { NormalizedLngLat } from './types.js';

/**
 * Normalizes various LngLatLike formats into a consistent {lng, lat} object
 * 
 * Supports:
 * - [lng, lat] array format
 * - {lng: number, lat: number} object format
 * - {lon: number, lat: number} object format
 * - LngLat instance
 */
export function normalizeLngLat(lngLatLike: LngLatLike): NormalizedLngLat {
  // Handle array format [lng, lat]
  if (Array.isArray(lngLatLike)) {
    const [lng, lat] = lngLatLike;
    return { lng, lat };
  }
  
  // Handle LngLat instance
  if (lngLatLike instanceof LngLat) {
    return { lng: lngLatLike.lng, lat: lngLatLike.lat };
  }
  
  // Handle object formats
  if (typeof lngLatLike === 'object' && lngLatLike !== null) {
    // Handle {lng, lat} format
    if ('lng' in lngLatLike && 'lat' in lngLatLike) {
      return { lng: lngLatLike.lng, lat: lngLatLike.lat };
    }
    
    // Handle {lon, lat} format
    if ('lon' in lngLatLike && 'lat' in lngLatLike) {
      return { lng: (lngLatLike as any).lon, lat: lngLatLike.lat };
    }
  }
  
  throw new Error('Invalid coordinate format. Expected [lng, lat], {lng, lat}, {lon, lat}, or LngLat instance');
}

/**
 * Calculates the optimal zoom level based on accuracy radius
 * Uses an approximation where accuracy radius maps to zoom level
 */
export function calculateZoomFromAccuracy(accuracy: number): number {
  // This is an approximation based on MapLibre GL JS's typical zoom-to-accuracy mapping
  // At equator: zoom 0 ≈ 40,075,000m, each zoom level roughly halves the scale
  const earthCircumference = 40075000; // meters at equator
  const zoomLevel = Math.log2(earthCircumference / (accuracy * 4));
  
  // Clamp to reasonable bounds
  return Math.max(1, Math.min(22, zoomLevel));
}

/**
 * Generates a unique ID for map sources and layers
 */
export function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Checks if coordinates are within map bounds
 */
export function isWithinBounds(
  coords: NormalizedLngLat, 
  bounds?: [[number, number], [number, number]]
): boolean {
  if (!bounds) {
    return true;
  }
  
  const [[minLng, minLat], [maxLng, maxLat]] = bounds;
  return coords.lng >= minLng && 
         coords.lng <= maxLng && 
         coords.lat >= minLat && 
         coords.lat <= maxLat;
}