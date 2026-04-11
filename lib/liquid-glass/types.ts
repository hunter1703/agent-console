/**
 * Liquid Glass Type Definitions
 * 
 * Core types for the liquid glass system.
 */

export type GlassType = 
  | 'frosted'    // Uniform blur, no distortion
  | 'liquid'     // Organic flowing distortion
  | 'crystal'    // Sharp faceted refraction
  | 'clear'      // Minimal blur, strong refraction
  | 'tinted';    // Colored glass with refraction

export type GlassIntensity = 'light' | 'medium' | 'heavy';

export interface GlassProperties {
  type: GlassType;
  intensity: GlassIntensity;
  blur: number;              // Blur amount in pixels
  refraction: number;        // Refraction strength (0-1)
  opacity: number;           // Background opacity (0-1)
  tint?: string;            // Optional tint color (HSL)
  chromatic?: number;        // Chromatic aberration amount
  fresnel?: boolean;         // Enable Fresnel effect
}

export interface RefractionLayer {
  id: string;
  zIndex: number;
  element: HTMLElement;
  properties: GlassProperties;
}

export const GLASS_PRESETS: Record<GlassType, Record<GlassIntensity, Partial<GlassProperties>>> = {
  frosted: {
    light: { blur: 5, refraction: 0, opacity: 0.15 },
    medium: { blur: 10, refraction: 0, opacity: 0.1 },
    heavy: { blur: 20, refraction: 0, opacity: 0.05 },
  },
  liquid: {
    light: { blur: 8, refraction: 0.01, opacity: 0.15, chromatic: 0.002 },
    medium: { blur: 12, refraction: 0.02, opacity: 0.1, chromatic: 0.005 },
    heavy: { blur: 16, refraction: 0.03, opacity: 0.05, chromatic: 0.008 },
  },
  crystal: {
    light: { blur: 3, refraction: 0.015, opacity: 0.2, chromatic: 0.01, fresnel: true },
    medium: { blur: 5, refraction: 0.025, opacity: 0.15, chromatic: 0.015, fresnel: true },
    heavy: { blur: 8, refraction: 0.04, opacity: 0.1, chromatic: 0.02, fresnel: true },
  },
  clear: {
    light: { blur: 2, refraction: 0.02, opacity: 0.05 },
    medium: { blur: 3, refraction: 0.03, opacity: 0.03 },
    heavy: { blur: 5, refraction: 0.05, opacity: 0.02 },
  },
  tinted: {
    light: { blur: 8, refraction: 0.01, opacity: 0.3, tint: 'hsl(207, 70%, 50%)' },
    medium: { blur: 12, refraction: 0.015, opacity: 0.4, tint: 'hsl(207, 70%, 50%)' },
    heavy: { blur: 16, refraction: 0.02, opacity: 0.5, tint: 'hsl(207, 70%, 50%)' },
  },
};
