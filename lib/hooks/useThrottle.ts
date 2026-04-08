/**
 * useThrottle Hook
 * 
 * Throttles a value, limiting updates to once per specified interval.
 */

'use client'

import { useEffect, useRef, useState } from 'react'

interface UseThrottleOptions {
  /**
   * Interval in milliseconds
   * @default 300
   */
  interval?: number
  
  /**
   * Whether to update on the leading edge
   * @default true
   */
  leading?: boolean
  
  /**
   * Whether to update on the trailing edge
   * @default true
   */
  trailing?: boolean
}

export function useThrottle<T>(value: T, options: UseThrottleOptions = {}): T {
  const { interval = 300, leading = true, trailing = true } = options
  const [throttledValue, setThrottledValue] = useState<T>(value)
  const lastRan = useRef<number>(Date.now())
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  useEffect(() => {
    const now = Date.now()
    const timeSinceLastRan = now - lastRan.current

    if (timeSinceLastRan >= interval) {
      // Leading edge
      if (leading) {
        setThrottledValue(value)
        lastRan.current = now
      }
    } else {
      // Trailing edge
      if (trailing) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        timeoutRef.current = setTimeout(() => {
          setThrottledValue(value)
          lastRan.current = Date.now()
        }, interval - timeSinceLastRan)
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [value, interval, leading, trailing])

  return throttledValue
}
