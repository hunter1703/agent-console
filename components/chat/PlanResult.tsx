'use client'

/**
 * Plan Result Component
 * 
 * Displays the final result/outcome when plan completes.
 * Slides in from bottom with fade.
 */

import { motion } from 'framer-motion'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'
import { springPresets } from '@/lib/constants/animations'

export interface PlanResultProps {
  result: string
  status: 'COMPLETED' | 'FAILED' | 'CANCELLED'
  className?: string
}

export function PlanResult({ result, status, className = '' }: PlanResultProps) {
  const prefersReducedMotion = useReducedMotion()

  const statusColors = {
    COMPLETED: 'border-green-500/20 bg-green-500/5',
    FAILED: 'border-red-500/20 bg-red-500/5',
    CANCELLED: 'border-text-tertiary/20 bg-text-tertiary/5',
  }

  const statusIcons = {
    COMPLETED: '✓',
    FAILED: '✗',
    CANCELLED: '⊘',
  }

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { ...springPresets.gentle, delay: 0.2 }
      }
      className={`plan-result rounded-lg border p-4 ${statusColors[status]} ${className}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-lg mt-0.5">{statusIcons[status]}</span>
        <div className="flex-1">
          <div className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">
            Result
          </div>
          <div className="text-sm text-text-primary">{result}</div>
        </div>
      </div>
    </motion.div>
  )
}
