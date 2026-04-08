'use client'

/**
 * Stagger List Component
 * 
 * Animates list items with staggered timing.
 * Creates a cascading reveal effect.
 * 
 * Design Philosophy:
 * - Smooth sequential reveals
 * - Natural, organic timing
 * - Draws attention to content
 */

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { springPresets } from '@/lib/constants/animations'

export interface StaggerListProps {
  children: ReactNode[]
  staggerDelay?: number
  className?: string
  itemClassName?: string
  direction?: 'up' | 'down' | 'left' | 'right'
  once?: boolean
}

export function StaggerList({
  children,
  staggerDelay = 0.1,
  className,
  itemClassName,
  direction = 'up',
  once = true,
}: StaggerListProps) {
  const directionVariants = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 },
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  }

  const itemVariants = {
    hidden: {
      opacity: 0,
      ...directionVariants[direction],
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: springPresets.default,
    },
  }

  return (
    <motion.div
      className={cn('space-y-2', className)}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          className={itemClassName}
          variants={itemVariants}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

/**
 * Stagger Grid - For grid layouts
 */
export function StaggerGrid({
  children,
  staggerDelay = 0.05,
  className,
  columns = 2,
}: {
  children: ReactNode[]
  staggerDelay?: number
  className?: string
  columns?: number
}) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: springPresets.default,
    },
  }

  return (
    <motion.div
      className={cn(
        'grid gap-4',
        columns === 2 && 'grid-cols-2',
        columns === 3 && 'grid-cols-3',
        columns === 4 && 'grid-cols-4',
        className
      )}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {children.map((child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}
