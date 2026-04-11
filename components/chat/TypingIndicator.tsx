'use client'

/**
 * Enhanced Typing Indicator Component
 * 
 * Animated typing indicator with breathing dots.
 * Staggered wave animation for natural feel.
 * 
 * Design Philosophy:
 * - Subtle and non-distracting
 * - Natural breathing animation
 * - Smooth wave motion
 */

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'

export interface TypingIndicatorProps {
  className?: string
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
  const { shouldAnimate } = useReducedMotion()

  // Container pulsing animation
  const containerVariants = {
    animate: {
      scale: [1, 1.02, 1],
      opacity: [0.8, 1, 0.8],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  }

  // Dot wave animation
  const dotVariants = {
    animate: (delay: number) => ({
      y: [0, -4, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      },
    }),
  }

  return (
    <motion.div
      variants={shouldAnimate ? containerVariants : undefined}
      animate={shouldAnimate ? 'animate' : undefined}
      className={cn(
        'inline-flex items-center gap-1',
        'px-4 py-3 rounded-xl',
        'bg-surface border border-border-subtle',
        className
      )}
    >
      {[0, 0.1, 0.2].map((delay, index) => (
        <motion.div
          key={index}
          custom={delay}
          variants={shouldAnimate ? dotVariants : undefined}
          animate={shouldAnimate ? 'animate' : undefined}
          className="w-1.5 h-1.5 rounded-full bg-text-tertiary"
        />
      ))}
    </motion.div>
  )
}
