'use client'

/**
 * Liquid Modal Component
 * 
 * Modal with liquid morphing entrance animation and focus trap.
 * Morphs from trigger button position to full modal.
 * 
 * Design Philosophy:
 * - Smooth, organic entrance animation
 * - Focus management for accessibility
 * - Backdrop blur for depth
 * - Escape and outside click to close
 */

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { ReactNode, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { springPresets } from '@/lib/constants/animations'
import { Button } from './Button'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  closeOnOutsideClick?: boolean
  closeOnEscape?: boolean
  triggerRef?: React.RefObject<HTMLElement>
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnOutsideClick = true,
  closeOnEscape = true,
  triggerRef,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const [origin, setOrigin] = useState({ x: 0, y: 0 })

  // Size styles
  const sizeStyles = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  }

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, closeOnEscape, onClose])

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Calculate origin from trigger button
      if (triggerRef?.current) {
        const rect = triggerRef.current.getBoundingClientRect()
        setOrigin({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        })
      } else {
        // Default to center of screen
        setOrigin({
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
        })
      }
      
      // Store current focus
      previousFocusRef.current = document.activeElement as HTMLElement
      
      // Focus modal
      setTimeout(() => {
        modalRef.current?.focus()
      }, 100)

      // Prevent body scroll
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = `${scrollbarWidth}px`
    } else {
      // Restore focus
      previousFocusRef.current?.focus()
      
      // Restore body scroll
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }

    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  }, [isOpen, triggerRef])

  // Focus trap
  useEffect(() => {
    if (!isOpen) return

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )

      if (!focusableElements || focusableElements.length === 0) return

      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    document.addEventListener('keydown', handleTab)
    return () => document.removeEventListener('keydown', handleTab)
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-overlay backdrop-blur-sm"
            onClick={closeOnOutsideClick ? onClose : undefined}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              ref={modalRef}
              initial={{
                opacity: 0,
                scale: 0,
                x: origin.x - window.innerWidth / 2,
                y: origin.y - window.innerHeight / 2,
                borderRadius: '50%',
              }}
              animate={{
                opacity: 1,
                scale: 1,
                x: 0,
                y: 0,
                borderRadius: '16px',
              }}
              exit={{
                opacity: 0,
                scale: 0,
                x: origin.x - window.innerWidth / 2,
                y: origin.y - window.innerHeight / 2,
                borderRadius: '50%',
              }}
              transition={springPresets.default}
              className={cn(
                'relative w-full bg-surface-elevated rounded-lg shadow-xl',
                'pointer-events-auto',
                'max-h-[90vh] flex flex-col',
                sizeStyles[size]
              )}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              tabIndex={-1}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border-subtle">
                <h2
                  id="modal-title"
                  className="text-xl font-semibold text-text-primary"
                >
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6">
                {children}
              </div>

              {/* Footer */}
              {footer && (
                <div className="flex items-center justify-end gap-3 p-6 border-t border-border-subtle">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
