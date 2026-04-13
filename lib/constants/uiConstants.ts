/**
 * UI Constants
 * 
 * Named constants for commonly used values throughout the application.
 * Eliminates magic numbers and improves code readability.
 */

// ============================================================================
// ANIMATION DISTANCES
// ============================================================================

export const HOVER_LIFT_DISTANCE = -2 // pixels
export const HOVER_SCALE_AMOUNT = 1.02
export const BUTTON_PRESS_SCALE_Y = 0.95
export const BUTTON_PRESS_SCALE_X = 1.02
export const MAGNETIC_HOVER_MAX_DISTANCE = 10 // pixels
export const PARALLAX_MAX_OFFSET = 100 // pixels

// ============================================================================
// TIMING
// ============================================================================

export const DEBOUNCE_DELAY = 300 // ms
export const THROTTLE_DELAY = 100 // ms
export const TOAST_AUTO_DISMISS_DURATION = 3000 // ms
export const RIPPLE_DURATION = 600 // ms
export const THEME_TRANSITION_DURATION = 400 // ms
export const MODAL_ANIMATION_DURATION = 250 // ms

// ============================================================================
// SIZES
// ============================================================================

export const AVATAR_SIZE = {
  sm: 32,
  md: 40,
  lg: 48,
} as const

export const BUTTON_HEIGHT = {
  sm: 36,
  md: 44,
  lg: 52,
} as const

export const ICON_SIZE = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 48,
} as const

export const PROGRESS_RING_SIZE = {
  sm: 40,
  md: 80,
  lg: 120,
  xl: 160,
} as const

// ============================================================================
// SPACING
// ============================================================================

export const SIDEBAR_WIDTH = 280 // pixels
export const SIDEBAR_COLLAPSED_WIDTH = 64 // pixels
export const CHAT_MAX_WIDTH = 768 // pixels
export const CONTAINER_PADDING = 16 // pixels
export const SECTION_GAP = 24 // pixels
export const LIST_ITEM_GAP = 12 // pixels

// ============================================================================
// Z-INDEX LAYERS
// ============================================================================

export const Z_INDEX = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 1080,
  skipLinks: 9999,
} as const

// ============================================================================
// SCROLL
// ============================================================================

export const SCROLL_THRESHOLD = 100 // pixels from bottom to trigger auto-scroll
export const INTERSECTION_THRESHOLD = 0.1 // 10% visibility
export const PARALLAX_SPEED = {
  back: 0.3,
  middle: 0.5,
  front: 0.7,
} as const

// ============================================================================
// FORM
// ============================================================================

export const INPUT_MAX_LENGTH = {
  short: 50,
  medium: 100,
  long: 500,
  message: 2000,
} as const

export const TEXTAREA_MIN_ROWS = 3
export const TEXTAREA_MAX_ROWS = 10

// ============================================================================
// ACCESSIBILITY
// ============================================================================

export const FOCUS_OUTLINE_WIDTH = 2 // pixels
export const FOCUS_OUTLINE_OFFSET = 2 // pixels
export const MIN_TOUCH_TARGET_SIZE = 44 // pixels (WCAG guideline)
export const REDUCED_MOTION_DURATION = 0 // instant for reduced motion

// ============================================================================
// BREAKPOINTS (for JS usage)
// ============================================================================

export const BREAKPOINTS = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

// ============================================================================
// CONTRAST RATIOS (WCAG)
// ============================================================================

export const WCAG_CONTRAST = {
  normalText: 4.5, // AA standard
  largeText: 3.0, // AA standard for 18px+
  enhanced: 7.0, // AAA standard
} as const

// ============================================================================
// LIMITS
// ============================================================================

export const MAX_TOAST_COUNT = 3
export const MAX_RIPPLES = 5
export const MAX_PARTICLES = 30
export const STAGGER_DELAY = 50 // ms between list items

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
} as const

// ============================================================================
// SHADOW BLUR
// ============================================================================

export const SHADOW_BLUR = {
  sm: 2,
  md: 4,
  lg: 8,
  xl: 16,
} as const
