/**
 * useParallaxHover Hook
 * 
 * Creates 3D parallax tilt effects based on mouse position.
 */

'use client'

import { useCallback, useState } from 'react'

interface ParallaxRotation {
  rotateX: number
  rotateY: number
}

interface UseParallaxHoverOptions {
  /**
   * Maximum rotation angle (in degrees)
   * @default 5
   */
  maxRotation?: number
  
  /**
   * Perspective value for 3D effect (in pixels)
   * @default 1000
   */
  perspective?: number
}

export function useParallaxHover({
  maxRotation = 5,
  perspective = 1000,
}: UseParallaxHoverOptions = {}) {
  const [rotation, setRotation] = useState<ParallaxRotation>({ rotateX: 0, rotateY: 0 })

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      const element = event.currentTarget
      const rect = element.getBoundingClientRect()

      // Calculate mouse position relative to element center (0-1 range)
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const mouseX = event.clientX
      const mouseY = event.clientY

      // Normalize to -1 to 1 range
      const normalizedX = (mouseX - centerX) / (rect.width / 2)
      const normalizedY = (mouseY - centerY) / (rect.height / 2)

      // Calculate rotation (inverted for natural feel)
      const rotateY = normalizedX * maxRotation
      const rotateX = -normalizedY * maxRotation

      setRotation({ rotateX, rotateY })
    },
    [maxRotation]
  )

  const handleMouseLeave = useCallback(() => {
    setRotation({ rotateX: 0, rotateY: 0 })
  }, [])

  return {
    rotation,
    perspective,
    handlers: {
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
    },
    style: {
      transform: `perspective(${perspective}px) rotateX(${rotation.rotateX}deg) rotateY(${rotation.rotateY}deg)`,
      transition: 'transform 0.1s ease-out',
    },
  }
}
