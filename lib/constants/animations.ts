/**
 * Animation System
 * 
 * Complete animation system based on the 12 principles of animation
 * and spring physics. Every animation should feel natural and organic.
 * 
 * Design Philosophy:
 * - Smooth motion with spring physics (60fps minimum)
 * - Natural, organic feel
 * - Immediate feedback
 * - Respect prefers-reduced-motion
 */

import { Transition, Variants } from 'framer-motion'

// ============================================================================
// SPRING PHYSICS PRESETS
// ============================================================================

export const springPresets = {
  // UI feedback - instant response
  instant: {
    type: 'spring' as const,
    stiffness: 500,
    damping: 30,
    mass: 0.5,
  },
  
  // Button interactions - snappy
  snappy: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 25,
    mass: 0.8,
  },
  
  // Default transitions - balanced
  default: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 30,
    mass: 1,
  },
  
  // Gentle movements - smooth
  gentle: {
    type: 'spring' as const,
    stiffness: 200,
    damping: 35,
    mass: 1.2,
  },
  
  // Playful interactions - bouncy
  bouncy: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 20,
    mass: 1,
  },
  
  // Heavy elements - slow
  heavy: {
    type: 'spring' as const,
    stiffness: 200,
    damping: 40,
    mass: 2,
  },
} as const

// ============================================================================
// EASING CURVES
// ============================================================================

export const easings = {
  // Entrances - start slow, end fast
  easeOut: [0, 0, 0.2, 1] as [number, number, number, number],
  
  // Exits - start fast, end slow
  easeIn: [0.4, 0, 1, 1] as [number, number, number, number],
  
  // Both - slow start and end
  easeInOut: [0.4, 0, 0.2, 1] as [number, number, number, number],
  
  // Emphasized - dramatic deceleration (Material Design)
  emphasized: [0.05, 0.7, 0.1, 1] as [number, number, number, number],
  
  // Bounce - overshoot
  bounce: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
} as const

// ============================================================================
// DURATION STANDARDS
// ============================================================================

export const durations = {
  instant: 0,
  fast: 150,      // Hover effects, micro-interactions
  normal: 250,    // View switching, standard transitions
  slow: 300,      // Page transitions, theme switching
  slower: 400,    // Large movements, complex animations
} as const

// ============================================================================
// MOTION VARIANTS
// ============================================================================

// Fade animations
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export const fadeOut: Variants = {
  initial: { opacity: 1 },
  animate: { opacity: 0 },
  exit: { opacity: 0 },
}

// Poof out - scale down and fade (for dismissed elements)
export const poofOut: Variants = {
  initial: { opacity: 1, scale: 1 },
  animate: { opacity: 0, scale: 0.8 },
  exit: { opacity: 0, scale: 0.8 },
}

// Slide animations
export const slideUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

export const slideDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
}

export const slideLeft: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
}

export const slideRight: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
}

// Scale animations
export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
}

// Button press (squash & stretch)
export const buttonPress: Variants = {
  whileTap: { 
    scaleY: 0.95,
    scaleX: 1.02,
  },
}

// Hover lift
export const hoverLift: Variants = {
  whileHover: { y: -2 },
}

// Stagger children
export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
}

// ============================================================================
// LIQUID & ORGANIC ANIMATIONS
// ============================================================================

// Liquid blob morphing border radius
export const liquidBlobKeyframes = [
  '60% 40% 30% 70%',
  '30% 60% 70% 40%',
  '60% 40% 30% 70%',
]

// Liquid progress bar border radius
export const liquidProgressKeyframes = [
  '0 50% 50% 0',
  '0 40% 60% 0',
  '0 60% 40% 0',
  '0 50% 50% 0',
]

// ============================================================================
// SIDEBAR ANIMATIONS
// ============================================================================

// Sidebar slide animations (desktop)
export const sidebarSlideIn: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
}

// Sidebar slide animations (mobile - full width slide)
export const sidebarMobileSlide = (width: number): Variants => ({
  initial: { x: -width },
  animate: { x: 0 },
  exit: { x: -width },
})

// ============================================================================
// ANIMATION HELPERS
// ============================================================================

/**
 * Get transition config based on reduced motion preference
 */
export function getTransition(
  prefersReducedMotion: boolean,
  transition: Transition = springPresets.default
): Transition {
  if (prefersReducedMotion) {
    return { duration: 0 }
  }
  return transition
}

/**
 * Get animation variants with reduced motion support
 */
export function getVariants(
  prefersReducedMotion: boolean,
  variants: Variants
): Variants {
  if (prefersReducedMotion) {
    // Return instant variants
    return {
      initial: variants.animate,
      animate: variants.animate,
      exit: variants.animate,
    }
  }
  return variants
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type SpringPreset = keyof typeof springPresets
export type Easing = keyof typeof easings
export type Duration = keyof typeof durations
