# Mock GeolocateControl Implementation Plan

## Overview
Implement a mock version of MapLibre GL's GeolocateControl for testing purposes.

## Core Components

### 1. GeolocateControl Class
- **Constructor**: Accept options parameter
- **onAdd(map)**: Store map reference, create container, bind event handlers
- **onRemove()**: Clean up resources, remove event listeners
- **trigger()**: Programmatically trigger geolocation

### 2. Event System
- Implement EventEmitter pattern
- Support events: `geolocate`, `error`, `trackuserlocationstart`, `trackuserlocationend`
- Methods: `on()`, `off()`, `fire()`

### 3. State Management
- Track control states: `OFF`, `ACTIVE`, `ACTIVE_LOCK`, `WAITING_ACTIVE`, `ACTIVE_ERROR`, `BACKGROUND`, `BACKGROUND_ERROR`
- Implement state transitions based on user interactions and API responses

### 4. Mock Geolocation API
- Create `_setupMockGeolocation()` method
- Support `getCurrentPosition()` and `watchPosition()`
- Allow setting mock coordinates and errors

### 5. Visual Markers
- User location dot with accuracy circle
- Heading indicator (when available)
- Animation support for tracking modes

### 6. Options Support
- `positionOptions`: High accuracy, timeout, maximum age
- `fitBoundsOptions`: Padding, max zoom
- `trackUserLocation`: Continuous tracking
- `showAccuracyCircle`: Show/hide accuracy visualization
- `showUserLocation`: Show/hide user marker
- `showUserHeading`: Show/hide heading indicator

### 7. Button Interaction
- Click handler for state transitions
- Visual feedback (active/inactive states)
- Support for different tracking modes

## Implementation Steps

1. **Setup base class structure**
   - EventEmitter implementation
   - Constructor with options
   - Basic lifecycle methods

2. **Implement mock geolocation**
   - Mock navigator.geolocation API
   - Configurable responses
   - Error simulation

3. **Add state management**
   - State constants
   - Transition logic
   - Event firing on state changes

4. **Create visual components**
   - User location marker
   - Accuracy circle
   - Heading indicator
   - DOM element creation

5. **Implement button behavior**
   - Click handling
   - State-based styling
   - Proper event sequencing

6. **Add tracking modes**
   - One-time location
   - Continuous tracking
   - Background tracking

7. **Testing utilities**
   - Helper methods for testing
   - Mock data setters
   - State inspection methods

## Testing Considerations

- Ability to set mock coordinates programmatically
- Simulate location errors
- Test state transitions
- Verify event firing
- Check visual updates
- Test cleanup on removal

## API Compatibility

Maintain compatibility with MapLibre GL JS GeolocateControl API:
- Same method signatures
- Same event names and payloads
- Same option properties
- Similar visual behavior (simplified for testing)