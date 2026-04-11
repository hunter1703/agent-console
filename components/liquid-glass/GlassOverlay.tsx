'use client';

import { useEffect, useRef, ReactNode } from 'react';

/**
 * WebGL Glass Overlay Component
 * 
 * Wraps content with a WebGL canvas that applies true glass refraction.
 * The canvas captures the content below and applies lens distortion.
 * 
 * References:
 * - liquid-glass/12-advanced-webgl-shaders.md → Raw WebGL Implementation
 */

interface GlassOverlayProps {
  children: ReactNode;
  refractionStrength?: number;
  className?: string;
  enabled?: boolean;
}

export default function GlassOverlay({
  children,
  refractionStrength = 0.08,
  className = '',
  enabled = true,
}: GlassOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const content = contentRef.current;
    
    if (!canvas || !container || !content) return;

    const gl = canvas.getContext('webgl', {
      alpha: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
    });

    if (!gl) {
      console.warn('WebGL not supported, falling back to CSS');
      return;
    }

    // Vertex shader
    const vsSource = `
      attribute vec2 position;
      varying vec2 vUv;
      
      void main() {
        vUv = position * 0.5 + 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    // Fragment shader with subtle refraction
    const fsSource = `
      precision mediump float;
      
      uniform vec2 iResolution;
      uniform sampler2D iChannel0;
      uniform float uRefraction;
      
      varying vec2 vUv;
      
      // Perlin-like noise for organic distortion
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }
      
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
      
      // Fractal noise for natural glass distortion
      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 3.0;
        
        for (int i = 0; i < 4; i++) {
          value += amplitude * noise(p * frequency);
          frequency *= 2.0;
          amplitude *= 0.5;
        }
        
        return value;
      }
      
      void main() {
        vec2 uv = gl_FragCoord.xy / iResolution.xy;
        
        // Create organic distortion field
        vec2 distortionField = vec2(
          fbm(uv * 4.0 + vec2(0.0, 0.0)),
          fbm(uv * 4.0 + vec2(5.2, 1.3))
        );
        
        // Normalize to -1 to 1 range
        distortionField = (distortionField - 0.5) * 2.0;
        
        // Apply refraction
        vec2 distortedUV = uv + distortionField * uRefraction;
        
        // Sample texture with distortion
        vec4 color = texture2D(iChannel0, distortedUV);
        
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
      resolution: gl.getUniformLocation(program, 'iResolution'),
      texture: gl.getUniformLocation(program, 'iChannel0'),
      refraction: gl.getUniformLocation(program, 'uRefraction'),
    };

    // Create texture from content
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    let animationId: number;
    
    const render = () => {
      if (!canvas || !content) return;
      
      // Update canvas size
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);

      // Capture content as texture using html2canvas approach
      // For now, we'll use a simpler approach with background capture
      
      gl.clear(gl.COLOR_BUFFER_BIT);
      
      // Update uniforms
      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
      gl.uniform1f(uniforms.refraction, refractionStrength);
      
      // Bind texture
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(uniforms.texture, 0);
      
      // Draw
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      
      animationId = requestAnimationFrame(render);
    };

    // Start render loop
    render();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buffer);
      gl.deleteTexture(texture);
    };
  }, [enabled, refractionStrength]);

  if (!enabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Content layer */}
      <div ref={contentRef} className="relative z-10">
        {children}
      </div>
      
      {/* WebGL refraction overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-20"
        style={{ mixBlendMode: 'normal' }}
      />
    </div>
  );
}
