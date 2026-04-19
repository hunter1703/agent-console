'use client'

/**
 * Planning Card Component - Minimal Elegance Design
 * 
 * Premium planning card following Unseen design principles:
 * - 90% grayscale with minimal accent colors
 * - Character-by-character animations
 * - Magnetic hover effects
 * - Serif/sans font switching
 * - Shows full data model (goal, description, result, hierarchy)
 * 
 * Design Philosophy:
 * - Frosted glass with backdrop blur
 * - Animated gradient blob background
 * - Smooth spring physics animations
 * - Hierarchical task nesting
 * - Respects prefers-reduced-motion
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { springPresets, scaleIn, getTransition } from '@/lib/constants/animations'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'
import { PlanningCardHeader } from './PlanningCardHeader'
import { PlanGoal } from './PlanGoal'
import { PlanResult } from './PlanResult'
import { TaskList } from './TaskList'
import { PlanningCardFooter } from './PlanningCardFooter'
import { getTaskStats } from '@/lib/utils/planning'
import type { Plan } from '@/types/planning'

export interface PlanningCardProps {
  plan: Plan
  className?: string
}

export function PlanningCard({ plan, className = '' }: PlanningCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  
  const stats = getTaskStats(plan.tasks)
  const isTerminal = ['COMPLETED', 'FAILED', 'CANCELLED'].includes(plan.status)

  return (
    <motion.div
      variants={scaleIn}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={getTransition(prefersReducedMotion, springPresets.gentle)}
      className={`planning-card-wrapper relative ${className}`}
    >
      {/* Animated blob background - subtle, grayscale */}
      <motion.div
        className="planning-blob absolute inset-0 -z-10"
        animate={{
          scale: prefersReducedMotion ? 1 : [1, 1.05, 1],
          opacity: prefersReducedMotion ? 0.05 : [0.05, 0.08, 0.05],
          borderRadius: prefersReducedMotion 
            ? '50% 50% 50% 50%'
            : [
                '50% 50% 50% 50%',
                '45% 55% 55% 45%',
                '50% 50% 50% 50%',
              ],
        }}
        transition={{
          duration: 8,
          repeat: prefersReducedMotion ? 0 : Infinity,
          ease: 'easeInOut',
        }}
        style={{
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Frosted glass card */}
      <div
        className="planning-card relative rounded-xl border border-border-subtle/10 p-8 shadow-2xl bg-surface/95"
        style={{
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {/* Card header with character-by-character title */}
        <PlanningCardHeader
          title={plan.title}
          status={plan.status}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          className="mb-6"
        />

        {/* Collapsible content */}
        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={getTransition(prefersReducedMotion, springPresets.gentle)}
              style={{ overflow: 'hidden' }}
            >
              <div className="space-y-6">
                {/* Plan goal (serif italic) */}
                <PlanGoal goal={plan.goal} />

                {/* Task list with hierarchical nesting */}
                <TaskList tasks={plan.tasks} />

                {/* Plan result (shown when complete) */}
                {isTerminal && plan.result && (
                  <PlanResult 
                    result={plan.result} 
                    status={plan.status as 'COMPLETED' | 'FAILED' | 'CANCELLED'} 
                  />
                )}

                {/* Footer with statistics */}
                <PlanningCardFooter
                  totalTasks={stats.total}
                  completedTasks={stats.completed}
                  inProgressTasks={stats.inProgress}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
