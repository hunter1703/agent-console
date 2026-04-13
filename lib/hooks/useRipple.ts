'use client'

/**
 * useRipple Hook
 * 
 * Creates ripple effect on click for interactive elements.
 * Returns event handler and ripple state for rendering.
 * 
 * Usage:
 * const { ripples, handleRipple } = useRipple()
 * <button onClick={handleRipple}>
 *   {children}
 *   <RippleEffect ripples={ripples} />
 * </button>
 */

import { useState, useCallback, MouseEvent } from 'react'

export interface Ripple {
  id: number
  x: number
  y: number
  size: number
}

export function useRipple() {
  const [ripples, setRipples] = useState<Ripple[]>([])

  const handleRipple = useCallback((event: MouseEvent<HTMLElement>) => {
    const target = event.currentTarget
    const rect = target.getBoundingClientRect()
    
    // Calculate ripple position relative to element
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    // Calculate ripple size (diameter of circle that covers entire element)
    const size = Math.max(rect.width, rect.height) * 2
    
    const newRipple: Ripple = {
      id: Date.now(),
      x,
      y,
      size,
    }
    
    setRipples((prev) => [...prev, newRipple])
    
    // Remove ripple after animation completes
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id))
    }, 600)
  }, [])

  return { ripples, handleRipple }
}
