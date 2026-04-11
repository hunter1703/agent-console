'use client'

/**
 * Planning Card Header Component
 * 
 * Header with character-by-character title animation (Unseen style).
 * Minimal status badge, collapse button.
 */

import { motion } from 'framer-motion'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'
import type { PlanStatus } from '@/types/planning'

export interface PlanningCardHeaderProps {
  title: string
  status: PlanStatus
  isCollapsed: boolean
  onToggleCollapse: () => void
  className?: string
}

const statusConfig: Record<PlanStatus, { label: string; className: string }> = {
  IN_PROGRESS: {
    label: 'In Progress',
    className: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  },
  COMPLETED: {
    label: 'Completed',
    className: 'bg-green-500/10 text-green-600 border-green-500/20',
  },
  FAILED: {
    label: 'Failed',
    className: 'bg-red-500/10 text-red-600 border-red-500/20',
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-text-tertiary/10 text-text-tertiary border-text-tertiary/20',
  },
  UNKNOWN: {
    label: 'Unknown',
    className: 'bg-text-tertiary/10 text-text-tertiary border-text-tertiary/20',
  },
}

export function PlanningCardHeader({
  title,
  status,
  isCollapsed,
  onToggleCollapse,
  className = '',
}: PlanningCardHeaderProps) {
  const prefersReducedMotion = useReducedMotion()
  const config = statusConfig[status]

  // Character-by-character animation
  const chars = title.split('')

  return (
    <div className={`planning-card-header flex items-center justify-between gap-4 ${className}`}>
      {/* Title with character animation */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <h3 className="text-lg font-medium text-text-primary">
          {prefersReducedMotion ? (
            title
          ) : (
            <span>
              {chars.map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.05,
                    delay: i * 0.03,
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
        </h3>
        <span
          className={`status-badge px-2 py-1 rounded-md text-xs font-medium border ${config.className}`}
        >
          {config.label}
        </span>
      </div>

      {/* Collapse button */}
      <motion.button
        onClick={onToggleCollapse}
        className="collapse-button p-2 rounded-lg hover:bg-surface-hover transition-colors"
        whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
        whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
        aria-label={isCollapsed ? 'Expand' : 'Collapse'}
      >
        <motion.svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="text-text-secondary"
          animate={{ rotate: isCollapsed ? 0 : 180 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2 }}
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.svg>
      </motion.button>
    </div>
  )
}
