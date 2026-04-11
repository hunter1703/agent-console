/**
 * useLiquidGlass Hook
 * Provides liquid glass support detection and configuration
 */

'use client'

import { useEffect, useState } from 'react'
import { supportsLiquidGlass, prefersReducedMotion } from '@/lib/liquid-glass'

export function useLiquidGlass() {
  const [supported, setSupported] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    setSupported(supportsLiquidGlass())
    setReducedMotion(prefersReducedMotion())

    // Listen for reduced motion preference changes
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return {
    enabled: supported && !reducedMotion,
    supported,
    reducedMotion,
    fallback: !supported || reducedMotion,
  }
}
