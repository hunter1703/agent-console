'use client'

import React, { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { Glass, type GlassProps } from '@/components/liquid-glass/Glass'
import { glassBuilder } from '@/lib/liquid-glass/builder'
import { cn } from '@/lib/utils/cn'

// ============================================================================
// LINEAR PROGRESS
// ============================================================================

export interface LinearProgressProps extends GlassProps {
  /**
   * Progress value (0-100)
   */
  value?: number
  
  /**
   * Indeterminate state (animated loading)
   */
  indeterminate?: boolean
  
  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg'
  
  /**
   * Show gradient fill
   */
  gradient?: boolean
}

/**
 * LinearProgress - Horizontal loading indicator
 * 
 * Features:
 * - Determinate and indeterminate modes
 * - Gradient fill option
 * - Glass surface
 * - Spring animation
 * 
 * @example
 * ```tsx
 * <LinearProgress value={75} />
 * 
 * <LinearProgress indeterminate />
 * 
 * <LinearProgress value={50} gradient />
 * ```
 */
export const LinearProgress = forwardRef<HTMLDivElement, LinearProgressProps>(
  (
    {
      value = 0,
      indeterminate = false,
      size = 'md',
      gradient = true,
      className,
      ...props
    },
    ref
  ) => {
    // Track config
    const trackConfig = React.useMemo(() => {
      return glassBuilder()
        .preset('frosted', 'light')
        .fill('rgba(255, 255, 255, 0.1)')
        .radius(9999)
        .accessible()
        .optimized()
        .build()
    }, [])
    
    // Size styles
    const sizeStyles = {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3',
    }
    
    // Clamp value
    const clampedValue = Math.min(100, Math.max(0, value))
    
    return (
      <Glass
        ref={ref}
        config={trackConfig}
        className={cn(
          'relative w-full overflow-hidden',
          sizeStyles[size],
          className
        )}
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        {...props}
      >
        {indeterminate ? (
          // Indeterminate animation
          <motion.div
            className={cn(
              'absolute inset-y-0 w-1/3 rounded-full',
              gradient
                ? 'bg-gradient-to-r from-transparent via-blue-500 to-transparent'
                : 'bg-blue-500'
            )}
            animate={{
              x: ['-100%', '400%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ) : (
          // Determinate progress
          <motion.div
            className={cn(
              'absolute inset-y-0 left-0 rounded-full',
              gradient
                ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                : 'bg-blue-500'
            )}
            initial={{ width: 0 }}
            animate={{ width: `${clampedValue}%` }}
            transition={{
              type: 'spring',
              stiffness: 100,
              damping: 20,
            }}
          />
        )}
      </Glass>
    )
  }
)

LinearProgress.displayName = 'LinearProgress'

// ============================================================================
// CIRCULAR PROGRESS
// ============================================================================

export interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Progress value (0-100)
   */
  value?: number
  
  /**
   * Indeterminate state (animated loading)
   */
  indeterminate?: boolean
  
  /**
   * Size in pixels
   */
  size?: number
  
  /**
   * Stroke width in pixels
   */
  strokeWidth?: number
  
  /**
   * Show value label
   */
  showValue?: boolean
}

/**
 * CircularProgress - Circular loading indicator
 * 
 * Features:
 * - Determinate and indeterminate modes
 * - Glass stroke
 * - Smooth rotation
 * - Optional value label
 * 
 * @example
 * ```tsx
 * <CircularProgress value={75} showValue />
 * 
 * <CircularProgress indeterminate />
 * 
 * <CircularProgress value={50} size={64} />
 * ```
 */
export const CircularProgress = forwardRef<HTMLDivElement, CircularProgressProps>(
  (
    {
      value = 0,
      indeterminate = false,
      size = 48,
      strokeWidth = 4,
      showValue = false,
      className,
      ...props
    },
    ref
  ) => {
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const clampedValue = Math.min(100, Math.max(0, value))
    const offset = circumference - (clampedValue / 100) * circumference
    
    return (
      <div
        ref={ref}
        className={cn('relative inline-flex items-center justify-center', className)}
        style={{ width: size, height: size }}
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        {...props}
      >
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={strokeWidth}
          />
          
          {/* Progress circle */}
          {indeterminate ? (
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="url(#gradient)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              animate={{
                strokeDashoffset: [circumference, 0],
                rotate: [0, 360],
              }}
              transition={{
                strokeDashoffset: {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
                rotate: {
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                },
              }}
            />
          ) : (
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="url(#gradient)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{
                type: 'spring',
                stiffness: 100,
                damping: 20,
              }}
            />
          )}
          
          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(210, 100%, 60%)" />
              <stop offset="100%" stopColor="hsl(270, 100%, 70%)" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Value label */}
        {showValue && !indeterminate && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-semibold text-white">
              {Math.round(clampedValue)}%
            </span>
          </div>
        )}
      </div>
    )
  }
)

CircularProgress.displayName = 'CircularProgress'
