'use client'

/**
 * Skeleton Loading Components
 * 
 * Enhanced skeleton screens with shimmer animation for better loading states.
 * Provides visual feedback while content loads with smooth wave effect.
 * 
 * Design Philosophy:
 * - Better UX than spinners
 * - Matches content structure
 * - Smooth shimmer animation
 * - Respects prefers-reduced-motion
 */

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export interface SkeletonProps {
  className?: string
  animate?: boolean
  width?: string | number
  height?: string | number
  borderRadius?: string | number
}

export function Skeleton({ 
  className, 
  animate = true, 
  width, 
  height, 
  borderRadius = '8px' 
}: SkeletonProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const shouldAnimate = animate && !prefersReducedMotion

  return (
    <div
      className={cn(
        'bg-surface',
        shouldAnimate && 'skeleton-shimmer',
        className
      )}
      data-testid="skeleton"
      style={{
        width,
        height,
        borderRadius,
      }}
    />
  )
}

/**
 * Skeleton Card - For agent/session cards (legacy - use specific skeletons)
 */
export function SkeletonCard() {
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton 
          width="40px" 
          height="40px" 
          borderRadius="50%"
        />
        <div className="flex-1 space-y-2">
          <Skeleton 
            width="75%" 
            height="16px" 
            borderRadius="4px"
          />
          <Skeleton 
            width="50%" 
            height="12px" 
            borderRadius="4px"
          />
        </div>
      </div>
    </div>
  )
}

/**
 * Skeleton List - For lists of items
 */
export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

/**
 * Skeleton Text - For text content
 */
export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 ? '66%' : '100%'}
          height="16px"
          borderRadius="4px"
        />
      ))}
    </div>
  )
}
