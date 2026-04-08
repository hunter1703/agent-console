'use client'

/**
 * Custom Cursor Component
 * 
 * Premium animated cursor with smooth follow and state changes.
 * Signature unseen.co feature for desktop interactions.
 * 
 * Design Philosophy:
 * - Smooth follow with lerp for organic feel
 * - State changes for different interactions
 * - Desktop only (pointer: fine)
 * - Respects reduced motion
 */

import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useMediaQuery } from '@/lib/hooks/useMediaQuery'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'

type CursorVariant = 'default' | 'hover' | 'active' | 'text'

export function CustomCursor() {
  const [cursorVariant, setCursorVariant] = useState<CursorVariant>('default')
  const [isVisible, setIsVisible] = useState(false)
  
  // Only show on desktop with fine pointer
  const isDesktop = useMediaQuery('(pointer: fine)')
  const { shouldAnimate } = useReducedMotion()
  
  // Cursor position with spring physics
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)
  
  // Smooth follow with lerp (factor: 0.15)
  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 }
  const cursorXSpring = useSpring(cursorX, springConfig)
  const cursorYSpring = useSpring(cursorY, springConfig)
  
  useEffect(() => {
    if (!isDesktop || !shouldAnimate) return
    
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
      setIsVisible(true)
    }
    
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      
      // Check for clickable elements
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.getAttribute('role') === 'button' ||
        target.style.cursor === 'pointer' ||
        target.closest('button') ||
        target.closest('a')
      ) {
        setCursorVariant('hover')
      }
      // Check for text selection areas
      else if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        window.getSelection()?.toString()
      ) {
        setCursorVariant('text')
      }
      // Default state
      else {
        setCursorVariant('default')
      }
    }
    
    const handleMouseDown = () => {
      setCursorVariant('active')
    }
    
    const handleMouseUp = () => {
      setCursorVariant('default')
    }
    
    const handleMouseLeave = () => {
      setIsVisible(false)
    }
    
    const handleMouseEnter = () => {
      setIsVisible(true)
    }
    
    window.addEventListener('mousemove', moveCursor)
    window.addEventListener('mouseover', handleMouseOver)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mouseenter', handleMouseEnter)
    
    return () => {
      window.removeEventListener('mousemove', moveCursor)
      window.removeEventListener('mouseover', handleMouseOver)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseenter', handleMouseEnter)
    }
  }, [isDesktop, shouldAnimate, cursorX, cursorY])
  
  // Don't render on mobile or if reduced motion is preferred
  if (!isDesktop || !shouldAnimate || !isVisible) {
    return null
  }
  
  // Variant configurations
  const variants = {
    default: {
      outer: {
        width: 12,
        height: 12,
        opacity: 0.4,
      },
      inner: {
        width: 4,
        height: 4,
        opacity: 1,
      },
    },
    hover: {
      outer: {
        width: 24,
        height: 24,
        opacity: 0.6,
      },
      inner: {
        width: 8,
        height: 8,
        opacity: 1,
      },
    },
    active: {
      outer: {
        width: 8,
        height: 8,
        opacity: 0.8,
      },
      inner: {
        width: 2,
        height: 2,
        opacity: 1,
      },
    },
    text: {
      outer: {
        width: 2,
        height: 20,
        opacity: 0.6,
      },
      inner: {
        width: 2,
        height: 20,
        opacity: 1,
      },
    },
  }
  
  const currentVariant = variants[cursorVariant]
  
  return (
    <>
      {/* Hide default cursor */}
      <style jsx global>{`
        * {
          cursor: none !important;
        }
      `}</style>
      
      {/* Outer ring */}
      <motion.div
        className="custom-cursor-outer"
        animate={currentVariant.outer}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 25,
          mass: 0.5,
        }}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: '-50%',
          translateY: '-50%',
          pointerEvents: 'none',
          zIndex: 9999,
          border: '2px solid var(--primary)',
          borderRadius: cursorVariant === 'text' ? '2px' : '50%',
          mixBlendMode: 'difference',
        }}
      />
      
      {/* Inner dot */}
      <motion.div
        className="custom-cursor-inner"
        animate={currentVariant.inner}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30,
          mass: 0.3,
        }}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
          pointerEvents: 'none',
          zIndex: 10000,
          background: 'var(--primary)',
          borderRadius: cursorVariant === 'text' ? '2px' : '50%',
          mixBlendMode: 'difference',
        }}
      />
    </>
  )
}
