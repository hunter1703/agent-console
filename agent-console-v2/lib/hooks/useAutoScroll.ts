/**
 * useAutoScroll Hook
 * 
 * Auto-scrolls to bottom when new content arrives, with user scroll detection.
 */

'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface UseAutoScrollOptions {
  /**
   * Distance from bottom (in pixels) to consider "at bottom"
   * @default 100
   */
  threshold?: number
  
  /**
   * Scroll behavior
   * @default 'smooth'
   */
  behavior?: ScrollBehavior
  
  /**
   * Dependencies that trigger auto-scroll
   */
  dependencies?: any[]
}

export function useAutoScroll({
  threshold = 100,
  behavior = 'smooth',
  dependencies = [],
}: UseAutoScrollOptions = {}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [userHasScrolled, setUserHasScrolled] = useState(false)

  const scrollToBottom = useCallback((instant = false) => {
    if (!containerRef.current) return

    containerRef.current.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: instant ? 'instant' : behavior,
    })
  }, [behavior])

  const checkIfAtBottom = useCallback(() => {
    if (!containerRef.current) return false

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight
    return distanceFromBottom <= threshold
  }, [threshold])

  const handleScroll = useCallback(() => {
    const atBottom = checkIfAtBottom()
    setIsAtBottom(atBottom)

    if (!atBottom) {
      setUserHasScrolled(true)
    } else {
      setUserHasScrolled(false)
    }
  }, [checkIfAtBottom])

  // Auto-scroll when dependencies change (new messages)
  useEffect(() => {
    if (isAtBottom && !userHasScrolled) {
      scrollToBottom()
    }
  }, [...dependencies, isAtBottom, userHasScrolled, scrollToBottom])

  // Attach scroll listener
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  return {
    containerRef,
    scrollToBottom,
    isAtBottom,
    userHasScrolled,
  }
}
