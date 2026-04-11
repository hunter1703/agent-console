'use client'

/**
 * Skeleton Message Component
 * 
 * Loading placeholder for messages with shimmer effect.
 */

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'

export interface SkeletonMessageProps {
  sender?: 'user' | 'agent'
  className?: string
}

export function SkeletonMessage({
  sender = 'agent',
  className,
}: SkeletonMessageProps) {
  const { shouldAnimate } = useReducedMotion()
  const isUser = sender === 'user'

  return (
    <div className={cn('flex gap-3', className)}>
      {/* Avatar skeleton */}
      <motion.div
        animate={
          shouldAnimate
            ? {
                opacity: [0.4, 0.6, 0.4],
              }
            : {}
        }
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="flex-shrink-0 w-8 h-8 rounded-full bg-surface-elevated"
      />

      {/* Content skeleton */}
      <div className="flex-1 space-y-2">
        {/* Name skeleton */}
        <motion.div
          animate={
            shouldAnimate
              ? {
                  opacity: [0.4, 0.6, 0.4],
                }
              : {}
          }
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.1,
          }}
          className="h-4 w-24 bg-surface-elevated rounded"
        />

        {/* Message skeleton */}
        <div className="space-y-2">
          <motion.div
            animate={
              shouldAnimate
                ? {
                    opacity: [0.4, 0.6, 0.4],
                  }
                : {}
            }
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.2,
            }}
            className={cn(
              'h-4 bg-surface-elevated rounded',
              isUser ? 'w-3/4' : 'w-full'
            )}
          />
          <motion.div
            animate={
              shouldAnimate
                ? {
                    opacity: [0.4, 0.6, 0.4],
                  }
                : {}
            }
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.3,
            }}
            className={cn(
              'h-4 bg-surface-elevated rounded',
              isUser ? 'w-2/3' : 'w-5/6'
            )}
          />
        </div>
      </div>
    </div>
  )
}
