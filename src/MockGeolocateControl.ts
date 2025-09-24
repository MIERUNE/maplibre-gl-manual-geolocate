import {
  LngLat,
  LngLatBounds,
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
  WatchState,
} from "./types";

/**
 * A MapLibre GL control that simulates geolocation functionality with mock coordinates.
 *
 * This control mimics the behavior of MapLibre's native GeolocateControl but uses
 * predefined coordinates instead of the browser's Geolocation API. Perfect for:
 * - Development and testing without GPS/location permissions
 * - Demos with predictable positioning
 * - Offline or indoor environments
 * - Privacy-conscious applications
 *
 * @example Basic usage
 * ```typescript
 * const mockGeolocate = new MockGeolocateControl({
 *   position: { lng: 139.74135747, lat: 35.65809922 }, // Tokyo
 *   accuracy: 50 // 50-meter accuracy radius
 * });
 * map.addControl(mockGeolocate, 'top-right');
 * ```
 *
 * @example With event handling
 * ```typescript
 * mockGeolocate.on('geolocate', (e) => {
 *   console.log('Position:', e.coords);
 * });
 * mockGeolocate.on('outofmaxbounds', (e) => {
 *   console.warn('Position outside bounds');
 * });
 * ```
 */
export class MockGeolocateControl implements IControl {
  private _map?: Map;
  private _container?: HTMLElement;
  private _button?: HTMLButtonElement;

  // Configuration options
  private _position: LngLat;
  private _accuracy: number;
  private _showAccuracyCircle: boolean;
  private _fitBoundsOptions: FitBoundsOptions;

  // Event handlers storage
  private _eventHandlers: EventHandlers = {};

  // Markers for position and accuracy
  private _positionMarker?: Marker;
  private _accuracyMarker?: Marker;

  // Track if we've set up map event listeners
  private _mapEventListenersSetup = false;

  // Bound update function for event listeners (stored to ensure proper removal)
  private _updateCircleHandler?: () => void;

  // Bound click handler (stored to ensure proper removal)
  private _onClickHandler?: () => void;

  // State management
  private _watchState: WatchState = "OFF";

  // Timeout for simulated geolocation delay
  private _geolocateTimeoutId?: ReturnType<typeof setTimeout>;

  /**
   * Creates a new MockGeolocateControl instance.
   *
   * @param options - Configuration options for the control
   * @param options.position - Required mock coordinates (LngLatLike)
   * @param options.accuracy - Accuracy radius in meters (default: 50)
   * @param options.showAccuracyCircle - Whether to display accuracy circle (default: true)
   * @param options.fitBoundsOptions - Options for map.fitBounds() when centering (default: {maxZoom: 15})
   * @throws {Error} If position option is not provided
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
   * Adds the control to the map and initializes its resources.
   * Creates the button element, sets up event listeners, and prepares markers.
   * Called automatically by map.addControl().
   *
   * @param map - The MapLibre Map instance
   * @returns The control's container DOM element
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

    // Create markers
    this._createMarkers();

    return this._container;
  }

  /**
   * Removes the control from the map and cleans up all resources.
   * Clears timeouts, removes event listeners, destroys markers, and releases references.
   * Called automatically by map.removeControl().
   */
  onRemove(): void {
    // Clear any pending timeouts
    if (this._geolocateTimeoutId) {
      clearTimeout(this._geolocateTimeoutId);
      this._geolocateTimeoutId = undefined;
    }

    // Remove map event listeners first
    this._removeMapEventListeners();

    // Clean up event listeners
    if (this._button && this._onClickHandler) {
      this._button.removeEventListener("click", this._onClickHandler);
      this._onClickHandler = undefined;
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
   * Creates the visual markers for user position and accuracy radius.
   * Markers are created but not added to the map until activated.
   * @private
   */
  private _createMarkers(): void {
    // Create accuracy circle marker (appears behind position marker)
    const accuracyEl = document.createElement("div");
    accuracyEl.className = "maplibregl-user-location-accuracy-circle";

    this._accuracyMarker = new Marker({
      element: accuracyEl,
      pitchAlignment: "map", // Only accuracy circle needs pitch alignment
    }).setLngLat(this._position);
    // Note: Not adding to map yet - will be added when showing

    // Create position marker (blue dot with white border and pulse animation)
    const positionEl = document.createElement("div");
    positionEl.className = "maplibregl-user-location-dot";

    this._positionMarker = new Marker({
      element: positionEl,
      // No special alignment for dot marker - matches original
    }).setLngLat(this._position);
    // Note: Not adding to map yet - will be added when showing
  }

  /**
   * Displays the position dot and accuracy circle on the map.
   * Accuracy circle is added first to appear behind the position dot.
   * @private
   */
  private _showMarkers(): void {
    if (!this._map) return;

    // Add accuracy circle first (so it appears behind the dot)
    if (this._accuracyMarker && this._showAccuracyCircle) {
      this._accuracyMarker.addTo(this._map);
      this._updateAccuracyCircle();
    }

    // Add position dot on top
    if (this._positionMarker) {
      this._positionMarker.addTo(this._map);
    }

    // Setup map event listeners for accuracy circle updates
    this._setupMapEventListeners();
  }

  /**
   * Sets up map event listeners to keep accuracy circle size synchronized
   * with map zoom, rotation, and pitch changes.
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
   * Remove map event listeners
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
   * Recalculates and updates the accuracy circle diameter based on current
   * map zoom level and accuracy radius. Converts meters to screen pixels.
   * @private
   */
  private _updateAccuracyCircle(): void {
    if (!this._map || !this._accuracyMarker || !this._showAccuracyCircle) {
      return;
    }

    // Use MapLibre's projection methods for accurate pixel-to-meter conversion
    const screenPosition = this._map.project(this._position);
    const positionWith100Px = this._map.unproject([
      screenPosition.x + 100,
      screenPosition.y,
    ]);
    const pixelsToMeters = this._position.distanceTo(positionWith100Px) / 100;
    const circleDiameter = (2 * this._accuracy) / pixelsToMeters;

    const element = this._accuracyMarker.getElement();
    element.style.width = `${circleDiameter.toFixed(2)}px`;
    element.style.height = `${circleDiameter.toFixed(2)}px`;
  }

  /**
   * Handles geolocate button clicks by delegating to trigger().
   * @private
   */
  private _onClick(): void {
    this.trigger();
  }

  /**
   * Updates the button's CSS classes to reflect the current state.
   * Manages visual feedback for waiting, active, and error states.
   * @private
   */
  private _updateButtonClasses(): void {
    if (!this._button) return;

    // Remove all state classes
    this._button.classList.remove(
      "maplibregl-ctrl-geolocate-waiting",
      "maplibregl-ctrl-geolocate-active",
      "maplibregl-ctrl-geolocate-active-error",
      "maplibregl-ctrl-geolocate-background",
      "maplibregl-ctrl-geolocate-background-error",
    );

    // Add appropriate class based on state
    switch (this._watchState) {
      case "WAITING_ACTIVE":
        this._button.classList.add("maplibregl-ctrl-geolocate-waiting");
        break;
      case "ACTIVE_LOCK":
        this._button.classList.add("maplibregl-ctrl-geolocate-active");
        break;
    }
  }

  /**
   * Checks whether the current position is outside the map's maximum bounds.
   * Used to determine if outofmaxbounds event should be fired.
   * @private
   * @returns true if position is outside bounds, false otherwise
   */
  private _isOutOfMapMaxBounds(): boolean {
    if (!this._map) return false;

    const bounds = this._map.getMaxBounds();
    if (!bounds) return false;

    return (
      this._position.lng < bounds.getWest() ||
      this._position.lng > bounds.getEast() ||
      this._position.lat < bounds.getSouth() ||
      this._position.lat > bounds.getNorth()
    );
  }

  /**
   * Centers and zooms the map to show the current position and accuracy radius.
   * Uses fitBounds with configured options to frame the location appropriately.
   * @private
   */
  private _updateCamera(): void {
    if (!this._map) return;

    // Create bounds from position and accuracy radius
    const bounds = LngLatBounds.fromLngLat(this._position, this._accuracy);

    // Fit bounds with configured options
    this._map.fitBounds(bounds, this._fitBoundsOptions, {
      geolocateSource: true,
    });
  }

  /**
   * Programmatically activates or deactivates the geolocate control.
   *
   * State transitions:
   * - OFF → WAITING_ACTIVE → ACTIVE_LOCK (activate and show location)
   * - ACTIVE_LOCK → OFF (deactivate and hide markers)
   * - WAITING_ACTIVE → OFF (cancel activation)
   *
   * When activating from OFF:
   * 1. Shows waiting state with loading animation
   * 2. After 250ms delay (simulating geolocation):
   *    - If position is within bounds: shows markers, zooms to location, fires 'geolocate'
   *    - If position is outside bounds: returns to OFF, fires 'outofmaxbounds'
   */
  trigger(): void {
    if (!this._map) return;

    switch (this._watchState) {
      case "OFF":
        // Transition from OFF to WAITING_ACTIVE
        this._watchState = "WAITING_ACTIVE";
        this._updateButtonClasses();

        // Clear any existing timeout
        if (this._geolocateTimeoutId) {
          clearTimeout(this._geolocateTimeoutId);
        }

        // Simulate a short delay for "locating" (like the real control)
        this._geolocateTimeoutId = setTimeout(() => {
          if (this._watchState !== "WAITING_ACTIVE") return;

          // Check if position is within bounds
          if (this._isOutOfMapMaxBounds()) {
            // Position is out of bounds - fire error event and return to OFF state
            this._watchState = "OFF";
            this._updateButtonClasses();

            const eventData: OutOfMaxBoundsEventData = {
              coords: {
                latitude: this._position.lat,
                longitude: this._position.lng,
                accuracy: this._accuracy,
              },
            };
            this._fire("outofmaxbounds", eventData);
          } else {
            // Position is within bounds - activate
            this._watchState = "ACTIVE_LOCK";
            this._updateButtonClasses();

            // Show markers
            this._showMarkers();

            // Update camera to zoom to position
            this._updateCamera();

            // Fire geolocate event
            const eventData: GeolocateEventData = {
              coords: {
                latitude: this._position.lat,
                longitude: this._position.lng,
                accuracy: this._accuracy,
              },
            };
            this._fire("geolocate", eventData);
          }

          this._geolocateTimeoutId = undefined;
        }, 250); // Simulate geolocation delay
        break;

      case "WAITING_ACTIVE":
        // Cancel waiting and return to OFF
        if (this._geolocateTimeoutId) {
          clearTimeout(this._geolocateTimeoutId);
          this._geolocateTimeoutId = undefined;
        }
        this._watchState = "OFF";
        this._updateButtonClasses();
        break;

      case "ACTIVE_LOCK":
        // Deactivate and hide markers
        this._watchState = "OFF";
        this._updateButtonClasses();
        this._hideMarkers();
        break;
    }
  }

  /**
   * Removes position and accuracy markers from the map.
   * Also cleans up associated event listeners.
   * @private
   */
  private _hideMarkers(): void {
    // Remove markers from map
    if (this._positionMarker) {
      this._positionMarker.remove();
    }
    if (this._accuracyMarker) {
      this._accuracyMarker.remove();
    }

    // Remove map event listeners
    this._removeMapEventListeners();
  }

  /**
   * Updates the mock position dynamically.
   * If control is active, updates marker positions and fires appropriate events.
   *
   * @param coordinates - New coordinates as LngLatLike (e.g., {lng, lat} or [lng, lat])
   * @fires geolocate - If active and position is within bounds
   * @fires outofmaxbounds - If active and position moves outside bounds
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

    // If active, check bounds again and potentially fire events
    if (this._watchState === "ACTIVE_LOCK") {
      if (this._isOutOfMapMaxBounds()) {
        // Position moved out of bounds
        const eventData: OutOfMaxBoundsEventData = {
          coords: {
            latitude: this._position.lat,
            longitude: this._position.lng,
            accuracy: this._accuracy,
          },
        };
        this._fire("outofmaxbounds", eventData);
      } else {
        // Fire geolocate event with new position
        const eventData: GeolocateEventData = {
          coords: {
            latitude: this._position.lat,
            longitude: this._position.lng,
            accuracy: this._accuracy,
          },
        };
        this._fire("geolocate", eventData);
      }
    }
  }

  /**
   * Updates the accuracy radius of the mock location.
   * If control is active, updates the accuracy circle and fires geolocate event.
   *
   * @param accuracy - New accuracy radius in meters
   * @fires geolocate - If control is currently active
   */
  setAccuracy(accuracy: number): void {
    this._accuracy = accuracy;

    // Update accuracy circle if visible
    if (this._accuracyMarker && this._showAccuracyCircle) {
      this._updateAccuracyCircle();
    }

    // Fire geolocate event with updated accuracy if active
    if (this._watchState === "ACTIVE_LOCK") {
      const eventData: GeolocateEventData = {
        coords: {
          latitude: this._position.lat,
          longitude: this._position.lng,
          accuracy: this._accuracy,
        },
      };
      this._fire("geolocate", eventData);
    }
  }

  /**
   * Shows or hides the accuracy circle visualization.
   * Only affects visual display; accuracy value remains unchanged.
   *
   * @param show - true to show accuracy circle, false to hide
   */
  setShowAccuracyCircle(show: boolean): void {
    this._showAccuracyCircle = show;

    if (!this._map || !this._accuracyMarker) return;

    if (show && this._watchState === "ACTIVE_LOCK") {
      // Show the accuracy circle if we're active
      this._accuracyMarker.addTo(this._map);
      this._updateAccuracyCircle();
      this._setupMapEventListeners();
    } else if (!show) {
      // Hide the accuracy circle
      this._accuracyMarker.remove();
      this._removeMapEventListeners();
    }
  }

  /**
   * Updates options used when the map zooms to the mock location.
   * These options are passed to map.fitBounds() when centering on position.
   *
   * @param options - MapLibre FitBoundsOptions (e.g., {maxZoom, padding, duration})
   */
  setFitBoundsOptions(options: FitBoundsOptions): void {
    this._fitBoundsOptions = options;
  }

  /**
   * Gets the current mock position.
   * @returns Current position as MapLibre LngLat object
   */
  getPosition(): LngLat {
    return this._position;
  }

  /**
   * Gets the current accuracy radius.
   * @returns Current accuracy radius in meters
   */
  getAccuracy(): number {
    return this._accuracy;
  }

  /**
   * Gets the current state of the control.
   * @returns Current state: 'OFF', 'WAITING_ACTIVE', or 'ACTIVE_LOCK'
   */
  getWatchState(): WatchState {
    return this._watchState;
  }

  /**
   * Registers an event listener for control events.
   *
   * @param type - Event type to listen for:
   *   - 'geolocate': Fired when position is successfully shown
   *   - 'outofmaxbounds': Fired when position is outside map bounds
   * @param listener - Callback function to handle the event
   * @returns this - For method chaining
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
   * Removes a previously registered event listener.
   *
   * @param type - Event type of the listener to remove
   * @param listener - The exact function reference that was registered
   * @returns this - For method chaining
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
   * Dispatches an event to all registered listeners.
   * @private
   * @param type - Event type to fire
   * @param data - Event data to pass to listeners
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
