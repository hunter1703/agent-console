'use client'

/**
 * Shimmer Card Component
 * 
 * Card with shimmer loading effect overlay.
 */

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface ShimmerCardProps {
  children: React.ReactNode
  className?: string
}

export function ShimmerCard({ children, className }: ShimmerCardProps) {
  return (
    <div className={cn('relative overflow-hidden rounded-xl border border-border bg-surface p-6', className)}>
      {/* Content */}
      <div className="relative z-10">{children}</div>
      
      {/* Shimmer overlay */}
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{
          translateX: ['100%', '100%'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  )
}
