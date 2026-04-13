'use client'

/**
 * Parallax Background Component
 * 
 * Creates subtle parallax scrolling effect for background elements.
 * Different layers move at different speeds for depth perception.
 * 
 * Design Philosophy:
 * - Subtle depth effect
 * - Desktop only (pointer: fine)
 * - Performance-optimized with useTransform
 * - Respects prefers-reduced-motion
 */

import { motion, useScroll, useTransform } from 'framer-motion'
import { ReactNode, useEffect, useState } from 'react'
import { useMediaQuery } from '@/lib/hooks/useMediaQuery'

interface ParallaxBackgroundProps {
  children: ReactNode
  className?: string
  speed?: number // 0.5 = half speed, 2 = double speed
  maxOffset?: number // Maximum pixels to move
}

export function ParallaxBackground({
  children,
  className = '',
  speed = 0.5,
  maxOffset = 100,
}: ParallaxBackgroundProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const isDesktop = useMediaQuery('(pointer: fine)')
  
  const { scrollY } = useScroll()
  
  // Transform scroll position to parallax offset
  const y = useTransform(
    scrollY,
    [0, 1000],
    [0, maxOffset * speed]
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Disable parallax on mobile or if reduced motion is preferred
  if (!isDesktop || prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      style={{ y }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Parallax Layer
 * Pre-configured parallax layers with different speeds
 */
export function ParallaxLayer({
  children,
  className = '',
  layer = 'middle',
}: {
  children: ReactNode
  className?: string
  layer?: 'back' | 'middle' | 'front'
}) {
  const speedMap = {
    back: 0.3,    // Slowest - furthest away
    middle: 0.5,  // Medium speed
    front: 0.7,   // Fastest - closest
  }

  const maxOffsetMap = {
    back: 50,
    middle: 75,
    front: 100,
  }

  return (
    <ParallaxBackground
      speed={speedMap[layer]}
      maxOffset={maxOffsetMap[layer]}
      className={className}
    >
      {children}
    </ParallaxBackground>
  )
}

/**
 * Parallax Blob Background
 * Animated blob with parallax effect
 */
export function ParallaxBlob({
  className = '',
  layer = 'back',
  color = 'primary',
}: {
  className?: string
  layer?: 'back' | 'middle' | 'front'
  color?: 'primary' | 'secondary'
}) {
  return (
    <ParallaxLayer layer={layer} className={className}>
      <motion.div
        className="absolute w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{
          background: color === 'primary' 
            ? 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)'
            : 'radial-gradient(circle, hsl(var(--secondary)) 0%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.15, 0.1],
          borderRadius: [
            '60% 40% 30% 70%',
            '30% 60% 70% 40%',
            '60% 40% 30% 70%',
          ],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </ParallaxLayer>
  )
}
