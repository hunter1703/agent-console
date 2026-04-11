'use client';

import { useEffect, useRef } from 'react';

/**
 * WebGL Glass Distortion Effect
 * 
 * Implements true optical glass with:
 * - Lens distortion (refraction)
 * - Chromatic aberration (color separation)
 * - Light flares
 * - Mouse-interactive lens center
 * 
 * References:
 * - liquid-glass/12-advanced-webgl-shaders.md → Raw WebGL Implementation
 */

interface GlassDistortionProps {
  imageUrl: string;
  refractionStrength?: number;
  chromaticAmount?: number;
  className?: string;
}

export default function GlassDistortion({
  imageUrl,
  refractionStrength = 0.15,
  chromaticAmount = 0.005,
  className = '',
}: GlassDistortionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      powerPreference: 'high-performance',
      antialias: false,
    });

    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    // Set canvas size
    const setCanvasSize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Vertex shader (simple passthrough)
    const vsSource = `
      attribute vec2 position;
      varying vec2 vUv;
      
      void main() {
        vUv = position * 0.5 + 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    // Fragment shader with glass effects
    const fsSource = `
      precision mediump float;
      
      uniform vec2 iResolution;
      uniform vec2 iMouse;
      uniform sampler2D iChannel0;
      uniform float uRefraction;
      uniform float uChromatic;
      
      varying vec2 vUv;
      
      // Lens distortion effect
      vec2 lensDistortion(vec2 uv, vec2 center, float strength) {
        vec2 delta = uv - center;
        float dist = length(delta);
        float factor = 1.0 + strength * dist * dist;
        return center + delta * factor;
      }
      
      // Chromatic aberration
      vec3 chromaticAberration(sampler2D tex, vec2 uv, float amount) {
        vec2 direction = uv - vec2(0.5);
        float r = texture2D(tex, uv + direction * amount).r;
        float g = texture2D(tex, uv).g;
        float b = texture2D(tex, uv - direction * amount).b;
        return vec3(r, g, b);
      }
      
      // Light flare effect
      float flare(vec2 uv, vec2 pos, float size) {
        float dist = length(uv - pos);
        return size / (dist * dist + 0.01);
      }
      
      void main() {
        vec2 uv = gl_FragCoord.xy / iResolution.xy;
        
        // Mouse-based lens center
        vec2 lensCenter = iMouse.xy / iResolution.xy;
        if (length(iMouse.xy) < 1.0) {
          lensCenter = vec2(0.5); // Default center
        }
        
        // Apply lens distortion
        vec2 distortedUV = lensDistortion(uv, lensCenter, uRefraction);
        
        // Sample with chromatic aberration
        vec3 color = chromaticAberration(iChannel0, distortedUV, uChromatic);
        
        // Add light flares
        float flare1 = flare(uv, lensCenter, 0.02);
        float flare2 = flare(uv, lensCenter + vec2(0.1, 0.05), 0.01);
        float flare3 = flare(uv, lensCenter - vec2(0.08, 0.03), 0.008);
        
        vec3 flareColor = vec3(1.0, 0.9, 0.7) * (flare1 + flare2 + flare3);
        
        // Combine
        color += flareColor * 0.3;
        
        // Vignette
        float vignette = smoothstep(0.8, 0.2, length(uv - vec2(0.5)));
        color *= vignette;
        
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    // Create shader
    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      
      return shader;
    };

    // Create program
    const vs = createShader(gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program linking error:', gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Create fullscreen quad
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1,  // Bottom-left
         1, -1,  // Bottom-right
        -1,  1,  // Top-left
         1,  1   // Top-right
      ]),
      gl.STATIC_DRAW
    );

    // Set up position attribute
    const position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    // Get uniform locations
    const uniforms = {
      resolution: gl.getUniformLocation(program, 'iResolution'),
      mouse: gl.getUniformLocation(program, 'iMouse'),
      texture: gl.getUniformLocation(program, 'iChannel0'),
      refraction: gl.getUniformLocation(program, 'uRefraction'),
      chromatic: gl.getUniformLocation(program, 'uChromatic'),
    };

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: canvas.height - (e.clientY - rect.top),
      };
    };
    canvas.addEventListener('mousemove', handleMouseMove);

    // Texture setup
    const texture = gl.createTexture();
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        img
      );
      
      // Texture parameters
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      
      // Start render loop
      render();
    };
    
    img.src = imageUrl;

    // Render loop
    let animationId: number;
    const render = () => {
      // Clear canvas
      gl.clear(gl.COLOR_BUFFER_BIT);
      
      // Update uniforms
      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
      gl.uniform2f(uniforms.mouse, mouseRef.current.x, mouseRef.current.y);
      gl.uniform1f(uniforms.refraction, refractionStrength);
      gl.uniform1f(uniforms.chromatic, chromaticAmount);
      
      // Bind texture
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(uniforms.texture, 0);
      
      // Draw fullscreen quad
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      
      animationId = requestAnimationFrame(render);
    };

    // Cleanup
    return () => {
      window.removeEventListener('resize', setCanvasSize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      if (animationId) cancelAnimationFrame(animationId);
      
      // Clean up WebGL resources
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buffer);
      gl.deleteTexture(texture);
    };
  }, [imageUrl, refractionStrength, chromaticAmount]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  );
}
