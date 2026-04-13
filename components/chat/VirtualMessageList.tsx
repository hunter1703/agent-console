'use client'

/**
 * Virtual Message List Component
 * 
 * High-performance message list using virtual scrolling.
 * Only renders visible messages for optimal performance with 100+ messages.
 * 
 * Performance:
 * - Virtual scrolling with @tanstack/react-virtual
 * - Dynamic height estimation
 * - 5 items overscan for smooth scrolling
 * - Maintains scroll position on new items
 */

import { useEffect, useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { motion } from 'framer-motion'
import { ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Message, MessageProps } from './Message'
import { springPresets } from '@/lib/constants/animations'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'

export interface VirtualMessageListProps {
  messages: Omit<MessageProps, 'isClusteredWithPrevious'>[]
  isLoading?: boolean
  className?: string
}

export function VirtualMessageList({
  messages,
  isLoading = false,
  className,
}: VirtualMessageListProps) {
  const { shouldAnimate } = useReducedMotion()
  const parentRef = useRef<HTMLDivElement>(null)
  const scrollingRef = useRef<number | null>(null)

  // Determine if message should be clustered with previous
  const shouldCluster = (index: number): boolean => {
    if (index === 0) return false

    const current = messages[index]
    const previous = messages[index - 1]

    // Cluster if same sender and within 2 minutes
    const timeDiff = current.timestamp.getTime() - previous.timestamp.getTime()
    const twoMinutes = 2 * 60 * 1000

    return current.sender === previous.sender && timeDiff < twoMinutes
  }

  // Virtual scrolling setup
  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => {
      // Estimate message height based on clustering
      const isClustered = shouldCluster(index)
      return isClustered ? 80 : 120
    },
    overscan: 5, // Render 5 items above/below viewport
  })

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0 && parentRef.current) {
      const { scrollHeight, scrollTop, clientHeight } = parentRef.current
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 200

      if (isNearBottom) {
        virtualizer.scrollToIndex(messages.length - 1, {
          align: 'end',
          behavior: 'smooth',
        })
      }
    }
  }, [messages.length, virtualizer])

  // Check if user is near bottom
  const isNearBottom = () => {
    if (!parentRef.current) return true
    const { scrollHeight, scrollTop, clientHeight } = parentRef.current
    return scrollHeight - scrollTop - clientHeight < 200
  }

  // Scroll to bottom handler
  const scrollToBottom = () => {
    virtualizer.scrollToIndex(messages.length - 1, {
      align: 'end',
      behavior: 'smooth',
    })
  }

  // Track scroll state
  const handleScroll = () => {
    if (scrollingRef.current) {
      clearTimeout(scrollingRef.current)
    }
    scrollingRef.current = window.setTimeout(() => {
      scrollingRef.current = null
    }, 150)
  }

  const virtualItems = virtualizer.getVirtualItems()

  return (
    <div className={cn('relative h-full', className)}>
      {/* Virtual scroll container */}
      <div
        ref={parentRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto overflow-x-hidden"
        style={{
          contain: 'strict',
        }}
      >
        {/* Virtual items container */}
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {/* Render only visible items */}
          {virtualItems.map((virtualItem) => {
            const message = messages[virtualItem.index]
            return (
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
                <Message
                  {...message}
                  isClusteredWithPrevious={shouldCluster(virtualItem.index)}
                />
              </div>
            )
          })}
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-center py-4">
            <div className="flex items-center gap-2 text-text-secondary">
              <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-current animate-pulse delay-75" />
              <div className="w-2 h-2 rounded-full bg-current animate-pulse delay-150" />
            </div>
          </div>
        )}
      </div>

      {/* Scroll to Bottom Button */}
      {!isNearBottom() && messages.length > 0 && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={shouldAnimate ? springPresets.snappy : { duration: 0 }}
          onClick={scrollToBottom}
          className={cn(
            'fixed bottom-24 right-8',
            'p-3 rounded-full',
            'bg-primary text-white',
            'shadow-lg hover:shadow-xl',
            'hover:scale-110 active:scale-95',
            'transition-all duration-200',
            'cursor-pointer',
            'z-10'
          )}
          aria-label="Scroll to bottom"
        >
          <ArrowDown size={20} />
        </motion.button>
      )}
    </div>
  )
}
