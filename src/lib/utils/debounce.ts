/**
 * Debounce and throttle utilities
 */

/**
 * Debounce a function call
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle a function call with trailing edge support
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  let lastArgs: Parameters<T> | null = null
  let timeoutId: NodeJS.Timeout | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      // Leading edge: execute immediately
      func(...args)
      inThrottle = true
      
      timeoutId = setTimeout(() => {
        inThrottle = false
        
        // Trailing edge: execute with last args if any
        if (lastArgs) {
          func(...lastArgs)
          lastArgs = null
          inThrottle = true
          timeoutId = setTimeout(() => {
            inThrottle = false
          }, limit)
        }
      }, limit)
    } else {
      // Store latest args for trailing call
      lastArgs = args
    }
  }
}
