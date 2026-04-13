'use client'

/**
 * Progress Ring Component
 * 
 * Circular progress indicator with animated stroke.
 * Perfect for showing completion percentage or loading states.
 * 
 * Design Philosophy:
 * - Smooth stroke animation
 * - Customizable colors and sizes
 * - Respects prefers-reduced-motion
 * - Accessible with ARIA attributes
 */

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface ProgressRingProps {
  percentage: number
  size?: number
  strokeWidth?: number
  color?: string
  backgroundColor?: string
  showPercentage?: boolean
  duration?: number
  className?: string
}

export function ProgressRing({
  percentage,
  size = 120,
  strokeWidth = 8,
  color = 'hsl(var(--primary))',
  backgroundColor = 'hsl(var(--surface))',
  showPercentage = true,
  duration = 1,
  className = '',
}: ProgressRingProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Calculate circle properties
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
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
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{
            strokeDashoffset: prefersReducedMotion ? offset : offset,
          }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : {
                  duration,
                  ease: [0, 0, 0.2, 1], // easeOut
                }
          }
        />
      </svg>

      {/* Percentage text */}
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-semibold text-primary tabular-nums">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  )
}

/**
 * Progress Ring with Label
 * Variant with label below the ring
 */
export function ProgressRingWithLabel({
  percentage,
  label,
  size = 120,
  className = '',
  ...props
}: ProgressRingProps & { label: string }) {
  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <ProgressRing percentage={percentage} size={size} {...props} />
      <span className="text-sm text-secondary">{label}</span>
    </div>
  )
}

/**
 * Mini Progress Ring
 * Smaller variant for inline use
 */
export function MiniProgressRing({
  percentage,
  className = '',
}: {
  percentage: number
  className?: string
}) {
  return (
    <ProgressRing
      percentage={percentage}
      size={40}
      strokeWidth={4}
      showPercentage={false}
      duration={0.6}
      className={className}
    />
  )
}
