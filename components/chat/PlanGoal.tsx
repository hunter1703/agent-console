'use client'

/**
 * Plan Goal Component
 * 
 * Displays the plan's goal in serif italic font (Unseen style).
 * Character-by-character animation on mount.
 */

import { motion } from 'framer-motion'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'

export interface PlanGoalProps {
  goal: string
  className?: string
}

export function PlanGoal({ goal, className = '' }: PlanGoalProps) {
  const prefersReducedMotion = useReducedMotion()

  // Split into characters for animation
  const chars = goal.split('')

  return (
    <div className={`plan-goal text-sm text-text-secondary italic ${className}`}>
      <span className="font-medium not-italic">Goal:</span>{' '}
      {prefersReducedMotion ? (
        <span>{goal}</span>
      ) : (
        <span className="inline-block">
          {chars.map((char, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.05,
                delay: i * 0.02,
                ease: 'easeOut',
              }}
              className="inline-block"
              style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}
            >
              {char}
            </motion.span>
          ))}
        </span>
      )}
    </div>
  )
}
