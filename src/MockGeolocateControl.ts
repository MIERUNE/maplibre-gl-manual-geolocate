import type { 
  Map as MaplibreMap, 
  IControl,
  LngLatLike,
  FitBoundsOptions
} from 'maplibre-gl';
import type {
  MockGeolocateControlOptions,
  MockGeolocateCoords,
  NormalizedLngLat
} from './types.js';
import {
  normalizeLngLat,
  calculateZoomFromAccuracy,
  generateId,
  isWithinBounds
} from './utils.js';

/**
 * A MapLibre GL JS control that displays a user position marker at specified coordinates 
 * without requiring the browser's geolocation API. Provides the same visual appearance 
 * as the built-in GeolocateControl with complete control over positioning.
 */
export class MockGeolocateControl implements IControl {
  private _map: MaplibreMap | null = null;
  private _container: HTMLElement | null = null;
  private _button: HTMLButtonElement | null = null;
  
  // Configuration options
  private _position: NormalizedLngLat;
  private _accuracy: number;
  private _showAccuracyCircle: boolean;
  private _fitBoundsOptions: FitBoundsOptions;
  
  // Map layer/source IDs
  private _sourceId: string;
  private _accuracyLayerId: string;
  private _positionLayerId: string;
  
  // Event system
  private _eventListeners: Map<string, Function[]> = new Map();
  
  constructor(options: MockGeolocateControlOptions) {
    // Validate required options
    if (!options.position) {
      throw new Error('MockGeolocateControl requires a position option');
    }
    
    // Initialize configuration
    this._position = normalizeLngLat(options.position);
    this._accuracy = options.accuracy ?? 50;
    this._showAccuracyCircle = options.showAccuracyCircle ?? true;
    this._fitBoundsOptions = {
      maxZoom: 15,
      ...options.fitBoundsOptions
    };
    
    // Generate unique IDs for map elements
    this._sourceId = generateId('mock-geolocate-source');
    this._accuracyLayerId = generateId('mock-geolocate-accuracy');
    this._positionLayerId = generateId('mock-geolocate-position');
  }
  
  /**
   * Called when the control is added to the map
   */
  onAdd(map: MaplibreMap): HTMLElement {
    this._map = map;
    this._container = this._createContainer();
    this._button = this._createButton();
    this._container.appendChild(this._button);
    
    // Add map sources and layers for the position marker and accuracy circle
    this._addMapElements();
    
    return this._container;
  }
  
  /**
   * Called when the control is removed from the map
   */
  onRemove(): void {
    if (this._map) {
      // Remove map elements
      this._removeMapElements();
    }
    
    if (this._container && this._container.parentNode) {
      this._container.parentNode.removeChild(this._container);
    }
    
    this._map = null;
    this._container = null;
    this._button = null;
  }
  
  /**
   * Updates the mock position coordinates
   */
  setPosition(coordinates: LngLatLike): void {
    this._position = normalizeLngLat(coordinates);
    this._updateMapElements();
  }
  
  /**
   * Updates the accuracy circle radius in meters
   */
  setAccuracy(accuracy: number): void {
    this._accuracy = accuracy;
    this._updateMapElements();
  }
  
  /**
   * Controls the visibility of the accuracy circle
   */
  setShowAccuracyCircle(show: boolean): void {
    this._showAccuracyCircle = show;
    this._updateMapElements();
  }
  
  /**
   * Updates the auto-zoom behavior options
   */
  setFitBoundsOptions(options: FitBoundsOptions): void {
    this._fitBoundsOptions = { ...this._fitBoundsOptions, ...options };
  }
  
  /**
   * Programmatically centers the map on the mock position with automatic zoom-to-accuracy
   */
  trigger(): void {
    if (!this._map) {
      return;
    }
    
    // Check if position is within bounds
    const mapBounds = this._map.getMaxBounds();
    const boundsArray = mapBounds ? [
      [mapBounds.getWest(), mapBounds.getSouth()],
      [mapBounds.getEast(), mapBounds.getNorth()]
    ] as [[number, number], [number, number]] : undefined;
    
    if (!isWithinBounds(this._position, boundsArray)) {
      this._fireEvent('outofmaxbounds', {
        coords: this._createCoordsObject()
      });
      return;
    }
    
    // Calculate optimal zoom based on accuracy
    const targetZoom = calculateZoomFromAccuracy(this._accuracy);
    const finalZoom = Math.min(targetZoom, this._fitBoundsOptions.maxZoom ?? 15);
    
    // Center map on position with zoom
    this._map.easeTo({
      center: [this._position.lng, this._position.lat],
      zoom: finalZoom,
      ...this._fitBoundsOptions
    });
    
    // Fire geolocate event
    this._fireEvent('geolocate', {
      coords: this._createCoordsObject()
    });
  }
  
  /**
   * Add event listener
   */
  on(event: string, listener: Function): void {
    if (!this._eventListeners.has(event)) {
      this._eventListeners.set(event, []);
    }
    this._eventListeners.get(event)!.push(listener);
  }
  
  /**
   * Remove event listener
   */
  off(event: string, listener: Function): void {
    const listeners = this._eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }
  
  /**
   * Creates the control container element
   */
  private _createContainer(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'maplibregl-ctrl maplibregl-ctrl-group';
    return container;
  }
  
  /**
   * Creates the geolocate button element
   */
  private _createButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = 'maplibregl-ctrl-geolocate';
    button.type = 'button';
    button.title = 'Find my location';
    button.setAttribute('aria-label', 'Find my location');
    
    // Add the geolocate icon
    const icon = document.createElement('span');
    icon.className = 'maplibregl-ctrl-icon';
    icon.setAttribute('aria-hidden', 'true');
    button.appendChild(icon);
    
    // Add click handler
    button.addEventListener('click', () => {
      this.trigger();
    });
    
    return button;
  }
  
  /**
   * Adds map sources and layers for position marker and accuracy circle
   */
  private _addMapElements(): void {
    if (!this._map) return;
    
    // Add source for position data
    this._map.addSource(this._sourceId, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    });
    
    // Add accuracy circle layer (if enabled)
    if (this._showAccuracyCircle) {
      this._map.addLayer({
        id: this._accuracyLayerId,
        type: 'fill',
        source: this._sourceId,
        filter: ['==', ['get', 'type'], 'accuracy'],
        paint: {
          'fill-color': '#1e90ff',
          'fill-opacity': 0.2
        }
      });
    }
    
    // Add position marker layer
    this._map.addLayer({
      id: this._positionLayerId,
      type: 'circle',
      source: this._sourceId,
      filter: ['==', ['get', 'type'], 'position'],
      paint: {
        'circle-radius': 6,
        'circle-color': '#1e90ff',
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 2
      }
    });
    
    // Initial update
    this._updateMapElements();
  }
  
  /**
   * Removes map sources and layers
   */
  private _removeMapElements(): void {
    if (!this._map) return;
    
    // Remove layers
    if (this._map.getLayer(this._positionLayerId)) {
      this._map.removeLayer(this._positionLayerId);
    }
    if (this._map.getLayer(this._accuracyLayerId)) {
      this._map.removeLayer(this._accuracyLayerId);
    }
    
    // Remove source
    if (this._map.getSource(this._sourceId)) {
      this._map.removeSource(this._sourceId);
    }
  }
  
  /**
   * Updates map sources with current position and accuracy data
   */
  private _updateMapElements(): void {
    if (!this._map) return;
    
    const source = this._map.getSource(this._sourceId);
    if (!source || source.type !== 'geojson') return;
    
    const features: any[] = [];
    
    // Add accuracy circle feature (if enabled)
    if (this._showAccuracyCircle) {
      // Create a circle polygon from center point and radius
      const circleFeature = this._createCircleFeature(
        [this._position.lng, this._position.lat],
        this._accuracy
      );
      circleFeature.properties = { type: 'accuracy' };
      features.push(circleFeature);
    }
    
    // Add position point feature
    features.push({
      type: 'Feature',
      properties: { type: 'position' },
      geometry: {
        type: 'Point',
        coordinates: [this._position.lng, this._position.lat]
      }
    });
    
    // Update source data
    (source as any).setData({
      type: 'FeatureCollection',
      features
    });
  }
  
  /**
   * Creates a circle polygon feature from center point and radius in meters
   */
  private _createCircleFeature(center: [number, number], radiusInMeters: number): any {
    const points = 64;
    const coords: number[][] = [];
    
    // Convert meters to degrees (rough approximation)
    const radiusInDegrees = radiusInMeters / 111320; // 1 degree ≈ 111,320 meters at equator
    
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * 2 * Math.PI;
      const x = center[0] + radiusInDegrees * Math.cos(angle);
      const y = center[1] + radiusInDegrees * Math.sin(angle);
      coords.push([x, y]);
    }
    
    // Close the polygon
    coords.push(coords[0]);
    
    return {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [coords]
      }
    };
  }
  
  /**
   * Creates coordinate object for events
   */
  private _createCoordsObject(): MockGeolocateCoords {
    return {
      latitude: this._position.lat,
      longitude: this._position.lng,
      accuracy: this._accuracy
    };
  }
  
  /**
   * Fires an event to all registered listeners
   */
  private _fireEvent(event: string, data: any): void {
    const listeners = this._eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in ${event} event listener:`, error);
        }
      });
    }
  }
}
