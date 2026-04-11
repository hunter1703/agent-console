/**
 * Layered Refraction Engine
 * 
 * Manages multiple WebGL layers where each layer refracts all layers below it.
 * This creates realistic glass stacking effects.
 * 
 * Architecture:
 * - Layer 0: Base background image
 * - Layer 1: Refracts Layer 0
 * - Layer 2: Refracts composite of Layer 0 + Layer 1
 * - Layer N: Refracts composite of all layers below
 */

import { GlassType, GlassProperties, RefractionLayer } from './types';
import { VERTEX_SHADER, SHADER_MAP } from './shaders';

export class RefractionEngine {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext;
  private layers: Map<string, RefractionLayer> = new Map();
  private programs: Map<GlassType, WebGLProgram> = new Map();
  private textures: Map<string, WebGLTexture> = new Map();
  private framebuffers: Map<string, WebGLFramebuffer> = new Map();
  private animationId: number | null = null;
  private startTime: number = performance.now();
  private baseImage: HTMLImageElement | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    
    const gl = canvas.getContext('webgl', {
      alpha: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      antialias: false,
    });

    if (!gl) {
      throw new Error('WebGL not supported');
    }

    this.gl = gl;
    this.setupGL();
  }

  private setupGL() {
    const gl = this.gl;
    
    // Create fullscreen quad
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    // Compile shaders for each glass type
    Object.entries(SHADER_MAP).forEach(([type, fragmentSource]) => {
      const program = this.createProgram(VERTEX_SHADER, fragmentSource);
      if (program) {
        this.programs.set(type as GlassType, program);
      }
    });
  }

  private createProgram(vsSource: string, fsSource: string): WebGLProgram | null {
    const gl = this.gl;
    
    const vs = this.createShader(gl.VERTEX_SHADER, vsSource);
    const fs = this.createShader(gl.FRAGMENT_SHADER, fsSource);
    
    if (!vs || !fs) return null;

    const program = gl.createProgram();
    if (!program) return null;

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return null;
    }

    return program;
  }

  private createShader(type: number, source: string): WebGLShader | null {
    const gl = this.gl;
    const shader = gl.createShader(type);
    if (!shader) return null;

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  setBaseImage(image: HTMLImageElement) {
    this.baseImage = image;
    
    // Create texture for base image
    const gl = this.gl;
    const texture = gl.createTexture();
    if (!texture) return;

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    this.textures.set('base', texture);
  }

  addLayer(id: string, zIndex: number, element: HTMLElement, properties: GlassProperties) {
    this.layers.set(id, { id, zIndex, element, properties });
    
    // Create framebuffer for this layer
    const gl = this.gl;
    const framebuffer = gl.createFramebuffer();
    const texture = gl.createTexture();
    
    if (!framebuffer || !texture) return;

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.canvas.width, this.canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    this.framebuffers.set(id, framebuffer);
    this.textures.set(id, texture);
  }

  removeLayer(id: string) {
    this.layers.delete(id);
    
    const framebuffer = this.framebuffers.get(id);
    const texture = this.textures.get(id);
    
    if (framebuffer) this.gl.deleteFramebuffer(framebuffer);
    if (texture) this.gl.deleteTexture(texture);
    
    this.framebuffers.delete(id);
    this.textures.delete(id);
  }

  resize(width: number, height: number) {
    const dpr = Math.min(window.devicePixelRatio, 2);
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

    // Recreate framebuffer textures
    this.layers.forEach((layer) => {
      const texture = this.textures.get(layer.id);
      if (texture) {
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.canvas.width, this.canvas.height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
      }
    });
  }

  private renderLayer(layer: RefractionLayer, inputTexture: WebGLTexture) {
    const gl = this.gl;
    const program = this.programs.get(layer.properties.type);
    if (!program) return;

    gl.useProgram(program);

    // Set uniforms
    const uniforms = {
      texture: gl.getUniformLocation(program, 'uTexture'),
      resolution: gl.getUniformLocation(program, 'uResolution'),
      time: gl.getUniformLocation(program, 'uTime'),
      refraction: gl.getUniformLocation(program, 'uRefraction'),
      chromatic: gl.getUniformLocation(program, 'uChromatic'),
      tint: gl.getUniformLocation(program, 'uTint'),
      tintStrength: gl.getUniformLocation(program, 'uTintStrength'),
    };

    const currentTime = (performance.now() - this.startTime) / 1000;

    gl.uniform2f(uniforms.resolution, this.canvas.width, this.canvas.height);
    gl.uniform1f(uniforms.time, currentTime);
    gl.uniform1f(uniforms.refraction, layer.properties.refraction || 0);
    gl.uniform1f(uniforms.chromatic, layer.properties.chromatic || 0);

    if (layer.properties.tint && uniforms.tint) {
      // Parse HSL color
      const match = layer.properties.tint.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
      if (match) {
        const h = parseInt(match[1]) / 360;
        const s = parseInt(match[2]) / 100;
        const l = parseInt(match[3]) / 100;
        // Convert HSL to RGB (simplified)
        gl.uniform3f(uniforms.tint, h, s, l);
        gl.uniform1f(uniforms.tintStrength, 0.3);
      }
    }

    // Bind input texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, inputTexture);
    gl.uniform1i(uniforms.texture, 0);

    // Set position attribute
    const position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    // Draw
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  render() {
    const gl = this.gl;
    
    // Sort layers by z-index
    const sortedLayers = Array.from(this.layers.values()).sort((a, b) => a.zIndex - b.zIndex);

    let currentTexture = this.textures.get('base');
    if (!currentTexture) return;

    // Render each layer, compositing with layers below
    sortedLayers.forEach((layer) => {
      const framebuffer = this.framebuffers.get(layer.id);
      if (!framebuffer) return;

      // Render to this layer's framebuffer
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.clear(gl.COLOR_BUFFER_BIT);
      
      this.renderLayer(layer, currentTexture!);

      // This layer's output becomes input for next layer
      currentTexture = this.textures.get(layer.id)!;
    });

    // Final render to screen
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    if (sortedLayers.length > 0) {
      // Render the final composite
      const lastLayer = sortedLayers[sortedLayers.length - 1];
      const program = this.programs.get('frosted'); // Use simple passthrough
      if (program) {
        gl.useProgram(program);
        const position = gl.getAttribLocation(program, 'position');
        gl.enableVertexAttribArray(position);
        gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
        
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, currentTexture);
        gl.uniform1i(gl.getUniformLocation(program, 'uTexture'), 0);
        
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
    } else {
      // No layers, just show base image
      const program = this.programs.get('frosted');
      if (program) {
        gl.useProgram(program);
        const position = gl.getAttribLocation(program, 'position');
        gl.enableVertexAttribArray(position);
        gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
        
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, currentTexture);
        gl.uniform1i(gl.getUniformLocation(program, 'uTexture'), 0);
        
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
    }
  }

  start() {
    if (this.animationId !== null) return;

    const loop = () => {
      this.render();
      this.animationId = requestAnimationFrame(loop);
    };

    loop();
  }

  stop() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  destroy() {
    this.stop();
    
    // Clean up WebGL resources
    this.programs.forEach(program => this.gl.deleteProgram(program));
    this.textures.forEach(texture => this.gl.deleteTexture(texture));
    this.framebuffers.forEach(fb => this.gl.deleteFramebuffer(fb));
    
    this.programs.clear();
    this.textures.clear();
    this.framebuffers.clear();
    this.layers.clear();
  }
}
