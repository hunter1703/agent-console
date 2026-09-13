'use client'

import React, { forwardRef } from 'react'
import { Glass, type GlassProps } from '@/components/liquid-glass/Glass'
import { GlassBuilders } from '@/lib/liquid-glass/builder'
import { cn } from '@/lib/utils/cn'

// ============================================================================
// TYPES
// ============================================================================

export interface CardProps extends GlassProps {
  /**
   * Glass intensity variant
   */
  variant?: 'light' | 'medium' | 'heavy'
  
  /**
   * Enable hover effects
   */
  hoverable?: boolean
  
  /**
   * Selected state
   */
  selected?: boolean
  
  /**
   * Enable parallax tilt on hover
   */
  tilt?: boolean
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Card - Primary content container
 * 
 * Features:
 * - Light, medium, heavy glass variants
 * - All 6 layers
 * - Magnetic hover effect
 * - Optional parallax tilt
 * - Selected state
 * 
 * @example
 * ```tsx
 * <Card variant="medium" hoverable>
 *   <h3>Card Title</h3>
 *   <p>Card content</p>
 * </Card>
 * 
 * <Card variant="heavy" selected>
 *   Selected card
 * </Card>
 * ```
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'medium',
      hoverable = false,
      selected = false,
      tilt = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    // Build configuration based on variant
    const config = React.useMemo(() => {
      const base = GlassBuilders.card()
      
      switch (variant) {
        case 'light':
          return base
            .fill('rgba(255, 255, 255, 0.05)')
            .blur(5)
            .build()
        
        case 'medium':
          return base
            .fill('rgba(255, 255, 255, 0.08)')
            .blur(8)
            .build()
        
        case 'heavy':
          return base
            .fill('rgba(255, 255, 255, 0.12)')
            .blur(12)
            .build()
      }
    }, [variant])
    
    // Motion variants for hover
    const motionVariants = hoverable ? {
      initial: { scale: 1, y: 0 },
      whileHover: { scale: 1.02, y: -4 },
    } : undefined
    
    return (
      <Glass
        ref={ref as any}
        config={config}
        className={cn(
          'relative p-6',
          'transition-all duration-300',
          hoverable && 'cursor-pointer',
          selected && 'ring-2 ring-blue-500/50',
          className
        )}
        variants={motionVariants}
        initial="initial"
        whileHover={hoverable ? 'whileHover' : undefined}
        {...props}
      >
        {children}
      </Glass>
    )
  }
)

Card.displayName = 'Card'

// ============================================================================
// CARD HEADER
// ============================================================================

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 mb-4', className)}
      {...props}
    />
  )
)

CardHeader.displayName = 'CardHeader'

// ============================================================================
// CARD TITLE
// ============================================================================

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-2xl font-semibold leading-none tracking-tight text-white', className)}
      {...props}
    />
  )
)

CardTitle.displayName = 'CardTitle'

// ============================================================================
// CARD DESCRIPTION
// ============================================================================

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-white/70', className)}
      {...props}
    />
  )
)

CardDescription.displayName = 'CardDescription'

// ============================================================================
// CARD CONTENT
// ============================================================================

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props} />
  )
)

CardContent.displayName = 'CardContent'

// ============================================================================
// CARD FOOTER
// ============================================================================

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center mt-4 pt-4 border-t border-white/10', className)}
      {...props}
    />
  )
)

CardFooter.displayName = 'CardFooter'
