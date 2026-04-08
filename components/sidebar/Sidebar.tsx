'use client'

/**
 * Sidebar Component
 * 
 * Main sidebar with responsive behavior and smooth animations.
 * Fixed 280px width on desktop, collapsible to 64px icon-only mode.
 * Slide-in overlay on mobile with backdrop blur.
 * 
 * Design Philosophy:
 * - Restrained elegance with generous spacing
 * - Smooth transitions with spring physics
 * - Immediate feedback on all interactions
 */

import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, ChevronLeft } from 'lucide-react'
import { ReactNode, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { springPresets, sidebarSlideIn, sidebarMobileSlide, slideRight } from '@/lib/constants/animations'
import { LAYOUT } from '@/lib/constants/spacing'
import { useMediaQuery } from '@/lib/hooks/useMediaQuery'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'

export interface SidebarProps {
  isOpen: boolean
  isCollapsed?: boolean
  onClose: () => void
  onToggleCollapse?: () => void
  header?: ReactNode
  footer?: ReactNode
  children: ReactNode
  className?: string
}

export function Sidebar({
  isOpen,
  isCollapsed = false,
  onClose,
  onToggleCollapse,
  header,
  footer,
  children,
  className,
}: SidebarProps) {
  const isMobile = useMediaQuery('(max-width: 767px)')
  const { shouldAnimate } = useReducedMotion()

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isMobile && isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = `${scrollbarWidth}px`
    } else {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }

    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  }, [isMobile, isOpen])

  // Handle swipe gesture to close (mobile)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return
    const touch = e.touches[0]
    const startX = touch.clientX
    
    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0]
      const deltaX = touch.clientX - startX
      
      // Swipe right to close (threshold: 50px)
      if (deltaX > 50) {
        onClose()
        document.removeEventListener('touchmove', handleTouchMove)
      }
    }
    
    document.addEventListener('touchmove', handleTouchMove, { passive: true })
    document.addEventListener('touchend', () => {
      document.removeEventListener('touchmove', handleTouchMove)
    }, { once: true })
  }

  // Desktop: always visible, collapsible
  // Mobile: overlay with backdrop
  const sidebarWidth = isCollapsed ? 0 : LAYOUT.sidebar.width

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && (
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: shouldAnimate ? 0.2 : 0 }}
              className="fixed inset-0 z-40 bg-overlay backdrop-blur-sm"
              onClick={onClose}
            />
          )}
        </AnimatePresence>
      )}

      {/* Floating Expand Button (desktop only, when collapsed) */}
      {!isMobile && isCollapsed && onToggleCollapse && (
        <motion.button
          variants={slideRight}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={shouldAnimate ? springPresets.snappy : { duration: 0 }}
          onClick={onToggleCollapse}
          className={cn(
            'fixed left-4 top-4 z-50 p-3 rounded-xl',
            'bg-surface border-2 border-border-subtle shadow-xl',
            'text-text-secondary hover:text-text-primary',
            'hover:bg-surface-elevated hover:shadow-2xl hover:scale-110',
            'transition-all duration-200 cursor-pointer'
          )}
          aria-label="Expand sidebar"
        >
          <ChevronRight size={20} />
        </motion.button>
      )}

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {!isCollapsed && (isOpen || !isMobile) && (
          <motion.aside
            variants={isMobile ? sidebarMobileSlide(LAYOUT.sidebar.width) : sidebarSlideIn}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={
              shouldAnimate 
                ? { ...springPresets.snappy, duration: 0.3 }
                : { duration: 0 }
            }
            onTouchStart={handleTouchStart}
            className={cn(
              'flex flex-col bg-surface border-r border-border-subtle',
              'h-screen',
              // Mobile: fixed overlay
              isMobile && 'fixed left-0 top-0 z-50',
              // Desktop: static
              !isMobile && 'relative',
              className
            )}
            style={{
              width: LAYOUT.sidebar.width,
              overflow: 'hidden', // Prevent text overflow
            }}
          >
            {/* Collapse button (desktop only) */}
            {!isMobile && onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className={cn(
                  'absolute top-4 right-4 z-20 p-2 rounded-lg',
                  'bg-surface-hover border border-border-subtle',
                  'text-text-secondary hover:text-text-primary',
                  'hover:bg-surface-elevated hover:shadow-md',
                  'transition-all duration-200 cursor-pointer'
                )}
                aria-label="Collapse sidebar"
              >
                <ChevronLeft size={16} />
              </button>
            )}

            {/* Header */}
            {header && (
              <div className="flex-shrink-0 border-b border-border-subtle p-4 pt-16">
                {header}
              </div>
            )}

            {/* Close button (mobile only) */}
            {isMobile && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors z-10 cursor-pointer"
                aria-label="Close sidebar"
              >
                <X size={20} />
              </button>
            )}

            {/* Content area (scrollable) */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="flex-shrink-0 border-t border-border-subtle p-4">
                {footer}
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}
