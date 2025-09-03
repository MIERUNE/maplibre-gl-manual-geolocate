# maplibre-gl-mock-geolocate

A MapLibre GL JS control that displays a user position marker at specified coordinates without requiring the browser's [geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API). Provides the same visual appearance as the built-in [`GeolocateControl`](https://maplibre.org/maplibre-gl-js/docs/API/classes/GeolocateControl/) with complete control over positioning.

## Why Use Mock Geolocate?

Perfect for scenarios where you need location visualization without actual geolocation:

- **🧪 Development & Testing** - Test location features with predictable coordinates
- **🎯 Demos & Presentations** - Reliable positioning that works every time  
- **🔒 Privacy-Conscious Apps** - Show approximate location without requesting permissions
- **📱 Offline & Indoor Use** - Display position when geolocation is unavailable
- **🏗️ Development Workflow** - Seamlessly switch between mock and real geolocation for testing

## Installation

```shell
npm install maplibre-gl-mock-geolocate
```

## Quick Start

```typescript
import { MockGeolocateControl } from 'maplibre-gl-mock-geolocate';
import { Map } from 'maplibre-gl';

const map = new Map({
  container: 'map',
  style: 'https://demotiles.maplibre.org/style.json',
  center: [139.6917, 35.6895], // Tokyo
  zoom: 12
});

// Create mock geolocate control
const mockGeolocateControl = new MockGeolocateControl({
  position: { lng: 139.6917, lat: 35.6895 }, // Tokyo coordinates
  accuracy: 50 // 50-meter accuracy circle
});

// Add to map (same as regular GeolocateControl)
map.addControl(mockGeolocateControl, 'top-right');
```

**Try it out:** Click the location button to center the map on Tokyo with automatic zoom-to-accuracy!

---

## 📚 API Reference

### Types

#### `MockGeolocateControlOptions`

```typescript
type MockGeolocateControlOptions = {
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
```

**References**

- [LngLatLike - MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/LngLatLike/)
- [FitBoundsOptions - MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/FitBoundsOptions/)

### Constructor

```typescript
new MockGeolocateControl(options: MockGeolocateControlOptions)
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| **`position`** | `LngLatLike` | **Required** | Mock coordinates to display (supports multiple formats) - See [LngLatLike - MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/LngLatLike/) for details |
| `accuracy` | `number` | `50` | Accuracy circle radius in meters |
| `showAccuracyCircle` | `boolean` | `true` | Whether to show the accuracy circle |
| `fitBoundsOptions` | `FitBoundsOptions` | `{maxZoom: 15}` | Options for auto-zoom behavior (same as GeolocateControl) - See [FitBoundsOptions - MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/FitBoundsOptions/) for details |

### Methods

#### `setPosition(coordinates: LngLatLike): void`

Updates the mock position coordinates.

```typescript
mockControl.setPosition({ lng: 139.6917, lat: 35.6895 });
// Also supports: [139.6917, 35.6895], {lon: 139.6917, lat: 35.6895}
```

#### `setAccuracy(accuracy: number): void`

Updates the accuracy circle radius in meters.

```typescript
mockControl.setAccuracy(100); // 100-meter accuracy circle
```

#### `setShowAccuracyCircle(show: boolean): void`

Controls the visibility of the accuracy circle.

```typescript
mockControl.setShowAccuracyCircle(false); // Hide accuracy circle
```

#### `setFitBoundsOptions(options: FitBoundsOptions): void`

Updates the auto-zoom behavior options.

```typescript
mockControl.setFitBoundsOptions({
  maxZoom: 18,
  padding: 100,
  linear: true
});
```

#### `trigger(): void`

Programmatically centers the map on the mock position with automatic zoom-to-accuracy.

```typescript
mockControl.trigger(); // Same as clicking the geolocate button
```

Automatically calculates the optimal zoom level based on the accuracy radius, constrained by `fitBoundsOptions`.

### Events

#### `geolocate`

Fired when the control button is clicked or `trigger()` is called.

```typescript
mockControl.on('geolocate', (event) => {
  console.log('Mock position activated:', event.coords);
  // event.coords: { latitude: number, longitude: number, accuracy: number }
});
```

#### `outofmaxbounds`

Fired when the mock position is outside the map's `maxBounds` (if set).

```typescript
mockControl.on('outofmaxbounds', (event) => {
  console.warn('Position outside map bounds:', event.coords);
});
```

---

## 💡 Usage Examples

### Basic Usage

Create a mock geolocate control with flexible coordinate formats:

```typescript
// Multiple coordinate formats supported
const mockControl = new MockGeolocateControl({
  position: { lng: 139.6917, lat: 35.6895 } // Tokyo
});

map.addControl(mockControl, 'top-right');

// Alternative coordinate formats:
// position: [139.6917, 35.6895]              // Array format
// position: { lon: 139.6917, lat: 35.6895 }  // lon/lat object
// position: new LngLat(139.6917, 35.6895)    // LngLat instance
```

### Dynamic Position Updates

Update the mock position programmatically for interactive applications:

```typescript
const mockControl = new MockGeolocateControl({
  position: [0, 0], // Equator starting point
  accuracy: 100
});

// Update location dynamically
function updateToNewYork() {
  mockControl.setPosition([-74.006, 40.7128]);
  mockControl.setAccuracy(25); // More precise location
}

function updateToLondon() {
  mockControl.setPosition([-0.1276, 51.5074]);
  mockControl.trigger(); // Auto-zoom to new location
}
```

### Event Handling

Listen to control events to integrate with your application:

```typescript
const mockControl = new MockGeolocateControl({
  position: { lng: 139.6917, lat: 35.6895 }
});

// Listen for geolocate events
mockControl.on('geolocate', (event) => {
  const { latitude, longitude, accuracy } = event.coords;
  console.log(`Location: ${latitude}, ${longitude} (±${accuracy}m)`);
  
  // Update your application UI
  updateLocationDisplay(event.coords);
});

// Handle out of bounds scenarios
mockControl.on('outofmaxbounds', (event) => {
  console.warn('Position outside map bounds!');
});

map.addControl(mockControl);
```

### Auto-Zoom Configuration

Customize the automatic zoom behavior with detailed options:

```typescript
const mockControl = new MockGeolocateControl({
  position: { lng: 139.6917, lat: 35.6895 },
  accuracy: 100, // 100-meter accuracy circle
  fitBoundsOptions: {
    maxZoom: 18,      // Allow closer zoom than default (15)
    padding: 50,      // Add padding around accuracy circle (in pixels)
    offset: [0, -20], // Offset center point [x, y] in pixels
    linear: false     // Use flyTo animation (default)
  }
});

map.addControl(mockControl);

// Zoom behavior examples:
// accuracy: 10   → Street-level view (buildings visible)
// accuracy: 100  → Neighborhood view (blocks visible)
// accuracy: 1000 → City-level view (districts visible)
```

See [FitBoundsOptions - MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/FitBoundsOptions/), and [FlyToOptions - MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/FlyToOptions/) (which FitBoundsOptions extends).

### Development vs Production

Seamlessly switch between mock and real geolocation based on environment:

```typescript
// Environment-based control selection
const isDevelopment = process.env.NODE_ENV === 'development';

const geolocateControl = isDevelopment 
  ? new MockGeolocateControl({
      position: { lng: 139.6917, lat: 35.6895 }, // Tokyo for testing
      accuracy: 50,
      showAccuracyCircle: true
    })
  : new GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: false
    });

map.addControl(geolocateControl, 'top-right');
```

This pattern enables reliable testing with mock data while using real geolocation in production.

---

## ⚖️ Comparison with GeolocateControl

### Key Differences

| Aspect | GeolocateControl | MockGeolocateControl |
|--------|------------------|----------------------|
| **Data Source** | Browser Geolocation API | Predefined coordinates |
| **Permissions** | Requires location access | ✅ None required |
| **HTTPS Requirement** | Required for security | ✅ Works on HTTP |
| **Reliability** | Depends on location sources | ✅ Always consistent |
| **Privacy** | Shares real location | ✅ Uses mock coordinates |

### API Compatibility

| Feature | GeolocateControl | MockGeolocateControl | Notes |
|---------|:----------------:|:--------------------:|-------|
| **Options** | | | |
| `fitBoundsOptions` | ✅ | ✅ | Identical behavior |
| `position` | ❌ | ✅ | Mock-specific |
| `accuracy` | ❌ | ✅ | Mock-specific |
| `showAccuracyCircle` | ❌ | ✅ | Mock-specific |
| `positionOptions` | ✅ | ❌ | Geolocation-specific |
| `trackUserLocation` | ✅ | ❌ | Geolocation-specific |
| **Methods** | | | |
| `trigger()` | ✅ | ✅ | Identical behavior |
| `setPosition()` | ❌ | ✅ | Mock-specific |
| `setAccuracy()` | ❌ | ✅ | Mock-specific |
| `setShowAccuracyCircle()` | ❌ | ✅ | Mock-specific |
| `setFitBoundsOptions()` | ❌ | ✅ | Mock-specific |
| **Events** | | | |
| `geolocate` | ✅ | ✅ | Same event data |
| `outofmaxbounds` | ✅ | ✅ | Same behavior |
| `error` | ✅ | ❌ | No geolocation errors |
| Tracking events | ✅ | ❌ | No tracking mode |
| **Visual** | | | |
| Blue dot marker | ✅ | ✅ | Identical appearance |
| Accuracy circle | ✅ | ✅ | Same styling |
| Button icon | ✅ | ✅ | Same UI |

---

## 📖 Related Resources

- **[MapLibre GL JS Documentation](https://maplibre.org/maplibre-gl-js/docs/)** - Main MapLibre GL JS docs
- **[GeolocateControl API](https://maplibre.org/maplibre-gl-js/docs/API/classes/GeolocateControl/)** - Original control reference
- **[LngLatLike Type](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/LngLatLike/)** - Coordinate format reference
- **[FitBoundsOptions](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/FitBoundsOptions/)** - Zoom configuration options

---

## License

[MIT](LICENSE)

---

**Happy mapping! 🗺️**
