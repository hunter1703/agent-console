'use client'

/**
 * Pull to Refresh Component
 * 
 * Mobile gesture for refreshing messages with spring physics.
 * Only enabled on touch devices.
 * 
 * Design Philosophy:
 * - Natural pull gesture
 * - Clear visual feedback
 * - Smooth spring animations
 * - Touch-optimized
 */

import { useState, useRef, useEffect, ReactNode } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { RefreshCw, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { springPresets } from '@/lib/constants/animations'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'

export interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  threshold?: number
  maxPullDistance?: number
  disabled?: boolean
  children: ReactNode
  className?: string
}

export function PullToRefresh({
  onRefresh,
  threshold = 80,
  maxPullDistance = 120,
  disabled = false,
  children,
  className,
}: PullToRefreshProps) {
  const { shouldAnimate } = useReducedMotion()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const pullDistance = useMotionValue(0)
  const startY = useRef(0)
  const isPulling = useRef(false)

  // Check if device supports touch
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  // Transform pull distance to rotation for spinner
  const spinnerRotation = useTransform(
    pullDistance,
    [0, threshold],
    [0, 360]
  )

  // Transform pull distance to opacity
  const indicatorOpacity = useTransform(
    pullDistance,
    [0, threshold / 2, threshold],
    [0, 0.5, 1]
  )

  // Transform pull distance to scale
  const indicatorScale = useTransform(
    pullDistance,
    [0, threshold],
    [0.5, 1]
  )

  // Handle touch start
  const handleTouchStart = (e: TouchEvent) => {
    if (disabled || isRefreshing || !containerRef.current) return

    const scrollTop = containerRef.current.scrollTop
    
    // Only allow pull at top of scroll
    if (scrollTop <= 0) {
      startY.current = e.touches[0].clientY
      isPulling.current = true
    }
  }

  // Handle touch move
  const handleTouchMove = (e: TouchEvent) => {
    if (!isPulling.current || disabled || isRefreshing) return

    const currentY = e.touches[0].clientY
    const deltaY = currentY - startY.current

    // Only pull down
    if (deltaY > 0) {
      // Apply resistance curve
      const resistance = 0.5
      const distance = Math.min(deltaY * resistance, maxPullDistance)
      pullDistance.set(distance)

      // Prevent default scroll if pulling
      if (distance > 10) {
        e.preventDefault()
      }
    }
  }

  // Handle touch end
  const handleTouchEnd = async () => {
    if (!isPulling.current) return

    isPulling.current = false
    const distance = pullDistance.get()

    // Trigger refresh if threshold exceeded
    if (distance >= threshold && !disabled && !isRefreshing) {
      setIsRefreshing(true)

      // Animate to threshold position
      animate(pullDistance, threshold, {
        type: 'spring',
        ...springPresets.snappy,
      })

      try {
        await onRefresh()
        
        // Show success state
        setShowSuccess(true)
        
        // Wait a bit to show success
        await new Promise(resolve => setTimeout(resolve, 800))
      } catch (error) {
        console.error('Refresh failed:', error)
      } finally {
        setShowSuccess(false)
        setIsRefreshing(false)
        
        // Animate back to 0
        animate(pullDistance, 0, {
          type: 'spring',
          ...springPresets.snappy,
        })
      }
    } else {
      // Snap back if threshold not met
      animate(pullDistance, 0, {
        type: 'spring',
        ...springPresets.snappy,
      })
    }
  }

  // Set up touch event listeners
  useEffect(() => {
    if (!isTouchDevice || !containerRef.current) return

    const container = containerRef.current

    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd)

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isTouchDevice, disabled, isRefreshing])

  // Don't render indicator on non-touch devices
  if (!isTouchDevice) {
    return <div className={className}>{children}</div>
  }

  return (
    <div ref={containerRef} className={cn('relative overflow-auto', className)}>
      {/* Pull Indicator */}
      <motion.div
        style={{
          opacity: shouldAnimate ? indicatorOpacity : 1,
          scale: shouldAnimate ? indicatorScale : 1,
          y: pullDistance,
        }}
        className={cn(
          'absolute top-0 left-1/2 -translate-x-1/2 z-10',
          'flex items-center justify-center',
          'w-10 h-10 rounded-full',
          'bg-surface border-2 border-border-subtle shadow-lg',
          'pointer-events-none'
        )}
      >
        {showSuccess ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={shouldAnimate ? springPresets.bouncy : { duration: 0 }}
          >
            <Check size={20} className="text-success" />
          </motion.div>
        ) : (
          <motion.div
            style={{
              rotate: shouldAnimate ? spinnerRotation : 0,
            }}
          >
            <RefreshCw
              size={20}
              className={cn(
                'transition-colors',
                isRefreshing ? 'text-primary' : 'text-text-secondary'
              )}
            />
          </motion.div>
        )}
      </motion.div>

      {/* Content */}
      <motion.div
        style={{
          y: shouldAnimate ? pullDistance : 0,
        }}
      >
        {children}
      </motion.div>
    </div>
  )
}
