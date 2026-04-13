'use client'

/**
 * Toggle Switch Component
 * 
 * Animated toggle switch with smooth transitions.
 * Microinteraction with spring physics.
 * 
 * Design Philosophy:
 * - Clear on/off states
 * - Smooth spring animation
 * - Satisfying interaction
 */

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { springPresets } from '@/lib/constants/animations'

export interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  label?: string
  className?: string
}

export function Toggle({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  label,
  className,
}: ToggleProps) {
  const sizes = {
    sm: { track: 'w-8 h-4', thumb: 'w-3 h-3', translate: 16 },
    md: { track: 'w-11 h-6', thumb: 'w-5 h-5', translate: 20 },
    lg: { track: 'w-14 h-7', thumb: 'w-6 h-6', translate: 28 },
  }

  const { track, thumb, translate } = sizes[size]

  return (
    <label
      className={cn(
        'inline-flex items-center gap-3',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        className
      )}
    >
      <motion.button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'relative rounded-full transition-colors',
          track,
          disabled ? 'cursor-not-allowed' : 'cursor-pointer'
        )}
        animate={{
          backgroundColor: checked
            ? 'var(--color-primary)'
            : 'var(--color-border-medium)',
        }}
        whileTap={!disabled ? { scale: 0.95 } : undefined}
        transition={springPresets.snappy}
      >
        <motion.div
          className={cn(
            'absolute top-0.5 left-0.5 rounded-full bg-white shadow-md',
            thumb
          )}
          animate={{
            x: checked ? translate : 0,
          }}
          transition={springPresets.snappy}
        />
      </motion.button>

      {label && (
        <span className="text-sm font-medium text-text-primary select-none">
          {label}
        </span>
      )}
    </label>
  )
}
