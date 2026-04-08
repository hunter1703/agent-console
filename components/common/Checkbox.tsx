'use client'

/**
 * Checkbox Component
 * 
 * Animated checkbox with checkmark animation.
 * Microinteraction with spring physics.
 * 
 * Design Philosophy:
 * - Clear checked/unchecked states
 * - Smooth checkmark animation
 * - Satisfying interaction
 */

import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { springPresets } from '@/lib/constants/animations'

export interface CheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  label?: string
  className?: string
}

export function Checkbox({
  checked,
  onChange,
  disabled = false,
  label,
  className,
}: CheckboxProps) {
  return (
    <label
      className={cn(
        'inline-flex items-center gap-2',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        className
      )}
    >
      <motion.button
        type="button"
        role="checkbox"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'relative w-5 h-5 rounded border-2 transition-colors',
          checked
            ? 'bg-primary border-primary'
            : 'bg-transparent border-border-medium hover:border-border-strong',
          disabled && 'cursor-not-allowed'
        )}
        whileTap={!disabled ? { scale: 0.9 } : undefined}
        transition={springPresets.snappy}
      >
        <AnimatePresence>
          {checked && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={springPresets.bouncy}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Check size={14} className="text-white" strokeWidth={3} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {label && (
        <span className="text-sm font-medium text-text-primary select-none">
          {label}
        </span>
      )}
    </label>
  )
}

/**
 * Radio Button Component
 */
export interface RadioProps {
  checked: boolean
  onChange: () => void
  disabled?: boolean
  label?: string
  className?: string
}

export function Radio({
  checked,
  onChange,
  disabled = false,
  label,
  className,
}: RadioProps) {
  return (
    <label
      className={cn(
        'inline-flex items-center gap-2',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        className
      )}
    >
      <motion.button
        type="button"
        role="radio"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange()}
        className={cn(
          'relative w-5 h-5 rounded-full border-2 transition-colors',
          checked
            ? 'border-primary'
            : 'border-border-medium hover:border-border-strong',
          disabled && 'cursor-not-allowed'
        )}
        whileTap={!disabled ? { scale: 0.9 } : undefined}
        transition={springPresets.snappy}
      >
        <AnimatePresence>
          {checked && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={springPresets.bouncy}
              className="absolute inset-1 rounded-full bg-primary"
            />
          )}
        </AnimatePresence>
      </motion.button>

      {label && (
        <span className="text-sm font-medium text-text-primary select-none">
          {label}
        </span>
      )}
    </label>
  )
}
