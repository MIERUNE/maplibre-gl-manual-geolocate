// Test setup file for vitest
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
HTMLCanvasElement.prototype.getContext = vi.fn((contextType: string) => {
  if (contextType === "webgl" || contextType === "webgl2") {
    return {
      canvas: document.createElement("canvas"),
      drawingBufferWidth: 300,
      drawingBufferHeight: 150,
      getExtension: vi.fn(() => null),
      getParameter: vi.fn(() => null),
      createTexture: vi.fn(),
      bindTexture: vi.fn(),
      texImage2D: vi.fn(),
      texParameteri: vi.fn(),
      createProgram: vi.fn(),
      createShader: vi.fn(),
      shaderSource: vi.fn(),
      compileShader: vi.fn(),
      attachShader: vi.fn(),
      linkProgram: vi.fn(),
      useProgram: vi.fn(),
      getShaderParameter: vi.fn(() => true),
      getProgramParameter: vi.fn(() => true),
      getUniformLocation: vi.fn(),
      getAttribLocation: vi.fn(),
      enableVertexAttribArray: vi.fn(),
      vertexAttribPointer: vi.fn(),
      createBuffer: vi.fn(),
      bindBuffer: vi.fn(),
      bufferData: vi.fn(),
      clear: vi.fn(),
      clearColor: vi.fn(),
      enable: vi.fn(),
      disable: vi.fn(),
      depthFunc: vi.fn(),
      blendFunc: vi.fn(),
      blendEquation: vi.fn(),
      blendFuncSeparate: vi.fn(),
      blendEquationSeparate: vi.fn(),
      viewport: vi.fn(),
      drawArrays: vi.fn(),
      drawElements: vi.fn(),
      deleteShader: vi.fn(),
      deleteProgram: vi.fn(),
      deleteBuffer: vi.fn(),
      deleteTexture: vi.fn(),
      deleteFramebuffer: vi.fn(),
      pixelStorei: vi.fn(),
      activeTexture: vi.fn(),
      uniform1i: vi.fn(),
      uniform1f: vi.fn(),
      uniform2f: vi.fn(),
      uniform3f: vi.fn(),
      uniform4f: vi.fn(),
      uniformMatrix4fv: vi.fn(),
      createFramebuffer: vi.fn(),
      bindFramebuffer: vi.fn(),
      framebufferTexture2D: vi.fn(),
      checkFramebufferStatus: vi.fn(() => 36053), // FRAMEBUFFER_COMPLETE
      stencilMask: vi.fn(),
      stencilFunc: vi.fn(),
      stencilOp: vi.fn(),
      colorMask: vi.fn(),
      depthMask: vi.fn(),
      cullFace: vi.fn(),
      frontFace: vi.fn(),
      lineWidth: vi.fn(),
      scissor: vi.fn(),
    } as any;
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
