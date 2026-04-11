/**
 * Liquid Glass Presets
 * Pre-configured liquid glass settings for different component types
 */

import type { LiquidGlassConfig } from './types'

export const LIQUID_GLASS_PRESETS: Record<string, LiquidGlassConfig> = {
  button: {
    profile: 'convex',
    refractionLevel: 1.5,
    bezelWidth: 20,
    glassThickness: 10,
    specularOpacity: 0.8,
    specularSaturation: 10,
    blurLevel: 1.0,
  },
  input: {
    profile: 'lip',
    refractionLevel: 1.5,
    bezelWidth: 20,
    glassThickness: 12,
    specularOpacity: 0.6,
    specularSaturation: 8,
    blurLevel: 1.5,
  },
  card: {
    profile: 'squircle',
    refractionLevel: 1.0,
    bezelWidth: 24,
    glassThickness: 12,
    specularOpacity: 0.5,
    specularSaturation: 6,
    blurLevel: 1.2,
  },
  modal: {
    profile: 'convex',
    refractionLevel: 1.0,
    bezelWidth: 20,
    glassThickness: 10,
    specularOpacity: 0.5,
    specularSaturation: 7,
    blurLevel: 1.5,
  },
  panel: {
    profile: 'convex',
    refractionLevel: 0.8,
    bezelWidth: 16,
    glassThickness: 8,
    specularOpacity: 0.3,
    specularSaturation: 5,
    blurLevel: 1.2,
  },
} as const
