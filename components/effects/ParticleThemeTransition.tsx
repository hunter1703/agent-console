'use client'

/**
 * Particle Theme Transition Component
 * 
 * Creates floating particles effect during theme transitions.
 * Generates 20-30 particles at random positions that float upward
 * with random drift, fade out as they rise, and are removed after animation.
 * 
 * Design Philosophy:
 * - Magical, delightful theme transitions
 * - Particles use primary color (amber in light, white in dark)
 * - Smooth upward floating with random horizontal drift
 * - Staggered animations for organic feel
 * - Respects prefers-reduced-motion
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useTheme } from '@/lib/hooks/useTheme'

interface Particle {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
  drift: number
}

interface ParticleThemeTransitionProps {
  /** Whether the particle transition is active */
  isActive: boolean
  /** Callback when transition completes */
  onComplete?: () => void
}

export function ParticleThemeTransition({
  isActive,
  onComplete,
}: ParticleThemeTransitionProps) {
  const { theme } = useTheme()
  const [particles, setParticles] = useState<Particle[]>([])
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    // Initialize with current preference
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    }
    return false
  })

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

  // Generate particles when transition becomes active
  useEffect(() => {
    if (isActive && !prefersReducedMotion) {
      generateParticles()
    } else if (isActive && prefersReducedMotion) {
      // Skip particle effect but still call onComplete
      setTimeout(() => onComplete?.(), 50)
    }
  }, [isActive, prefersReducedMotion]) // Remove onComplete from dependencies to avoid issues

  const generateParticles = () => {
    const particleCount = Math.floor(Math.random() * 11) + 20 // 20-30 particles
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    const newParticles: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * viewportWidth,
      y: Math.random() * viewportHeight,
      size: Math.random() * 4 + 4, // 4-8px diameter
      duration: Math.random() * 200 + 600, // 600-800ms duration
      delay: i * 20, // 20ms stagger delay
      drift: (Math.random() - 0.5) * 100, // Random horizontal drift -50px to +50px
    }))

    setParticles(newParticles)

    // Clear particles after animation completes
    const maxDuration = Math.max(...newParticles.map(p => p.duration + p.delay))
    setTimeout(() => {
      setParticles([])
      onComplete?.()
    }, maxDuration + 100) // Add small buffer
  }

  // Get particle color based on current theme
  const getParticleColor = () => {
    return theme === 'light' ? '#F59E0B' : '#FAFAFA' // Amber for light, near-white for dark
  }

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 9998 }}>
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{
              x: particle.x,
              y: particle.y,
              scale: 0,
              opacity: 1,
            }}
            animate={{
              x: particle.x + particle.drift,
              y: particle.y - 150, // Float upward 150px
              scale: 1,
              opacity: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0,
            }}
            transition={{
              duration: particle.duration / 1000, // Convert to seconds
              delay: particle.delay / 1000, // Convert to seconds
              ease: [0.0, 0.0, 0.2, 1.0], // easeOut for natural floating
            }}
            style={{
              position: 'absolute',
              width: particle.size,
              height: particle.size,
              borderRadius: '50%',
              backgroundColor: getParticleColor(),
              pointerEvents: 'none',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

/**
 * Hook to manage particle theme transitions
 * 
 * Provides utilities to trigger particle transitions during theme changes.
 */
export function useParticleThemeTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false)

  const triggerParticles = () => {
    setIsTransitioning(true)
  }

  const completeTransition = () => {
    setIsTransitioning(false)
  }

  return {
    isTransitioning,
    triggerParticles,
    completeTransition,
  }
}