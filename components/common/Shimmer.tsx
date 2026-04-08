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

/**
 * Shimmer Card - Card with shimmer effect
 */
export function ShimmerCard({ children }: { children: ReactNode }) {
  return (
    <Shimmer className="rounded-lg">
      <div className="bg-surface p-4">{children}</div>
    </Shimmer>
  )
}

/**
 * Shimmer Button - Button with shimmer on hover
 */
export function ShimmerButton({
  children,
  onClick,
  className,
}: {
  children: ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative overflow-hidden',
        'px-6 py-2 rounded-md',
        'bg-primary text-white',
        className
      )}
    >
      <span className="relative z-10">{children}</span>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.6 }}
      />
    </button>
  )
}
