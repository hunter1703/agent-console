'use client'

/**
 * Page Transition Component
 * 
 * Smooth transitions between views/pages.
 * Provides visual continuity during navigation.
 * 
 * Design Philosophy:
 * - Smooth, seamless transitions
 * - Clear visual feedback
 * - Non-disruptive
 */

import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface PageTransitionProps {
  children: ReactNode
  pageKey: string | number
  className?: string
  type?: 'fade' | 'slide' | 'scale' | 'slideUp' | 'slideDown'
  duration?: number
}

export function PageTransition({
  children,
  pageKey,
  className,
  type = 'slide',
  duration = 0.3,
}: PageTransitionProps) {
  const transitions = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    slide: {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 },
    },
    slideUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
    },
    slideDown: {
      initial: { opacity: 0, y: -20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 20 },
    },
    scale: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
    },
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pageKey}
        className={className}
        initial={transitions[type].initial}
        animate={transitions[type].animate}
        exit={transitions[type].exit}
        transition={{
          duration,
          ease: 'easeInOut',
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

/**
 * View Switcher - For switching between different views
 */
export function ViewSwitcher({
  currentView,
  views,
  className,
}: {
  currentView: string
  views: Record<string, ReactNode>
  className?: string
}) {
  return (
    <PageTransition pageKey={currentView} className={className}>
      {views[currentView]}
    </PageTransition>
  )
}
