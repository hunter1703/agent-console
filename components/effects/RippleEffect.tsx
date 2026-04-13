'use client'

/**
 * Ripple Effect Component
 * 
 * Material Design-inspired ripple effect for button clicks.
 * Creates expanding circle animation from click position.
 * 
 * Design Philosophy:
 * - Immediate visual feedback
 * - Natural, organic expansion
 * - Respects prefers-reduced-motion
 * - Auto-cleanup after animation
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Ripple } from '@/lib/hooks/useRipple'

interface RippleEffectProps {
  ripples: Ripple[]
  color?: string
  duration?: number
}

export function RippleEffect({
  ripples,
  color = 'rgba(255, 255, 255, 0.5)',
  duration = 0.6,
}: RippleEffectProps) {
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
    return null
  }

  return (
    <span className="absolute inset-0 overflow-hidden pointer-events-none rounded-[inherit]">
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="absolute rounded-full"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
              backgroundColor: color,
              transform: 'translate(-50%, -50%)',
            }}
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{
              duration,
              ease: 'easeOut',
            }}
          />
        ))}
      </AnimatePresence>
    </span>
  )
}
