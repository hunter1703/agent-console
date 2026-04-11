'use client'

import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Glass } from '@/components/liquid-glass/Glass'
import { glassBuilder } from '@/lib/liquid-glass/builder'
import { IconButton } from './Button'
import { cn } from '@/lib/utils/cn'

// ============================================================================
// TYPES
// ============================================================================

export interface ModalProps {
  /**
   * Open state
   */
  open: boolean
  
  /**
   * Close handler
   */
  onClose: () => void
  
  /**
   * Modal title
   */
  title?: string
  
  /**
   * Modal content
   */
  children: React.ReactNode
  
  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  
  /**
   * Show close button
   */
  showClose?: boolean
  
  /**
   * Close on backdrop click
   */
  closeOnBackdrop?: boolean
  
  /**
   * Close on escape key
   */
  closeOnEscape?: boolean
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Modal - Modal dialog
 * 
 * Features:
 * - Liquid morph open/close animation
 * - Backdrop blur
 * - Focus trap
 * - Glass surface
 * - Multiple sizes
 * 
 * @example
 * ```tsx
 * <Modal 
 *   open={isOpen} 
 *   onClose={() => setIsOpen(false)}
 *   title="Confirm Action"
 * >
 *   <p>Are you sure?</p>
 * </Modal>
 * ```
 */
export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  size = 'md',
  showClose = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
}) => {
  // Build configuration
  const config = React.useMemo(() => {
    return glassBuilder()
      .preset('frosted', 'heavy')
      .fill('rgba(0, 0, 0, 0.6)')
      .radius(16)
      .shadow('hard')
      .withBorder({
        highlight: {
          topLeft: 'rgba(255, 255, 255, 0.2)',
          bottomRight: 'rgba(255, 255, 255, 0.1)',
        },
      })
      .accessible()
      .optimized()
      .build()
  }, [])
  
  // Size styles
  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full m-4',
  }
  
  // Handle escape key
  useEffect(() => {
    if (!open || !closeOnEscape) return
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, closeOnEscape, onClose])
  
  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [open])
  
  if (typeof document === 'undefined') return null
  
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeOnBackdrop ? onClose : undefined}
          />
          
          {/* Modal */}
          <motion.div
            className={cn('relative w-full', sizeStyles[size])}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
          >
            <Glass config={config} className="relative p-6">
              {/* Header */}
              {(title || showClose) && (
                <div className="flex items-center justify-between mb-4">
                  {title && (
                    <h2 className="text-2xl font-semibold text-white">
                      {title}
                    </h2>
                  )}
                  {showClose && (
                    <IconButton
                      variant="ghost"
                      size="sm"
                      icon={<X className="h-5 w-5" />}
                      onClick={onClose}
                      aria-label="Close"
                    />
                  )}
                </div>
              )}
              
              {/* Content */}
              <div className="text-white/90">
                {children}
              </div>
            </Glass>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

Modal.displayName = 'Modal'
