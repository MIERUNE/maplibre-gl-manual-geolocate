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

### Constructor

```typescript
new MockGeolocateControl(options: MockGeolocateControlOptions)
```

Creates a new mock geolocate control with the specified options.

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

**Type References:**
- [`LngLatLike`](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/LngLatLike/) - Flexible coordinate input formats
- [`FitBoundsOptions`](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/FitBoundsOptions/) - Auto-zoom behavior options

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

Fired when the control button is clicked or `trigger()` is called. The event data structure matches the browser's [GeolocationPosition](https://developer.mozilla.org/en-US/docs/Web/API/GeolocationPosition) interface.

```typescript
mockControl.on('geolocate', (event: GeolocateEventData) => {
  console.log('Mock position activated:', event);
  // event structure:
  // {
  //   coords: {
  //     latitude: number,
  //     longitude: number,
  //     accuracy: number
  //   },
  //   timestamp: number  // Unix timestamp in milliseconds
  // }
  
  console.log(`Position: ${event.coords.latitude}, ${event.coords.longitude}`);
  console.log(`Accuracy: ±${event.coords.accuracy}m`);
  console.log(`Timestamp: ${new Date(event.timestamp).toISOString()}`);
});
```

#### `outofmaxbounds`

Fired when the mock position is outside the map's `maxBounds` (if set). Uses the same data structure as `geolocate` event.

```typescript
mockControl.on('outofmaxbounds', (event: OutOfMaxBoundsEventData) => {
  console.warn('Position outside map bounds:', event);
  // event structure (same as GeolocateEventData):
  // {
  //   coords: {
  //     latitude: number,
  //     longitude: number,
  //     accuracy: number
  //   },
  //   timestamp: number
  // }
  
  alert(`Position (${event.coords.latitude}, ${event.coords.longitude}) is outside map bounds!`);
});
```

Both events provide full compatibility with the original GeolocateControl's event structure, making it easy to switch between mock and real controls without changing event handlers.

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

See the [Comparison with GeolocateControl](#️-comparison-with-geolocatecontrol) section below for detailed differences between the two controls.

---

## ⚖️ Comparison with GeolocateControl

MockGeolocateControl is designed to be a drop-in replacement for MapLibre GL JS's built-in [`GeolocateControl`](https://maplibre.org/maplibre-gl-js/docs/API/classes/GeolocateControl/), which provides a button that uses the browser's Geolocation API to locate the user on the map.

### Key Differences

While MockGeolocateControl maintains the same visual appearance and core functionality as the original GeolocateControl, there are important differences in how they operate:

**Data Source:** The original GeolocateControl uses the browser's Geolocation API to obtain real-time location data from various sources (GPS, WiFi, cell towers, IP addresses). MockGeolocateControl uses predefined coordinates that you specify, giving you complete control over the displayed position.

**Permissions & Privacy:** GeolocateControl requires users to grant location permissions through a browser prompt, which some users may decline for privacy reasons. MockGeolocateControl requires no permissions at all, making it ideal for privacy-conscious applications or scenarios where you want to show approximate locations without accessing actual user data.

**Reliability & Consistency:** GeolocateControl's accuracy depends on available location sources and can fail in various scenarios (poor signal, indoor environments, permission denied). MockGeolocateControl always works consistently with your specified coordinates, making it perfect for demos, testing, and predictable behavior.

**Security Requirements:** GeolocateControl requires HTTPS in modern browsers for security reasons. MockGeolocateControl works on both HTTP and HTTPS, simplifying local development and testing.

**Tracking Mode:** GeolocateControl offers a tracking mode (when `trackUserLocation: true`) that continuously monitors the user's position and updates the map in real-time as they move. This creates an active state where the control acts as a toggle button, maintaining a lock on the user's location. MockGeolocateControl does not support tracking mode since it works with static, predefined coordinates. Each trigger simply centers the map on the mock position without continuous updates.

### Compatibility Tables

#### Options Compatibility

For comparison with the original control, see [`GeolocateControlOptions`](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/GeolocateControlOptions/) in the MapLibre GL JS documentation. MockGeolocateControl uses [`MockGeolocateControlOptions`](#mockgeolocatecontroloptions) instead.

| Option | GeolocateControl | MockGeolocateControl | Description |
|--------|:----------------:|:--------------------:|-------------|
| `fitBoundsOptions` | ✅ | ✅ | Auto-zoom configuration (identical behavior) |
| `positionOptions` | ✅ | ❌ | Geolocation API options (not needed for mock) |
| `showAccuracyCircle` | ✅ | ✅ | Accuracy circle visibility |
| `showUserLocation` | ✅ | ❌ | Always shows location in mock |
| `trackUserLocation` | ✅ | ❌ | Real-time tracking (not supported in mock) |
| **Mock-specific** | | | |
| `position` | ❌ | ✅ | Required: Coordinates to display |
| `accuracy` | ❌ | ✅ | Optional: Accuracy radius in meters |

#### Methods Compatibility

| Method | GeolocateControl | MockGeolocateControl | Description |
|--------|:----------------:|:--------------------:|-------------|
| `trigger()` | ✅ | ✅ | Center map on position (identical) |
| **Mock-specific** | | | |
| `setPosition()` | ❌ | ✅ | Update mock coordinates |
| `setAccuracy()` | ❌ | ✅ | Update accuracy radius |
| `setShowAccuracyCircle()` | ❌ | ✅ | Toggle accuracy circle |
| `setFitBoundsOptions()` | ❌ | ✅ | Update zoom behavior |

#### Events Compatibility

| Event | GeolocateControl | MockGeolocateControl | Description |
|-------|:----------------:|:--------------------:|-------------|
| `geolocate` | ✅ | ✅ | Position update (same payload structure) |
| `outofmaxbounds` | ✅ | ✅ | Position outside map bounds |
| `error` | ✅ | ❌ | Geolocation API errors (not applicable) |
| `trackuserlocationstart` | ✅ | ❌ | Tracking mode started |
| `trackuserlocationend` | ✅ | ❌ | Tracking mode ended |
| `userlocationfocus` | ✅ | ❌ | Return to tracking mode |
| `userlocationlostfocus` | ✅ | ❌ | Exit tracking mode |

#### Visual Compatibility

| Element | GeolocateControl | MockGeolocateControl | Description |
|---------|:----------------:|:--------------------:|-------------|
| Control button | ✅ | ✅ | Same button appearance and position |
| Default icon | ✅ | ✅ | Same geolocate icon in default state |
| Position marker | ✅ | ✅ | Blue dot with white border |
| Accuracy circle | ✅ | ✅ | Semi-transparent blue circle |
| CSS classes | ✅ | ✅ | Uses same MapLibre classes for markers |
| **Button States** | | | |
| Default (inactive) | ✅ | ✅ | Same appearance when not activated |
| Active (tracking) | ✅ | ❌ | No persistent active state in mock |
| Background | ✅ | ❌ | No background tracking state |
| Disabled | ✅ | ❌ | Mock is always enabled |
| Error | ✅ | ❌ | No error state (always succeeds) |
| **Visual Feedback** | | | |
| Click animation | ✅ | ✅ | Button press feedback |
| Location pulse | ✅ | ❌ | No pulsing animation for live tracking |

---

## 📖 Related Resources

- **[MapLibre GL JS Documentation](https://maplibre.org/maplibre-gl-js/docs/)** - Main MapLibre GL JS docs
- **[GeolocateControl API](https://maplibre.org/maplibre-gl-js/docs/API/classes/GeolocateControl/)** - Original control reference
- **[LngLatLike Type](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/LngLatLike/)** - Coordinate format reference
- **[FitBoundsOptions](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/FitBoundsOptions/)** - Zoom configuration options

---

## 🛠️ Development

This project uses separate Vite configurations for different build targets:

### Build Commands

```bash
pnpm dev          # Development server
pnpm build        # Build library for npm (→ dist/)
pnpm build:demo   # Build demo site for GitHub Pages (→ demo-dist/)
pnpm preview      # Preview library build
pnpm preview:demo # Preview demo site
```

### Configuration Files

- `vite.config.ts` - Development server configuration
- `vite.config.lib.ts` - Library build (ES/UMD modules for npm)
- `vite.config.demo.ts` - Demo site build (GitHub Pages deployment)

---

## License

[MIT](LICENSE)

---

**Happy mapping! 🗺️**
