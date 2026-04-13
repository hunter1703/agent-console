'use client'

/**
 * useHoverLift Hook
 * 
 * Provides hover lift effect for interactive cards and elements.
 * Returns motion props that can be spread onto motion components.
 * 
 * Usage:
 * const hoverLift = useHoverLift()
 * <motion.div {...hoverLift}>Content</motion.div>
 */

import { useEffect, useState } from 'react'
import { springPresets } from '@/lib/constants/animations'

interface HoverLiftOptions {
  y?: number
  scale?: number
  shadow?: boolean
}

export function useHoverLift(options: HoverLiftOptions = {}) {
  const { y = -2, scale = 1, shadow = true } = options
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

  if (prefersReducedMotion) {
    return {
      whileHover: {},
      transition: springPresets.snappy,
    }
  }

  return {
    whileHover: {
      y,
      scale,
      ...(shadow && {
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      }),
    },
    transition: springPresets.snappy,
  }
}

/**
 * useHoverScale Hook
 * Variant that only scales without lifting
 */
export function useHoverScale(scale: number = 1.02) {
  return useHoverLift({ y: 0, scale, shadow: false })
}

/**
 * useHoverGlow Hook
 * Variant that adds a glow effect on hover
 */
export function useHoverGlow(color: string = 'rgba(245, 158, 11, 0.2)') {
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

  if (prefersReducedMotion) {
    return {
      whileHover: {},
      transition: springPresets.snappy,
    }
  }

  return {
    whileHover: {
      y: -2,
      boxShadow: `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 0 20px ${color}`,
    },
    transition: springPresets.snappy,
  }
}
