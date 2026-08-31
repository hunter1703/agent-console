'use client'

import React, { useEffect, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'

export interface VirtualTimelineListProps {
  itemCount: number
  renderItem: (index: number) => React.ReactNode
  scrollContainerRef: React.RefObject<HTMLDivElement>
}

export function VirtualTimelineList({
  itemCount,
  renderItem,
  scrollContainerRef,
}: VirtualTimelineListProps) {
  // We need to track when the scroll container is actually mounted and attached
  // so the virtualizer can recalculate sizes based on its layout.
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const virtualizer = useVirtualizer({
    count: itemCount,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => 150, // Default estimate, will be updated by measureElement
    overscan: 5,
  })

  const virtualItems = virtualizer.getVirtualItems()

  if (!isMounted) {
    return null
  }

  return (
    <div
      style={{
        height: `${virtualizer.getTotalSize()}px`,
        width: '100%',
        position: 'relative',
      }}
    >
      {virtualItems.map((virtualItem) => (
        <div
          key={virtualItem.key}
          data-index={virtualItem.index}
          ref={virtualizer.measureElement}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            transform: `translateY(${virtualItem.start}px)`,
          }}
        >
          {renderItem(virtualItem.index)}
        </div>
      ))}
    </div>
  )
}
