import {
  LngLat,
  type IControl,
  type Map,
  type FitBoundsOptions,
  type LngLatLike,
  Marker,
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

  // Options
  private _position: LngLat;
  private _accuracy: number;
  private _showAccuracyCircle: boolean;
  private _fitBoundsOptions: FitBoundsOptions;

  // Event handlers
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

    // Add click handler
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
   * Update the accuracy circle size based on current zoom and accuracy
   * @private
   */
  private _updateAccuracyCircle(): void {
    if (!this._map || !this._accuracyMarker) return;

    const metersPerPixel = this._getMetersPerPixelAtLatitude(
      this._position.lat,
      this._map.getZoom(),
    );

    const pixelRadius = this._accuracy / metersPerPixel;
    const diameter = pixelRadius * 2;

    const element = this._accuracyMarker.getElement();
    element.style.width = `${diameter}px`;
    element.style.height = `${diameter}px`;

    // Update visibility based on _showAccuracyCircle
    if (this._showAccuracyCircle) {
      element.style.display = "block";
    } else {
      element.style.display = "none";
    }
  }

  /**
   * Calculate meters per pixel at a given latitude and zoom level
   * @private
   */
  private _getMetersPerPixelAtLatitude(latitude: number, zoom: number): number {
    const earthCircumference = 40075017; // meters at equator
    const latitudeRadians = (latitude * Math.PI) / 180;
    return (
      (earthCircumference * Math.cos(latitudeRadians)) / Math.pow(2, zoom + 8)
    );
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
    this._updateAccuracyCircle();
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
   * Handle button click event
   * @private
   */
  private _onClick(): void {
    if (!this._map) return;

    // Check if position is within map bounds (if maxBounds is set)
    const bounds = this._map.getMaxBounds();
    const isOutOfBounds = bounds && !bounds.contains(this._position);

    // Prepare event data
    const eventData: GeolocateEventData = {
      coords: {
        latitude: this._position.lat,
        longitude: this._position.lng,
        accuracy: this._accuracy,
      },
    };

    if (isOutOfBounds) {
      // Fire outofmaxbounds event
      this._fire("outofmaxbounds", eventData);
    } else {
      // Show markers
      this._showMarkers();

      // Update accuracy circle on zoom
      this._map.on("zoom", () => this._updateAccuracyCircle());

      // Fire geolocate event
      this._fire("geolocate", eventData);

      // Center map on position with zoom-to-accuracy
      this._centerOnPosition();
    }
  }

  /**
   * Center the map on the mock position with appropriate zoom
   * @private
   */
  private _centerOnPosition(): void {
    if (!this._map) return;

    // Calculate bounds from position and accuracy
    const bounds = this._getBoundsForAccuracy();

    // Fit map to bounds with options
    this._map.fitBounds(bounds, this._fitBoundsOptions);
  }

  /**
   * Calculate bounds based on position and accuracy radius
   * @private
   */
  private _getBoundsForAccuracy(): [number, number, number, number] {
    // Convert accuracy (meters) to approximate degrees
    // 1 degree latitude ≈ 111,111 meters
    const metersPerDegree = 111111;
    const deltaLat = this._accuracy / metersPerDegree;

    // Longitude degrees vary by latitude
    const metersPerDegreeLng =
      metersPerDegree * Math.cos((this._position.lat * Math.PI) / 180);
    const deltaLng = this._accuracy / metersPerDegreeLng;

    return [
      this._position.lng - deltaLng,
      this._position.lat - deltaLat,
      this._position.lng + deltaLng,
      this._position.lat + deltaLat,
    ];
  }

  /**
   * Programmatically trigger the geolocate control
   */
  trigger(): void {
    this._onClick();
  }

  /**
   * Update the mock position
   * @param coordinates - The new coordinates to set
   */
  setPosition(coordinates: LngLatLike): void {
    this._position = LngLat.convert(coordinates);

    // Update marker positions if they exist
    if (this._positionMarker) {
      this._positionMarker.setLngLat(this._position);
    }
    if (this._accuracyMarker) {
      this._accuracyMarker.setLngLat(this._position);
      this._updateAccuracyCircle();
    }
  }

  /**
   * Update the accuracy radius
   * @param accuracy - The new accuracy radius in meters
   */
  setAccuracy(accuracy: number): void {
    this._accuracy = accuracy;

    // Update accuracy circle if it exists
    if (this._accuracyMarker) {
      this._updateAccuracyCircle();
    }
  }

  /**
   * Toggle the accuracy circle visibility
   * @param show - Whether to show the accuracy circle
   */
  setShowAccuracyCircle(show: boolean): void {
    this._showAccuracyCircle = show;

    // Update accuracy circle visibility
    if (this._accuracyMarker) {
      const element = this._accuracyMarker.getElement();
      if (show && this._positionMarker?.getElement().style.display !== "none") {
        element.style.display = "block";
        this._updateAccuracyCircle();
      } else {
        element.style.display = "none";
      }
    }
  }

  /**
   * Update the fit bounds options
   * @param options - The new fit bounds options
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
