/**
 * Liquid Glass Browser Support Detection
 */

/**
 * Check if browser supports SVG filters as backdrop-filter
 * Currently only Chrome/Edge support this
 */
export function supportsLiquidGlass(): boolean {
  if (typeof window === 'undefined') return false

  try {
    const testElement = document.createElement('div')
    testElement.style.backdropFilter = 'url(#test)'

    return testElement.style.backdropFilter !== ''
  } catch {
    return false
  }
}

/**
 * Detect if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Check if device is touch-enabled
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false

  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}
