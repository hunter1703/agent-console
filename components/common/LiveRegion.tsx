'use client'

/**
 * Live Region Component
 * 
 * ARIA live region for announcing dynamic content changes to screen readers.
 * Used for streaming messages, notifications, and status updates.
 * 
 * Accessibility:
 * - aria-live for dynamic announcements
 * - aria-atomic for complete message reading
 * - Polite vs assertive priorities
 * - Visually hidden but screen reader accessible
 */

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface LiveRegionProps {
  message: string
  priority?: 'polite' | 'assertive' | 'off'
  atomic?: boolean
  className?: string
}

export function LiveRegion({
  message,
  priority = 'polite',
  atomic = true,
  className,
}: LiveRegionProps) {
  const regionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Force screen reader to re-announce when message changes
    if (regionRef.current && message) {
      // Clear and re-add to trigger announcement
      const temp = regionRef.current.textContent
      regionRef.current.textContent = ''
      setTimeout(() => {
        if (regionRef.current) {
          regionRef.current.textContent = message
        }
      }, 10)
    }
  }, [message])

  if (!message) return null

  return (
    <div
      ref={regionRef}
      role="status"
      aria-live={priority}
      aria-atomic={atomic}
      className={cn('sr-only', className)}
    >
      {message}
    </div>
  )
}

/**
 * Toast Live Region
 * Pre-configured for toast notifications
 */
export function ToastLiveRegion({ message }: { message: string }) {
  return <LiveRegion message={message} priority="polite" />
}

/**
 * Alert Live Region
 * Pre-configured for important alerts
 */
export function AlertLiveRegion({ message }: { message: string }) {
  return <LiveRegion message={message} priority="assertive" />
}

/**
 * Status Live Region
 * Pre-configured for status updates
 */
export function StatusLiveRegion({ message }: { message: string }) {
  return <LiveRegion message={message} priority="polite" atomic={false} />
}
