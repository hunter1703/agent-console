'use client'

import React, { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { Glass } from '@/components/liquid-glass/Glass'
import { glassBuilder } from '@/lib/liquid-glass/builder'
import { cn } from '@/lib/utils/cn'

// ============================================================================
// TYPES
// ============================================================================

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Badge variant
   */
  variant?: 'dot' | 'count' | 'status'
  
  /**
   * Badge content (for count variant)
   */
  content?: string | number
  
  /**
   * Status color (for status variant)
   */
  status?: 'success' | 'error' | 'warning' | 'info'
  
  /**
   * Show pulse animation
   */
  pulse?: boolean
  
  /**
   * Maximum count to display (shows "99+" if exceeded)
   */
  max?: number
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Badge - Notification indicator
 * 
 * Features:
 * - Dot, count, and status variants
 * - Glass surface with pulse animation
 * - Auto-sizing based on content
 * - Status colors
 * 
 * @example
 * ```tsx
 * <Badge variant="dot" pulse />
 * 
 * <Badge variant="count" content={5} />
 * 
 * <Badge variant="status" status="success" />
 * ```
 */
export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  (
    {
      variant = 'dot',
      content,
      status = 'info',
      pulse = false,
      max = 99,
      className,
      ...props
    },
    ref
  ) => {
    // Build configuration based on variant and status
    const config = React.useMemo(() => {
      const statusColors = {
        success: 'hsla(142, 76%, 36%, 0.3)',
        error: 'hsla(0, 84%, 60%, 0.3)',
        warning: 'hsla(38, 92%, 50%, 0.3)',
        info: 'hsla(var(--color-primary-hue), var(--color-primary-saturation), var(--color-primary-lightness), 0.3)',
      }
      
      return glassBuilder()
        .preset('frosted', 'medium')
        .fill(statusColors[status])
        .radius(9999)
        .shadow('soft')
        .withBorder({
          highlight: {
            topLeft: 'rgba(255, 255, 255, 0.3)',
            bottomRight: 'rgba(255, 255, 255, 0.1)',
          },
        })
        .accessible()
        .optimized()
        .build()
    }, [status])
    
    // Format content for count variant
    const displayContent = React.useMemo(() => {
      if (variant !== 'count' || content === undefined) return null
      
      const num = typeof content === 'number' ? content : parseInt(content, 10)
      if (isNaN(num)) return content
      
      return num > max ? `${max}+` : num
    }, [variant, content, max])
    
    // Size based on variant
    const sizeStyles = {
      dot: 'h-2 w-2',
      count: 'h-5 min-w-[1.25rem] px-1.5',
      status: 'h-3 w-3',
    }
    
    return (
      <Glass
        ref={ref}
        config={config}
        className={cn(
          'inline-flex items-center justify-center',
          'text-white text-xs font-semibold',
          sizeStyles[variant],
          className
        )}
        {...props}
      >
        {variant === 'count' && displayContent}
        
        {/* Pulse animation */}
        {pulse && (
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{
              background: config.glass.fill,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </Glass>
    )
  }
)

Badge.displayName = 'Badge'
