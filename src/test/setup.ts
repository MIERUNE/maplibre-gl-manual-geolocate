import { beforeAll, vi } from 'vitest';

/**
 * Test setup for MapLibre GL JS components
 *
 * This setup file provides browser API mocks required for testing components
 * that use MapLibre GL JS. Since MapLibre GL requires WebGL and various browser
 * APIs, we need to mock them for the jsdom environment.
 *
 * Inspired by MapLibre GL JS test setup:
 * https://github.com/maplibre/maplibre-gl-js/blob/main/test/unit/lib/web_worker_mock.ts
 * https://github.com/maplibre/maplibre-gl-js/blob/main/test/unit/setup.ts
 */

// Mock URL.createObjectURL for MapLibre GL worker setup
(globalThis as any).URL.createObjectURL = vi.fn(() => 'blob:mock-url');
(globalThis as any).URL.revokeObjectURL = vi.fn();

// Mock Worker for MapLibre GL
(globalThis as any).Worker = vi.fn().mockImplementation(() => ({
  postMessage: vi.fn(),
  terminate: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
})) as any;

// Mock ImageData if not provided by the environment
if (!(globalThis as any).ImageData) {
  (globalThis as any).ImageData = class ImageData {
    data: Uint8ClampedArray;
    width: number;
    height: number;

    constructor(
      widthOrData: number | Uint8ClampedArray,
      heightOrWidth: number,
      maybeHeight?: number,
    ) {
      if (typeof widthOrData === 'number') {
        this.width = widthOrData;
        this.height = heightOrWidth;
        this.data = new Uint8ClampedArray(this.width * this.height * 4);
      } else {
        this.data = widthOrData;
        this.width = heightOrWidth;
        this.height = typeof maybeHeight === 'number'
          ? maybeHeight
          : Math.max(1, Math.floor(this.data.length / 4 / this.width));
      }
    }
  };
}

// Mock ResizeObserver
(globalThis as any).ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
(globalThis as any).IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock WebGL
beforeAll(() => {
  const webglMock = {
    // Canvas reference
    canvas: document.createElement('canvas'),
    drawingBufferWidth: 200,
    drawingBufferHeight: 200,

    // Buffer operations
    createBuffer: vi.fn(() => ({})),
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    bufferSubData: vi.fn(),
    deleteBuffer: vi.fn(),

    // Shader operations
    createShader: vi.fn(() => ({})),
    shaderSource: vi.fn(),
    compileShader: vi.fn(),
    getShaderParameter: vi.fn(() => true),
    getShaderInfoLog: vi.fn(() => ''),
    deleteShader: vi.fn(),

    // Program operations
    createProgram: vi.fn(() => ({})),
    attachShader: vi.fn(),
    linkProgram: vi.fn(),
    useProgram: vi.fn(),
    getProgramParameter: vi.fn(() => true),
    getProgramInfoLog: vi.fn(() => ''),
    deleteProgram: vi.fn(),
    getUniformLocation: vi.fn(() => ({})),
    getAttribLocation: vi.fn(() => 0),
    uniform1i: vi.fn(),
    uniform1f: vi.fn(),
    uniform2f: vi.fn(),
    uniform3f: vi.fn(),
    uniform4f: vi.fn(),
    uniformMatrix4fv: vi.fn(),

    // Texture operations
    createTexture: vi.fn(() => ({})),
    bindTexture: vi.fn(),
    texImage2D: vi.fn(),
    texParameteri: vi.fn(),
    deleteTexture: vi.fn(),
    activeTexture: vi.fn(),

    // Framebuffer operations
    createFramebuffer: vi.fn(() => ({})),
    bindFramebuffer: vi.fn(),
    framebufferTexture2D: vi.fn(),
    deleteFramebuffer: vi.fn(),
    checkFramebufferStatus: vi.fn(() => 0x8CD5), // GL_FRAMEBUFFER_COMPLETE

    // Renderbuffer operations
    createRenderbuffer: vi.fn(() => ({})),
    bindRenderbuffer: vi.fn(),
    renderbufferStorage: vi.fn(),
    framebufferRenderbuffer: vi.fn(),
    deleteRenderbuffer: vi.fn(),

    // Vertex operations
    enableVertexAttribArray: vi.fn(),
    disableVertexAttribArray: vi.fn(),
    vertexAttribPointer: vi.fn(),

    // Drawing operations
    drawArrays: vi.fn(),
    drawElements: vi.fn(),
    viewport: vi.fn(),
    scissor: vi.fn(),

    // State operations
    enable: vi.fn(),
    disable: vi.fn(),
    clearColor: vi.fn(),
    clear: vi.fn(),
    colorMask: vi.fn(),
    clearDepth: vi.fn(),
    clearStencil: vi.fn(),
    depthFunc: vi.fn(),
    depthMask: vi.fn(),
    depthRange: vi.fn(),
    blendFunc: vi.fn(),
    blendFuncSeparate: vi.fn(),
    blendEquation: vi.fn(),
    blendColor: vi.fn(),
    cullFace: vi.fn(),
    frontFace: vi.fn(),
    stencilMask: vi.fn(),
    stencilMaskSeparate: vi.fn(),
    stencilFunc: vi.fn(),
    stencilFuncSeparate: vi.fn(),
    stencilOp: vi.fn(),
    stencilOpSeparate: vi.fn(),
    polygonOffset: vi.fn(),
    sampleCoverage: vi.fn(),

    // Query operations
    getParameter: vi.fn((param) => {
      // Return sensible defaults for common parameters
      if (param === 0x1F02) return 'WebGL 1.0'; // GL_VERSION
      if (param === 0x1F01) return 'Mock WebGL Renderer'; // GL_RENDERER
      if (param === 0x1F00) return 'Mock WebGL Vendor'; // GL_VENDOR
      if (param === 0x8B8C) return 'WebGL GLSL ES 1.0'; // GL_SHADING_LANGUAGE_VERSION
      if (param === 0x0D33) return 16384; // GL_MAX_TEXTURE_SIZE
      if (param === 0x8869) return 16; // GL_MAX_VERTEX_TEXTURE_IMAGE_UNITS
      if (param === 0x8872) return 16; // GL_MAX_TEXTURE_IMAGE_UNITS
      if (param === 0x851C) return 16; // GL_MAX_VERTEX_ATTRIBS
      if (param === 0x8B4C) return 16; // GL_MAX_VARYING_VECTORS
      if (param === 0x8B4B) return 256; // GL_MAX_VERTEX_UNIFORM_VECTORS
      if (param === 0x8B49) return 256; // GL_MAX_FRAGMENT_UNIFORM_VECTORS
      if (param === 0x84E2) return 16; // GL_MAX_RENDERBUFFER_SIZE
      if (param === 0x8CDF) return 1; // GL_MAX_COLOR_ATTACHMENTS
      if (param === 0x0D32) return [16384, 16384]; // GL_MAX_VIEWPORT_DIMS
      return 0;
    }),
    getExtension: vi.fn((name) => {
      // Return mock extensions for commonly requested ones
      if (name === 'WEBGL_depth_texture' ||
          name === 'OES_texture_float' ||
          name === 'OES_texture_half_float' ||
          name === 'OES_element_index_uint' ||
          name === 'OES_standard_derivatives' ||
          name === 'EXT_texture_filter_anisotropic' ||
          name === 'OES_vertex_array_object' ||
          name === 'ANGLE_instanced_arrays') {
        return {};
      }
      return null;
    }),
    getError: vi.fn(() => 0), // GL_NO_ERROR
    getSupportedExtensions: vi.fn(() => [
      'WEBGL_depth_texture',
      'OES_texture_float',
      'OES_texture_half_float',
      'OES_element_index_uint',
      'OES_standard_derivatives',
      'EXT_texture_filter_anisotropic',
      'OES_vertex_array_object',
      'ANGLE_instanced_arrays',
    ]),
    isContextLost: vi.fn(() => false),
    getShaderPrecisionFormat: vi.fn(() => ({
      rangeMin: 127,
      rangeMax: 127,
      precision: 23,
    })),
    pixelStorei: vi.fn(),
    lineWidth: vi.fn(),

    // Constants
    ARRAY_BUFFER: 0x8892,
    ELEMENT_ARRAY_BUFFER: 0x8893,
    STATIC_DRAW: 0x88E4,
    DYNAMIC_DRAW: 0x88E8,
    VERSION: 0x1F02,
    VERTEX_SHADER: 0x8B31,
    FRAGMENT_SHADER: 0x8B30,
    COMPILE_STATUS: 0x8B81,
    LINK_STATUS: 0x8B82,
    TEXTURE_2D: 0x0DE1,
    TEXTURE0: 0x84C0,
    RGBA: 0x1908,
    UNSIGNED_BYTE: 0x1401,
    FRAMEBUFFER: 0x8D40,
    RENDERBUFFER: 0x8D41,
    DEPTH_COMPONENT16: 0x81A5,
    COLOR_ATTACHMENT0: 0x8CE0,
    DEPTH_ATTACHMENT: 0x8D00,
  };

  HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation((type) => {
    if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') {
      return webglMock;
    }
    if (type === '2d') {
      return {
        fillRect: vi.fn(),
        clearRect: vi.fn(),
        getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) })),
        putImageData: vi.fn(),
        createImageData: vi.fn(),
        setTransform: vi.fn(),
        drawImage: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        fillText: vi.fn(),
        measureText: vi.fn(() => ({ width: 0 })),
        scale: vi.fn(),
        rotate: vi.fn(),
        translate: vi.fn(),
        transform: vi.fn(),
      };
    }
    return null;
  });
});

// Mock performance.mark and performance.measure
if (typeof performance !== 'undefined') {
  performance.mark = vi.fn();
  performance.measure = vi.fn();
}
