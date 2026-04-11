'use client'

/**
 * Task Item Component
 * 
 * Individual task with Unseen-style animations:
 * - Magnetic hover (follows cursor ±10px)
 * - Sans → Serif font switching on hover
 * - Bouncing checkmark for completed
 * - Spinning loader for in-progress
 * - Expandable to show goal/description/result
 */

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'
import { springPresets } from '@/lib/constants/animations'
import { getStatusColor, getStatusIcon } from '@/lib/utils/planning'
import type { TaskWithChildren } from '@/types/planning'

export interface TaskItemProps {
  task: TaskWithChildren
  className?: string
}

export function TaskItem({ task, className = '' }: TaskItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const itemRef = useRef<HTMLDivElement>(null)

  // Magnetic hover effect
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const x = useSpring(mouseX, springPresets.snappy)
  const y = useSpring(mouseY, springPresets.snappy)

  useEffect(() => {
    if (prefersReducedMotion) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!itemRef.current || !isHovered) return

      const rect = itemRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      // Calculate distance from center
      const deltaX = e.clientX - centerX
      const deltaY = e.clientY - centerY

      // Limit to ±10px
      const limitedX = Math.max(-10, Math.min(10, deltaX * 0.1))
      const limitedY = Math.max(-10, Math.min(10, deltaY * 0.1))

      mouseX.set(limitedX)
      mouseY.set(limitedY)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [isHovered, mouseX, mouseY, prefersReducedMotion])

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    mouseX.set(0)
    mouseY.set(0)
  }

  const hasDetails = task.goal || task.description || task.result

  return (
    <motion.div
      ref={itemRef}
      style={prefersReducedMotion ? {} : { x, y }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`task-item group ${className}`}
    >
      <div
        className="flex items-start gap-3 p-3 rounded-lg transition-all duration-200 cursor-pointer hover:bg-surface-hover/50"
        onClick={() => hasDetails && setIsExpanded(!isExpanded)}
        style={{
          paddingLeft: `${task.depth * 2}rem`,
        }}
      >
        {/* Status icon */}
        <motion.div
          className={`task-status flex-shrink-0 mt-0.5 ${getStatusColor(task.status)}`}
          animate={
            prefersReducedMotion
              ? {}
              : task.status === 'COMPLETED'
              ? {
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                }
              : task.status === 'IN_PROGRESS'
              ? {
                  rotate: 360,
                }
              : {}
          }
          transition={
            task.status === 'COMPLETED'
              ? { duration: 0.5, ease: 'easeOut' }
              : task.status === 'IN_PROGRESS'
              ? { duration: 2, repeat: Infinity, ease: 'linear' }
              : {}
          }
        >
          {getStatusIcon(task.status)}
        </motion.div>

        {/* Task content */}
        <div className="flex-1 min-w-0">
          {/* Task name with font switching */}
          <motion.div
            className={`task-name text-sm transition-all duration-300 ${
              task.status === 'COMPLETED' ? 'opacity-50 line-through' : ''
            }`}
            animate={
              isHovered && !prefersReducedMotion
                ? {
                    fontFamily: 'Georgia, serif',
                    fontStyle: 'italic',
                  }
                : {
                    fontFamily: 'inherit',
                    fontStyle: 'normal',
                  }
            }
          >
            {task.name}
          </motion.div>

          {/* Expandable details */}
          {hasDetails && (
            <motion.div
              initial={false}
              animate={{
                height: isExpanded ? 'auto' : 0,
                opacity: isExpanded ? 1 : 0,
              }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : springPresets.gentle
              }
              style={{ overflow: 'hidden' }}
              className="mt-2 space-y-2"
            >
              {task.goal && (
                <div className="text-xs text-text-secondary">
                  <span className="font-medium">Goal:</span> {task.goal}
                </div>
              )}
              {task.description && (
                <div className="text-xs text-text-secondary">
                  <span className="font-medium">Description:</span> {task.description}
                </div>
              )}
              {task.result && (
                <div className="text-xs text-text-primary bg-surface/50 rounded p-2">
                  <span className="font-medium">Result:</span> {task.result}
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Expand indicator */}
        {hasDetails && (
          <motion.div
            className="flex-shrink-0 text-text-tertiary text-xs mt-0.5"
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2 }}
          >
            ›
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
