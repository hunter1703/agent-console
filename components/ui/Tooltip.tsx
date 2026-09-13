'use client'

import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Glass } from '@/components/liquid-glass/Glass'
import { glassBuilder } from '@/lib/liquid-glass/builder'
import { cn } from '@/lib/utils/cn'

// ============================================================================
// TYPES
// ============================================================================

export interface TooltipProps {
  /**
   * Tooltip content
   */
  content: React.ReactNode
  
  /**
   * Tooltip variant
   */
  variant?: 'plain' | 'rich'
  
  /**
   * Placement relative to trigger
   */
  placement?: 'top' | 'bottom' | 'left' | 'right'
  
  /**
   * Delay before showing (ms)
   */
  delay?: number
  
  /**
   * Children (trigger element)
   */
  children: React.ReactElement
  
  /**
   * Disabled state
   */
  disabled?: boolean
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Tooltip - Hover label
 * 
 * Features:
 * - Plain and rich variants
 * - Glass surface
 * - Fade-in animation
 * - Smart positioning
 * - Portal rendering
 * 
 * @example
 * ```tsx
 * <Tooltip content="Save changes">
 *   <Button>Save</Button>
 * </Tooltip>
 * 
 * <Tooltip 
 *   variant="rich" 
 *   content={<div>Rich content here</div>}
 * >
 *   <IconButton icon={<Info />} />
 * </Tooltip>
 * ```
 */
export const Tooltip: React.FC<TooltipProps> = ({
  content,
  variant = 'plain',
  placement = 'top',
  delay = 200,
  children,
  disabled = false,
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  
  // Build configuration
  const config = React.useMemo(() => {
    return glassBuilder()
      .preset('frosted', 'heavy')
      .fill('rgba(0, 0, 0, 0.8)')
      .radius(8)
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
  
  // Calculate position
  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return
    
    const triggerRect = triggerRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    const gap = 8
    
    let top = 0
    let left = 0
    
    switch (placement) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - gap
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2
        break
      case 'bottom':
        top = triggerRect.bottom + gap
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2
        break
      case 'left':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2
        left = triggerRect.left - tooltipRect.width - gap
        break
      case 'right':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2
        left = triggerRect.right + gap
        break
    }
    
    // Keep within viewport
    const padding = 8
    top = Math.max(padding, Math.min(top, window.innerHeight - tooltipRect.height - padding))
    left = Math.max(padding, Math.min(left, window.innerWidth - tooltipRect.width - padding))
    
    setPosition({ top, left })
  }
  
  // Show tooltip
  const show = () => {
    if (disabled) return
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true)
    }, delay)
  }
  
  // Hide tooltip
  const hide = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }
  
  // Update position when visible
  useEffect(() => {
    if (isVisible) {
      calculatePosition()
      
      // Recalculate on scroll/resize
      window.addEventListener('scroll', calculatePosition, true)
      window.addEventListener('resize', calculatePosition)
      
      return () => {
        window.removeEventListener('scroll', calculatePosition, true)
        window.removeEventListener('resize', calculatePosition)
      }
    }
  }, [isVisible])
  
  // Clone child with event handlers
  const trigger = React.cloneElement(children as any, {
    ref: triggerRef,
    onMouseEnter: (e: React.MouseEvent) => {
      show()
      ;(children as any).props.onMouseEnter?.(e)
    },
    onMouseLeave: (e: React.MouseEvent) => {
      hide()
      ;(children as any).props.onMouseLeave?.(e)
    },
    onFocus: (e: React.FocusEvent) => {
      show()
      ;(children as any).props.onFocus?.(e)
    },
    onBlur: (e: React.FocusEvent) => {
      hide()
      ;(children as any).props.onBlur?.(e)
    },
  })
  
  return (
    <>
      {trigger}
      
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isVisible && (
            <motion.div
              ref={tooltipRef}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'fixed',
                top: position.top,
                left: position.left,
                zIndex: 9999,
              }}
            >
              <Glass
                config={config}
                className={cn(
                  'pointer-events-none',
                  variant === 'plain' ? 'px-3 py-1.5' : 'p-4',
                  variant === 'plain' ? 'max-w-xs' : 'max-w-sm'
                )}
              >
                <div className={cn(
                  'text-white',
                  variant === 'plain' ? 'text-sm' : 'text-base'
                )}>
                  {content}
                </div>
              </Glass>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}

Tooltip.displayName = 'Tooltip'
