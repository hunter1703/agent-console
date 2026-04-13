/**
 * Shared Motion Variants
 * 
 * Reusable Framer Motion animation variants to avoid duplication.
 * All variants use spring physics for natural, organic feel.
 */

import { Variants } from 'framer-motion'
import { springPresets } from './animations'

// ============================================================================
// FADE ANIMATIONS
// ============================================================================

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

// ============================================================================
// SLIDE ANIMATIONS
// ============================================================================

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

// ============================================================================
// SCALE ANIMATIONS
// ============================================================================

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
}

export const scaleOut: Variants = {
  initial: { opacity: 1, scale: 1 },
  animate: { opacity: 0, scale: 0.8 },
  exit: { opacity: 0, scale: 0.8 },
}

// ============================================================================
// INTERACTION ANIMATIONS
// ============================================================================

export const buttonPress: Variants = {
  whileTap: {
    scaleY: 0.95,
    scaleX: 1.02,
  },
}

export const hoverLift: Variants = {
  whileHover: {
    y: -2,
    transition: springPresets.snappy,
  },
}

export const hoverScale: Variants = {
  whileHover: {
    scale: 1.02,
    transition: springPresets.snappy,
  },
}

// ============================================================================
// CONTAINER ANIMATIONS
// ============================================================================

export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
}

export const staggerContainerFast: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.03,
    },
  },
}

export const staggerContainerSlow: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

// ============================================================================
// MODAL/OVERLAY ANIMATIONS
// ============================================================================

export const modalBackdrop: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export const modalContent: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 20 },
}

// ============================================================================
// TOAST/NOTIFICATION ANIMATIONS
// ============================================================================

export const toastSlideIn: Variants = {
  initial: { opacity: 0, x: 100, scale: 0.95 },
  animate: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: 100, scale: 0.95 },
}

export const toastSlideDown: Variants = {
  initial: { opacity: 0, y: -100 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -100 },
}

// ============================================================================
// SIDEBAR ANIMATIONS
// ============================================================================

export const sidebarSlideIn: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
}

export const sidebarSlideOut: Variants = {
  initial: { opacity: 1, x: 0 },
  animate: { opacity: 0, x: -20 },
  exit: { opacity: 0, x: -20 },
}

// ============================================================================
// LIST ITEM ANIMATIONS
// ============================================================================

export const listItem: Variants = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 10 },
}

export const listItemFade: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}
