'use client'

/**
 * Ripple Theme Transition Component
 * 
 * Creates a simple wipe effect that emanates from the theme toggle button
 * during theme transitions. The wipe expands to cover the screen with the new
 * theme color, then fades out to reveal the new themed content.
 * 
 * Design Philosophy:
 * - Simple one-way wipe transition
 * - Dark wipe for light→dark, light wipe for dark→light  
 * - No bouncing - just expand and fade
 * - Respects prefers-reduced-motion
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useTheme } from '@/lib/hooks/useTheme'

interface RippleThemeTransitionProps {
  /** Whether the ripple transition is active */
  isActive: boolean
  /** Position where the ripple should originate from */
  origin: { x: number; y: number }
  /** Callback when transition completes */
  onComplete?: () => void
}

export function RippleThemeTransition({
  isActive,
  origin,
  onComplete,
}: RippleThemeTransitionProps) {
  const { theme } = useTheme()
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

  // Calculate the maximum distance needed to cover the entire viewport
  const calculateMaxDistance = () => {
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    
    // Calculate distance from origin to each corner
    const distances = [
      Math.sqrt(origin.x ** 2 + origin.y ** 2), // Top-left
      Math.sqrt((viewportWidth - origin.x) ** 2 + origin.y ** 2), // Top-right
      Math.sqrt(origin.x ** 2 + (viewportHeight - origin.y) ** 2), // Bottom-left
      Math.sqrt((viewportWidth - origin.x) ** 2 + (viewportHeight - origin.y) ** 2), // Bottom-right
    ]
    
    // Return the maximum distance (diagonal)
    return Math.max(...distances)
  }

  const maxDistance = calculateMaxDistance()

  // Get the wipe color (the new theme's color)
  const getWipeColor = () => {
    // Use the target theme's color
    return theme === 'light' ? '#FAFAFA' : '#09090B'
  }

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{
            clipPath: `circle(0px at ${origin.x}px ${origin.y}px)`,
          }}
          animate={{
            clipPath: `circle(${maxDistance}px at ${origin.x}px ${origin.y}px)`,
          }}
          exit={{
            clipPath: `circle(${maxDistance}px at ${origin.x}px ${origin.y}px)`,
            opacity: 0,
          }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : {
                  duration: 0.5,
                  ease: [0.4, 0.0, 0.2, 1.0], // easeInOut
                }
          }
          onAnimationComplete={() => {
            // Complete after a brief pause to let new content settle
            setTimeout(() => {
              onComplete?.()
            }, 100)
          }}
          className="fixed inset-0 pointer-events-none"
          style={{
            backgroundColor: getWipeColor(),
            zIndex: 9999,
          }}
        />
      )}
    </AnimatePresence>
  )
}

/**
 * Hook to manage ripple theme transitions
 * 
 * Provides utilities to trigger ripple transitions from any element.
 */
export function useRippleThemeTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [rippleOrigin, setRippleOrigin] = useState({ x: 0, y: 0 })

  const triggerRipple = (element: HTMLElement | null) => {
    if (!element) return

    // Get the element's position
    const rect = element.getBoundingClientRect()
    const origin = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    }

    setRippleOrigin(origin)
    setIsTransitioning(true)
  }

  const completeTransition = () => {
    setIsTransitioning(false)
  }

  return {
    isTransitioning,
    rippleOrigin,
    triggerRipple,
    completeTransition,
  }
}