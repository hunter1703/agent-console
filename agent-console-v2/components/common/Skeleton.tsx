'use client'

/**
 * Skeleton Loading Components
 * 
 * Skeleton screens for better loading states.
 * Provides visual feedback while content loads.
 * 
 * Design Philosophy:
 * - Better UX than spinners
 * - Matches content structure
 * - Smooth pulse animation
 */

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface SkeletonProps {
  className?: string
  animate?: boolean
}

export function Skeleton({ className, animate = true }: SkeletonProps) {
  return (
    <motion.div
      className={cn('bg-surface rounded', className)}
      animate={animate ? { opacity: [0.5, 1, 0.5] } : undefined}
      transition={
        animate
          ? {
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }
          : undefined
      }
    />
  )
}

/**
 * Skeleton Card - For agent/session cards
 */
export function SkeletonCard() {
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  )
}

/**
 * Skeleton Message - For chat messages
 */
export function SkeletonMessage({ isUser = false }: { isUser?: boolean }) {
  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2 max-w-[70%]">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
      </div>
    </div>
  )
}

/**
 * Skeleton List - For lists of items
 */
export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

/**
 * Skeleton Text - For text content
 */
export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 ? 'w-2/3' : 'w-full'
          )}
        />
      ))}
    </div>
  )
}
