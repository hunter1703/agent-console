'use client'

/**
 * useToast Hook
 * 
 * Hook for managing toast notifications.
 * Provides methods to show and dismiss toasts.
 */

import { useState, useCallback } from 'react'
import { ToastProps, ToastVariant } from '@/components/common/Toast'

let toastId = 0

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const showToast = useCallback(
    (variant: ToastVariant, message: string, duration?: number) => {
      const id = `toast-${toastId++}`
      
      const toast: ToastProps = {
        id,
        variant,
        message,
        duration,
        onClose: () => dismissToast(id),
      }

      setToasts((prev) => [...prev, toast])
      return id
    },
    []
  )

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const dismissAll = useCallback(() => {
    setToasts([])
  }, [])

  // Convenience methods
  const success = useCallback(
    (message: string, duration?: number) => showToast('success', message, duration),
    [showToast]
  )

  const error = useCallback(
    (message: string, duration?: number) => showToast('error', message, duration),
    [showToast]
  )

  const warning = useCallback(
    (message: string, duration?: number) => showToast('warning', message, duration),
    [showToast]
  )

  const info = useCallback(
    (message: string, duration?: number) => showToast('info', message, duration),
    [showToast]
  )

  return {
    toasts,
    showToast,
    dismissToast,
    dismissAll,
    success,
    error,
    warning,
    info,
  }
}
