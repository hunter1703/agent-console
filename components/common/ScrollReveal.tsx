'use client'

/**
 * Scroll Reveal Component
 * 
 * Animates elements as they scroll into view.
 * Creates engaging scroll experiences.
 * 
 * Design Philosophy:
 * - Reveals content progressively
 * - Draws attention to new content
 * - Smooth, natural animations
 */

import { motion, useInView } from 'framer-motion'
import { ReactNode, useRef } from 'react'
import React from 'react'
import { cn } from '@/lib/utils'
import { springPresets } from '@/lib/constants/animations'

export interface ScrollRevealProps {
  children: ReactNode
  className?: string
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale'
  delay?: number
  once?: boolean
  amount?: number
}

export function ScrollReveal({
  children,
  className,
  direction = 'up',
  delay = 0,
  once = true,
  amount = 0.3,
}: ScrollRevealProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, amount })

  const variants = {
    up: {
      hidden: { opacity: 0, y: 50 },
      visible: { opacity: 1, y: 0 },
    },
    down: {
      hidden: { opacity: 0, y: -50 },
      visible: { opacity: 1, y: 0 },
    },
    left: {
      hidden: { opacity: 0, x: 50 },
      visible: { opacity: 1, x: 0 },
    },
    right: {
      hidden: { opacity: 0, x: -50 },
      visible: { opacity: 1, x: 0 },
    },
    scale: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1 },
    },
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants[direction]}
      transition={{
        ...springPresets.default,
        delay,
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Scroll Stagger - Stagger children as they scroll into view
 */
export function ScrollStagger({
  children,
  className,
  staggerDelay = 0.1,
  once = true,
}: {
  children: ReactNode
  className?: string
  staggerDelay?: number
  once?: boolean
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, amount: 0.2 })

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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: springPresets.default,
    },
  }

  // Convert children to array and filter out falsy values
  const childrenArray = React.Children.toArray(children).filter(Boolean)

  return (
    <motion.div
      ref={ref}
      className={cn('space-y-2', className)}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={containerVariants}
    >
      {childrenArray.map((child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}
