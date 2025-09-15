// Entry point for the library

// Export main control class
export { MockGeolocateControl } from './MockGeolocateControl.js';

// Export TypeScript interfaces and types
export type {
  MockGeolocateControlOptions,
  MockGeolocateCoords,
  MockGeolocateEvent,
  MockOutOfMaxBoundsEvent,
  NormalizedLngLat
} from './types.js';

// Export utility functions (for advanced users)
export {
  normalizeLngLat,
  calculateZoomFromAccuracy,
  generateId,
  isWithinBounds
} from './utils.js';
