/**
 * useDebounce Hook
 * 
 * Debounces a value, delaying updates until after a specified delay.
 */

'use client'

import { useEffect, useState } from 'react'

interface UseDebounceOptions {
  /**
   * Delay in milliseconds
   * @default 300
   */
  delay?: number
  
  /**
   * Whether to update on the leading edge
   * @default false
   */
  leading?: boolean
}

export function useDebounce<T>(value: T, options: UseDebounceOptions = {}): T {
  const { delay = 300, leading = false } = options
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  const [isFirstRun, setIsFirstRun] = useState(true)

  useEffect(() => {
    // Handle leading edge
    if (leading && isFirstRun) {
      setDebouncedValue(value)
      setIsFirstRun(false)
      return
    }

    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay, leading, isFirstRun])

  return debouncedValue
}
