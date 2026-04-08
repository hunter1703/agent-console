'use client'

/**
 * Liquid Button Component
 * 
 * Button with liquid morphing animations and all variants.
 * Implements squash & stretch principle and magnetic hover effects.
 * 
 * Design Philosophy:
 * - Immediate feedback through animations
 * - Smooth motion with spring physics
 * - Restrained elegance in color usage
 * 
 * Enhanced Features:
 * - MORE visible hover animations (scale 1.05, y: -4px)
 * - Liquid SVG border morphing
 * - Dual-layer text for slide animations
 * - Stronger magnetic pull (0.3 strength)
 * - Glow effects on hover
 */

import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { ButtonHTMLAttributes, ReactNode, forwardRef, useState, MouseEvent } from 'react'
import { cn } from '@/lib/utils'
import { springPresets } from '@/lib/constants/animations'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  magnetic?: boolean
  liquidBorder?: boolean // Enable liquid SVG border morphing
  children: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      magnetic = false,
      liquidBorder = false,
      disabled,
      className,
      children,
      onMouseMove,
      onMouseLeave,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading
    const [magneticOffset, setMagneticOffset] = useState({ x: 0, y: 0 })
    const [isHovered, setIsHovered] = useState(false)

    const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
      if (magnetic && !isDisabled) {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left - rect.width / 2
        const y = e.clientY - rect.top - rect.height / 2

        // STRONGER magnetic pull with 0.3 strength (was 0.15)
        const moveX = x * 0.3
        const moveY = y * 0.3

        setMagneticOffset({ x: moveX, y: moveY })
      }
      onMouseMove?.(e)
    }

    const handleMouseEnter = () => {
      setIsHovered(true)
    }

    const handleMouseLeave = (e: MouseEvent<HTMLButtonElement>) => {
      if (magnetic) {
        setMagneticOffset({ x: 0, y: 0 })
      }
      setIsHovered(false)
      onMouseLeave?.(e)
    }

    // Variant styles
    const variantStyles = {
      primary: 'bg-warning text-white font-semibold',
      secondary: 'bg-transparent border border-border-medium text-text-primary hover:bg-surface-hover hover:border-border-strong',
      ghost: 'bg-transparent text-text-secondary hover:bg-surface-hover hover:text-text-primary',
      danger: 'bg-error text-white font-semibold',
    }

    // Size styles — pill-shaped (rounded-full) to match brand aesthetic
    const sizeStyles = {
      sm: 'h-9 px-4 text-sm rounded-full',
      md: 'h-11 px-5 text-sm rounded-2xl',
      lg: 'h-13 px-8 text-base rounded-2xl',
    }

    // Glow colors per variant
    const glowColors = {
      primary: 'rgba(245, 158, 11, 0.45)',
      secondary: 'rgba(0, 0, 0, 0.08)',
      ghost: 'rgba(0, 0, 0, 0.04)',
      danger: 'rgba(239, 68, 68, 0.45)',
    }

    // Resting shadow per variant
    const restingShadow = {
      primary: '0 2px 8px rgba(245, 158, 11, 0.25)',
      secondary: '0 1px 3px rgba(0,0,0,0.06)',
      ghost: 'none',
      danger: '0 2px 8px rgba(239, 68, 68, 0.25)',
    }

    return (
      <motion.button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          // Base styles
          'relative inline-flex items-center justify-center gap-2',
          'font-medium tracking-tight',
          'transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          isDisabled ? 'cursor-not-allowed' : 'cursor-pointer',
          isDisabled && 'opacity-40 grayscale',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        // Magnetic pull
        animate={
          magnetic && !isDisabled
            ? {
                x: magneticOffset.x,
                y: magneticOffset.y,
              }
            : undefined
        }
        // Squash & stretch on press - MORE OBVIOUS
        whileTap={
          !isDisabled
            ? {
                scaleY: 0.92,
                scaleX: 1.04,
                transition: { duration: 0.1 },
              }
            : undefined
        }
        // Hover effects - MUCH MORE VISIBLE (scale 1.05, y: -4px)
        whileHover={
          !isDisabled
            ? {
                scale: 1.05,
                y: -4,
                transition: { duration: 0.2 },
              }
            : undefined
        }
        transition={springPresets.snappy}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          boxShadow: isDisabled
            ? 'none'
            : isHovered
            ? `0 8px 28px ${glowColors[variant]}, 0 3px 10px rgba(0,0,0,0.12)`
            : restingShadow[variant],
        }}
        {...(props as any)}
      >
        {/* Liquid SVG border morphing (optional) */}
        {liquidBorder && !isDisabled && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 1 }}
          >
            <motion.rect
              x="1"
              y="1"
              width="calc(100% - 2px)"
              height="calc(100% - 2px)"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              rx="12"
              animate={{
                rx: isHovered ? [12, 8, 16, 12] : 12,
                ry: isHovered ? [12, 16, 8, 12] : 12,
              }}
              transition={{
                duration: 1.5,
                repeat: isHovered ? Infinity : 0,
                ease: 'easeInOut',
              }}
            />
          </svg>
        )}

        {/* Content wrapper - moves as a unit on hover */}
        <span className="relative z-10 flex items-center gap-2">
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              <Loader2 size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
            </motion.div>
          ) : (
            <>
              {icon && iconPosition === 'left' && icon}
              {children}
              {icon && iconPosition === 'right' && icon}
            </>
          )}
        </span>
      </motion.button>
    )
  }
)

Button.displayName = 'Button'
