/**
 * Liquid Glass Framework
 * 
 * A declarative, composable system for building glass components with:
 * - 6-layer composition (Background, Glass, Border, Content, Depth, Motion)
 * - WebGL refraction support
 * - Accessibility features
 * - Performance optimization
 * - Theme integration
 */

import type { CSSProperties, ReactNode } from 'react'
import type { GlassType, GlassIntensity } from './types'

// ============================================================================
// CORE TYPES
// ============================================================================

/**
 * Layer 1: Background
 * Vibrant gradients, animated blobs, or patterns behind the glass
 */
export interface BackgroundLayer {
  type: 'gradient' | 'blob' | 'pattern' | 'image' | 'none'
  
  // Gradient options
  gradient?: {
    colors: string[]
    angle?: number
    type?: 'linear' | 'radial' | 'conic'
  }
  
  // Blob options
  blob?: {
    count?: number
    colors: string[]
    animation?: 'float' | 'pulse' | 'morph' | 'none'
    speed?: 'slow' | 'medium' | 'fast'
  }
  
  // Pattern options
  pattern?: {
    type: 'dots' | 'grid' | 'noise' | 'waves'
    color?: string
    opacity?: number
  }
  
  // Image options
  image?: {
    src: string
    position?: string
    size?: string
    repeat?: string
  }
}

/**
 * Layer 2: Glass Surface
 * Backdrop-filter + semi-transparent fill
 */
export interface GlassSurface {
  type: GlassType
  intensity: GlassIntensity
  
  // Blur settings
  blur?: number // px, overrides intensity default
  saturation?: number // %, overrides intensity default
  
  // Fill color
  fill?: string // rgba color
  
  // Refraction
  refraction?: {
    enabled: boolean
    strength?: number // 0-1
    dispersion?: number // 0-1, chromatic aberration
  }
}

/**
 * Layer 3: Border
 * Directional highlights (white top-left, accent bottom-right)
 */
export interface BorderLayer {
  enabled: boolean
  
  // Border style
  width?: number // px
  radius?: number | string // px or string like "12px 12px 0 0"
  
  // Directional highlights
  highlight?: {
    topLeft?: string // color
    bottomRight?: string // color
    opacity?: number // 0-1
  }
  
  // Gradient border
  gradient?: {
    colors: string[]
    angle?: number
  }
}

/**
 * Layer 4: Content
 * Typography, inputs, or data
 */
export interface ContentLayer {
  // Typography
  typography?: {
    color?: string
    contrast?: 'auto' | 'high' | 'low' // WCAG compliance
    shadow?: boolean // text shadow for readability
  }
  
  // Padding
  padding?: string | number
  
  // Custom styles
  style?: CSSProperties
}

/**
 * Layer 5: Depth
 * Stacking, offset, or 3D relative to adjacent elements
 */
export interface DepthLayer {
  // Shadow
  shadow?: {
    type: 'soft' | 'medium' | 'hard' | 'dual' | 'none'
    color?: string
    offset?: { x: number; y: number }
    blur?: number
  }
  
  // 3D transform
  transform?: {
    perspective?: number
    rotateX?: number
    rotateY?: number
    translateZ?: number
  }
  
  // Elevation (Material Design style)
  elevation?: 0 | 1 | 2 | 3 | 4 | 5
}

/**
 * Layer 6: Motion
 * Hover response, transition, or ambient animation
 */
export interface MotionLayer {
  // Hover effects
  hover?: {
    enabled: boolean
    type?: 'lift' | 'scale' | 'glow' | 'tilt' | 'magnetic' | 'none'
    intensity?: 'subtle' | 'medium' | 'strong'
  }
  
  // Transitions
  transition?: {
    duration?: number // ms
    easing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'spring' | 'bounce'
    properties?: string[] // CSS properties to transition
  }
  
  // Ambient animation
  ambient?: {
    enabled: boolean
    type?: 'pulse' | 'float' | 'shimmer' | 'breathe' | 'none'
    duration?: number // ms
  }
  
  // Spring physics (for Framer Motion)
  spring?: {
    stiffness?: number
    damping?: number
    mass?: number
  }
}

/**
 * Complete glass component configuration
 * Combines all 6 layers
 */
export interface GlassConfig {
  // Layer 1: Background
  background?: BackgroundLayer
  
  // Layer 2: Glass Surface
  glass: GlassSurface
  
  // Layer 3: Border
  border?: BorderLayer
  
  // Layer 4: Content
  content?: ContentLayer
  
  // Layer 5: Depth
  depth?: DepthLayer
  
  // Layer 6: Motion
  motion?: MotionLayer
  
  // Accessibility
  accessibility?: {
    reducedMotion?: boolean // respect prefers-reduced-motion
    reducedTransparency?: boolean // respect prefers-reduced-transparency
    highContrast?: boolean // respect prefers-contrast
    focusVisible?: boolean // show focus indicators
  }
  
  // Performance
  performance?: {
    gpuAcceleration?: boolean // transform: translateZ(0)
    containment?: 'layout' | 'style' | 'paint' | 'layout style' | 'none'
    willChange?: string[] // CSS properties
  }
  
  // Responsive
  responsive?: {
    mobile?: Partial<GlassConfig> // overrides for mobile
    tablet?: Partial<GlassConfig> // overrides for tablet
    desktop?: Partial<GlassConfig> // overrides for desktop
  }
}

// ============================================================================
// PRESET CONFIGURATIONS
// ============================================================================

/**
 * Preset glass configurations for common use cases
 */
export const GlassPresets = {
  /**
   * Frosted glass - subtle blur, high readability
   */
  frosted: {
    light: (): GlassConfig => ({
      glass: {
        type: 'frosted',
        intensity: 'light',
        fill: 'rgba(255, 255, 255, 0.05)',
      },
      border: {
        enabled: true,
        width: 1,
        radius: 12,
        highlight: {
          topLeft: 'rgba(255, 255, 255, 0.2)',
          bottomRight: 'rgba(255, 255, 255, 0.1)',
        },
      },
      depth: {
        shadow: { type: 'soft' },
      },
      motion: {
        hover: { enabled: true, type: 'lift', intensity: 'subtle' },
        transition: { duration: 200, easing: 'ease-out' },
      },
    }),
    
    medium: (): GlassConfig => ({
      glass: {
        type: 'frosted',
        intensity: 'medium',
        fill: 'rgba(255, 255, 255, 0.1)',
      },
      border: {
        enabled: true,
        width: 1,
        radius: 16,
        highlight: {
          topLeft: 'rgba(255, 255, 255, 0.3)',
          bottomRight: 'rgba(255, 255, 255, 0.15)',
        },
      },
      depth: {
        shadow: { type: 'medium' },
      },
      motion: {
        hover: { enabled: true, type: 'lift', intensity: 'medium' },
        transition: { duration: 250, easing: 'spring' },
      },
    }),
    
    heavy: (): GlassConfig => ({
      glass: {
        type: 'frosted',
        intensity: 'heavy',
        fill: 'rgba(255, 255, 255, 0.15)',
      },
      border: {
        enabled: true,
        width: 1,
        radius: 20,
        highlight: {
          topLeft: 'rgba(255, 255, 255, 0.4)',
          bottomRight: 'rgba(255, 255, 255, 0.2)',
        },
      },
      depth: {
        shadow: { type: 'hard' },
      },
      motion: {
        hover: { enabled: true, type: 'lift', intensity: 'strong' },
        transition: { duration: 300, easing: 'spring' },
      },
    }),
  },
  
  /**
   * Liquid glass - flowing, morphing animations
   */
  liquid: {
    default: (): GlassConfig => ({
      glass: {
        type: 'liquid',
        intensity: 'medium',
        fill: 'rgba(255, 255, 255, 0.1)',
      },
      border: {
        enabled: true,
        width: 1,
        radius: 24,
        highlight: {
          topLeft: 'rgba(255, 255, 255, 0.3)',
          bottomRight: 'rgba(255, 255, 255, 0.15)',
        },
      },
      depth: {
        shadow: { type: 'soft' },
      },
      motion: {
        hover: { enabled: true, type: 'magnetic', intensity: 'medium' },
        transition: { duration: 400, easing: 'spring' },
        ambient: { enabled: true, type: 'breathe', duration: 3000 },
      },
    }),
  },
  
  /**
   * Crystal glass - sharp, clear, with refraction
   */
  crystal: {
    default: (): GlassConfig => ({
      glass: {
        type: 'crystal',
        intensity: 'light',
        fill: 'rgba(255, 255, 255, 0.08)',
        refraction: {
          enabled: true,
          strength: 0.08,
          dispersion: 0.02,
        },
      },
      border: {
        enabled: true,
        width: 1,
        radius: 8,
        highlight: {
          topLeft: 'rgba(255, 255, 255, 0.5)',
          bottomRight: 'rgba(255, 255, 255, 0.2)',
        },
      },
      depth: {
        shadow: { type: 'hard' },
      },
      motion: {
        hover: { enabled: true, type: 'tilt', intensity: 'medium' },
        transition: { duration: 200, easing: 'ease-out' },
      },
    }),
  },
  
  /**
   * Clear glass - minimal blur, maximum transparency
   */
  clear: {
    default: (): GlassConfig => ({
      glass: {
        type: 'clear',
        intensity: 'light',
        fill: 'rgba(255, 255, 255, 0.03)',
      },
      border: {
        enabled: true,
        width: 1,
        radius: 12,
        highlight: {
          topLeft: 'rgba(255, 255, 255, 0.15)',
          bottomRight: 'rgba(255, 255, 255, 0.08)',
        },
      },
      depth: {
        shadow: { type: 'soft' },
      },
      motion: {
        hover: { enabled: true, type: 'glow', intensity: 'subtle' },
        transition: { duration: 150, easing: 'ease-out' },
      },
    }),
  },
  
  /**
   * Tinted glass - colored glass with theme integration
   */
  tinted: {
    default: (color: string = 'hsl(220, 90%, 60%)'): GlassConfig => ({
      glass: {
        type: 'tinted',
        intensity: 'medium',
        fill: `${color}15`, // 15% opacity
      },
      border: {
        enabled: true,
        width: 1,
        radius: 16,
        gradient: {
          colors: [`${color}40`, `${color}20`],
          angle: 135,
        },
      },
      depth: {
        shadow: { type: 'medium', color: `${color}20` },
      },
      motion: {
        hover: { enabled: true, type: 'scale', intensity: 'subtle' },
        transition: { duration: 200, easing: 'ease-out' },
      },
    }),
  },
} as const

// ============================================================================
// CONFIGURATION UTILITIES
// ============================================================================

/**
 * Deep merge two glass configurations
 */
export function mergeGlassConfig(
  base: GlassConfig,
  override: Partial<GlassConfig>
): GlassConfig {
  return {
    background: override.background ?? base.background,
    glass: { ...base.glass, ...override.glass },
    border: override.border ? { ...base.border, ...override.border } : base.border,
    content: override.content ? { ...base.content, ...override.content } : base.content,
    depth: override.depth ? { ...base.depth, ...override.depth } : base.depth,
    motion: override.motion ? { ...base.motion, ...override.motion } : base.motion,
    accessibility: override.accessibility
      ? { ...base.accessibility, ...override.accessibility }
      : base.accessibility,
    performance: override.performance
      ? { ...base.performance, ...override.performance }
      : base.performance,
    responsive: override.responsive
      ? { ...base.responsive, ...override.responsive }
      : base.responsive,
  }
}

/**
 * Create a custom glass configuration from a preset
 */
export function createGlassConfig(
  preset: keyof typeof GlassPresets,
  variant: string = 'default',
  overrides?: Partial<GlassConfig>
): GlassConfig {
  const presetConfig = GlassPresets[preset]
  
  if (!presetConfig) {
    throw new Error(`Unknown preset: ${preset}`)
  }
  
  const variantConfig = (presetConfig as any)[variant]
  
  if (!variantConfig) {
    throw new Error(`Unknown variant: ${variant} for preset: ${preset}`)
  }
  
  const baseConfig = typeof variantConfig === 'function' ? variantConfig() : variantConfig
  
  return overrides ? mergeGlassConfig(baseConfig, overrides) : baseConfig
}

/**
 * Apply responsive overrides based on screen size
 */
export function getResponsiveConfig(
  config: GlassConfig,
  breakpoint: 'mobile' | 'tablet' | 'desktop'
): GlassConfig {
  if (!config.responsive || !config.responsive[breakpoint]) {
    return config
  }
  
  return mergeGlassConfig(config, config.responsive[breakpoint]!)
}

// ============================================================================
// CSS GENERATION
// ============================================================================

/**
 * Generate CSS styles from glass configuration
 */
export function generateGlassStyles(config: GlassConfig): CSSProperties {
  const styles: CSSProperties = {}
  
  // Glass surface
  const { glass } = config
  const blurValue = glass.blur ?? getDefaultBlur(glass.intensity)
  const saturationValue = glass.saturation ?? getDefaultSaturation(glass.intensity)
  
  styles.background = glass.fill
  styles.backdropFilter = `blur(${blurValue}px) saturate(${saturationValue}%)`
  // @ts-ignore - webkit prefix
  styles.WebkitBackdropFilter = `blur(${blurValue}px) saturate(${saturationValue}%)`
  
  // Border
  if (config.border?.enabled) {
    const { border } = config
    styles.border = `${border.width}px solid rgba(255, 255, 255, 0.18)`
    styles.borderRadius = typeof border.radius === 'number' ? `${border.radius}px` : border.radius
    
    // Border highlights via box-shadow
    if (border.highlight) {
      const shadows: string[] = []
      
      if (border.highlight.topLeft) {
        shadows.push(`inset 1px 1px 0 ${border.highlight.topLeft}`)
      }
      
      if (border.highlight.bottomRight) {
        shadows.push(`inset -1px -1px 0 ${border.highlight.bottomRight}`)
      }
      
      if (shadows.length > 0) {
        styles.boxShadow = shadows.join(', ')
      }
    }
  }
  
  // Content
  if (config.content) {
    if (config.content.padding) {
      styles.padding = typeof config.content.padding === 'number'
        ? `${config.content.padding}px`
        : config.content.padding
    }
    
    if (config.content.typography?.color) {
      styles.color = config.content.typography.color
    }
    
    if (config.content.typography?.shadow) {
      styles.textShadow = '0 1px 2px rgba(0, 0, 0, 0.5)'
    }
    
    if (config.content.style) {
      Object.assign(styles, config.content.style)
    }
  }
  
  // Depth - shadow
  if (config.depth?.shadow && config.depth.shadow.type !== 'none') {
    const shadowStyles = getShadowStyles(config.depth.shadow.type)
    if (styles.boxShadow) {
      styles.boxShadow += `, ${shadowStyles}`
    } else {
      styles.boxShadow = shadowStyles
    }
  }
  
  // Depth - 3D transform
  if (config.depth?.transform) {
    const { transform } = config.depth
    const transforms: string[] = []
    
    if (transform.perspective) transforms.push(`perspective(${transform.perspective}px)`)
    if (transform.rotateX) transforms.push(`rotateX(${transform.rotateX}deg)`)
    if (transform.rotateY) transforms.push(`rotateY(${transform.rotateY}deg)`)
    if (transform.translateZ) transforms.push(`translateZ(${transform.translateZ}px)`)
    
    if (transforms.length > 0) {
      styles.transform = transforms.join(' ')
      styles.transformStyle = 'preserve-3d'
    }
  }
  
  // Motion - transitions
  if (config.motion?.transition) {
    const { transition } = config.motion
    const duration = transition.duration ?? 200
    const easing = getEasingFunction(transition.easing ?? 'ease-out')
    const properties = transition.properties ?? ['all']
    
    styles.transition = properties
      .map(prop => `${prop} ${duration}ms ${easing}`)
      .join(', ')
  }
  
  // Performance
  if (config.performance?.gpuAcceleration) {
    styles.transform = styles.transform
      ? `${styles.transform} translateZ(0)`
      : 'translateZ(0)'
    styles.backfaceVisibility = 'hidden'
  }
  
  if (config.performance?.containment && config.performance.containment !== 'none') {
    styles.contain = config.performance.containment
  }
  
  if (config.performance?.willChange && config.performance.willChange.length > 0) {
    styles.willChange = config.performance.willChange.join(', ')
  }
  
  return styles
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getDefaultBlur(intensity: GlassIntensity): number {
  switch (intensity) {
    case 'light': return 8
    case 'medium': return 12
    case 'heavy': return 20
  }
}

function getDefaultSaturation(intensity: GlassIntensity): number {
  switch (intensity) {
    case 'light': return 150
    case 'medium': return 180
    case 'heavy': return 200
  }
}

function getShadowStyles(type: 'soft' | 'medium' | 'hard' | 'dual'): string {
  switch (type) {
    case 'soft':
      return '0 4px 16px rgba(0, 0, 0, 0.1)'
    case 'medium':
      return '0 8px 32px rgba(0, 0, 0, 0.15)'
    case 'hard':
      return '0 12px 48px rgba(0, 0, 0, 0.2)'
    case 'dual':
      return '-3px -3px 18px rgba(255, 255, 255, 0.1), 3px 3px 18px rgba(0, 0, 0, 0.2)'
  }
}

function getEasingFunction(easing: string): string {
  switch (easing) {
    case 'spring':
      return 'cubic-bezier(0.34, 1.56, 0.64, 1)'
    case 'bounce':
      return 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    default:
      return easing
  }
}
