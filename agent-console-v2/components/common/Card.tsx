'use client'

/**
 * Card Component with Magnetic Hover
 * 
 * Card with magnetic hover effects and multiple variants.
 * Follows cursor within bounds for organic, playful interaction.
 * 
 * Design Philosophy:
 * - Generous spacing for breathing room
 * - Subtle depth through shadows and borders
 * - Magnetic hover for delightful interaction
 */

import { motion } from 'framer-motion'
import { HTMLAttributes, ReactNode, useState, MouseEvent } from 'react'
import { cn } from '@/lib/utils'
import { springPresets } from '@/lib/constants/animations'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'glass'
  padding?: 'sm' | 'md' | 'lg'
  hoverable?: boolean
  magnetic?: boolean
  children: ReactNode
}

export function Card({
  variant = 'default',
  padding = 'md',
  hoverable = false,
  magnetic = false,
  className,
  children,
  ...props
}: CardProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })

  // Variant styles with STRONGER depth and shadows
  const variantStyles = {
    default: 'bg-surface border-none shadow-md',
    elevated: 'bg-surface shadow-xl hover:shadow-2xl transition-shadow duration-300',
    outlined: 'bg-transparent border-2 border-border-subtle hover:border-border-strong hover:shadow-lg',
    glass: 'bg-surface/80 backdrop-blur-xl border-2 border-border-subtle/50 hover:border-border-medium/50 shadow-xl',
  }

  // Padding styles
  const paddingStyles = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!magnetic) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2

    // STRONGER magnetic effect - limit to 20px (was 10px), strength 0.15 (was 0.1)
    const moveX = Math.max(-20, Math.min(20, x * 0.15))
    const moveY = Math.max(-20, Math.min(20, y * 0.15))

    setPosition({ x: moveX, y: moveY })
  }

  const handleMouseLeave = () => {
    if (magnetic) {
      setPosition({ x: 0, y: 0 })
    }
  }

  return (
    <motion.div
      className={cn(
        // Base styles
        'rounded-lg transition-all duration-300',
        // Variant and padding
        variantStyles[variant],
        paddingStyles[padding],
        // Hoverable cursor
        hoverable && 'cursor-pointer',
        className
      )}
      // Magnetic hover
      animate={magnetic ? { x: position.x, y: position.y } : undefined}
      // Hover lift with scale - MORE VISIBLE (y: -6px, scale: 1.02)
      whileHover={
        hoverable
          ? {
              y: -6,
              scale: 1.02,
              transition: { duration: 0.2 },
            }
          : undefined
      }
      // Tap effect - MORE OBVIOUS
      whileTap={
        hoverable
          ? {
              scale: 0.98,
              transition: { duration: 0.1 },
            }
          : undefined
      }
      transition={springPresets.default}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...(props as any)}
    >
      {children}
    </motion.div>
  )
}
