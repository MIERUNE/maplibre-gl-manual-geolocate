// Test setup file for vitest
// Suppress console errors from MapLibre GL rendering in tests
const originalError = console.error;
console.error = (...args: any[]) => {
  // Suppress MapLibre GL rendering errors in tests
  const message = args[0]?.toString() || "";
  if (
    message.includes("gl.") ||
    message.includes("WebGL") ||
    message.includes("this.gl")
  ) {
    return;
  }
  originalError.apply(console, args);
};

// Mock window.URL.createObjectURL which is not available in jsdom
if (typeof window !== "undefined") {
  window.URL.createObjectURL = vi.fn(() => "mock-url");
  window.URL.revokeObjectURL = vi.fn();
}

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock Worker for MapLibre GL
global.Worker = vi.fn().mockImplementation(() => ({
  postMessage: vi.fn(),
  terminate: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
})) as any;

// Mock WebGL context (comprehensive mock to support MapLibre GL)
// Using Proxy to catch all WebGL method calls and return mock functions
HTMLCanvasElement.prototype.getContext = vi.fn((contextType: string) => {
  if (contextType === "webgl" || contextType === "webgl2") {
    const baseContext = {
      canvas: document.createElement("canvas"),
      drawingBufferWidth: 300,
      drawingBufferHeight: 150,
      // Return values for specific methods
      getExtension: vi.fn(() => null),
      getParameter: vi.fn(() => null),
      getShaderParameter: vi.fn(() => true),
      getProgramParameter: vi.fn(() => true),
      checkFramebufferStatus: vi.fn(() => 36053), // FRAMEBUFFER_COMPLETE
      getContextAttributes: vi.fn(() => ({
        alpha: true,
        antialias: false,
        depth: true,
        stencil: true,
      })),
    };

    // Use Proxy to automatically mock any missing WebGL methods
    return new Proxy(baseContext, {
      get(target: any, prop: string) {
        if (prop in target) {
          return target[prop];
        }
        // Return a mock function for any WebGL method not explicitly defined
        target[prop] = vi.fn();
        return target[prop];
      },
    }) as any;
  }
  // 2D context fallback
  return {
    canvas: document.createElement("canvas"),
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn(),
    putImageData: vi.fn(),
    createImageData: vi.fn(),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    measureText: vi.fn(() => ({ width: 0 })),
    transform: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn(),
  } as any;
}) as any;
