# SSR Usage Guide

This guide explains how to use `@mierune/maplibre-gl-manual-geolocate` in SSR (Server-Side Rendering) environments like SvelteKit, Next.js, or Nuxt.

## The Problem

The standard build of this package imports `maplibre-gl` at the top level, which causes errors in SSR environments because MapLibre GL JS is a browser-only library that depends on WebGL and other browser APIs not available in Node.js.

## The Solution

We provide an SSR-safe build that uses dynamic imports to lazy-load `maplibre-gl` dependencies only when needed (in the browser).

## Installation

```bash
npm install @mierune/maplibre-gl-manual-geolocate
# or
pnpm add @mierune/maplibre-gl-manual-geolocate
```

## Usage in SvelteKit

### Option 1: Use the SSR-safe Export (Recommended)

Import from the `/ssr` export path which provides the SSR-safe version:

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import maplibregl from 'maplibre-gl';
  import { ManualGeolocateControl } from '@mierune/maplibre-gl-manual-geolocate/ssr';
  import 'maplibre-gl/dist/maplibre-gl.css';

  let mapContainer: HTMLDivElement;
  let map: maplibregl.Map;

  onMount(() => {
    map = new maplibregl.Map({
      container: mapContainer,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [139.74135747, 35.65809922],
      zoom: 14
    });

    const manualGeolocateControl = new ManualGeolocateControl({
      position: { lng: 139.74135747, lat: 35.65809922 },
      accuracy: 50
    });

    map.addControl(manualGeolocateControl, 'top-right');

    return () => map.remove();
  });
</script>

<div bind:this={mapContainer} class="map"></div>

<style>
  .map {
    width: 100%;
    height: 400px;
  }
</style>
```

### Option 2: Client-Only Import

If you prefer to use the regular build, you can import it only on the client side:

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import maplibregl from 'maplibre-gl';
  import 'maplibre-gl/dist/maplibre-gl.css';

  let mapContainer: HTMLDivElement;
  let map: maplibregl.Map;

  onMount(async () => {
    // Dynamically import only in browser
    const { ManualGeolocateControl } = await import('@mierune/maplibre-gl-manual-geolocate');

    map = new maplibregl.Map({
      container: mapContainer,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [139.74135747, 35.65809922],
      zoom: 14
    });

    const manualGeolocateControl = new ManualGeolocateControl({
      position: { lng: 139.74135747, lat: 35.65809922 },
      accuracy: 50
    });

    map.addControl(manualGeolocateControl, 'top-right');

    return () => map.remove();
  });
</script>
```

### Option 3: Disable SSR for the Component

You can also disable SSR for specific components in SvelteKit:

```javascript
// +page.js or +layout.js
export const ssr = false;
```

## Usage in Next.js

For Next.js, use dynamic imports with `ssr: false`:

```tsx
import dynamic from 'next/dynamic';

const MapComponent = dynamic(
  () => import('./MapComponent'),
  { ssr: false }
);

export default function Page() {
  return <MapComponent />;
}
```

Then in your MapComponent:

```tsx
import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { ManualGeolocateControl } from '@mierune/maplibre-gl-manual-geolocate/ssr';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function MapComponent() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [139.74135747, 35.65809922],
      zoom: 14
    });

    const manualGeolocateControl = new ManualGeolocateControl({
      position: { lng: 139.74135747, lat: 35.65809922 },
      accuracy: 50
    });

    map.current.addControl(manualGeolocateControl, 'top-right');

    return () => map.current?.remove();
  }, []);

  return <div ref={mapContainer} style={{ width: '100%', height: '400px' }} />;
}
```

## API Differences

The SSR-safe version has a few minor differences:

1. **Async Methods**: Some methods like `trigger()` and `setPosition()` are now async to handle dynamic imports:
   ```typescript
   // Regular version
   control.trigger();

   // SSR-safe version
   await control.trigger();
   ```

2. **Lazy Loading**: MapLibre GL classes are loaded on first use, so there might be a slight delay when first interacting with the control.

These differences are minimal and shouldn't affect most use cases. The control maintains full compatibility with the MapLibre GL JS API.

## TypeScript Support

Both versions provide full TypeScript support. The types are identical, so you can switch between versions without changing your type definitions.

## Performance Considerations

- The SSR-safe version uses dynamic imports, which means MapLibre GL classes are loaded on-demand
- This adds a minimal one-time delay when the control is first used
- Once loaded, performance is identical to the regular version
- The SSR-safe build is slightly larger (~1KB) due to the dynamic import logic

## Troubleshooting

If you still encounter SSR errors:

1. Make sure you're importing from `@mierune/maplibre-gl-manual-geolocate/ssr`
2. Ensure the control is only used inside `onMount()` (Svelte) or `useEffect()` (React)
3. Check that your build system is configured to handle dynamic imports
4. Consider disabling SSR for map components if the above solutions don't work

## Example Repository

For a complete working example with SvelteKit, see: [TODO: Add example repo link]