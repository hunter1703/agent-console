/**
 * Color Manipulation Utilities
 * 
 * Utilities for dynamic color transformations and gradient generation.
 */

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

/**
 * Convert RGB to hex color
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

/**
 * Lighten a color by a percentage
 */
export function lighten(hex: string, percent: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex

  const amount = Math.round(2.55 * percent)
  const r = Math.min(255, rgb.r + amount)
  const g = Math.min(255, rgb.g + amount)
  const b = Math.min(255, rgb.b + amount)

  return rgbToHex(r, g, b)
}

/**
 * Darken a color by a percentage
 */
export function darken(hex: string, percent: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex

  const amount = Math.round(2.55 * percent)
  const r = Math.max(0, rgb.r - amount)
  const g = Math.max(0, rgb.g - amount)
  const b = Math.max(0, rgb.b - amount)

  return rgbToHex(r, g, b)
}

/**
 * Adjust opacity of a color
 */
export function withOpacity(hex: string, opacity: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex

  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`
}

/**
 * Mix two colors
 */
export function mixColors(color1: string, color2: string, weight: number = 0.5): string {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)
  
  if (!rgb1 || !rgb2) return color1

  // weight 0 = 100% color1, weight 1 = 100% color2
  const r = Math.round(rgb1.r * (1 - weight) + rgb2.r * weight)
  const g = Math.round(rgb1.g * (1 - weight) + rgb2.g * weight)
  const b = Math.round(rgb1.b * (1 - weight) + rgb2.b * weight)

  return rgbToHex(r, g, b)
}

/**
 * Generate gradient from two colors
 */
export function generateGradient(
  color1: string,
  color2: string,
  angle: number = 135,
  type: 'linear' | 'radial' = 'linear'
): string {
  if (type === 'radial') {
    return `radial-gradient(circle, ${color1} 0%, ${color2} 100%)`
  }
  return `linear-gradient(${angle}deg, ${color1} 0%, ${color2} 100%)`
}

/**
 * Generate multi-stop gradient
 */
export function generateMultiStopGradient(
  colors: string[],
  angle: number = 135,
  type: 'linear' | 'radial' = 'linear'
): string {
  const stops = colors.map((color, index) => {
    const position = (index / (colors.length - 1)) * 100
    return `${color} ${position}%`
  }).join(', ')

  if (type === 'radial') {
    return `radial-gradient(circle, ${stops})`
  }
  return `linear-gradient(${angle}deg, ${stops})`
}

/**
 * Get complementary color
 */
export function getComplementary(hex: string): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex

  const r = 255 - rgb.r
  const g = 255 - rgb.g
  const b = 255 - rgb.b

  return rgbToHex(r, g, b)
}

/**
 * Convert hex to HSL
 */
export function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const rgb = hexToRgb(hex)
  if (!rgb) return null

  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

/**
 * Convert HSL to hex
 */
export function hslToHex(h: number, s: number, l: number): string {
  h = h / 360
  s = s / 100
  l = l / 100

  let r, g, b

  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q

    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return rgbToHex(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255))
}

/**
 * Adjust saturation of a color
 */
export function adjustSaturation(hex: string, amount: number): string {
  const hsl = hexToHsl(hex)
  if (!hsl) return hex

  const newS = Math.max(0, Math.min(100, hsl.s + amount))
  return hslToHex(hsl.h, newS, hsl.l)
}

/**
 * Adjust hue of a color
 */
export function adjustHue(hex: string, amount: number): string {
  const hsl = hexToHsl(hex)
  if (!hsl) return hex

  const newH = (hsl.h + amount) % 360
  return hslToHex(newH, hsl.s, hsl.l)
}

/**
 * Generate color palette from base color
 */
export function generatePalette(baseColor: string, count: number = 5): string[] {
  const hsl = hexToHsl(baseColor)
  if (!hsl) return [baseColor]
  
  const palette: string[] = []
  const step = 80 / (count - 1) // Range from 20% to 100% lightness
  
  for (let i = 0; i < count; i++) {
    const lightness = 20 + step * i
    palette.push(hslToHex(hsl.h, hsl.s, Math.round(lightness)))
  }

  return palette
}

/**
 * Check if color is light or dark
 */
export function isLight(hex: string): boolean {
  const rgb = hexToRgb(hex)
  if (!rgb) return true

  // Calculate relative luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255
  return luminance > 0.5
}

/**
 * Get contrasting text color (black or white)
 */
export function getContrastingTextColor(hex: string): string {
  return isLight(hex) ? '#000000' : '#FFFFFF'
}
