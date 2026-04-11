'use client'

/**
 * Shimmer Effect Component
 * 
 * Adds animated shimmer effect to loading states or hover interactions.
 * Can be used as overlay or standalone loading indicator.
 */

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'

export interface ShimmerEffectProps {
  children?: ReactNode
  className?: string
  duration?: number
  direction?: 'horizontal' | 'vertical'
  trigger?: 'always' | 'hover'
}

export function ShimmerEffect({
  children,
  className,
  duration = 1.5,
  direction = 'horizontal',
  trigger = 'always',
}: ShimmerEffectProps) {
  const { shouldAnimate } = useReducedMotion()

  const animationProps =
    direction === 'horizontal'
      ? { x: ['-100%', '200%'] }
      : { y: ['-100%', '200%'] }

  const shimmer = (
    <motion.div
      animate={shouldAnimate ? animationProps : {}}
      transition={{
        duration,
        repeat: trigger === 'always' ? Infinity : 0,
        ease: 'linear',
      }}
      className={cn(
        'absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none',
        direction === 'vertical' && 'bg-gradient-to-b'
      )}
      style={{ transform: 'skewX(-20deg)' }}
    />
  )

  if (!children) {
    return shimmer
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {children}
      {trigger === 'always' && shimmer}
      {trigger === 'hover' && (
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute inset-0"
        >
          {shimmer}
        </motion.div>
      )}
    </div>
  )
}
