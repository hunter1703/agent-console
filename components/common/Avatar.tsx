'use client'

/**
 * Avatar Component
 * 
 * Avatar with fallback to initials and colored backgrounds.
 * Supports user and agent variants with different styling.
 * 
 * Design Philosophy:
 * - Clear visual distinction between user and agent
 * - Fallback to initials maintains visual consistency
 * - Subtle hover animation for interactive avatars
 */

import { motion } from 'framer-motion'
import { HTMLAttributes } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { springPresets } from '@/lib/constants/animations'

export interface AvatarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  name: string
  src?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'user' | 'agent'
  interactive?: boolean
}

export function Avatar({
  name,
  src,
  size = 'md',
  variant = 'user',
  interactive = false,
  className,
  ...props
}: AvatarProps) {
  // Size styles
  const sizeStyles = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  }

  // Variant styles
  const variantStyles = {
    user: 'bg-gradient-to-br from-primary to-secondary text-white',
    agent: 'bg-surface border border-border-medium text-text-primary',
  }

  // Get initials from name
  const getInitials = (name: string): string => {
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.slice(0, 1).toUpperCase()
  }

  const initials = getInitials(name)

  // Size dimensions for Next.js Image
  const sizeDimensions = {
    sm: 32,
    md: 40,
    lg: 48,
  }

  const content = src ? (
    <Image
      src={src}
      alt={name}
      width={sizeDimensions[size]}
      height={sizeDimensions[size]}
      className="w-full h-full object-cover"
      loading="lazy"
      quality={85}
    />
  ) : (
    <span>{initials}</span>
  )

  if (interactive) {
    return (
      <motion.div
        className={cn(
          // Base styles
          'relative inline-flex items-center justify-center',
          'rounded-full font-semibold select-none',
          'overflow-hidden transition-all duration-200',
          // Size and variant
          sizeStyles[size],
          !src && variantStyles[variant],
          // Interactive cursor and shadow
          'cursor-pointer hover:shadow-lg',
          className
        )}
        whileHover={{
          scale: 1.1,
          rotate: [0, -5, 5, 0],
          transition: { duration: 0.3 },
        }}
        whileTap={{
          scale: 0.95,
          transition: { duration: 0.1 },
        }}
        transition={springPresets.snappy}
        {...(props as any)}
      >
        {content}
      </motion.div>
    )
  }

  return (
    <div
      className={cn(
        // Base styles
        'relative inline-flex items-center justify-center',
        'rounded-full font-semibold select-none',
        'overflow-hidden transition-all duration-200',
        // Size and variant
        sizeStyles[size],
        !src && variantStyles[variant],
        className
      )}
      {...props}
    >
      {content}
    </div>
  )
}
