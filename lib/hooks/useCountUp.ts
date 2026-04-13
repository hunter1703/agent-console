'use client'

/**
 * useCountUp Hook
 * 
 * Animates a number from its previous value to a new target value.
 * Uses requestAnimationFrame for smooth 60fps animation.
 * 
 * Usage:
 * const count = useCountUp(targetValue, 800)
 */

import { useEffect, useState, useRef } from 'react'

export function useCountUp(
  target: number,
  duration: number = 800
): number {
  const [count, setCount] = useState(0)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const frameRef = useRef<number>()
  const startTimeRef = useRef<number>()
  const startValueRef = useRef(0)

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

  useEffect(() => {
    // If reduced motion, set immediately
    if (prefersReducedMotion) {
      setCount(target)
      return
    }

    // Store starting value
    startValueRef.current = count
    startTimeRef.current = undefined

    // Easing function (easeOutCubic)
    const easeOut = (t: number): number => {
      return 1 - Math.pow(1 - t, 3)
    }

    // Animation loop
    const animate = (currentTime: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime
      }

      const elapsed = currentTime - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easeOut(progress)

      const currentCount =
        startValueRef.current +
        (target - startValueRef.current) * easedProgress

      setCount(currentCount)

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      } else {
        setCount(target)
      }
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [target, duration, prefersReducedMotion])

  return count
}
