'use client'

/**
 * Text Reveal Component
 * 
 * Character-by-character text reveal animation.
 * Inspired by unseen.co
 */

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'

export interface TextRevealProps {
  children: string
  delay?: number
  duration?: number
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
}

export function TextReveal({
  children,
  delay = 0,
  duration = 0.05,
  className,
  as: Component = 'span',
}: TextRevealProps) {
  const { shouldAnimate } = useReducedMotion()
  
  const chars = children.split('')

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: duration, delayChildren: delay },
    }),
  }

  const child = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        damping: 12,
        stiffness: 200,
      },
    },
  }

  if (!shouldAnimate) {
    return <Component className={className}>{children}</Component>
  }

  return (
    <motion.div
      className={cn('overflow-hidden', className)}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {chars.map((char, index) => (
        <motion.span
          key={index}
          variants={child}
          className="inline-block"
          style={{ display: char === ' ' ? 'inline' : 'inline-block' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.div>
  )
}
