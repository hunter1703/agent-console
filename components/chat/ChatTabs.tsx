'use client'

/**
 * Chat View Tabs Component
 * 
 * Tab bar for Overview and individual session tabs with morphing underline.
 * Horizontal scroll with fade indicators at edges.
 * 
 * Design Philosophy:
 * - Smooth morphing underline animation
 * - Clear visual hierarchy
 * - Responsive horizontal scrolling
 */

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useRef, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { springPresets } from '@/lib/constants/animations'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'

export interface ChatTab {
  id: string
  label: string
  isCloseable?: boolean
}

export interface ChatTabsProps {
  tabs: ChatTab[]
  activeTabId: string
  onTabClick: (tabId: string) => void
  onTabClose?: (tabId: string) => void
  className?: string
}

export function ChatTabs({
  tabs,
  activeTabId,
  onTabClick,
  onTabClose,
  className,
}: ChatTabsProps) {
  const { shouldAnimate } = useReducedMotion()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftFade, setShowLeftFade] = useState(false)
  const [showRightFade, setShowRightFade] = useState(false)

  // Check scroll position to show/hide fade indicators
  const checkScroll = () => {
    if (!scrollContainerRef.current) return

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
    setShowLeftFade(scrollLeft > 0)
    setShowRightFade(scrollLeft < scrollWidth - clientWidth - 1)
  }

  useEffect(() => {
    checkScroll()
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', checkScroll)
      return () => container.removeEventListener('scroll', checkScroll)
    }
  }, [tabs])

  // Scroll to active tab when it changes
  useEffect(() => {
    if (!scrollContainerRef.current) return

    const activeTabElement = scrollContainerRef.current.querySelector(
      `[data-tab-id="${activeTabId}"]`
    ) as HTMLElement

    if (activeTabElement) {
      activeTabElement.scrollIntoView({
        behavior: shouldAnimate ? 'smooth' : 'auto',
        block: 'nearest',
        inline: 'center',
      })
    }
  }, [activeTabId, shouldAnimate])

  return (
    <div className={cn('relative', className)}>
      {/* Left Fade Indicator */}
      {showLeftFade && (
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-surface to-transparent z-10 pointer-events-none" />
      )}

      {/* Right Fade Indicator */}
      {showRightFade && (
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-surface to-transparent z-10 pointer-events-none" />
      )}

      {/* Tabs Container */}
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {tabs.map((tab, index) => (
          <motion.div
            key={tab.id}
            data-tab-id={tab.id}
            className="relative flex-shrink-0"
            initial={shouldAnimate ? { opacity: 0, y: -10 } : false}
            animate={shouldAnimate ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
            transition={shouldAnimate ? { delay: index * 0.05, ...springPresets.default } : { duration: 0 }}
          >
            <motion.button
              onClick={() => onTabClick(tab.id)}
              whileHover={shouldAnimate ? { y: -2 } : undefined}
              whileTap={shouldAnimate ? { scale: 0.95 } : undefined}
              className={cn(
                'relative px-4 py-3 h-11',
                'text-sm font-medium',
                'transition-colors duration-200',
                'cursor-pointer',
                activeTabId === tab.id
                  ? 'text-text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              {/* Animated background on hover */}
              {activeTabId !== tab.id && (
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  className="absolute inset-0 bg-surface-hover rounded-t-lg"
                />
              )}
              
              <span className="relative z-10">{tab.label}</span>
            </motion.button>

            {/* Morphing Underline with glow */}
            {activeTabId === tab.id && (
              <>
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  transition={shouldAnimate ? springPresets.snappy : { duration: 0 }}
                />
                {shouldAnimate && (
                  <motion.div
                    layoutId="activeTabGlow"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-primary/30 blur-sm"
                    transition={springPresets.snappy}
                  />
                )}
              </>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
