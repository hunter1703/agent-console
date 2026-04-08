'use client'

/**
 * useReducedMotion Hook
 * 
 * Detects user's motion preference and provides appropriate animation configs.
 * Respects prefers-reduced-motion for accessibility.
 * 
 * Design Philosophy:
 * - Accessibility first
 * - Respect user preferences
 * - Provide appropriate fallbacks
 */

import { useEffect, useState } from 'react'
import { Transition } from 'framer-motion'
import { springPresets } from '@/lib/constants/animations'

export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    // Check initial preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  // Return appropriate transition config
  const transition: Transition = prefersReducedMotion
    ? { duration: 0 }
    : springPresets.default

  return {
    prefersReducedMotion,
    shouldAnimate: !prefersReducedMotion,
    transition,
  }
}
