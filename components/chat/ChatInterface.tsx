'use client'

/**
 * Chat Interface Component
 * 
 * Main chat interface layout with centered column and tabs.
 * Maximum 768px width, centered, with generous spacing.
 * Enhanced with parallax background effects for depth.
 * 
 * Design Philosophy:
 * - Chat interface is the heart of the experience
 * - Maximum 768px width for optimal readability
 * - Generous 24px vertical spacing between messages
 * - Natural and organic animations
 * - Subtle parallax for depth perception
 */

import { ReactNode, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'
import { LAYOUT } from '@/lib/constants/spacing'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'

export interface ChatInterfaceProps {
  tabs?: ReactNode
  messages?: ReactNode
  planningCard?: ReactNode
  input?: ReactNode
  emptyState?: ReactNode
  className?: string
}

export function ChatInterface({
  tabs,
  messages,
  planningCard,
  input,
  emptyState,
  className,
}: ChatInterfaceProps) {
  const { shouldAnimate } = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Parallax effect for background elements
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })
  
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -50])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100])
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.6, 0.3, 0])

  return (
    <div
      className={cn(
        'flex flex-col h-full relative',
        'bg-background',
        className
      )}
    >
      {/* Animated background elements for depth */}
      {shouldAnimate && (
        <>
          {/* Layer 1 - Slow moving gradient orbs */}
          <motion.div
            style={{ y: y1, opacity }}
            className="absolute top-20 right-10 w-96 h-96 rounded-full bg-gradient-to-br from-primary/5 to-transparent blur-3xl pointer-events-none"
          />
          <motion.div
            style={{ y: y2, opacity }}
            className="absolute bottom-40 left-10 w-80 h-80 rounded-full bg-gradient-to-tr from-primary/8 to-transparent blur-3xl pointer-events-none"
          />
          
          {/* Layer 2 - Floating particles */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -30, 0],
                x: [0, Math.sin(i) * 20, 0],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.5,
              }}
              className="absolute w-2 h-2 rounded-full bg-primary/20 pointer-events-none"
              style={{
                top: `${20 + i * 15}%`,
                left: `${10 + i * 18}%`,
              }}
            />
          ))}
        </>
      )}
      
      {/* Tab Bar - Fixed at top */}
      {tabs && (
        <div className="flex-shrink-0 border-b border-border-subtle bg-surface relative z-10">
          {tabs}
        </div>
      )}

      {/* Main Content Area - Scrollable messages */}
      <div ref={containerRef} className="flex-1 overflow-y-auto relative z-10 min-h-0">
        {/* Centered Column for Messages */}
        <div
          className={cn(
            'mx-auto w-full',
            'px-4 md:px-6',
          )}
          style={{
            maxWidth: `min(${LAYOUT.chat.maxWidthPx}px, 100%)`,
          }}
        >
          {/* Empty State */}
          {emptyState && (
            <div className="flex items-center justify-center min-h-full py-12">
              {emptyState}
            </div>
          )}

          {/* Messages and Planning Card */}
          {!emptyState && (
            <div className="py-12 space-y-8 pb-56">
              {/* Planning Card (if active) */}
              {planningCard && (
                <div className="mb-8">
                  {planningCard}
                </div>
              )}

              {/* Message List */}
              {messages}
            </div>
          )}
        </div>
      </div>

      {/* Message Input - Fixed at Bottom with sophisticated styling */}
      {input && (
        <div
          className={cn(
            'fixed bottom-0 left-0 right-0',
            'bg-gradient-to-t from-background via-background/95 to-background/0',
            'pt-6 pb-6',
            'z-20',
            'backdrop-blur-sm',
          )}
        >
          <div
            className={cn(
              'mx-auto w-full',
              'px-4 md:px-6',
            )}
            style={{
              maxWidth: `min(${LAYOUT.chat.maxWidthPx}px, 100%)`,
            }}
          >
            {input}
          </div>
        </div>
      )}
    </div>
  )
}
