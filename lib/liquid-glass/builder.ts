/**
 * Glass Component Builder
 * 
 * Fluent API for building custom glass components declaratively
 * 
 * @example
 * ```ts
 * const MyCard = glassBuilder()
 *   .preset('frosted', 'medium')
 *   .withBackground({ type: 'blob', blob: { colors: ['#f59e0b', '#3b82f6'] } })
 *   .withBorder({ radius: 24, highlight: { topLeft: 'rgba(255,255,255,0.4)' } })
 *   .withHover('lift', 'medium')
 *   .withRefraction(0.05, 0.01)
 *   .build()
 * ```
 */

import type {
  GlassConfig,
  BackgroundLayer,
  GlassSurface,
  BorderLayer,
  ContentLayer,
  DepthLayer,
  MotionLayer,
} from './framework'
import { GlassPresets, mergeGlassConfig } from './framework'

export class GlassBuilder {
  private config: Partial<GlassConfig> = {}
  
  /**
   * Start with a preset configuration
   */
  preset(name: keyof typeof GlassPresets, variant: string = 'default'): this {
    const presetConfig = GlassPresets[name]
    if (!presetConfig) {
      throw new Error(`Unknown preset: ${name}`)
    }
    
    const variantConfig = (presetConfig as any)[variant]
    if (!variantConfig) {
      throw new Error(`Unknown variant: ${variant} for preset: ${name}`)
    }
    
    this.config = typeof variantConfig === 'function' ? variantConfig() : variantConfig
    return this
  }
  
  /**
   * Set glass surface properties
   */
  glass(surface: Partial<GlassSurface>): this {
    this.config.glass = { ...this.config.glass, ...surface } as GlassSurface
    return this
  }
  
  /**
   * Set background layer
   */
  withBackground(background: BackgroundLayer): this {
    this.config.background = background
    return this
  }
  
  /**
   * Set border layer
   */
  withBorder(border: Partial<BorderLayer>): this {
    this.config.border = { ...this.config.border, ...border } as BorderLayer
    return this
  }
  
  /**
   * Set content layer
   */
  withContent(content: Partial<ContentLayer>): this {
    this.config.content = { ...this.config.content, ...content }
    return this
  }
  
  /**
   * Set depth layer
   */
  withDepth(depth: Partial<DepthLayer>): this {
    this.config.depth = { ...this.config.depth, ...depth }
    return this
  }
  
  /**
   * Set motion layer
   */
  withMotion(motion: Partial<MotionLayer>): this {
    this.config.motion = { ...this.config.motion, ...motion }
    return this
  }
  
  /**
   * Quick method: Set blur amount
   */
  blur(amount: number): this {
    if (!this.config.glass) {
      this.config.glass = { type: 'frosted', intensity: 'medium' }
    }
    this.config.glass.blur = amount
    return this
  }
  
  /**
   * Quick method: Set fill color
   */
  fill(color: string): this {
    if (!this.config.glass) {
      this.config.glass = { type: 'frosted', intensity: 'medium' }
    }
    this.config.glass.fill = color
    return this
  }
  
  /**
   * Quick method: Set border radius
   */
  radius(value: number | string): this {
    if (!this.config.border) {
      this.config.border = { enabled: true }
    }
    this.config.border.radius = value
    return this
  }
  
  /**
   * Quick method: Set padding
   */
  padding(value: string | number): this {
    if (!this.config.content) {
      this.config.content = {}
    }
    this.config.content.padding = value
    return this
  }
  
  /**
   * Quick method: Set shadow type
   */
  shadow(type: 'soft' | 'medium' | 'hard' | 'dual' | 'none'): this {
    if (!this.config.depth) {
      this.config.depth = {}
    }
    this.config.depth.shadow = { type }
    return this
  }
  
  /**
   * Quick method: Set hover effect
   */
  withHover(
    type: 'lift' | 'scale' | 'glow' | 'tilt' | 'magnetic' | 'none',
    intensity: 'subtle' | 'medium' | 'strong' = 'medium'
  ): this {
    if (!this.config.motion) {
      this.config.motion = {}
    }
    this.config.motion.hover = { enabled: type !== 'none', type, intensity }
    return this
  }
  
  /**
   * Quick method: Set transition
   */
  withTransition(
    duration: number,
    easing: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'spring' | 'bounce' = 'ease-out'
  ): this {
    if (!this.config.motion) {
      this.config.motion = {}
    }
    this.config.motion.transition = { duration, easing }
    return this
  }
  
  /**
   * Quick method: Set ambient animation
   */
  withAmbient(
    type: 'pulse' | 'float' | 'shimmer' | 'breathe' | 'none',
    duration: number = 3000
  ): this {
    if (!this.config.motion) {
      this.config.motion = {}
    }
    this.config.motion.ambient = { enabled: type !== 'none', type, duration }
    return this
  }
  
  /**
   * Quick method: Enable refraction
   */
  withRefraction(strength: number = 0.05, dispersion: number = 0.01): this {
    if (!this.config.glass) {
      this.config.glass = { type: 'frosted', intensity: 'medium' }
    }
    this.config.glass.refraction = {
      enabled: true,
      strength,
      dispersion,
    }
    return this
  }
  
  /**
   * Enable accessibility features
   */
  accessible(options: {
    reducedMotion?: boolean
    reducedTransparency?: boolean
    highContrast?: boolean
    focusVisible?: boolean
  } = {}): this {
    this.config.accessibility = {
      reducedMotion: options.reducedMotion ?? true,
      reducedTransparency: options.reducedTransparency ?? true,
      highContrast: options.highContrast ?? true,
      focusVisible: options.focusVisible ?? true,
    }
    return this
  }
  
  /**
   * Enable performance optimizations
   */
  optimized(options: {
    gpuAcceleration?: boolean
    containment?: 'layout' | 'style' | 'paint' | 'layout style' | 'none'
    willChange?: string[]
  } = {}): this {
    this.config.performance = {
      gpuAcceleration: options.gpuAcceleration ?? true,
      containment: options.containment ?? 'layout style',
      willChange: options.willChange ?? ['transform', 'opacity'],
    }
    return this
  }
  
  /**
   * Add responsive overrides
   */
  responsive(breakpoint: 'mobile' | 'tablet' | 'desktop', overrides: Partial<GlassConfig>): this {
    if (!this.config.responsive) {
      this.config.responsive = {}
    }
    this.config.responsive[breakpoint] = overrides
    return this
  }
  
  /**
   * Build the final configuration
   */
  build(): GlassConfig {
    if (!this.config.glass) {
      throw new Error('Glass surface configuration is required')
    }
    
    return this.config as GlassConfig
  }
  
  /**
   * Clone this builder
   */
  clone(): GlassBuilder {
    const builder = new GlassBuilder()
    builder.config = JSON.parse(JSON.stringify(this.config))
    return builder
  }
}

/**
 * Create a new glass builder
 */
export function glassBuilder(): GlassBuilder {
  return new GlassBuilder()
}

// ============================================================================
// PRESET BUILDERS
// ============================================================================

/**
 * Pre-configured builders for common use cases
 */
export const GlassBuilders = {
  /**
   * Card builder - frosted glass card
   */
  card: () =>
    glassBuilder()
      .preset('frosted', 'medium')
      .padding('2rem')
      .radius(16)
      .shadow('medium')
      .withHover('lift', 'subtle')
      .accessible()
      .optimized(),
  
  /**
   * Button builder - interactive glass button
   */
  button: () =>
    glassBuilder()
      .preset('frosted', 'light')
      .padding('0.875rem 2rem')
      .radius(12)
      .shadow('soft')
      .withHover('lift', 'medium')
      .withTransition(200, 'spring')
      .accessible()
      .optimized(),
  
  /**
   * Modal builder - heavy glass modal
   */
  modal: () =>
    glassBuilder()
      .preset('frosted', 'heavy')
      .padding('2rem')
      .radius(20)
      .shadow('hard')
      .accessible()
      .optimized(),
  
  /**
   * Input builder - clear glass input
   */
  input: () =>
    glassBuilder()
      .preset('clear', 'default')
      .padding('0.875rem 1rem')
      .radius(12)
      .shadow('soft')
      .withHover('glow', 'subtle')
      .accessible()
      .optimized(),
  
  /**
   * Navigation builder - sticky glass nav
   */
  nav: () =>
    glassBuilder()
      .preset('frosted', 'medium')
      .padding('1rem 2rem')
      .radius(0)
      .shadow('medium')
      .accessible()
      .optimized(),
  
  /**
   * Sidebar builder - dark glass sidebar
   */
  sidebar: () =>
    glassBuilder()
      .preset('frosted', 'heavy')
      .fill('rgba(0, 0, 0, 0.65)')
      .padding('1rem')
      .radius(0)
      .shadow('hard')
      .accessible()
      .optimized(),
  
  /**
   * Tooltip builder - minimal glass tooltip
   */
  tooltip: () =>
    glassBuilder()
      .preset('frosted', 'medium')
      .padding('0.5rem 0.75rem')
      .radius(8)
      .shadow('soft')
      .withTransition(150, 'ease-out')
      .accessible()
      .optimized(),
  
  /**
   * Badge builder - small glass badge
   */
  badge: () =>
    glassBuilder()
      .preset('frosted', 'light')
      .padding('0.25rem 0.75rem')
      .radius(12)
      .shadow('soft')
      .accessible()
      .optimized(),
  
  /**
   * Floating builder - floating glass element with refraction
   */
  floating: () =>
    glassBuilder()
      .preset('crystal', 'default')
      .padding('1.5rem')
      .radius(16)
      .shadow('hard')
      .withHover('tilt', 'medium')
      .withRefraction(0.08, 0.02)
      .accessible()
      .optimized(),
}

// ============================================================================
// COMPOSITION UTILITIES
// ============================================================================

/**
 * Compose multiple glass configurations
 */
export function composeGlass(...configs: Partial<GlassConfig>[]): GlassConfig {
  return configs.reduce((acc, config) => {
    return mergeGlassConfig(acc as GlassConfig, config)
  }, configs[0]) as GlassConfig
}

/**
 * Create a glass variant by extending a base configuration
 */
export function extendGlass(
  base: GlassConfig,
  overrides: Partial<GlassConfig>
): GlassConfig {
  return mergeGlassConfig(base, overrides)
}

/**
 * Create multiple variants from a base configuration
 */
export function createVariants<T extends string>(
  base: GlassConfig,
  variants: Record<T, Partial<GlassConfig>>
): Record<T, GlassConfig> {
  const result = {} as Record<T, GlassConfig>
  
  for (const [key, overrides] of Object.entries(variants)) {
    result[key as T] = mergeGlassConfig(base, overrides)
  }
  
  return result
}
