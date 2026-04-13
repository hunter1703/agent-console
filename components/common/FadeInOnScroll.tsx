'use client'

/**
 * Fade In on Scroll Component
 * 
 * Animates elements with fade-in effect as they enter the viewport.
 * Uses Intersection Observer for performance and triggers once by default.
 * 
 * Design Philosophy:
 * - Smooth entrance animations
 * - Performance-optimized with Intersection Observer
 * - Respects prefers-reduced-motion
 * - Triggers once to avoid repetitive animations
 */

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { useInView } from '@/lib/hooks/useInView'
import { springPresets } from '@/lib/constants/animations'

interface FadeInOnScrollProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  y?: number
  once?: boolean
  threshold?: number
}

export function FadeInOnScroll({
  children,
  className = '',
  delay = 0,
  duration = 0.4,
  y = 20,
  once = true,
  threshold = 0.1,
}: FadeInOnScrollProps) {
  const { ref, isInView } = useInView({ threshold, once })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{
        ...springPresets.gentle,
        delay,
        duration,
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Fade In on Scroll with Scale
 * Variant that also scales the element
 */
export function FadeInScaleOnScroll({
  children,
  className = '',
  delay = 0,
  duration = 0.4,
  scale = 0.95,
  once = true,
  threshold = 0.1,
}: FadeInOnScrollProps & { scale?: number }) {
  const { ref, isInView } = useInView({ threshold, once })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale }}
      transition={{
        ...springPresets.gentle,
        delay,
        duration,
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Slide In from Direction
 * Variant that slides from different directions
 */
export function SlideInOnScroll({
  children,
  className = '',
  delay = 0,
  duration = 0.4,
  direction = 'up',
  distance = 20,
  once = true,
  threshold = 0.1,
}: FadeInOnScrollProps & {
  direction?: 'up' | 'down' | 'left' | 'right'
  distance?: number
}) {
  const { ref, isInView } = useInView({ threshold, once })

  const getInitialPosition = () => {
    switch (direction) {
      case 'up':
        return { x: 0, y: distance }
      case 'down':
        return { x: 0, y: -distance }
      case 'left':
        return { x: distance, y: 0 }
      case 'right':
        return { x: -distance, y: 0 }
    }
  }

  const initial = { opacity: 0, ...getInitialPosition() }
  const animate = isInView ? { opacity: 1, x: 0, y: 0 } : initial

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={animate}
      transition={{
        ...springPresets.gentle,
        delay,
        duration,
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
