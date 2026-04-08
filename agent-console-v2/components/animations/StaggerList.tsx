'use client'

/**
 * Stagger List Animation Component
 * 
 * Animates list items with staggered timing for organic appearance.
 * Perfect for agent lists, session lists, message lists.
 */

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { springPresets } from '@/lib/constants/animations'

export interface StaggerListProps {
  children: ReactNode[]
  stagger?: number // Delay between items (seconds)
  className?: string
  direction?: 'up' | 'down' | 'left' | 'right'
  distance?: number // Distance to travel (px)
}

export function StaggerList({
  children,
  stagger = 0.1,
  className,
  direction = 'up',
  distance = 20,
}: StaggerListProps) {
  const directionMap = {
    up: { x: 0, y: distance },
    down: { x: 0, y: -distance },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
  }

  const offset = directionMap[direction]

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: stagger,
          },
        },
      }}
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: {
              opacity: 0,
              x: offset.x,
              y: offset.y,
            },
            visible: {
              opacity: 1,
              x: 0,
              y: 0,
            },
          }}
          transition={springPresets.default}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}
