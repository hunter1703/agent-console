'use client'

/**
 * Planning Card Footer Component
 * 
 * Minimal footer showing task completion statistics.
 * No progress bar - just counts (per user feedback).
 */

import { motion } from 'framer-motion'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'

export interface PlanningCardFooterProps {
  totalTasks: number
  completedTasks: number
  inProgressTasks?: number
  className?: string
}

export function PlanningCardFooter({
  totalTasks,
  completedTasks,
  inProgressTasks = 0,
  className = '',
}: PlanningCardFooterProps) {
  const prefersReducedMotion = useReducedMotion()
  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className={`planning-card-footer flex items-center justify-between text-xs text-text-secondary ${className}`}
    >
      <div className="flex items-center gap-4">
        <span>
          <span className="font-medium text-text-primary">{completedTasks}</span> of{' '}
          <span className="font-medium text-text-primary">{totalTasks}</span> tasks completed
        </span>
        {inProgressTasks > 0 && (
          <span className="text-amber-600">
            {inProgressTasks} in progress
          </span>
        )}
      </div>
      <span className="font-medium text-text-primary">{percentage}%</span>
    </motion.div>
  )
}
