'use client'

import React, { useState, useEffect, useRef } from 'react'

export interface SmoothTextProps {
  content: string
}

export function SmoothText({ content }: SmoothTextProps) {
  // Initialize with the current content so we don't re-type what's already there
  // e.g. when scrolling back into view in a virtualized list or reconnecting.
  const [displayedText, setDisplayedText] = useState(content)
  const contentRef = useRef(content)
  const indexRef = useRef(content.length)
  const frameRef = useRef<number>(0)

  useEffect(() => {
    contentRef.current = content
  }, [content])

  useEffect(() => {
    const tick = () => {
      const targetLength = contentRef.current.length
      if (indexRef.current < targetLength) {
        const distance = targetLength - indexRef.current
        // Smoothly catch up: add a fraction of the remaining distance per frame.
        // At 60fps (16ms), dividing by 5 means we catch up to a sudden large chunk
        // smoothly over ~100-150ms, giving a very natural, fast typewriter feel.
        const charsToAdd = Math.max(1, Math.ceil(distance / 5))
        
        indexRef.current = Math.min(targetLength, indexRef.current + charsToAdd)
        setDisplayedText(contentRef.current.substring(0, indexRef.current))
      }
      frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [])

  return <>{displayedText}</>
}
