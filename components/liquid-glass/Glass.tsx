'use client'

import React, { forwardRef, useMemo } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { useGlassLayer } from '@/lib/hooks/useGlassLayer'
import {
  type GlassConfig,
  generateGlassStyles,
  GlassPresets,
  createGlassConfig,
} from '@/lib/liquid-glass/framework'
import { cn } from '@/lib/utils/cn'

// ============================================================================
// TYPES
// ============================================================================

export interface GlassProps extends Omit<HTMLMotionProps<'div'>, 'style'> {
  /**
   * Glass configuration
   * Can be a full config object or a preset name
   */
  config?: GlassConfig | keyof typeof GlassPresets
  
  /**
   * Preset variant (when using preset name)
   */
  variant?: string
  
  /**
   * Quick overrides for common properties
   */
  blur?: number
  fill?: string
  radius?: number
  padding?: string | number
  
  /**
   * Enable WebGL refraction
   */
  refraction?: boolean
  
  /**
   * Custom styles (merged with generated styles)
   */
  style?: React.CSSProperties
  
  /**
   * Additional CSS classes
   */
  className?: string
  
  /**
   * Children
   */
  children?: React.ReactNode
  
  /**
   * HTML element type
   */
  as?: keyof JSX.IntrinsicElements
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Glass - Declarative liquid glass component
 * 
 * @example
 * ```tsx
 * // Using preset
 * <Glass config="frosted" variant="medium">
 *   Content
 * </Glass>
 * 
 * // Using full config
 * <Glass config={{
 *   glass: { type: 'frosted', intensity: 'medium' },
 *   border: { enabled: true, radius: 16 },
 *   motion: { hover: { enabled: true, type: 'lift' } }
 * }}>
 *   Content
 * </Glass>
 * 
 * // Quick overrides
 * <Glass config="frosted" blur={20} radius={24} padding="2rem">
 *   Content
 * </Glass>
 * ```
 */
export const Glass = forwardRef<HTMLDivElement, GlassProps>(
  (
    {
      config = 'frosted',
      variant = 'medium',
      blur,
      fill,
      radius,
      padding,
      refraction = false,
      style: customStyle,
      className,
      children,
      as = 'div',
      ...motionProps
    },
    forwardedRef
  ) => {
    // Resolve configuration
    const resolvedConfig = useMemo(() => {
      let baseConfig: GlassConfig
      
      // If config is a string (preset name), create from preset
      if (typeof config === 'string') {
        baseConfig = createGlassConfig(config, variant)
      } else {
        baseConfig = config
      }
      
      // Apply quick overrides
      if (blur !== undefined || fill !== undefined || radius !== undefined || padding !== undefined) {
        return {
          ...baseConfig,
          glass: {
            ...baseConfig.glass,
            ...(blur !== undefined && { blur }),
            ...(fill !== undefined && { fill }),
          },
          border: baseConfig.border
            ? {
                ...baseConfig.border,
                ...(radius !== undefined && { radius }),
              }
            : undefined,
          content: baseConfig.content
            ? {
                ...baseConfig.content,
                ...(padding !== undefined && { padding }),
              }
            : padding !== undefined
            ? { padding }
            : undefined,
        }
      }
      
      return baseConfig
    }, [config, variant, blur, fill, radius, padding])
    
    // Register with refraction system if enabled
    const refractionRef = useGlassLayer({
      type: resolvedConfig.glass.type,
      intensity: resolvedConfig.glass.intensity,
      refraction: resolvedConfig.glass.refraction?.strength,
      dispersion: resolvedConfig.glass.refraction?.dispersion,
      enabled: refraction && resolvedConfig.glass.refraction?.enabled !== false,
    })
    
    // Generate styles from configuration
    const generatedStyles = useMemo(
      () => generateGlassStyles(resolvedConfig),
      [resolvedConfig]
    )
    
    // Merge custom styles
    const finalStyles = useMemo(
      () => ({ ...generatedStyles, ...customStyle }),
      [generatedStyles, customStyle]
    )
    
    // Generate motion variants
    const motionVariants = useMemo(() => {
      if (!resolvedConfig.motion?.hover?.enabled) return undefined
      
      const { hover } = resolvedConfig.motion
      const intensity = hover.intensity ?? 'medium'
      
      switch (hover.type) {
        case 'lift':
          return {
            initial: { y: 0 },
            whileHover: {
              y: intensity === 'subtle' ? -2 : intensity === 'medium' ? -4 : -8,
            },
          }
        
        case 'scale':
          return {
            initial: { scale: 1 },
            whileHover: {
              scale: intensity === 'subtle' ? 1.02 : intensity === 'medium' ? 1.05 : 1.08,
            },
          }
        
        case 'glow':
          return {
            initial: { boxShadow: finalStyles.boxShadow },
            whileHover: {
              boxShadow: '0 0 20px rgba(255, 255, 255, 0.3)',
            },
          }
        
        default:
          return undefined
      }
    }, [resolvedConfig.motion, finalStyles.boxShadow])
    
    // Combine refs
    const combinedRef = useMemo(() => {
      if (!refraction) return forwardedRef
      
      return (node: HTMLDivElement | null) => {
        // Set refraction ref
        if (refractionRef) {
          ;(refractionRef as React.MutableRefObject<HTMLDivElement | null>).current = node
        }
        
        // Set forwarded ref
        if (typeof forwardedRef === 'function') {
          forwardedRef(node)
        } else if (forwardedRef) {
          forwardedRef.current = node
        }
      }
    }, [refraction, refractionRef, forwardedRef])
    
    // Render
    const Component = motion[as as keyof typeof motion] as typeof motion.div
    
    return (
      <Component
        ref={combinedRef}
        className={cn('glass-component', className)}
        style={finalStyles}
        variants={motionVariants}
        initial="initial"
        whileHover="whileHover"
        {...motionProps}
      >
        {children}
      </Component>
    )
  }
)

Glass.displayName = 'Glass'

// ============================================================================
// SPECIALIZED VARIANTS
// ============================================================================

/**
 * GlassCard - Pre-configured card component
 */
export const GlassCard = forwardRef<HTMLDivElement, Omit<GlassProps, 'config'>>(
  (props, ref) => (
    <Glass
      ref={ref}
      config="frosted"
      variant="medium"
      padding="2rem"
      {...props}
    />
  )
)

GlassCard.displayName = 'GlassCard'

/**
 * GlassButton - Pre-configured button component
 */
export const GlassButton = forwardRef<HTMLButtonElement, Omit<GlassProps, 'config' | 'as'>>(
  (props, ref) => (
    <Glass
      ref={ref as any}
      as="button"
      config="frosted"
      variant="light"
      padding="0.875rem 2rem"
      radius={12}
      {...props}
    />
  )
)

GlassButton.displayName = 'GlassButton'

/**
 * GlassModal - Pre-configured modal component
 */
export const GlassModal = forwardRef<HTMLDivElement, Omit<GlassProps, 'config'>>(
  (props, ref) => (
    <Glass
      ref={ref}
      config="frosted"
      variant="heavy"
      padding="2rem"
      radius={20}
      {...props}
    />
  )
)

GlassModal.displayName = 'GlassModal'

/**
 * GlassInput - Pre-configured input wrapper
 */
export const GlassInput = forwardRef<HTMLDivElement, Omit<GlassProps, 'config'>>(
  (props, ref) => (
    <Glass
      ref={ref}
      config="clear"
      variant="default"
      padding="0.875rem 1rem"
      radius={12}
      {...props}
    />
  )
)

GlassInput.displayName = 'GlassInput'
