'use client'

/**
 * Icon Component
 * 
 * Wrapper for Lucide React icons with consistent sizing and animations.
 * All icons use 2px stroke width for visual consistency.
 * 
 * Design Philosophy:
 * - Consistent sizing across the application
 * - Optional animations for interactive icons
 * - Semantic color usage
 */

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { icons, iconSizes, IconName, IconSize } from '@/lib/constants/icons'
import { springPresets } from '@/lib/constants/animations'

export interface IconProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  name: IconName
  size?: IconSize
  color?: string
  animate?: 'spin' | 'pulse' | 'bounce' | 'hover' | 'none'
}

export function Icon({
  name,
  size = 'md',
  color,
  animate = 'none',
  className,
  ...props
}: IconProps) {
  const IconComponent = icons[name] as LucideIcon
  const sizeValue = iconSizes[size]

  // Animation variants
  const animations = {
    spin: {
      animate: { rotate: 360 },
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'linear' as const,
      },
    },
    pulse: {
      animate: {
        scale: [1, 1.2, 1],
        opacity: [1, 0.8, 1],
      },
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    },
    bounce: {
      animate: {
        y: [0, -4, 0],
      },
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    },
    hover: {
      whileHover: { scale: 1.1, rotate: 5 },
      transition: springPresets.snappy,
    },
    none: {},
  }

  const animationProps = animations[animate]

  return (
    <motion.div
      className={cn('inline-flex items-center justify-center', className)}
      {...animationProps}
      {...(props as any)}
    >
      <IconComponent
        size={sizeValue}
        color={color || 'currentColor'}
        strokeWidth={2}
      />
    </motion.div>
  )
}

// Export icon names for convenience
export { icons, type IconName }
