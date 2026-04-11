'use client';

import { useEffect, useRef } from 'react';

/**
 * WebGL Refraction Layer
 * 
 * Creates a full-page WebGL canvas that captures the background and applies
 * refraction distortion. Glass components above this layer will show the
 * distorted background through their transparency.
 * 
 * This is the only way to achieve true background refraction in web browsers.
 * 
 * References:
 * - liquid-glass/12-advanced-webgl-shaders.md → Raw WebGL Implementation
 */

interface RefractionLayerProps {
  backgroundImage: string;
  enabled?: boolean;
  strength?: number;
}

export default function RefractionLayer({
  backgroundImage,
  enabled = true,
  strength = 0.015,
}: RefractionLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      alpha: false,
      premultipliedAlpha: false,
    });

    if (!gl) {
      console.warn('WebGL not supported');
      return;
    }

    // Vertex shader
    const vsSource = `
      attribute vec2 position;
      varying vec2 vUv;
      
      void main() {
        vUv = position * 0.5 + 0.5;
        vUv.y = 1.0 - vUv.y; // Flip Y for texture
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    // Fragment shader with organic refraction
    const fsSource = `
      precision highp float;
      
      uniform sampler2D uTexture;
      uniform vec2 uResolution;
      uniform float uTime;
      uniform float uStrength;
      
      varying vec2 vUv;
      
      // Hash function for noise
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }
      
      // Smooth noise
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }
      
      // Fractal Brownian Motion for organic distortion
      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        
        for (int i = 0; i < 5; i++) {
          value += amplitude * noise(p);
          p *= 2.0;
          amplitude *= 0.5;
        }
        
        return value;
      }
      
      void main() {
        vec2 uv = vUv;
        
        // Create organic distortion field
        float distortX = fbm(uv * 3.0 + vec2(uTime * 0.1, 0.0));
        float distortY = fbm(uv * 3.0 + vec2(0.0, uTime * 0.1));
        
        // Normalize to -1 to 1
        vec2 distortion = vec2(distortX, distortY) * 2.0 - 1.0;
        
        // Apply refraction
        vec2 refractedUV = uv + distortion * uStrength;
        
        // Sample texture
        vec4 color = texture2D(uTexture, refractedUV);
        
        gl_FragColor = color;
      }
    `;

    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      
      return shader;
    };

    const vs = createShader(gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program error:', gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Fullscreen quad
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const uniforms = {
      texture: gl.getUniformLocation(program, 'uTexture'),
      resolution: gl.getUniformLocation(program, 'uResolution'),
      time: gl.getUniformLocation(program, 'uTime'),
      strength: gl.getUniformLocation(program, 'uStrength'),
    };

    // Load texture
    const texture = gl.createTexture();
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      
      render();
    };
    
    img.src = backgroundImage;

    // Resize handler
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    
    resize();
    window.addEventListener('resize', resize);

    // Render loop
    let animationId: number;
    const startTime = performance.now();
    
    const render = () => {
      const currentTime = (performance.now() - startTime) / 1000;
      
      gl.clear(gl.COLOR_BUFFER_BIT);
      
      // Update uniforms
      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
      gl.uniform1f(uniforms.time, currentTime);
      gl.uniform1f(uniforms.strength, strength);
      
      // Bind texture
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(uniforms.texture, 0);
      
      // Draw
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      
      animationId = requestAnimationFrame(render);
    };

    return () => {
      window.removeEventListener('resize', resize);
      if (animationId) cancelAnimationFrame(animationId);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buffer);
      gl.deleteTexture(texture);
    };
  }, [backgroundImage, enabled, strength]);

  if (!enabled) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
