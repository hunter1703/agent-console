'use client'

import React, { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { Glass } from '@/components/liquid-glass/Glass'
import { glassBuilder } from '@/lib/liquid-glass/builder'
import { cn } from '@/lib/utils/cn'

// ============================================================================
// TYPES
// ============================================================================

export interface FABProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * FAB variant
   */
  variant?: 'default' | 'extended'
  
  /**
   * FAB size
   */
  size?: 'default' | 'small' | 'large'
  
  /**
   * Icon to display
   */
  icon: React.ReactNode
  
  /**
   * Label (for extended variant)
   */
  label?: string
  
  /**
   * Position on screen
   */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * FAB - Floating Action Button
 * 
 * Features:
 * - Floating position
 * - Liquid morph animation
 * - Extended variant with label
 * - Spring entrance animation
 * - Magnetic hover
 * 
 * @example
 * ```tsx
 * <FAB icon={<Plus />} aria-label="Add" />
 * 
 * <FAB 
 *   variant="extended" 
 *   icon={<Plus />} 
 *   label="Create New"
 * />
 * ```
 */
export const FAB = forwardRef<HTMLButtonElement, FABProps>(
  (
    {
      variant = 'default',
      size = 'default',
      icon,
      label,
      position = 'bottom-right',
      className,
      ...props
    },
    ref
  ) => {
    // Build configuration
    const config = React.useMemo(() => {
      return glassBuilder()
        .preset('frosted', 'medium')
        .fill('hsla(var(--color-primary-hue), var(--color-primary-saturation), var(--color-primary-lightness), 0.2)')
        .radius(variant === 'extended' ? 16 : 9999)
        .padding(variant === 'extended' ? '1rem 1.5rem' : '1rem')
        .shadow('hard')
        .withHover('scale', 'medium')
        .withTransition(300, 'spring')
        .withBorder({
          highlight: {
            topLeft: 'hsla(var(--color-primary-hue), var(--color-primary-saturation), calc(var(--color-primary-lightness) + 10%), 0.5)',
            bottomRight: 'hsla(var(--color-primary-hue), var(--color-primary-saturation), var(--color-primary-lightness), 0.3)',
          },
        })
        .accessible()
        .optimized()
        .build()
    }, [variant])
    
    // Size styles
    const sizeStyles = {
      small: variant === 'extended' ? 'h-12' : 'h-12 w-12',
      default: variant === 'extended' ? 'h-14' : 'h-14 w-14',
      large: variant === 'extended' ? 'h-16' : 'h-16 w-16',
    }
    
    // Position styles
    const positionStyles = {
      'bottom-right': 'bottom-6 right-6',
      'bottom-left': 'bottom-6 left-6',
      'top-right': 'top-6 right-6',
      'top-left': 'top-6 left-6',
    }
    
    // Icon size
    const iconSize = {
      small: 'h-5 w-5',
      default: 'h-6 w-6',
      large: 'h-7 w-7',
    }
    
    return (
      // @ts-expect-error - GlassProps extends HTMLMotionProps<'div'> which doesn't perfectly match button props
      <Glass
        ref={ref as any}
        as="button"
        config={config}
        className={cn(
          'fixed z-50',
          'inline-flex items-center justify-center gap-3',
          'font-medium text-white',
          'cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2',
          'transition-all',
          sizeStyles[size],
          positionStyles[position],
          className
        )}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 20,
          delay: 0.2,
        }}
        whileTap={{ scale: 0.95 }}
        {...props}
      >
        <span className={cn('inline-flex', iconSize[size])}>
          {icon}
        </span>
        
        {variant === 'extended' && label && (
          <span className="text-sm font-semibold">{label}</span>
        )}
      </Glass>
    )
  }
)

FAB.displayName = 'FAB'
