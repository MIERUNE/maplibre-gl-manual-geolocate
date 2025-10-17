# maplibre-gl-manual-geolocate

[![npm version](https://img.shields.io/npm/v/@mierune/maplibre-gl-manual-geolocate.svg)](https://www.npmjs.com/package/@mierune/maplibre-gl-manual-geolocate)

[GitHub Repository](https://github.com/MIERUNE/maplibre-gl-mock-geolocate) | [Live Demo](https://maplibre-gl-manual-geolocate.mierune.dev/)

A MapLibre GL JS control that displays a user position marker at specified coordinates without requiring the browser's [geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API). Provides the same visual appearance as the built-in [`GeolocateControl`](https://maplibre.org/maplibre-gl-js/docs/API/classes/GeolocateControl/) with complete control over positioning.

## Why Use This Control?

Perfect for scenarios where you need location visualization without actual geolocation:

- **🧪 Development & Testing** - Test location features with predictable coordinates
- **🎯 Demos & Presentations** - Reliable positioning that works every time
- **🔒 Privacy-Conscious Apps** - Show approximate location without requesting permissions
- **📱 Offline & Indoor Use** - Display position when geolocation is unavailable
- **🏗️ Development Workflow** - Seamlessly switch between manual and real geolocation for testing

## Installation

```shell
npm install @mierune/maplibre-gl-manual-geolocate
```

### SSR Support (SvelteKit, Next.js, Nuxt)

For Server-Side Rendering (SSR) frameworks, use the `/ssr` export path to avoid Node.js compatibility issues:

```typescript
// For SSR environments (SvelteKit, Next.js, etc.)
import { ManualGeolocateControl } from "@mierune/maplibre-gl-manual-geolocate/ssr";
```

See the [SSR Usage Guide](./SSR_USAGE.md) for detailed instructions on using this package with SvelteKit, Next.js, and other SSR frameworks.

## Quick Start

```typescript
import { ManualGeolocateControl } from "@mierune/maplibre-gl-manual-geolocate";
import { Map } from "maplibre-gl";

const map = new Map({
  container: "map",
  style: "https://demotiles.maplibre.org/style.json",
  center: [139.6917, 35.6895], // Tokyo
  zoom: 12,
});

// Create manual geolocate control
const manualGeolocateControl = new ManualGeolocateControl({
  position: { lng: 139.6917, lat: 35.6895 }, // Tokyo coordinates
  accuracy: 50, // 50-meter accuracy circle
});

// Add to map (same as regular GeolocateControl)
map.addControl(manualGeolocateControl, "top-right");
```

**Try it out:** Click the location button to center the map on Tokyo with automatic zoom-to-accuracy!

Check out the [**Live Demo**](https://maplibre-gl-manual-geolocate.mierune.dev/) to see it in action.

---

## 📚 API Reference

### Constructor

```typescript
new ManualGeolocateControl(options: ManualGeolocateControlOptions)
```

Creates a new manual geolocate control with the specified options.

#### `ManualGeolocateControlOptions`

```typescript
type ManualGeolocateControlOptions = {
  /**
   * The manual coordinates to display.
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
   * A `FitBoundsOptions` object to use when the map is panned and zoomed to the manual location.
   * The default is to use a `maxZoom` of 15 to limit how far the map will zoom in for very accurate locations.
   * @default {maxZoom: 15}
   */
  fitBoundsOptions?: FitBoundsOptions;
};
```

**Type References:**

- [`LngLatLike`](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/LngLatLike/) - Flexible coordinate input formats
- [`FitBoundsOptions`](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/FitBoundsOptions/) - Auto-zoom behavior options

### Methods

#### `setPosition(coordinates: LngLatLike): void`

Updates the manual position coordinates.

```typescript
manualControl.setPosition({ lng: 139.6917, lat: 35.6895 });
// Also supports: [139.6917, 35.6895], {lon: 139.6917, lat: 35.6895}
```

#### `setAccuracy(accuracy: number): void`

Updates the accuracy circle radius in meters.

```typescript
manualControl.setAccuracy(100); // 100-meter accuracy circle
```

#### `setShowAccuracyCircle(show: boolean): void`

Controls the visibility of the accuracy circle.

```typescript
manualControl.setShowAccuracyCircle(false); // Hide accuracy circle
```

#### `setFitBoundsOptions(options: FitBoundsOptions): void`

Updates the auto-zoom behavior options.

```typescript
manualControl.setFitBoundsOptions({
  maxZoom: 18,
  padding: 100,
  linear: true,
});
```

#### `trigger(): void`

Programmatically centers the map on the manual position with automatic zoom-to-accuracy and fires a `geolocate` event.

```typescript
manualControl.trigger(); // Same as clicking the geolocate button
```

Automatically calculates the optimal zoom level based on the accuracy radius, constrained by `fitBoundsOptions`. When called, it fires a `geolocate` event with a `GeolocationPosition` object.

### Events

#### `geolocate`

Fired when the control button is clicked or `trigger()` is called. The event uses the browser's native [`GeolocationPosition`](https://developer.mozilla.org/en-US/docs/Web/API/GeolocationPosition) type for compatibility with the original GeolocateControl.

```typescript
manualControl.on("geolocate", (event: GeolocationPosition) => {
  console.log("Manual position activated:", event.coords);
  // event.coords contains all W3C Geolocation API properties:
  // - latitude: number
  // - longitude: number
  // - accuracy: number
  // - altitude: null (always null for manual control)
  // - altitudeAccuracy: null (always null for manual control)
  // - heading: null (always null for manual control)
  // - speed: null (always null for manual control)

  console.log("Timestamp:", event.timestamp);
});
```

#### `outofmaxbounds`

Fired when the manual position is outside the map's `maxBounds` (if set on the map instance). Uses the same `GeolocationPosition` type as the geolocate event.

The `maxBounds` are set on the map itself, not on the control:

```typescript
const map = new Map({
  container: "map",
  style: "https://demotiles.maplibre.org/style.json",
  center: [139.6917, 35.6895],
  zoom: 12,
  maxBounds: [
    [138.0, 34.0],
    [141.0, 37.0],
  ], // Restrict map to Tokyo region
});

const manualControl = new ManualGeolocateControl({
  position: { lng: 200, lat: 100 }, // Outside the maxBounds
});

manualControl.on("outofmaxbounds", (event: GeolocationPosition) => {
  console.warn("Position outside map bounds:", event.coords);
  // Handle out-of-bounds scenario - markers won't be shown, map won't center
});

map.addControl(manualControl);
manualControl.trigger(); // Will fire 'outofmaxbounds' instead of 'geolocate'
```

---

## 💡 Usage Examples

### Basic Usage

Create a manual geolocate control with flexible coordinate formats:

```typescript
// Multiple coordinate formats supported
const manualControl = new ManualGeolocateControl({
  position: { lng: 139.6917, lat: 35.6895 }, // Tokyo
});

map.addControl(manualControl, "top-right");

// Alternative coordinate formats:
// position: [139.6917, 35.6895]              // Array format
// position: { lon: 139.6917, lat: 35.6895 }  // lon/lat object
// position: new LngLat(139.6917, 35.6895)    // LngLat instance
```

### Dynamic Position Updates

Update the manual position programmatically for interactive applications:

```typescript
const manualControl = new ManualGeolocateControl({
  position: [0, 0], // Equator starting point
  accuracy: 100,
});

// Update location dynamically
function updateToNewYork() {
  manualControl.setPosition([-74.006, 40.7128]);
  manualControl.setAccuracy(25); // More precise location
}

function updateToLondon() {
  manualControl.setPosition([-0.1276, 51.5074]);
  manualControl.trigger(); // Auto-zoom to new location
}
```

### Event Handling

Listen to control events to integrate with your application. Events use the browser's native [`GeolocationPosition`](https://developer.mozilla.org/en-US/docs/Web/API/GeolocationPosition) type for compatibility:

```typescript
const manualControl = new ManualGeolocateControl({
  position: { lng: 139.6917, lat: 35.6895 },
});

// Listen for geolocate events (uses native GeolocationPosition type)
manualControl.on("geolocate", (event) => {
  const {
    latitude,
    longitude,
    accuracy,
    altitude, // Always null for manual control
    altitudeAccuracy, // Always null for manual control
    heading, // Always null for manual control
    speed, // Always null for manual control
  } = event.coords;

  console.log(`Location: ${latitude}, ${longitude} (±${accuracy}m)`);
  console.log(`Timestamp: ${event.timestamp}`);

  // Update your application UI
  updateLocationDisplay(event.coords);
});

// Handle out of bounds scenarios
manualControl.on("outofmaxbounds", (event) => {
  console.warn("Position outside map bounds!");
});

map.addControl(manualControl);
```

### Auto-Zoom Configuration

Customize the automatic zoom behavior with detailed options:

```typescript
const manualControl = new ManualGeolocateControl({
  position: { lng: 139.6917, lat: 35.6895 },
  accuracy: 100, // 100-meter accuracy circle
  fitBoundsOptions: {
    maxZoom: 18, // Allow closer zoom than default (15)
    padding: 50, // Add padding around accuracy circle (in pixels)
    offset: [0, -20], // Offset center point [x, y] in pixels
    linear: false, // Use flyTo animation (default)
  },
});

map.addControl(manualControl);

// Zoom behavior examples:
// accuracy: 10   → Street-level view (buildings visible)
// accuracy: 100  → Neighborhood view (blocks visible)
// accuracy: 1000 → City-level view (districts visible)
```

See [FitBoundsOptions - MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/FitBoundsOptions/), and [FlyToOptions - MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/FlyToOptions/) (which FitBoundsOptions extends).

### Development vs Production

Seamlessly switch between manual and real geolocation based on environment:

```typescript
// Environment-based control selection
const isDevelopment = process.env.NODE_ENV === "development";

const geolocateControl = isDevelopment
  ? new ManualGeolocateControl({
      position: { lng: 139.6917, lat: 35.6895 }, // Tokyo for testing
      accuracy: 50,
      showAccuracyCircle: true,
    })
  : new GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: false,
    });

map.addControl(geolocateControl, "top-right");
```

This pattern enables reliable testing with manual data while using real geolocation in production.

See the [Comparison with GeolocateControl](#️-comparison-with-geolocatecontrol) section below for detailed differences between the two controls.

---

## ⚖️ Comparison with GeolocateControl

ManualGeolocateControl is designed to be a drop-in replacement for MapLibre GL JS's built-in [`GeolocateControl`](https://maplibre.org/maplibre-gl-js/docs/API/classes/GeolocateControl/), which provides a button that uses the browser's Geolocation API to locate the user on the map.

### Key Differences

While ManualGeolocateControl maintains the same visual appearance and core functionality as the original GeolocateControl, there are important differences in how they operate:

**Data Source:** The original GeolocateControl uses the browser's Geolocation API to obtain real-time location data from various sources (GPS, WiFi, cell towers, IP addresses). ManualGeolocateControl uses predefined coordinates that you specify, giving you complete control over the displayed position.

**Permissions & Privacy:** GeolocateControl requires users to grant location permissions through a browser prompt, which some users may decline for privacy reasons. ManualGeolocateControl requires no permissions at all, making it ideal for privacy-conscious applications or scenarios where you want to show approximate locations without accessing actual user data.

**Reliability & Consistency:** GeolocateControl's accuracy depends on available location sources and can fail in various scenarios (poor signal, indoor environments, permission denied). ManualGeolocateControl always works consistently with your specified coordinates, making it perfect for demos, testing, and predictable behavior.

**Security Requirements:** GeolocateControl requires HTTPS in modern browsers for security reasons. ManualGeolocateControl works on both HTTP and HTTPS, simplifying local development and testing.

**Tracking Mode:** GeolocateControl offers a tracking mode (when `trackUserLocation: true`) that continuously monitors the user's position and updates the map in real-time as they move. This creates an active state where the control acts as a toggle button, maintaining a lock on the user's location. ManualGeolocateControl does not support tracking mode since it works with static, predefined coordinates. Each trigger simply centers the map on the manual position without continuous updates.

### Compatibility Tables

#### Options Compatibility

For comparison with the original control, see [`GeolocateControlOptions`](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/GeolocateControlOptions/) in the MapLibre GL JS documentation. ManualGeolocateControl uses [`ManualGeolocateControlOptions`](#manualgeolocatecontroloptions) instead.

| Option               | GeolocateControl | ManualGeolocateControl | Description                                     |
| -------------------- | :--------------: | :--------------------: | ----------------------------------------------- |
| `fitBoundsOptions`   |        ✅        |           ✅           | Auto-zoom configuration (identical behavior)    |
| `positionOptions`    |        ✅        |           ❌           | Geolocation API options (not needed for manual) |
| `showAccuracyCircle` |        ✅        |           ✅           | Accuracy circle visibility                      |
| `showUserLocation`   |        ✅        |           ❌           | Always shows location in manual                 |
| `trackUserLocation`  |        ✅        |           ❌           | Real-time tracking (not supported in manual)    |
| **Manual-specific**  |                  |                        |                                                 |
| `position`           |        ❌        |           ✅           | Required: Coordinates to display                |
| `accuracy`           |        ❌        |           ✅           | Optional: Accuracy radius in meters             |

#### Methods Compatibility

| Method                    | GeolocateControl | ManualGeolocateControl | Description                        |
| ------------------------- | :--------------: | :--------------------: | ---------------------------------- |
| `trigger()`               |        ✅        |           ✅           | Center map on position (identical) |
| **Manual-specific**       |                  |                        |                                    |
| `setPosition()`           |        ❌        |           ✅           | Update manual coordinates          |
| `setAccuracy()`           |        ❌        |           ✅           | Update accuracy radius             |
| `setShowAccuracyCircle()` |        ❌        |           ✅           | Toggle accuracy circle             |
| `setFitBoundsOptions()`   |        ❌        |           ✅           | Update zoom behavior               |

#### Events Compatibility

| Event                    | GeolocateControl | ManualGeolocateControl | Description                              |
| ------------------------ | :--------------: | :--------------------: | ---------------------------------------- |
| `geolocate`              |        ✅        |           ✅           | Position update (same payload structure) |
| `outofmaxbounds`         |        ✅        |           ✅           | Position outside map bounds              |
| `error`                  |        ✅        |           ❌           | Geolocation API errors (not applicable)  |
| `trackuserlocationstart` |        ✅        |           ❌           | Tracking mode started                    |
| `trackuserlocationend`   |        ✅        |           ❌           | Tracking mode ended                      |
| `userlocationfocus`      |        ✅        |           ❌           | Return to tracking mode                  |
| `userlocationlostfocus`  |        ✅        |           ❌           | Exit tracking mode                       |

#### Visual Compatibility

| Element             | GeolocateControl | ManualGeolocateControl | Description                            |
| ------------------- | :--------------: | :--------------------: | -------------------------------------- |
| Control button      |        ✅        |           ✅           | Same button appearance and position    |
| Default icon        |        ✅        |           ✅           | Same geolocate icon in default state   |
| Position marker     |        ✅        |           ✅           | Blue dot with white border             |
| Accuracy circle     |        ✅        |           ✅           | Semi-transparent blue circle           |
| CSS classes         |        ✅        |           ✅           | Uses same MapLibre classes for markers |
| **Button States**   |                  |                        |                                        |
| Default (inactive)  |        ✅        |           ✅           | Same appearance when not activated     |
| Active (tracking)   |        ✅        |           ❌           | No persistent active state in manual   |
| Background          |        ✅        |           ❌           | No background tracking state           |
| Disabled            |        ✅        |           ❌           | Manual is always enabled               |
| Error               |        ✅        |           ❌           | No error state (always succeeds)       |
| **Visual Feedback** |                  |                        |                                        |
| Click animation     |        ✅        |           ✅           | Button press feedback                  |
| Location pulse      |        ✅        |           ❌           | No pulsing animation for live tracking |

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

### Testing

```bash
pnpm test          # Run tests in watch mode
pnpm test:ui       # Run tests with interactive UI
pnpm test:coverage # Run tests with coverage report
```

The project uses [Vitest](https://vitest.dev/) for testing with coverage reporting via `@vitest/coverage-v8`. Current test coverage for the main control is ~85%.

### Code Quality

```bash
pnpm lint        # Check code for issues (formatting + linting)
pnpm lint:fix    # Fix auto-fixable issues
pnpm format      # Check code formatting
pnpm format:fix  # Format code
```

The project uses [Biome](https://biomejs.dev/) for fast linting and formatting. Biome provides a unified toolchain that replaces ESLint and Prettier with better performance.

**Pre-commit Hooks**: The project uses [Husky](https://typicode.github.io/husky/) and [lint-staged](https://github.com/lint-staged/lint-staged) to automatically format and lint staged files before each commit. This ensures all committed code follows the project's style guide. The hooks are automatically set up when you run `pnpm install`.

To skip the pre-commit hook (not recommended), use `git commit --no-verify`.

### Configuration Files

- `vite.config.ts` - Development server configuration
- `vite.config.lib.ts` - Library build (ES/UMD modules for npm)
- `vite.config.demo.ts` - Demo site build (GitHub Pages deployment)
- `biome.json` - Biome linting and formatting configuration
- `vitest.config.ts` - Vitest testing configuration

### CI/CD

The project uses GitHub Actions for continuous integration and deployment:

- **Lint** - Runs Biome checks on all code (formatting + linting)
- **Test** - Runs unit tests with Vitest
- **Build** - Compiles TypeScript and builds the library
- **Deploy Demo** - Automatically deploys the demo to GitHub Pages on push to main
- **Publish** - Automatically publishes to npm when a GitHub Release is created

All workflows run on pull requests to ensure code quality before merging.

### Publishing Releases

See [RELEASE.md](.github/RELEASE.md) for instructions on how to publish new versions to npm.

---

## License

Licensed under either of:

- [MIT License](LICENSE-MIT)
- [Apache License, Version 2.0](LICENSE-APACHE)

at your option.

This dual licensing approach provides you with the flexibility to choose the license that best suits your project's needs. The Apache 2.0 license includes explicit patent grants for additional protection.

---

**Happy mapping! 🗺️**
