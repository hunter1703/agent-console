'use client'

/**
 * Sidebar Toggle Component
 *
 * Segmented control that switches between "My Agents" and "Recent Chats" views.
 * Uses a sliding filled pill as the active indicator — matches the app screenshot.
 *
 * Design Philosophy:
 * - Filled pill morphs smoothly between tabs (layoutId animation)
 * - Icon animates on tab activation
 * - Active tab: brand color background, white text
 * - Inactive tab: muted text, subtle hover
 */

import { motion } from 'framer-motion'
import { Users, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { springPresets } from '@/lib/constants/animations'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'

export type SidebarView = 'agents' | 'chats'

export interface SidebarToggleProps {
  activeView: SidebarView
  onViewChange: (view: SidebarView) => void
  className?: string
}

export function SidebarToggle({
  activeView,
  onViewChange,
  className,
}: SidebarToggleProps) {
  const { shouldAnimate } = useReducedMotion()

  const tabs = [
    { id: 'agents' as SidebarView, label: 'My Agents', icon: Users },
    { id: 'chats' as SidebarView, label: 'Recent Chats', icon: MessageSquare },
  ]

  return (
    <div
      className={cn(
        'relative flex items-center p-1 bg-surface-elevated rounded-xl',
        className
      )}
      role="tablist"
      aria-label="Sidebar view"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeView === tab.id

        return (
          <button
            key={tab.id}
            onClick={() => onViewChange(tab.id)}
            className={cn(
              'relative flex-1 flex items-center justify-center gap-1.5',
              'h-10 px-3 rounded-lg z-10',
              'text-sm font-medium',
              'cursor-pointer',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
              'transition-colors duration-200',
              isActive
                ? 'text-white'
                : 'text-text-secondary hover:text-text-primary',
            )}
            role="tab"
            aria-selected={isActive}
            aria-controls={`${tab.id}-panel`}
          >
            {/* Sliding pill background */}
            {isActive && (
              <motion.div
                layoutId="sidebar-tab-pill"
                className="absolute inset-0 rounded-lg bg-warning"
                style={{
                  boxShadow: '0 2px 8px rgba(245, 158, 11, 0.35)',
                }}
                transition={
                  shouldAnimate
                    ? { ...springPresets.snappy, duration: 0.22 }
                    : { duration: 0 }
                }
              />
            )}

            {/* Icon — scales up slightly when active */}
            <motion.span
              animate={shouldAnimate && isActive ? { scale: 1.1 } : { scale: 1 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 flex-shrink-0"
            >
              <Icon size={14} strokeWidth={isActive ? 2.5 : 2} />
            </motion.span>

            {/* Label */}
            <span className="relative z-10 truncate">{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}
