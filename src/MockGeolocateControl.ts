import {
  LngLat,
  Marker,
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

  // Markers for position and accuracy
  private _positionMarker?: Marker;
  private _accuracyMarker?: Marker;

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

    // Create markers
    this._createMarkers();

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

    // Remove markers from map
    if (this._positionMarker) {
      this._positionMarker.remove();
      this._positionMarker = undefined;
    }

    if (this._accuracyMarker) {
      this._accuracyMarker.remove();
      this._accuracyMarker = undefined;
    }

    // Clean up references
    this._container = undefined;
    this._button = undefined;
    this._map = undefined;
  }

  /**
   * Create the position and accuracy markers
   * @private
   */
  private _createMarkers(): void {
    if (!this._map) return;

    // Create accuracy circle marker (appears behind position marker)
    const accuracyEl = document.createElement("div");
    accuracyEl.style.width = "24px";
    accuracyEl.style.height = "24px";
    accuracyEl.style.borderRadius = "50%";
    accuracyEl.style.backgroundColor = "rgba(33, 150, 243, 0.2)";
    accuracyEl.style.border = "1px solid rgba(33, 150, 243, 0.3)";
    accuracyEl.style.boxSizing = "border-box";

    this._accuracyMarker = new Marker({
      element: accuracyEl,
      anchor: "center",
      pitchAlignment: "map",
      rotationAlignment: "map",
    })
      .setLngLat(this._position)
      .addTo(this._map);

    // Create position marker (blue dot with white border)
    const positionEl = document.createElement("div");
    positionEl.style.width = "16px";
    positionEl.style.height = "16px";
    positionEl.style.borderRadius = "50%";
    positionEl.style.backgroundColor = "#2196F3";
    positionEl.style.border = "2px solid white";
    positionEl.style.boxShadow = "0 1px 4px rgba(0, 0, 0, 0.3)";
    positionEl.style.boxSizing = "border-box";

    this._positionMarker = new Marker({
      element: positionEl,
      anchor: "center",
      pitchAlignment: "map",
      rotationAlignment: "map",
    })
      .setLngLat(this._position)
      .addTo(this._map);

    // Initially hide markers until triggered
    this._hideMarkers();
  }

  /**
   * Show the position markers
   * @private
   */
  private _showMarkers(): void {
    if (this._positionMarker) {
      this._positionMarker.getElement().style.display = "block";
    }
    if (this._accuracyMarker && this._showAccuracyCircle) {
      this._accuracyMarker.getElement().style.display = "block";
    }
  }

  /**
   * Hide the position markers
   * @private
   */
  private _hideMarkers(): void {
    if (this._positionMarker) {
      this._positionMarker.getElement().style.display = "none";
    }
    if (this._accuracyMarker) {
      this._accuracyMarker.getElement().style.display = "none";
    }
  }

  /**
   * Handle button click event (placeholder - will be implemented in Step 4)
   * @private
   */
  private _onClick(): void {
    // Placeholder implementation - will be properly implemented in next PR
    console.log("MockGeolocateControl button clicked - showing markers");

    // Show markers when clicked (temporary - full implementation in next PR)
    this._showMarkers();

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
