'use client'

/**
 * Task Stepper Component
 * 
 * Visual progress indicator showing tasks as connected circles/dots.
 * Each task is represented by a circle with connecting lines showing progression.
 * 
 * Design Philosophy:
 * - Clear visual hierarchy with completed, active, and pending states
 * - Smooth animations for state transitions
 * - Connecting lines show flow and progression
 * - Respects prefers-reduced-motion
 */

import { motion } from 'framer-motion'
import { Check, Circle, Loader2, X } from 'lucide-react'
import { springPresets } from '@/lib/constants/animations'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'
import type { Task } from '@/types/planning'

export interface TaskStepperProps {
  tasks: Task[]
  maxVisible?: number
  className?: string
}

export function TaskStepper({ tasks, maxVisible = 5, className = '' }: TaskStepperProps) {
  const prefersReducedMotion = useReducedMotion()
  
  // Show only top-level tasks (no parent) for the stepper
  const topLevelTasks = tasks.filter(task => !task.parentTaskId).slice(0, maxVisible)

  const getStepState = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return {
          icon: Check,
          color: 'bg-success text-white',
          ringColor: 'ring-success/20',
          lineColor: 'bg-success',
        }
      case 'in-progress':
        return {
          icon: Loader2,
          color: 'bg-primary text-white',
          ringColor: 'ring-primary/20',
          lineColor: 'bg-gradient-to-r from-success to-primary',
        }
      case 'failed':
        return {
          icon: X,
          color: 'bg-error text-white',
          ringColor: 'ring-error/20',
          lineColor: 'bg-error',
        }
      default:
        return {
          icon: Circle,
          color: 'bg-surface-hover text-text-tertiary',
          ringColor: 'ring-border-subtle',
          lineColor: 'bg-border-subtle',
        }
    }
  }

  return (
    <div className={`task-stepper ${className}`}>
      <div className="flex items-center justify-between">
        {topLevelTasks.map((task, index) => {
          const state = getStepState(task.status)
          const Icon = state.icon
          const isLast = index === topLevelTasks.length - 1
          const isActive = task.status === 'in-progress'

          return (
            <div key={task.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <motion.div
                  className={`relative flex items-center justify-center w-10 h-10 rounded-full ${state.color} ring-4 ${state.ringColor} shadow-sm`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={springPresets.snappy}
                  whileHover={{ scale: 1.05 }}
                >
                  {isActive && !prefersReducedMotion ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    >
                      <Icon size={18} strokeWidth={2.5} />
                    </motion.div>
                  ) : (
                    <Icon size={18} strokeWidth={2.5} />
                  )}
                </motion.div>

                {/* Step Label */}
                <motion.div
                  className="mt-2 text-center"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...springPresets.gentle, delay: 0.1 }}
                >
                  <p className="text-xs font-medium text-text-primary line-clamp-2 max-w-[80px]">
                    {task.title}
                  </p>
                </motion.div>
              </div>

              {/* Connecting Line */}
              {!isLast && (
                <div className="flex-1 h-0.5 mx-2 relative">
                  <div className="absolute inset-0 bg-border-subtle rounded-full" />
                  <motion.div
                    className={`absolute inset-0 ${state.lineColor} rounded-full origin-left`}
                    initial={{ scaleX: 0 }}
                    animate={{
                      scaleX: task.status === 'completed' ? 1 : 0,
                    }}
                    transition={springPresets.gentle}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary */}
      {tasks.length > maxVisible && (
        <motion.p
          className="mt-4 text-xs text-text-tertiary text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          +{tasks.length - maxVisible} more tasks
        </motion.p>
      )}
    </div>
  )
}
