'use client'

import React, { forwardRef } from 'react'
import LiquidGlassReact from 'liquid-glass-react'
import { cn } from '@/lib/utils/cn'

// ============================================================================
// TYPES
// ============================================================================

export interface LiquidGlassProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Preset configuration
   */
  preset?: 'subtle' | 'medium' | 'prominent' | 'liquid'
  
  /**
   * Displacement scale (intensity of refraction)
   */
  displacementScale?: number
  
  /**
   * Blur/frost amount
   */
  blurAmount?: number
  
  /**
   * Color saturation
   */
  saturation?: number
  
  /**
   * Chromatic aberration intensity
   */
  aberrationIntensity?: number
  
  /**
   * Elasticity (liquid feel)
   */
  elasticity?: number
  
  /**
   * Corner radius
   */
  cornerRadius?: number
  
  /**
   * Padding
   */
  padding?: string
  
  /**
   * Over light background
   */
  overLight?: boolean
  
  /**
   * Refraction mode
   */
  mode?: 'standard' | 'polar' | 'prominent' | 'shader'
  
  /**
   * Mouse container ref
   */
  mouseContainer?: React.RefObject<HTMLElement | null>
  
  /**
   * Children
   */
  children: React.ReactNode
}

// ============================================================================
// PRESETS
// ============================================================================

const PRESETS = {
  subtle: {
    displacementScale: 40,
    blurAmount: 0.05,
    saturation: 120,
    aberrationIntensity: 1,
    elasticity: 0.1,
  },
  medium: {
    displacementScale: 70,
    blurAmount: 0.0625,
    saturation: 140,
    aberrationIntensity: 2,
    elasticity: 0.15,
  },
  prominent: {
    displacementScale: 100,
    blurAmount: 0.08,
    saturation: 160,
    aberrationIntensity: 3,
    elasticity: 0.25,
  },
  liquid: {
    displacementScale: 120,
    blurAmount: 0.1,
    saturation: 180,
    aberrationIntensity: 4,
    elasticity: 0.35,
  },
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * LiquidGlass - Apple-style liquid glass effect
 * 
 * Features:
 * - Proper edgy bending and refraction
 * - Chromatic aberration
 * - Configurable elasticity
 * - Multiple refraction modes
 * - Preset configurations
 * 
 * Note: Safari and Firefox only partially support (displacement not visible)
 * 
 * @example
 * ```tsx
 * <LiquidGlass preset="medium">
 *   <div className="p-6">
 *     <h2>Content with liquid glass effect</h2>
 *   </div>
 * </LiquidGlass>
 * 
 * <LiquidGlass 
 *   preset="liquid"
 *   mode="prominent"
 *   cornerRadius={16}
 * >
 *   <Button>Liquid Button</Button>
 * </LiquidGlass>
 * ```
 */
export const LiquidGlass = forwardRef<HTMLDivElement, LiquidGlassProps>(
  (
    {
      preset = 'medium',
      displacementScale,
      blurAmount,
      saturation,
      aberrationIntensity,
      elasticity,
      cornerRadius = 16,
      padding,
      overLight = false,
      mode = 'standard',
      mouseContainer,
      className,
      children,
      onClick,
      style,
      ...props
    },
    ref
  ) => {
    // Get preset values
    const presetValues = PRESETS[preset]
    
    // Merge preset with custom values
    const finalProps = {
      displacementScale: displacementScale ?? presetValues.displacementScale,
      blurAmount: blurAmount ?? presetValues.blurAmount,
      saturation: saturation ?? presetValues.saturation,
      aberrationIntensity: aberrationIntensity ?? presetValues.aberrationIntensity,
      elasticity: elasticity ?? presetValues.elasticity,
      cornerRadius,
      padding,
      overLight,
      mode,
      mouseContainer,
    }
    
    return (
      <div ref={ref} className={cn('inline-block', className)} {...props}>
        <LiquidGlassReact
          {...finalProps}
          onClick={onClick}
          style={style}
        >
          {children}
        </LiquidGlassReact>
      </div>
    )
  }
)

LiquidGlass.displayName = 'LiquidGlass'
