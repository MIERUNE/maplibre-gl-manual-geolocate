import { LngLat, type IControl, type Map, type FitBoundsOptions, type LngLatLike } from 'maplibre-gl';
import type { MockGeolocateControlOptions } from './types';

/**
 * A MapLibre GL control that displays a user position marker at specified coordinates
 * without requiring the browser's geolocation API.
 * 
 * @example
 * ```typescript
 * const mockGeolocateControl = new MockGeolocateControl({
 *   position: { lng: 139.74135747, lat: 35.65809922 },
 *   accuracy: 50
 * });
 * map.addControl(mockGeolocateControl, 'top-right');
 * ```
 */
export class MockGeolocateControl implements IControl {
  private _map?: Map;
  private _container?: HTMLElement;
  private _button?: HTMLButtonElement;
  
  // Options (will be used in future steps)
  private _position: LngLat;
  private _accuracy: number;
  private _showAccuracyCircle: boolean;
  private _fitBoundsOptions: FitBoundsOptions;

  /**
   * Creates a new MockGeolocateControl instance
   * @param options - Configuration options for the control
   */
  constructor(options: MockGeolocateControlOptions) {
    // Validate required position option
    if (!options.position) {
      throw new Error('MockGeolocateControl: position option is required');
    }

    // Convert position using MapLibre's built-in converter
    this._position = LngLat.convert(options.position);
    
    // Set defaults for optional properties
    this._accuracy = options.accuracy ?? 50;
    this._showAccuracyCircle = options.showAccuracyCircle ?? true;
    this._fitBoundsOptions = options.fitBoundsOptions ?? { maxZoom: 15 };
  }

  /**
   * Register a control on the map and give it a chance to register event listeners
   * and resources. This method is called by Map#addControl.
   * 
   * @param map - The Map instance to add the control to
   * @returns The control's container element
   */
  onAdd(map: Map): HTMLElement {
    this._map = map;
    
    // Create container element
    this._container = document.createElement('div');
    this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group';
    
    // Create button element
    this._button = document.createElement('button');
    this._button.type = 'button';
    this._button.className = 'maplibregl-ctrl-geolocate';
    this._button.title = 'Find my location';
    
    // Add icon span (required for MapLibre GL styles)
    const iconSpan = document.createElement('span');
    iconSpan.className = 'maplibregl-ctrl-icon';
    iconSpan.setAttribute('aria-hidden', 'true');
    this._button.appendChild(iconSpan);
    
    // Add button to container
    this._container.appendChild(this._button);
    
    // Placeholder for click handler (will be implemented in Step 4)
    this._button.addEventListener('click', this._onClick.bind(this));
    
    return this._container;
  }

  /**
   * Unregister a control on the map and give it a chance to detach event listeners
   * and resources. This method is called by Map#removeControl.
   */
  onRemove(): void {
    // Clean up event listeners
    if (this._button) {
      this._button.removeEventListener('click', this._onClick.bind(this));
    }
    
    // Remove DOM elements
    if (this._container && this._container.parentNode) {
      this._container.parentNode.removeChild(this._container);
    }
    
    // Clean up references
    this._container = undefined;
    this._button = undefined;
    this._map = undefined;
  }

  /**
   * Handle button click event (placeholder - will be implemented in Step 4)
   * @private
   */
  private _onClick(): void {
    // Placeholder implementation
    console.log('MockGeolocateControl button clicked');
    // Actual implementation will trigger the geolocate functionality
    // These private variables will be used in Step 7:
    void this._map;
    void this._position;
    void this._accuracy;
    void this._showAccuracyCircle;
    void this._fitBoundsOptions;
  }


  /**
   * Programmatically trigger the geolocate control
   * (Placeholder - will be implemented in Step 7)
   */
  trigger(): void {
    // Placeholder implementation
    console.log('MockGeolocateControl.trigger() called');
    // Will be properly implemented in Step 7
  }

  /**
   * Update the mock position
   * (Placeholder - will be implemented in Step 9)
   */
  setPosition(coordinates: LngLatLike): void {
    this._position = LngLat.convert(coordinates);
    // Will update marker position in Step 9
  }

  /**
   * Update the accuracy radius
   * (Placeholder - will be implemented in Step 10)
   */
  setAccuracy(accuracy: number): void {
    this._accuracy = accuracy;
    // Will update accuracy circle in Step 10
  }

  /**
   * Toggle the accuracy circle visibility
   * (Placeholder - will be implemented in Step 11)
   */
  setShowAccuracyCircle(show: boolean): void {
    this._showAccuracyCircle = show;
    // Will toggle circle visibility in Step 11
  }

  /**
   * Update the fit bounds options
   * (Placeholder - will be implemented in Step 12)
   */
  setFitBoundsOptions(options: FitBoundsOptions): void {
    this._fitBoundsOptions = options;
  }

  /**
   * Event handler registration (placeholder - will be implemented in Step 13)
   */
  on(type: string, _listener: Function): this {
    // Placeholder implementation
    console.log(`Event listener registered for ${type}`);
    return this;
  }

  /**
   * Event handler removal (placeholder - will be implemented in Step 13)
   */
  off(type: string, _listener: Function): this {
    // Placeholder implementation
    console.log(`Event listener removed for ${type}`);
    return this;
  }
}