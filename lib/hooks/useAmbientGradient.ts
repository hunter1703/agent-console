/**
 * useAmbientGradient Hook
 * Creates slowly rotating ambient gradient backgrounds
 */

'use client'

import { useEffect, useState } from 'react'

export function useAmbientGradient() {
  const [gradientPhase, setGradientPhase] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setGradientPhase((prev) => (prev + 1) % 360)
    }, 100) // Update every 100ms for smooth transition

    return () => clearInterval(interval)
  }, [])

  return {
    gradientPhase,
    style: {
      backgroundSize: '400% 400%',
      backgroundPosition: `${gradientPhase}% 50%`,
    },
  }
}
