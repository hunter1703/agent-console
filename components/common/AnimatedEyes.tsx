'use client'

/**
 * Animated Eyes Component
 * 
 * Playful animated eyes that follow cursor and blink.
 * Inspired by unseen.co design.
 */

import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'

export interface AnimatedEyesProps {
  size?: 'sm' | 'md' | 'lg'
  showHearts?: boolean
  className?: string
}

export function AnimatedEyes({
  size = 'md',
  showHearts = false,
  className,
}: AnimatedEyesProps) {
  const { shouldAnimate } = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  const [isBlinking, setIsBlinking] = useState(false)
  
  // Smooth cursor following
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  const leftPupilX = useSpring(0, { stiffness: 150, damping: 15 })
  const leftPupilY = useSpring(0, { stiffness: 150, damping: 15 })
  const rightPupilX = useSpring(0, { stiffness: 150, damping: 15 })
  const rightPupilY = useSpring(0, { stiffness: 150, damping: 15 })

  // Size variants
  const sizes = {
    sm: { width: 60, height: 30, pupil: 6 },
    md: { width: 80, height: 40, pupil: 8 },
    lg: { width: 100, height: 50, pupil: 10 },
  }
  
  const { width, height, pupil } = sizes[size]

  // Follow cursor
  useEffect(() => {
    if (!shouldAnimate) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      // Calculate angle and distance
      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX)
      const distance = Math.min(
        Math.sqrt(
          Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
        ) / 100,
        1
      )

      // Max pupil movement
      const maxMove = pupil * 1.5

      const moveX = Math.cos(angle) * distance * maxMove
      const moveY = Math.sin(angle) * distance * maxMove

      leftPupilX.set(moveX)
      leftPupilY.set(moveY)
      rightPupilX.set(moveX)
      rightPupilY.set(moveY)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [shouldAnimate, leftPupilX, leftPupilY, rightPupilX, rightPupilY, pupil])

  // Random blinking
  useEffect(() => {
    if (!shouldAnimate) return

    const blink = () => {
      setIsBlinking(true)
      setTimeout(() => setIsBlinking(false), 150)
    }

    const interval = setInterval(blink, 3000 + Math.random() * 2000)
    return () => clearInterval(interval)
  }, [shouldAnimate])

  return (
    <div
      ref={containerRef}
      className={cn('relative inline-flex gap-3', className)}
      style={{ width: width * 2 + 12, height }}
    >
      {/* Left Eye */}
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
      >
        {/* Eye white */}
        <ellipse
          cx={width / 2}
          cy={height / 2}
          rx={width / 2 - 2}
          ry={height / 2 - 2}
          fill="currentColor"
          className="text-surface"
          stroke="currentColor"
          strokeWidth="2"
          className="text-border-medium"
        />
        
        {/* Pupil */}
        <motion.circle
          cx={width / 2}
          cy={height / 2}
          r={pupil}
          fill="currentColor"
          className="text-text-primary"
          style={{
            x: leftPupilX,
            y: leftPupilY,
          }}
        />
        
        {/* Highlight */}
        <motion.circle
          cx={width / 2 + 2}
          cy={height / 2 - 2}
          r={pupil / 3}
          fill="white"
          opacity={0.8}
          style={{
            x: leftPupilX,
            y: leftPupilY,
          }}
        />

        {/* Heart (on hover) */}
        {showHearts && (
          <motion.path
            d={`M${width / 2},${height / 2 + 2} 
                l-3,-3 
                q-2,-2 0,-4 
                q2,-2 4,0 
                l-1,1 
                l-1,-1 
                q2,-2 4,0 
                q2,2 0,4 
                z`}
            fill="#FF4E1B"
            initial={{ scale: 0, rotate: -80 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.4, type: 'spring' }}
            style={{
              transformOrigin: `${width / 2}px ${height / 2}px`,
            }}
          />
        )}

        {/* Eyelid (blink) */}
        <motion.rect
          x={0}
          y={0}
          width={width}
          height={height / 2}
          fill="currentColor"
          className="text-background"
          animate={{
            scaleY: isBlinking ? 2 : 0,
          }}
          transition={{ duration: 0.15 }}
          style={{
            transformOrigin: `${width / 2}px 0px`,
          }}
        />
      </svg>

      {/* Right Eye */}
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
      >
        {/* Eye white */}
        <ellipse
          cx={width / 2}
          cy={height / 2}
          rx={width / 2 - 2}
          ry={height / 2 - 2}
          fill="currentColor"
          className="text-surface"
          stroke="currentColor"
          strokeWidth="2"
          className="text-border-medium"
        />
        
        {/* Pupil */}
        <motion.circle
          cx={width / 2}
          cy={height / 2}
          r={pupil}
          fill="currentColor"
          className="text-text-primary"
          style={{
            x: rightPupilX,
            y: rightPupilY,
          }}
        />
        
        {/* Highlight */}
        <motion.circle
          cx={width / 2 + 2}
          cy={height / 2 - 2}
          r={pupil / 3}
          fill="white"
          opacity={0.8}
          style={{
            x: rightPupilX,
            y: rightPupilY,
          }}
        />

        {/* Heart (on hover) */}
        {showHearts && (
          <motion.path
            d={`M${width / 2},${height / 2 + 2} 
                l-3,-3 
                q-2,-2 0,-4 
                q2,-2 4,0 
                l-1,1 
                l-1,-1 
                q2,-2 4,0 
                q2,2 0,4 
                z`}
            fill="#FF4E1B"
            initial={{ scale: 0, rotate: -80 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.4, type: 'spring', delay: 0.1 }}
            style={{
              transformOrigin: `${width / 2}px ${height / 2}px`,
            }}
          />
        )}

        {/* Eyelid (blink) */}
        <motion.rect
          x={0}
          y={0}
          width={width}
          height={height / 2}
          fill="currentColor"
          className="text-background"
          animate={{
            scaleY: isBlinking ? 2 : 0,
          }}
          transition={{ duration: 0.15 }}
          style={{
            transformOrigin: `${width / 2}px 0px`,
          }}
        />
      </svg>
    </div>
  )
}
