'use client'

/**
 * StaggeredMorphTransition Component
 * 
 * Creates staggered morphing effect for UI elements during theme change.
 * Animates color changes with 50ms delay between elements using spring physics.
 * 
 * Design Philosophy:
 * - Smooth, organic transitions
 * - Staggered timing for visual interest
 * - Spring physics for natural feel
 * - Respects prefers-reduced-motion
 */

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'
import { springPresets } from '@/lib/constants/animations'
import { lightTheme, darkTheme } from '@/lib/constants/theme'

interface StaggeredMorphTransitionProps {
  /** Current theme */
  theme: 'light' | 'dark'
  /** Whether transition is active */
  isTransitioning: boolean
  /** Callback when transition completes */
  onTransitionComplete?: () => void
}

// Key UI elements to animate in order
const UI_ELEMENTS = [
  '.sidebar',
  '.chat-header', 
  '.message',
  '.agent-card',
  '.session-item',
  '.input-container',
  '.button',
  '.card',
] as const

// Animation duration per element
const ELEMENT_DURATION = 400
// Stagger delay between elements
const STAGGER_DELAY = 50

export function StaggeredMorphTransition({
  theme,
  isTransitioning,
  onTransitionComplete,
}: StaggeredMorphTransitionProps) {
  const { prefersReducedMotion } = useReducedMotion()
  const timeoutRefs = useRef<NodeJS.Timeout[]>([])

  useEffect(() => {
    if (!isTransitioning) return

    // Clear any existing timeouts
    timeoutRefs.current.forEach(clearTimeout)
    timeoutRefs.current = []

    if (prefersReducedMotion) {
      // Instant transition for reduced motion
      onTransitionComplete?.()
      return
    }

    const colors = theme === 'light' ? lightTheme : darkTheme
    let completedElements = 0

    // Animate each element type with stagger
    UI_ELEMENTS.forEach((selector, index) => {
      const timeout = setTimeout(() => {
        const elements = document.querySelectorAll(selector)
        
        elements.forEach((element) => {
          const htmlElement = element as HTMLElement
          
          // Add morphing class for CSS transition
          htmlElement.classList.add('theme-morphing')
          
          // Apply new colors with CSS custom properties
          htmlElement.style.setProperty('--morph-bg', colors.background)
          htmlElement.style.setProperty('--morph-surface', colors.surface)
          htmlElement.style.setProperty('--morph-text', colors.text.primary)
          htmlElement.style.setProperty('--morph-border', colors.border.subtle)
          htmlElement.style.setProperty('--morph-primary', colors.primary)
          
          // Remove morphing class after animation
          setTimeout(() => {
            htmlElement.classList.remove('theme-morphing')
            htmlElement.style.removeProperty('--morph-bg')
            htmlElement.style.removeProperty('--morph-surface')
            htmlElement.style.removeProperty('--morph-text')
            htmlElement.style.removeProperty('--morph-border')
            htmlElement.style.removeProperty('--morph-primary')
          }, ELEMENT_DURATION)
        })

        completedElements++
        
        // Call completion callback when all elements are done
        if (completedElements === UI_ELEMENTS.length) {
          setTimeout(() => {
            onTransitionComplete?.()
          }, ELEMENT_DURATION)
        }
      }, index * STAGGER_DELAY)

      timeoutRefs.current.push(timeout)
    })

    // Cleanup function
    return () => {
      timeoutRefs.current.forEach(clearTimeout)
      timeoutRefs.current = []
    }
  }, [isTransitioning, theme, prefersReducedMotion, onTransitionComplete])

  // Visual feedback overlay during transition
  return (
    <AnimatePresence>
      {isTransitioning && !prefersReducedMotion && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={springPresets.gentle}
        >
          {/* Subtle overlay to indicate transition */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at center, ${
                theme === 'light' 
                  ? 'rgba(245, 158, 11, 0.03)' 
                  : 'rgba(250, 250, 250, 0.02)'
              } 0%, transparent 70%)`,
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              ease: 'easeInOut',
              repeat: Infinity,
            }}
          />
          
          {/* Animated particles for visual interest */}
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                background: theme === 'light' ? lightTheme.primary : darkTheme.primary,
                left: `${20 + (i * 10)}%`,
                top: `${30 + (i % 3) * 20}%`,
              }}
              animate={{
                y: [-10, -30, -10],
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.1,
                ease: 'easeOut',
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// CSS styles to be added to global.css
export const staggeredMorphStyles = `
/* Staggered Morph Transition Styles */
.theme-morphing {
  transition: all 400ms cubic-bezier(0.34, 1.56, 0.64, 1) !important;
}

/* Element-specific morphing */
.theme-morphing.sidebar,
.theme-morphing .sidebar {
  background-color: var(--morph-surface) !important;
  border-color: var(--morph-border) !important;
}

.theme-morphing.message,
.theme-morphing .message {
  background-color: var(--morph-bg) !important;
  color: var(--morph-text) !important;
  border-color: var(--morph-border) !important;
}

.theme-morphing.card,
.theme-morphing .card {
  background-color: var(--morph-surface) !important;
  border-color: var(--morph-border) !important;
}

.theme-morphing.button,
.theme-morphing .button {
  background-color: var(--morph-primary) !important;
  border-color: var(--morph-primary) !important;
}

/* Smooth color interpolation */
.theme-morphing * {
  transition: color 400ms cubic-bezier(0.34, 1.56, 0.64, 1),
              background-color 400ms cubic-bezier(0.34, 1.56, 0.64, 1),
              border-color 400ms cubic-bezier(0.34, 1.56, 0.64, 1) !important;
}
`