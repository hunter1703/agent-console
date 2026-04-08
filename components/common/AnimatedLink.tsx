'use client'

/**
 * Animated Link Component
 * 
 * Link with animated underline effect.
 * Microinteraction for better UX.
 * 
 * Design Philosophy:
 * - Clear hover feedback
 * - Smooth animation
 * - Elegant underline reveal
 */

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { springPresets } from '@/lib/constants/animations'

export interface AnimatedLinkProps {
  href?: string
  onClick?: () => void
  children: ReactNode
  className?: string
  underlineColor?: string
  external?: boolean
}

export function AnimatedLink({
  href,
  onClick,
  children,
  className,
  underlineColor = 'var(--color-primary)',
  external = false,
}: AnimatedLinkProps) {
  const Component = href ? 'a' : 'button'

  return (
    <Component
      href={href}
      onClick={onClick}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={cn(
        'relative inline-block group cursor-pointer',
        'text-text-primary hover:text-primary transition-colors',
        className
      )}
    >
      <motion.span
        className="relative"
        whileHover={{ x: 2 }}
        transition={springPresets.snappy}
      >
        {children}
      </motion.span>

      {/* Animated underline */}
      <motion.span
        className="absolute bottom-0 left-0 h-0.5 rounded-full"
        style={{ backgroundColor: underlineColor }}
        initial={{ width: 0 }}
        whileHover={{ width: '100%' }}
        transition={springPresets.snappy}
      />
    </Component>
  )
}

/**
 * Arrow Link - Link with animated arrow
 */
export function ArrowLink({
  href,
  onClick,
  children,
  className,
  direction = 'right',
}: {
  href?: string
  onClick?: () => void
  children: ReactNode
  className?: string
  direction?: 'left' | 'right' | 'up' | 'down'
}) {
  const arrows = {
    right: '→',
    left: '←',
    up: '↑',
    down: '↓',
  }

  const Component = href ? 'a' : 'button'

  return (
    <Component
      href={href}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 group cursor-pointer',
        'text-text-primary hover:text-primary transition-colors',
        className
      )}
    >
      {direction === 'left' && (
        <motion.span
          className="inline-block"
          initial={{ x: 0 }}
          whileHover={{ x: -4 }}
          transition={springPresets.snappy}
        >
          {arrows[direction]}
        </motion.span>
      )}

      <span>{children}</span>

      {(direction === 'right' || direction === 'up' || direction === 'down') && (
        <motion.span
          className="inline-block"
          initial={{ x: 0, y: 0 }}
          whileHover={{
            x: direction === 'right' ? 4 : 0,
            y: direction === 'down' ? 4 : direction === 'up' ? -4 : 0,
          }}
          transition={springPresets.snappy}
        >
          {arrows[direction]}
        </motion.span>
      )}
    </Component>
  )
}
