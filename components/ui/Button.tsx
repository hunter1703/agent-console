'use client'

import React, { forwardRef } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { Glass } from '@/components/liquid-glass/Glass'
import { GlassBuilders } from '@/lib/liquid-glass/builder'
import { cn } from '@/lib/utils/cn'

// ============================================================================
// TYPES
// ============================================================================

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'style'> {
  /**
   * Button variant
   */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  
  /**
   * Button size
   */
  size?: 'sm' | 'md' | 'lg'
  
  /**
   * Loading state
   */
  loading?: boolean
  
  /**
   * Icon to display (left side)
   */
  iconLeft?: React.ReactNode
  
  /**
   * Icon to display (right side)
   */
  iconRight?: React.ReactNode
  
  /**
   * Full width button
   */
  fullWidth?: boolean
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Button - Liquid glass button with all variants
 * 
 * Features:
 * - Liquid morph animation
 * - Squash & stretch on press
 * - Magnetic hover effect
 * - Loading state with spinner
 * - Icon support
 * - All 6 glass layers
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="md">
 *   Click Me
 * </Button>
 * 
 * <Button variant="secondary" loading>
 *   Loading...
 * </Button>
 * 
 * <Button variant="ghost" iconLeft={<Icon />}>
 *   With Icon
 * </Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      iconLeft,
      iconRight,
      fullWidth = false,
      disabled,
      children,
      className,
      ...props
    },
    ref
  ) => {
    // Build configuration based on variant
    const config = React.useMemo(() => {
      const base = GlassBuilders.button()
      
      switch (variant) {
        case 'primary':
          return base
            .fill('hsla(var(--color-primary-hue), var(--color-primary-saturation), var(--color-primary-lightness), 0.15)')
            .withBorder({
              highlight: {
                topLeft: 'hsla(var(--color-primary-hue), var(--color-primary-saturation), calc(var(--color-primary-lightness) + 10%), 0.4)',
                bottomRight: 'hsla(var(--color-primary-hue), var(--color-primary-saturation), var(--color-primary-lightness), 0.2)',
              },
            })
            .build()
        
        case 'secondary':
          return base
            .fill('rgba(255, 255, 255, 0.08)')
            .build()
        
        case 'ghost':
          return base
            .fill('transparent')
            .withBorder({ enabled: false })
            .shadow('none')
            .build()
        
        case 'danger':
          return base
            .fill('hsla(0, 84%, 60%, 0.15)')
            .withBorder({
              highlight: {
                topLeft: 'hsla(0, 84%, 70%, 0.4)',
                bottomRight: 'hsla(0, 84%, 60%, 0.2)',
              },
            })
            .build()
      }
    }, [variant])
    
    // Size styles
    const sizeStyles = {
      sm: 'h-9 px-3 text-sm',
      md: 'h-11 px-6 text-base',
      lg: 'h-13 px-8 text-lg',
    }
    
    // Motion variants
    const motionVariants = {
      initial: { scale: 1 },
      whileHover: { scale: 1.02 },
      whileTap: { scaleY: 0.95, scaleX: 1.02 },
    }
    
    return (
      <Glass
        ref={ref as any}
        as="button"
        config={config}
        className={cn(
          'relative inline-flex items-center justify-center gap-2',
          'font-medium transition-all',
          'cursor-pointer',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2',
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        variants={motionVariants}
        initial="initial"
        whileHover={!disabled && !loading ? 'whileHover' : undefined}
        whileTap={!disabled && !loading ? 'whileTap' : undefined}
        // @ts-expect-error - GlassProps extends HTMLMotionProps<'div'> which doesn't include disabled
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
        
        {!loading && iconLeft && (
          <span className="inline-flex">{iconLeft}</span>
        )}
        
        {children as React.ReactNode}
        
        {!loading && iconRight && (
          <span className="inline-flex">{iconRight}</span>
        )}
      </Glass>
    )
  }
)

Button.displayName = 'Button'

// ============================================================================
// ICON BUTTON
// ============================================================================

export interface IconButtonProps extends Omit<ButtonProps, 'iconLeft' | 'iconRight'> {
  /**
   * Icon to display
   */
  icon: React.ReactNode
  
  /**
   * Accessible label
   */
  'aria-label': string
}

/**
 * IconButton - Icon-only button variant
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = 'md', className, ...props }, ref) => {
    const sizeStyles = {
      sm: 'h-9 w-9',
      md: 'h-11 w-11',
      lg: 'h-13 w-13',
    }
    
    return (
      <Button
        ref={ref}
        size={size}
        className={cn('!px-0', sizeStyles[size], className)}
        {...props}
      >
        {icon}
      </Button>
    )
  }
)

IconButton.displayName = 'IconButton'
