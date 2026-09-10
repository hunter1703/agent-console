'use client'

/**
 * Modern Message Component - 2026 Design
 * 
 * Inspired by Claude's minimal, typography-first approach with creative animations.
 * User messages: Subtle background, no heavy bubbles
 * Agent messages: Plain text on canvas, no background
 * 
 * Design Philosophy:
 * - Minimal and clean
 * - Typography-first
 * - Creative micro-animations
 * - Smooth, delightful interactions
 * - Generous whitespace
 * 
 * Performance:
 * - Memoized to prevent unnecessary re-renders
 * - Custom comparison function for optimal performance
 */

import { motion, useInView } from 'framer-motion'
import { Copy, Check } from 'lucide-react'
import { useState, useRef, memo } from 'react'
import { cn } from '@/lib/utils'
import { springPresets } from '@/lib/constants/animations'
import { Avatar } from '@/components/common/Avatar'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer'
import { AttachmentPreview } from './AttachmentPreview'
import type { MessageAttachment } from '@/lib/api/types'

export interface MessageProps {
  id: string
  content: string
  sender: 'user' | 'agent'
  senderName: string
  senderAvatar?: string
  timestamp: Date
  isClusteredWithPrevious?: boolean
  attachments?: MessageAttachment[]
  onCopy?: () => void
  onRegenerate?: () => void
  onDelete?: () => void
  className?: string
}

// Copy button component - reusable for both message types
const CopyButton = memo(function CopyButton({
  isCopied,
  onClick,
}: {
  isCopied: boolean
  onClick: () => void
}) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.15 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={cn(
        'flex-shrink-0 p-2 rounded-lg transition-all duration-200',
        'bg-surface shadow-md border border-border-subtle',
        'hover:bg-surface-hover cursor-pointer',
        isCopied && 'bg-success/10 border-success/30'
      )}
      aria-label={isCopied ? 'Copied!' : 'Copy message'}
    >
      <motion.div
        animate={
          isCopied
            ? {
                scale: [1, 1.3, 1],
                rotate: [0, 360, 360],
              }
            : {}
        }
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        {isCopied ? (
          <Check size={14} className="text-success" strokeWidth={2.5} />
        ) : (
          <Copy size={14} className="text-text-tertiary" strokeWidth={2} />
        )}
      </motion.div>
    </motion.button>
  )
})

// Message content wrapper - handles layout for both message types
function MessageContent({
  children,
  isHovered,
  isCopied,
  onCopy,
}: {
  children: React.ReactNode
  isHovered: boolean
  isCopied: boolean
  onCopy: () => void
}) {
  return (
    <div className="flex items-center gap-2">
      {children}
      {/* Reserve space for button to prevent layout shift */}
      <div className="w-[34px] h-[34px] flex-shrink-0 flex items-center justify-center">
        <div className={cn("transition-opacity duration-200", isHovered ? "opacity-100" : "opacity-0")}>
          <CopyButton isCopied={isCopied} onClick={onCopy} />
        </div>
      </div>
    </div>
  )
}

// Custom comparison function for memoization
function attachmentsKey(attachments: MessageAttachment[] | undefined): string {
  return attachments?.map((a) => a.source).join(',') ?? ''
}

function arePropsEqual(prevProps: MessageProps, nextProps: MessageProps): boolean {
  return (
    prevProps.id === nextProps.id &&
    prevProps.content === nextProps.content &&
    prevProps.sender === nextProps.sender &&
    prevProps.senderName === nextProps.senderName &&
    prevProps.senderAvatar === nextProps.senderAvatar &&
    prevProps.timestamp.getTime() === nextProps.timestamp.getTime() &&
    prevProps.isClusteredWithPrevious === nextProps.isClusteredWithPrevious &&
    prevProps.className === nextProps.className &&
    // Comparing just .length let a same-length attachments array with different contents
    // (e.g. a corrected/edited source) bail out of re-rendering and keep showing stale
    // AttachmentPreviews.
    attachmentsKey(prevProps.attachments) === attachmentsKey(nextProps.attachments)
  )
}

const MessageComponent = function Message({
  id,
  content,
  sender,
  senderName,
  senderAvatar,
  timestamp,
  isClusteredWithPrevious = false,
  attachments,
  onCopy,
  onRegenerate,
  onDelete,
  className,
}: MessageProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const { shouldAnimate } = useReducedMotion()
  const messageRef = useRef(null)
  const isInView = useInView(messageRef, { once: true, margin: '-50px' })

  const isUser = sender === 'user'

  // Format timestamp
  const timeString = timestamp.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })

  // Handle copy with success feedback
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      onCopy?.()
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Scroll-triggered fade-in animation
  const fadeInVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      },
    },
  }

  return (
    <motion.div
      ref={messageRef}
      variants={shouldAnimate ? fadeInVariants : undefined}
      initial={shouldAnimate ? 'hidden' : false}
      animate={shouldAnimate && isInView ? 'visible' : false}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-role={sender === 'user' ? 'user' : 'assistant'}
      data-message-id={id}
      className={cn(
        'flex gap-4 group relative',
        isClusteredWithPrevious ? 'mt-2' : 'mt-10',
        className
      )}
    >
      {/* Avatar (hidden if clustered) */}
      {!isClusteredWithPrevious && (
        <motion.div
          initial={shouldAnimate ? { scale: 0, rotate: -180 } : false}
          animate={shouldAnimate && isInView ? { scale: 1, rotate: 0 } : { scale: 1, rotate: 0 }}
          transition={shouldAnimate ? { ...springPresets.snappy, delay: 0.1 } : { duration: 0 }}
          className="flex-shrink-0"
        >
          <Avatar
            src={senderAvatar}
            name={senderName}
            size="sm"
            variant={isUser ? 'user' : 'agent'}
          />
        </motion.div>
      )}

      {/* Spacer for clustered messages */}
      {isClusteredWithPrevious && <div className="w-9 flex-shrink-0" />}

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        {/* Sender Name and Timestamp (hidden if clustered) */}
        {!isClusteredWithPrevious && (
          <motion.div
            initial={shouldAnimate ? { opacity: 0, x: -10 } : false}
            animate={shouldAnimate && isInView ? { opacity: 1, x: 0 } : { opacity: 1, x: 0 }}
            transition={shouldAnimate ? { delay: 0.2, duration: 0.3 } : { duration: 0 }}
            className="flex items-baseline gap-2 mb-2"
          >
            <span className="text-sm font-semibold text-text-primary">
              {senderName}
            </span>
            <span className="text-xs text-text-tertiary">
              {timeString}
            </span>
          </motion.div>
        )}

        {/* USER MESSAGE - Minimal bubble */}
        {isUser && (
          <div className="relative inline-flex items-start gap-2">
            <div
              className={cn(
                'px-5 py-3.5',
                'bg-surface-hover/60',
                'rounded-[20px]',
                'border border-border-subtle/50'
              )}
            >
              {content && (
                <div className="text-[15px] text-text-primary whitespace-pre-wrap break-words leading-[1.65] font-normal tracking-[-0.01em] select-text cursor-text">
                  {content}
                </div>
              )}
              {attachments && attachments.length > 0 && (
                <div className={cn("flex flex-col gap-1", content && "mt-2")}>
                  {attachments.map((att) => (
                    <AttachmentPreview key={att.source} attachment={att} />
                  ))}
                </div>
              )}
            </div>
            {/* Only show the message-level copy button when there's text content and no attachments
                (attachments have their own copy button) */}
            {content && (!attachments || attachments.length === 0) && (
              <div className={cn("transition-opacity duration-200 flex-shrink-0 mt-1", isHovered ? "opacity-100" : "opacity-0 pointer-events-none")}>
                <CopyButton isCopied={isCopied} onClick={handleCopy} />
              </div>
            )}
          </div>
        )}

        {/* AGENT MESSAGE - Markdown rendered */}
        {!isUser && (
          <div className="relative">
            <MarkdownRenderer content={content} showCopyButton={false} />
            {attachments && attachments.length > 0 && (
              <div className="flex flex-col gap-1 mt-2">
                {attachments.map((att) => (
                  <AttachmentPreview key={att.source} attachment={att} />
                ))}
              </div>
            )}
            <div className={cn("absolute right-0 top-0 -translate-y-1/2 mt-1 transition-opacity duration-200", isHovered ? "opacity-100" : "opacity-0 pointer-events-none")}>
              <CopyButton isCopied={isCopied} onClick={handleCopy} />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Export memoized component
export const Message = memo(MessageComponent, arePropsEqual)
