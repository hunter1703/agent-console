'use client'

/**
 * Chat Interface Component
 */

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { LAYOUT } from '@/lib/constants/spacing'
import { useAutoScroll } from '@/lib/hooks/useAutoScroll'

export interface ChatInterfaceProps {
  tabs?: ReactNode
  messages?: ReactNode
  planningCard?: ReactNode
  input?: ReactNode
  emptyState?: ReactNode
  className?: string
  /** Dependencies that trigger auto-scroll to bottom (e.g. message count, streaming state) */
  scrollDependencies?: any[]
  /** Optional external ref to the scroll container */
  scrollRef?: React.RefObject<HTMLDivElement | null>
}

export function ChatInterface({
  tabs,
  messages,
  planningCard,
  input,
  emptyState,
  className,
  scrollDependencies = [],
  scrollRef,
}: ChatInterfaceProps) {
  // When the caller supplies its own scrollRef (e.g. app/chat/page.tsx's virtualized
  // timeline), it owns scroll-to-bottom via the virtualizer's own followOnAppend —
  // this hook's naive scrollTo(scrollHeight) doesn't know about dynamically-measured
  // item sizes and would fight the virtualizer for scroll position.
  const { containerRef } = useAutoScroll({ dependencies: scrollDependencies, enabled: !scrollRef })
  
  // Merge refs so both useAutoScroll and external consumers can access the scroll container
  const setRefs = (node: HTMLDivElement) => {
    if (containerRef) {
      (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node
    }
    if (scrollRef) {
      (scrollRef as React.MutableRefObject<HTMLDivElement | null>).current = node
    }
  }

  return (
    <div
      className={cn(
        'flex flex-col h-full relative w-full',
        'bg-background',
        className
      )}
    >
      {/* Tab Bar - Fixed at top */}
      {tabs && (
        <div className="flex-shrink-0 border-b border-border-subtle bg-surface relative z-10">
          {tabs}
        </div>
      )}

      {/* Main Content Area - Scrollable messages */}
      <div ref={setRefs} className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden relative z-10">
        <div className="flex justify-center min-h-full">
          <div
            className={cn('w-full', 'px-4 md:px-6')}
            style={{ maxWidth: `min(${LAYOUT.chat.maxWidthPx}px, 100%)` }}
          >
            {/* Empty State */}
            {emptyState && (
              <div className="flex items-center justify-center min-h-full py-12">
                {emptyState}
              </div>
            )}

            {/* Messages */}
            {!emptyState && (
              <div className="py-12 space-y-8 pb-8">
                {planningCard && (
                  <div className="mb-8">{planningCard}</div>
                )}
                {messages}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Message Input - sticky at bottom, inside the flex column so it respects sidebar */}
      {input && (
        <div
          className={cn(
            'flex-shrink-0',
            'bg-gradient-to-t from-background via-background/95 to-background/0',
            'pt-4 pb-6 px-4 md:px-6',
            'flex justify-center',
          )}
        >
          <div
            className="w-full"
            style={{ maxWidth: `min(${LAYOUT.chat.maxWidthPx}px, 100%)` }}
          >
            {input}
          </div>
        </div>
      )}
    </div>
  )
}
