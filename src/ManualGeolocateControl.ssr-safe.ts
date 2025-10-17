import type { FitBoundsOptions, IControl, LngLatLike, Map } from "maplibre-gl";
import type { EventHandlers, ManualGeolocateControlOptions } from "./types";

/**
 * A MapLibre GL control that displays a user position marker at specified coordinates
 * without requiring the browser's geolocation API.
 *
 * This SSR-safe version lazy-loads maplibre-gl dependencies to avoid SSR issues.
 *
 * @example
 * ```typescript
 * const manualGeolocateControl = new ManualGeolocateControl({
 *   position: { lng: 139.74135747, lat: 35.65809922 },
 *   accuracy: 50
 * });
 * map.addControl(manualGeolocateControl, 'top-right');
 * ```
 */
export class ManualGeolocateControl implements IControl {
  private _map?: Map;
  private _container?: HTMLElement;
  private _button?: HTMLButtonElement;

  // Options (will be used in future steps)
  private _position: LngLatLike;
  private _accuracy: number;
  private _showAccuracyCircle: boolean;
  private _fitBoundsOptions: FitBoundsOptions;

  // Event handlers storage
  private _eventHandlers: EventHandlers = {};

  // Markers for position and accuracy
  private _positionMarker?: any; // Will be Marker type at runtime
  private _accuracyMarker?: any; // Will be Marker type at runtime

  // Track if we've set up map event listeners
  private _mapEventListenersSetup = false;

  // Bound update function for event listeners (stored to ensure proper removal)
  private _updateCircleHandler?: () => void;

  // Bound click handler (stored to ensure proper removal)
  private _onClickHandler?: () => void;

  // Store maplibre-gl classes after lazy loading
  private _maplibreClasses?: {
    LngLat: typeof import("maplibre-gl").LngLat;
    Marker: typeof import("maplibre-gl").Marker;
    LngLatBounds: typeof import("maplibre-gl").LngLatBounds;
  };

  /**
   * Creates a new ManualGeolocateControl instance
   * @param options - Configuration options for the control
   */
  constructor(options: ManualGeolocateControlOptions) {
    // Validate required position option
    if (!options.position) {
      throw new Error("ManualGeolocateControl: position option is required");
    }

    // Store position as-is (will convert when classes are loaded)
    this._position = options.position;

    // Set defaults for optional properties
    this._accuracy = options.accuracy ?? 50;
    this._showAccuracyCircle = options.showAccuracyCircle ?? true;
    this._fitBoundsOptions = options.fitBoundsOptions ?? { maxZoom: 15 };
  }

  /**
   * Lazy-load maplibre-gl classes
   * @private
   */
  private async _loadMaplibreClasses() {
    if (this._maplibreClasses) {
      return this._maplibreClasses;
    }

    // Dynamically import maplibre-gl only when needed (in browser)
    const maplibregl = await import("maplibre-gl");
    this._maplibreClasses = {
      LngLat: maplibregl.LngLat,
      Marker: maplibregl.Marker,
      LngLatBounds: maplibregl.LngLatBounds,
    };

    // Convert position using MapLibre's built-in converter
    this._position = this._maplibreClasses.LngLat.convert(this._position);

    return this._maplibreClasses;
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

    // Store bound click handler to enable proper removal
    this._onClickHandler = this._onClick.bind(this);
    this._button.addEventListener("click", this._onClickHandler);

    // Create markers asynchronously
    this._createMarkers().catch(console.error);

    return this._container;
  }

  /**
   * Unregister a control on the map and give it a chance to detach event listeners
   * and resources. This method is called by Map#removeControl.
   */
  onRemove(): void {
    // Remove map event listeners first
    this._removeMapEventListeners();

    // Clean up event listeners
    if (this._onClickHandler) {
      this._button?.removeEventListener("click", this._onClickHandler);
      this._onClickHandler = undefined;
    }

    // Remove DOM elements
    this._container?.parentNode?.removeChild(this._container);

    // Remove markers from map
    this._positionMarker?.remove();
    this._positionMarker = undefined;

    this._accuracyMarker?.remove();
    this._accuracyMarker = undefined;

    // Clean up references
    this._container = undefined;
    this._button = undefined;
    this._map = undefined;
  }

  /**
   * Create the position and accuracy markers
   * @private
   */
  private async _createMarkers(): Promise<void> {
    const classes = await this._loadMaplibreClasses();
    if (!classes) return;

    // Create accuracy circle marker (appears behind position marker)
    const accuracyEl = document.createElement("div");
    accuracyEl.className = "maplibregl-user-location-accuracy-circle";

    this._accuracyMarker = new classes.Marker({
      element: accuracyEl,
      pitchAlignment: "map", // Only accuracy circle needs pitch alignment
    }).setLngLat(this._position);
    // Note: Not adding to map yet - will be added when showing

    // Create position marker (blue dot with white border and pulse animation)
    const positionEl = document.createElement("div");
    positionEl.className = "maplibregl-user-location-dot";

    this._positionMarker = new classes.Marker({
      element: positionEl,
      // No special alignment for dot marker - matches original
    }).setLngLat(this._position);
    // Note: Not adding to map yet - will be added when showing
  }

  /**
   * Show the position markers
   * @private
   */
  private _showMarkers(): void {
    if (!this._map) return;

    // Add accuracy circle first (so it appears behind the dot)
    if (this._showAccuracyCircle) {
      this._accuracyMarker?.addTo(this._map);
    }
    this._updateAccuracyCircle();

    // Add position dot on top
    this._positionMarker?.addTo(this._map);

    // Setup map event listeners for accuracy circle updates
    this._setupMapEventListeners();
  }

  /**
   * Setup map event listeners for updating accuracy circle
   * @private
   */
  private _setupMapEventListeners(): void {
    if (
      !this._map ||
      this._mapEventListenersSetup ||
      !this._showAccuracyCircle
    ) {
      return;
    }

    // Create and store the bound handler
    this._updateCircleHandler = this._updateAccuracyCircle.bind(this);

    // Update accuracy circle on map changes (matches original implementation)
    this._map.on("zoom", this._updateCircleHandler);
    this._map.on("move", this._updateCircleHandler);
    this._map.on("rotate", this._updateCircleHandler);
    this._map.on("pitch", this._updateCircleHandler);

    this._mapEventListenersSetup = true;
  }

  /**
   * Remove map event listeners for accuracy circle updates
   * @private
   */
  private _removeMapEventListeners(): void {
    if (
      !this._map ||
      !this._mapEventListenersSetup ||
      !this._updateCircleHandler
    ) {
      return;
    }

    this._map.off("zoom", this._updateCircleHandler);
    this._map.off("move", this._updateCircleHandler);
    this._map.off("rotate", this._updateCircleHandler);
    this._map.off("pitch", this._updateCircleHandler);

    this._updateCircleHandler = undefined;
    this._mapEventListenersSetup = false;
  }

  /**
   * Update the accuracy circle size based on current zoom and accuracy
   * @private
   */
  private _updateAccuracyCircle(): void {
    if (!this._map || !this._accuracyMarker || !this._showAccuracyCircle) {
      return;
    }

    // Ensure position is a LngLat instance
    if (!this._maplibreClasses || !("distanceTo" in (this._position as any))) {
      return;
    }

    // Use MapLibre's projection methods for accurate pixel-to-meter conversion
    const screenPosition = this._map.project(this._position);
    const positionWith100Px = this._map.unproject([
      screenPosition.x + 100,
      screenPosition.y,
    ]);
    const pixelsToMeters =
      (this._position as any).distanceTo(positionWith100Px) / 100;
    const circleDiameter = (2 * this._accuracy) / pixelsToMeters;

    const element = this._accuracyMarker.getElement();
    element.style.width = `${circleDiameter.toFixed(2)}px`;
    element.style.height = `${circleDiameter.toFixed(2)}px`;
  }

  /**
   * Handle button click event
   * @private
   */
  private _onClick(): void {
    this.trigger();
  }

  /**
   * Zoom the map to the manual position with accuracy radius
   * @private
   */
  private async _zoomToPosition(): Promise<void> {
    if (!this._map) return;

    const classes = await this._loadMaplibreClasses();
    if (!classes) return;

    // Ensure position is a LngLat instance
    const position =
      this._position instanceof classes.LngLat
        ? this._position
        : classes.LngLat.convert(this._position);

    // Create bounds from position and accuracy radius
    const bounds = classes.LngLatBounds.fromLngLat(position, this._accuracy);

    this._map.fitBounds(bounds, {
      ...this._fitBoundsOptions,
      bearing: this._fitBoundsOptions.bearing ?? this._map.getBearing(),
    });
  }

  /**
   * Create a GeolocationPosition object from the current position
   * @returns A W3C-compliant GeolocationPosition object
   * @private
   */
  private _createGeolocationPosition(): GeolocationPosition {
    const position = this._position as any;
    const lat = position.lat || position.latitude || position[1];
    const lng = position.lng || position.longitude || position[0];
    const accuracy = this._accuracy;
    const timestamp = Date.now();

    const coords = {
      latitude: lat,
      longitude: lng,
      accuracy,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
      toJSON: () => ({
        latitude: lat,
        longitude: lng,
        accuracy,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      }),
    } satisfies GeolocationCoordinates;

    const positionObj = {
      coords,
      timestamp,
      toJSON: () => ({
        coords: coords.toJSON(),
        timestamp,
      }),
    } satisfies GeolocationPosition;

    return positionObj;
  }

  /**
   * Check if the current position is outside the map's maxBounds
   * Matches the original GeolocateControl behavior
   * @returns `true` if position is outside bounds, `false` otherwise
   * @private
   */
  private _isOutOfMapMaxBounds(): boolean {
    if (!this._map) {
      return false;
    }

    const bounds = this._map.getMaxBounds();
    if (!bounds) {
      return false;
    }

    const position = this._position as any;
    const lat = position.lat || position.latitude || position[1];
    const lng = position.lng || position.longitude || position[0];

    return (
      lng < bounds.getWest() ||
      lng > bounds.getEast() ||
      lat < bounds.getSouth() ||
      lat > bounds.getNorth()
    );
  }

  /**
   * Programmatically trigger the geolocate control
   * Shows markers and centers the map on the manual position
   */
  async trigger(): Promise<void> {
    // Ensure classes are loaded
    await this._loadMaplibreClasses();

    // Ensure markers are created
    if (!this._positionMarker || !this._accuracyMarker) {
      await this._createMarkers();
    }

    // Check if position is outside map's maxBounds
    if (this._isOutOfMapMaxBounds()) {
      this._fire("outofmaxbounds", this._createGeolocationPosition());
      return;
    }

    // Show markers (or update their position if already shown)
    this._showMarkers();

    // Zoom to the manual location with accuracy
    await this._zoomToPosition();

    // Fire geolocate event with native GeolocationPosition format
    this._fire("geolocate", this._createGeolocationPosition());
  }

  /**
   * Update the manual position
   * @param coordinates - The new position coordinates
   */
  async setPosition(coordinates: LngLatLike): Promise<void> {
    if (this._maplibreClasses) {
      this._position = this._maplibreClasses.LngLat.convert(coordinates);
    } else {
      this._position = coordinates;
    }

    // Update marker positions if they exist
    this._positionMarker?.setLngLat(this._position);
    this._accuracyMarker?.setLngLat(this._position);
    this._updateAccuracyCircle();
  }

  /**
   * Update the accuracy radius
   * @param accuracy - The new accuracy radius in meters
   */
  setAccuracy(accuracy: number): void {
    this._accuracy = accuracy;
    this._updateAccuracyCircle();
  }

  /**
   * Toggle the accuracy circle visibility
   * @param show - Whether to show the accuracy circle
   */
  setShowAccuracyCircle(show: boolean): void {
    this._showAccuracyCircle = show;

    if (!this._map || !this._accuracyMarker) {
      return;
    }

    if (show) {
      // Show the accuracy circle
      this._accuracyMarker.addTo(this._map);
      this._setupMapEventListeners();
      this._updateAccuracyCircle();
    } else {
      // Hide the accuracy circle
      this._accuracyMarker.remove();
      this._removeMapEventListeners();
    }
  }

  /**
   * Update the fit bounds options used when zooming to position
   * @param options - The FitBoundsOptions to use for map.fitBounds() calls
   */
  setFitBoundsOptions(options: FitBoundsOptions): void {
    this._fitBoundsOptions = options;
  }

  /**
   * Register an event handler
   * @param type - The event type ('geolocate' or 'outofmaxbounds')
   * @param listener - The event handler function
   */
  on(type: "geolocate", listener: (e: GeolocationPosition) => void): this;
  on(type: "outofmaxbounds", listener: (e: GeolocationPosition) => void): this;
  on(
    type: "geolocate" | "outofmaxbounds",
    listener: (e: GeolocationPosition) => void,
  ): this {
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
  off(type: "geolocate", listener: (e: GeolocationPosition) => void): this;
  off(type: "outofmaxbounds", listener: (e: GeolocationPosition) => void): this;
  off(
    type: "geolocate" | "outofmaxbounds",
    listener: (e: GeolocationPosition) => void,
  ): this {
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
  private _fire(type: "geolocate", data: GeolocationPosition): void;
  private _fire(type: "outofmaxbounds", data: GeolocationPosition): void;
  private _fire(
    type: "geolocate" | "outofmaxbounds",
    data: GeolocationPosition,
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
