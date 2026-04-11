/**
 * WebGL Shader Library for Liquid Glass
 * 
 * Production-ready shaders for different glass types.
 * Each shader is optimized and tested.
 */

export const VERTEX_SHADER = `
  attribute vec2 position;
  varying vec2 vUv;
  
  void main() {
    vUv = position * 0.5 + 0.5;
    vUv.y = 1.0 - vUv.y;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

// Noise functions (shared across shaders)
export const NOISE_FUNCTIONS = `
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
`;

// Liquid Glass Shader - Organic flowing distortion
export const LIQUID_GLASS_SHADER = `
  precision highp float;
  
  uniform sampler2D uTexture;
  uniform vec2 uResolution;
  uniform float uTime;
  uniform float uRefraction;
  uniform float uChromatic;
  
  varying vec2 vUv;
  
  ${NOISE_FUNCTIONS}
  
  void main() {
    vec2 uv = vUv;
    
    // Organic flowing distortion
    float distortX = fbm(uv * 3.0 + vec2(uTime * 0.05, 0.0));
    float distortY = fbm(uv * 3.0 + vec2(0.0, uTime * 0.05));
    
    vec2 distortion = vec2(distortX, distortY) * 2.0 - 1.0;
    vec2 refractedUV = uv + distortion * uRefraction;
    
    // Chromatic aberration
    if (uChromatic > 0.0) {
      vec2 direction = uv - vec2(0.5);
      float r = texture2D(uTexture, refractedUV + direction * uChromatic).r;
      float g = texture2D(uTexture, refractedUV).g;
      float b = texture2D(uTexture, refractedUV - direction * uChromatic).b;
      gl_FragColor = vec4(r, g, b, 1.0);
    } else {
      gl_FragColor = texture2D(uTexture, refractedUV);
    }
  }
`;

// Crystal Glass Shader - Sharp faceted refraction
export const CRYSTAL_GLASS_SHADER = `
  precision highp float;
  
  uniform sampler2D uTexture;
  uniform vec2 uResolution;
  uniform float uTime;
  uniform float uRefraction;
  uniform float uChromatic;
  
  varying vec2 vUv;
  
  // Voronoi for crystal facets
  vec2 voronoi(vec2 p) {
    vec2 n = floor(p);
    vec2 f = fract(p);
    
    float minDist = 1.0;
    vec2 minPoint = vec2(0.0, 0.0);
    
    for (int j = -1; j <= 1; j++) {
      for (int i = -1; i <= 1; i++) {
        vec2 neighbor = vec2(float(i), float(j));
        float hash = fract(sin(dot(n + neighbor, vec2(127.1, 311.7))) * 43758.5453);
        vec2 point = vec2(
          0.5 + 0.5 * sin(uTime * 0.2 + 6.2831 * hash),
          0.5 + 0.5 * cos(uTime * 0.2 + 6.2831 * hash)
        );
        vec2 diff = neighbor + point - f;
        float dist = length(diff);
        
        if (dist < minDist) {
          minDist = dist;
          minPoint = diff;
        }
      }
    }
    
    return minPoint;
  }
  
  void main() {
    vec2 uv = vUv;
    
    // Crystal facet distortion
    vec2 facet = voronoi(uv * 8.0);
    vec2 refractedUV = uv + facet * uRefraction;
    
    // Strong chromatic aberration for prismatic effect
    vec2 direction = normalize(facet);
    float r = texture2D(uTexture, refractedUV + direction * uChromatic * 1.5).r;
    float g = texture2D(uTexture, refractedUV).g;
    float b = texture2D(uTexture, refractedUV - direction * uChromatic * 1.5).b;
    
    gl_FragColor = vec4(r, g, b, 1.0);
  }
`;

// Clear Glass Shader - Minimal blur, strong refraction
export const CLEAR_GLASS_SHADER = `
  precision highp float;
  
  uniform sampler2D uTexture;
  uniform vec2 uResolution;
  uniform float uTime;
  uniform float uRefraction;
  
  varying vec2 vUv;
  
  ${NOISE_FUNCTIONS}
  
  void main() {
    vec2 uv = vUv;
    
    // Subtle lens distortion
    vec2 center = vec2(0.5);
    vec2 delta = uv - center;
    float dist = length(delta);
    float factor = 1.0 + uRefraction * dist * dist;
    vec2 refractedUV = center + delta * factor;
    
    // Add subtle noise for imperfections
    float noiseVal = noise(uv * 50.0 + uTime * 0.1) * 0.002;
    refractedUV += noiseVal;
    
    gl_FragColor = texture2D(uTexture, refractedUV);
  }
`;

// Tinted Glass Shader - Colored glass with refraction
export const TINTED_GLASS_SHADER = `
  precision highp float;
  
  uniform sampler2D uTexture;
  uniform vec2 uResolution;
  uniform float uTime;
  uniform float uRefraction;
  uniform vec3 uTint;
  uniform float uTintStrength;
  
  varying vec2 vUv;
  
  ${NOISE_FUNCTIONS}
  
  void main() {
    vec2 uv = vUv;
    
    // Gentle distortion
    float distortX = fbm(uv * 2.0 + vec2(uTime * 0.03, 0.0));
    float distortY = fbm(uv * 2.0 + vec2(0.0, uTime * 0.03));
    
    vec2 distortion = vec2(distortX, distortY) * 2.0 - 1.0;
    vec2 refractedUV = uv + distortion * uRefraction;
    
    vec4 color = texture2D(uTexture, refractedUV);
    
    // Apply tint
    color.rgb = mix(color.rgb, uTint, uTintStrength);
    
    gl_FragColor = color;
  }
`;

// Frosted Glass Shader - No refraction, just for completeness
export const FROSTED_GLASS_SHADER = `
  precision highp float;
  
  uniform sampler2D uTexture;
  varying vec2 vUv;
  
  void main() {
    // No distortion, just pass through
    // Blur is handled by CSS backdrop-filter
    gl_FragColor = texture2D(uTexture, vUv);
  }
`;

export const SHADER_MAP = {
  frosted: FROSTED_GLASS_SHADER,
  liquid: LIQUID_GLASS_SHADER,
  crystal: CRYSTAL_GLASS_SHADER,
  clear: CLEAR_GLASS_SHADER,
  tinted: TINTED_GLASS_SHADER,
};
