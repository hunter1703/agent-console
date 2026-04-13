'use client'

/**
 * Message List Component
 * 
 * Container for messages with auto-scroll and clustering logic.
 * Implements message clustering for consecutive messages from same sender.
 * 
 * Design Philosophy:
 * - Generous 24px vertical spacing between message groups
 * - Reduced spacing for clustered messages
 * - Smooth auto-scroll behavior
 * - Natural animations
 */

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Message, MessageProps } from './Message'
import { springPresets } from '@/lib/constants/animations'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'
import { useAutoScroll } from '@/lib/hooks/useAutoScroll'

export interface MessageListProps {
  messages: Omit<MessageProps, 'isClusteredWithPrevious'>[]
  isLoading?: boolean
  className?: string
}

export function MessageList({
  messages,
  isLoading = false,
  className,
}: MessageListProps) {
  const { shouldAnimate } = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  const { isNearBottom, scrollToBottom } = useAutoScroll(containerRef, messages)

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

  // Stagger animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldAnimate ? 0.05 : 0,
      },
    },
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Messages */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-0"
      >
        {messages.map((message, index) => (
          <Message
            key={message.id}
            {...message}
            isClusteredWithPrevious={shouldCluster(index)}
          />
        ))}
      </motion.div>

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
  )
}
