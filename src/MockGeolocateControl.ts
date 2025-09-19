import {
  LngLat,
  type IControl,
  type Map,
  type FitBoundsOptions,
  type LngLatLike,
} from "maplibre-gl";
import type {
  MockGeolocateControlOptions,
  EventHandlers,
  GeolocateEventData,
  OutOfMaxBoundsEventData,
} from "./types";

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

  // Event handlers storage
  private _eventHandlers: EventHandlers = {};

  /**
   * Creates a new MockGeolocateControl instance
   * @param options - Configuration options for the control
   */
  constructor(options: MockGeolocateControlOptions) {
    // Validate required position option
    if (!options.position) {
      throw new Error("MockGeolocateControl: position option is required");
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
    this._container = document.createElement("div");
    this._container.className = "maplibregl-ctrl maplibregl-ctrl-group";

    // Create button element
    this._button = document.createElement("button");
    this._button.type = "button";
    this._button.className = "maplibregl-ctrl-geolocate";
    this._button.title = "Find my location";

    // Add icon span (required for MapLibre GL styles)
    const iconSpan = document.createElement("span");
    iconSpan.className = "maplibregl-ctrl-icon";
    iconSpan.setAttribute("aria-hidden", "true");
    this._button.appendChild(iconSpan);

    // Add button to container
    this._container.appendChild(this._button);

    // Placeholder for click handler (will be implemented in Step 4)
    this._button.addEventListener("click", this._onClick.bind(this));

    return this._container;
  }

  /**
   * Unregister a control on the map and give it a chance to detach event listeners
   * and resources. This method is called by Map#removeControl.
   */
  onRemove(): void {
    // Clean up event listeners
    if (this._button) {
      this._button.removeEventListener("click", this._onClick.bind(this));
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
    // Placeholder implementation - will be properly implemented in next PR
    console.log("MockGeolocateControl button clicked");

    // Test event firing (temporary - will be properly implemented later)
    const testData: GeolocateEventData = {
      coords: {
        latitude: this._position.lat,
        longitude: this._position.lng,
        accuracy: this._accuracy,
      },
    };
    this._fire("geolocate", testData);
  }

  /**
   * Programmatically trigger the geolocate control
   * (Placeholder - will be implemented in Step 7)
   */
  trigger(): void {
    // Placeholder implementation
    console.log("MockGeolocateControl.trigger() called");
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
   * Register an event handler
   * @param type - The event type ('geolocate' or 'outofmaxbounds')
   * @param listener - The event handler function
   */
  on(type: "geolocate", listener: (e: GeolocateEventData) => void): this;
  on(
    type: "outofmaxbounds",
    listener: (e: OutOfMaxBoundsEventData) => void,
  ): this;
  on(type: "geolocate" | "outofmaxbounds", listener: (e: any) => void): this {
    if (!this._eventHandlers[type]) {
      this._eventHandlers[type] = [];
    }
    this._eventHandlers[type]!.push(listener as any);
    return this;
  }

  /**
   * Remove an event handler
   * @param type - The event type
   * @param listener - The event handler function to remove
   */
  off(type: "geolocate", listener: (e: GeolocateEventData) => void): this;
  off(
    type: "outofmaxbounds",
    listener: (e: OutOfMaxBoundsEventData) => void,
  ): this;
  off(type: "geolocate" | "outofmaxbounds", listener: (e: any) => void): this {
    if (!this._eventHandlers[type]) {
      return this;
    }

    const handlers = this._eventHandlers[type]!;
    const index = handlers.indexOf(listener as any);
    if (index !== -1) {
      handlers.splice(index, 1);
    }

    return this;
  }

  /**
   * Fire an event
   * @private
   */
  private _fire(type: "geolocate", data: GeolocateEventData): void;
  private _fire(type: "outofmaxbounds", data: OutOfMaxBoundsEventData): void;
  private _fire(
    type: "geolocate" | "outofmaxbounds",
    data: GeolocateEventData | OutOfMaxBoundsEventData,
  ): void {
    if (!this._eventHandlers[type]) {
      return;
    }

    const handlers = this._eventHandlers[type]!;
    for (const handler of handlers) {
      handler(data);
    }
  }
}
