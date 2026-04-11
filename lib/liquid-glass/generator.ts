/**
 * Liquid Glass Generator
 * Generates SVG displacement maps for liquid glass effects
 */

import type { DisplacementMapConfig } from './types'

/**
 * Generate SVG displacement map for refraction effects
 */
export function generateDisplacementMap(config: DisplacementMapConfig): string {
  const { size, frequency, octaves, scale } = config

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <defs>
        <filter id="displacement-${config.profile}">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="${frequency}"
            numOctaves="${octaves}"
            seed="1"
            result="turbulence"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="turbulence"
            scale="${scale}"
            xChannelSelector="R"
            yChannelSelector="G"
            result="displacement"
          />
        </filter>
      </defs>
      <rect width="100%" height="100%" filter="url(#displacement-${config.profile})" fill="transparent" />
    </svg>
  `.trim()

  // Convert to base64 data URL
  return `data:image/svg+xml;base64,${btoa(svg)}`
}

/**
 * Pre-generated displacement maps for common profiles
 */
export const DISPLACEMENT_MAPS = {
  button: generateDisplacementMap({
    profile: 'convex',
    size: 256,
    frequency: 0.01,
    octaves: 3,
    scale: 10,
  }),
  input: generateDisplacementMap({
    profile: 'lip',
    size: 512,
    frequency: 0.02,
    octaves: 2,
    scale: 15,
  }),
  card: generateDisplacementMap({
    profile: 'squircle',
    size: 512,
    frequency: 0.015,
    octaves: 2,
    scale: 8,
  }),
  modal: generateDisplacementMap({
    profile: 'convex',
    size: 1024,
    frequency: 0.01,
    octaves: 4,
    scale: 20,
  }),
  panel: generateDisplacementMap({
    profile: 'convex',
    size: 768,
    frequency: 0.012,
    octaves: 3,
    scale: 12,
  }),
} as const
