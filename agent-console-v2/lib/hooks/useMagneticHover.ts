/**
 * useMagneticHover Hook
 * 
 * Creates magnetic hover effects that pull elements toward the cursor.
 */

'use client'

import { useCallback, useState } from 'react'

interface MagneticPosition {
  x: number
  y: number
}

interface UseMagneticHoverOptions {
  /**
   * Maximum distance the element can move (in pixels)
   * @default 20
   */
  maxDistance?: number
  
  /**
   * Strength of the magnetic effect (0-1)
   * @default 0.3
   */
  strength?: number
}

export function useMagneticHover({
  maxDistance = 20,
  strength = 0.3,
}: UseMagneticHoverOptions = {}) {
  const [position, setPosition] = useState<MagneticPosition>({ x: 0, y: 0 })

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      const element = event.currentTarget
      const rect = element.getBoundingClientRect()

      // Calculate mouse position relative to element center
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const mouseX = event.clientX
      const mouseY = event.clientY

      // Calculate offset
      let offsetX = (mouseX - centerX) * strength
      let offsetY = (mouseY - centerY) * strength

      // Limit to maxDistance
      const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY)
      if (distance > maxDistance) {
        const scale = maxDistance / distance
        offsetX *= scale
        offsetY *= scale
      }

      setPosition({ x: offsetX, y: offsetY })
    },
    [maxDistance, strength]
  )

  const handleMouseLeave = useCallback(() => {
    setPosition({ x: 0, y: 0 })
  }, [])

  return {
    position,
    handlers: {
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
    },
  }
}
