'use client'

/**
 * Toast Component
 * 
 * Toast notification with auto-dismiss and stacking.
 * Slides in from top-right with spring physics.
 * 
 * Design Philosophy:
 * - Non-intrusive notifications
 * - Clear visual feedback
 * - Auto-dismiss with progress indicator
 * - Stack multiple toasts
 */

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'
import { ReactNode, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { springPresets } from '@/lib/constants/animations'

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

export interface ToastProps {
  id: string
  variant: ToastVariant
  message: string
  duration?: number
  onClose: () => void
}

const variantConfig = {
  success: {
    icon: CheckCircle,
    color: 'text-success',
    bg: 'bg-success/10',
    border: 'border-success/20',
  },
  error: {
    icon: XCircle,
    color: 'text-error',
    bg: 'bg-error/10',
    border: 'border-error/20',
  },
  warning: {
    icon: AlertCircle,
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/20',
  },
  info: {
    icon: Info,
    color: 'text-info',
    bg: 'bg-info/10',
    border: 'border-info/20',
  },
}

export function Toast({
  id,
  variant,
  message,
  duration = 3000,
  onClose,
}: ToastProps) {
  const [progress, setProgress] = useState(100)
  const config = variantConfig[variant]
  const Icon = config.icon

  useEffect(() => {
    // Auto-dismiss timer
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    // Progress animation
    const startTime = Date.now()
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
      setProgress(remaining)
    }, 16) // ~60fps

    return () => {
      clearTimeout(timer)
      clearInterval(progressInterval)
    }
  }, [duration, onClose])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, x: 20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={springPresets.default}
      className={cn(
        'relative w-full max-w-sm rounded-lg shadow-lg border',
        'bg-surface overflow-hidden',
        config.border
      )}
    >
      {/* Progress bar */}
      <motion.div
        className={cn('absolute top-0 left-0 h-1', config.bg)}
        initial={{ width: '100%' }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.1, ease: 'linear' }}
      />

      {/* Content */}
      <div className="flex items-start gap-3 p-4 pt-5">
        <Icon size={20} className={cn('flex-shrink-0 mt-0.5', config.color)} />
        
        <p className="flex-1 text-sm text-text-primary">
          {message}
        </p>

        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
          aria-label="Close notification"
        >
          <X size={16} />
        </button>
      </div>
    </motion.div>
  )
}

// Toast Container
export interface ToastContainerProps {
  toasts: ToastProps[]
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  maxToasts?: number
}

export function ToastContainer({
  toasts,
  position = 'top-right',
  maxToasts = 3,
}: ToastContainerProps) {
  const positionStyles = {
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
  }

  // Limit number of visible toasts
  const visibleToasts = toasts.slice(0, maxToasts)

  return (
    <div
      className={cn(
        'fixed z-50 flex flex-col gap-2',
        'pointer-events-none',
        positionStyles[position]
      )}
    >
      <AnimatePresence mode="popLayout">
        {visibleToasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast {...toast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}
