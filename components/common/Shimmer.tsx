'use client'

/**
 * Shimmer Effect Component
 * 
 * Adds a shimmer/shine effect to loading content.
 * Creates a moving gradient that suggests content is loading.
 * 
 * Design Philosophy:
 * - Subtle loading indicator
 * - Premium feel
 * - Non-intrusive
 */

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface ShimmerProps {
  children: ReactNode
  className?: string
  duration?: number
  direction?: 'left-to-right' | 'top-to-bottom'
}

export function Shimmer({
  children,
  className,
  duration = 1.5,
  direction = 'left-to-right',
}: ShimmerProps) {
  const isHorizontal = direction === 'left-to-right'

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {children}
      <motion.div
        className={cn(
          'absolute inset-0 pointer-events-none',
          'bg-gradient-to-r from-transparent via-white/10 to-transparent'
        )}
        style={{
          backgroundImage: isHorizontal
            ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)'
            : 'linear-gradient(180deg, transparent, rgba(255,255,255,0.1), transparent)',
        }}
        animate={
          isHorizontal
            ? { x: ['-100%', '100%'] }
            : { y: ['-100%', '100%'] }
        }
        transition={{
          duration,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  )
}

