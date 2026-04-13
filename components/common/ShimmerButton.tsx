'use client'

/**
 * Shimmer Button Component
 * 
 * Button with shimmer effect on hover.
 */

import { motion } from 'framer-motion'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export interface ShimmerButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

export function ShimmerButton({ children, onClick, className }: ShimmerButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.button
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className={cn(
        'relative overflow-hidden px-6 py-3 rounded-lg',
        'bg-primary text-white font-medium',
        'transition-all duration-200',
        'hover:shadow-lg',
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Content */}
      <span className="relative z-10">{children}</span>
      
      {/* Shimmer effect */}
      {isHovered && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          initial={{ translateX: '-100%' }}
          animate={{ translateX: '100%' }}
          transition={{
            duration: 0.6,
            ease: 'easeInOut',
          }}
        />
      )}
    </motion.button>
  )
}
