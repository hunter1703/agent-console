import { describe, it, expect } from 'vitest'
import {
  hexToRgb,
  rgbToHex,
  lighten,
  darken,
  withOpacity,
  mixColors,
  generateGradient,
  generateMultiStopGradient,
  getComplementary,
  hexToHsl,
  hslToHex,
  adjustSaturation,
  adjustHue,
  generatePalette,
  isLight,
  getContrastingTextColor,
} from '../colors'

describe('color utilities', () => {
  describe('hexToRgb', () => {
    it('should convert hex to RGB', () => {
      expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 })
      expect(hexToRgb('#00FF00')).toEqual({ r: 0, g: 255, b: 0 })
      expect(hexToRgb('#0000FF')).toEqual({ r: 0, g: 0, b: 255 })
    })

    it('should handle hex without #', () => {
      expect(hexToRgb('FF0000')).toEqual({ r: 255, g: 0, b: 0 })
    })

    it('should handle lowercase hex', () => {
      expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 })
    })

    it('should return null for invalid hex', () => {
      expect(hexToRgb('invalid')).toBeNull()
    })
  })

  describe('rgbToHex', () => {
    it('should convert RGB to hex', () => {
      expect(rgbToHex(255, 0, 0)).toBe('#ff0000')
      expect(rgbToHex(0, 255, 0)).toBe('#00ff00')
      expect(rgbToHex(0, 0, 255)).toBe('#0000ff')
    })

    it('should handle single digit values', () => {
      expect(rgbToHex(1, 2, 3)).toBe('#010203')
    })
  })

  describe('lighten', () => {
    it('should lighten a color', () => {
      const result = lighten('#808080', 20)
      const rgb = hexToRgb(result)
      expect(rgb).toBeTruthy()
      expect(rgb!.r).toBeGreaterThan(128)
    })

    it('should not exceed 255', () => {
      const result = lighten('#FFFFFF', 50)
      expect(result).toBe('#ffffff')
    })

    it('should handle invalid hex', () => {
      expect(lighten('invalid', 20)).toBe('invalid')
    })
  })

  describe('darken', () => {
    it('should darken a color', () => {
      const result = darken('#808080', 20)
      const rgb = hexToRgb(result)
      expect(rgb).toBeTruthy()
      expect(rgb!.r).toBeLessThan(128)
    })

    it('should not go below 0', () => {
      const result = darken('#000000', 50)
      expect(result).toBe('#000000')
    })
  })

  describe('withOpacity', () => {
    it('should add opacity to color', () => {
      expect(withOpacity('#FF0000', 0.5)).toBe('rgba(255, 0, 0, 0.5)')
    })

    it('should handle full opacity', () => {
      expect(withOpacity('#FF0000', 1)).toBe('rgba(255, 0, 0, 1)')
    })

    it('should handle zero opacity', () => {
      expect(withOpacity('#FF0000', 0)).toBe('rgba(255, 0, 0, 0)')
    })
  })

  describe('mixColors', () => {
    it('should mix two colors equally', () => {
      const result = mixColors('#FF0000', '#0000FF', 0.5)
      const rgb = hexToRgb(result)
      expect(rgb).toBeTruthy()
      expect(rgb!.r).toBeGreaterThan(0)
      expect(rgb!.b).toBeGreaterThan(0)
    })

    it('should favor first color with weight 0', () => {
      const result = mixColors('#FF0000', '#0000FF', 0)
      expect(result).toBe('#ff0000')
    })

    it('should favor second color with weight 1', () => {
      const result = mixColors('#FF0000', '#0000FF', 1)
      expect(result).toBe('#0000ff')
    })
  })

  describe('generateGradient', () => {
    it('should generate linear gradient', () => {
      const result = generateGradient('#FF0000', '#0000FF', 135)
      expect(result).toBe('linear-gradient(135deg, #FF0000 0%, #0000FF 100%)')
    })

    it('should generate radial gradient', () => {
      const result = generateGradient('#FF0000', '#0000FF', 0, 'radial')
      expect(result).toBe('radial-gradient(circle, #FF0000 0%, #0000FF 100%)')
    })
  })

  describe('generateMultiStopGradient', () => {
    it('should generate multi-stop gradient', () => {
      const result = generateMultiStopGradient(['#FF0000', '#00FF00', '#0000FF'])
      expect(result).toContain('#FF0000 0%')
      expect(result).toContain('#00FF00 50%')
      expect(result).toContain('#0000FF 100%')
    })

    it('should handle two colors', () => {
      const result = generateMultiStopGradient(['#FF0000', '#0000FF'])
      expect(result).toContain('#FF0000 0%')
      expect(result).toContain('#0000FF 100%')
    })
  })

  describe('getComplementary', () => {
    it('should get complementary color', () => {
      const result = getComplementary('#FF0000')
      expect(result).toBe('#00ffff')
    })

    it('should handle black', () => {
      const result = getComplementary('#000000')
      expect(result).toBe('#ffffff')
    })

    it('should handle white', () => {
      const result = getComplementary('#FFFFFF')
      expect(result).toBe('#000000')
    })
  })

  describe('hexToHsl and hslToHex', () => {
    it('should convert hex to HSL', () => {
      const hsl = hexToHsl('#FF0000')
      expect(hsl).toBeTruthy()
      expect(hsl!.h).toBe(0)
      expect(hsl!.s).toBe(100)
      expect(hsl!.l).toBe(50)
    })

    it('should convert HSL to hex', () => {
      const hex = hslToHex(0, 100, 50)
      expect(hex).toBe('#ff0000')
    })

    it('should round-trip correctly', () => {
      const original = '#FF0000'
      const hsl = hexToHsl(original)
      const back = hslToHex(hsl!.h, hsl!.s, hsl!.l)
      expect(back).toBe(original.toLowerCase())
    })
  })

  describe('adjustSaturation', () => {
    it('should increase saturation', () => {
      const result = adjustSaturation('#808080', 50)
      const hsl = hexToHsl(result)
      expect(hsl!.s).toBeGreaterThan(0)
    })

    it('should decrease saturation', () => {
      const result = adjustSaturation('#FF0000', -50)
      const hsl = hexToHsl(result)
      expect(hsl!.s).toBeLessThan(100)
    })

    it('should not exceed 100', () => {
      const result = adjustSaturation('#FF0000', 50)
      const hsl = hexToHsl(result)
      expect(hsl!.s).toBeLessThanOrEqual(100)
    })
  })

  describe('adjustHue', () => {
    it('should rotate hue', () => {
      const result = adjustHue('#FF0000', 120)
      const hsl = hexToHsl(result)
      expect(hsl!.h).toBe(120)
    })

    it('should wrap around 360', () => {
      const result = adjustHue('#FF0000', 400)
      const hsl = hexToHsl(result)
      expect(hsl!.h).toBe(40)
    })
  })

  describe('generatePalette', () => {
    it('should generate color palette', () => {
      const palette = generatePalette('#FF0000', 5)
      expect(palette).toHaveLength(5)
      expect(palette[0]).toBeTruthy()
      expect(palette[4]).toBeTruthy()
    })

    it('should generate darker to lighter', () => {
      const palette = generatePalette('#FF0000', 3)
      const hsl0 = hexToHsl(palette[0])
      const hsl2 = hexToHsl(palette[2])
      expect(hsl2!.l).toBeGreaterThan(hsl0!.l)
    })
  })

  describe('isLight', () => {
    it('should detect light colors', () => {
      expect(isLight('#FFFFFF')).toBe(true)
      expect(isLight('#FFFF00')).toBe(true)
    })

    it('should detect dark colors', () => {
      expect(isLight('#000000')).toBe(false)
      expect(isLight('#0000FF')).toBe(false)
    })

    it('should handle mid-tones', () => {
      expect(isLight('#808080')).toBe(true)
    })
  })

  describe('getContrastingTextColor', () => {
    it('should return black for light backgrounds', () => {
      expect(getContrastingTextColor('#FFFFFF')).toBe('#000000')
    })

    it('should return white for dark backgrounds', () => {
      expect(getContrastingTextColor('#000000')).toBe('#FFFFFF')
    })
  })
})
