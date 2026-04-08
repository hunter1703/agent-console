/**
 * useInView Hook
 * 
 * Detects when an element enters the viewport using Intersection Observer.
 */

'use client'

import { useEffect, useRef, useState } from 'react'

interface UseInViewOptions {
  /**
   * Threshold for intersection (0-1)
   * @default 0.1
   */
  threshold?: number
  
  /**
   * Root margin for intersection observer
   * @default '0px'
   */
  rootMargin?: string
  
  /**
   * Whether to trigger only once
   * @default true
   */
  once?: boolean
  
  /**
   * Root element for intersection observer
   * @default null (viewport)
   */
  root?: Element | null
}

export function useInView({
  threshold = 0.1,
  rootMargin = '0px',
  once = true,
  root = null,
}: UseInViewOptions = {}) {
  const [isInView, setIsInView] = useState(false)
  const [hasBeenInView, setHasBeenInView] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // If once is true and element has already been in view, skip
    if (once && hasBeenInView) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const inView = entry.isIntersecting

        setIsInView(inView)

        if (inView && once) {
          setHasBeenInView(true)
        }
      },
      {
        threshold,
        rootMargin,
        root,
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [threshold, rootMargin, root, once, hasBeenInView])

  return { ref, isInView }
}
