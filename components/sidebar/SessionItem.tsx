'use client'

/**
 * Session Item Component
 * 
 * Session list item with hierarchy indicators and expand/collapse.
 * Displays agent avatar, name, last message preview, and timestamp.
 * Supports nested sessions with depth indicators.
 * 
 * Design Philosophy:
 * - Clear visual hierarchy with indentation
 * - Smooth expand/collapse animations
 * - Immediate feedback on interactions
 */

import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { springPresets } from '@/lib/constants/animations'
import { Avatar } from '@/components/common/Avatar'
import { formatRelativeTime } from '@/lib/utils/formatDate'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'

export interface SessionItemProps {
  id: string
  agentName: string
  agentAvatarUrl?: string
  lastMessage?: string
  lastActivity: Date
  childCount?: number
  depth?: number
  isActive?: boolean
  isExpanded?: boolean
  onClick?: () => void
  onToggleExpand?: () => void
  onDelete?: () => void
  children?: React.ReactNode
  className?: string
}

export function SessionItem({
  id,
  agentName,
  agentAvatarUrl,
  lastMessage,
  lastActivity,
  childCount = 0,
  depth = 0,
  isActive = false,
  isExpanded = false,
  onClick,
  onToggleExpand,
  onDelete,
  children,
  className,
}: SessionItemProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { shouldAnimate } = useReducedMotion()
  const hasChildren = childCount > 0

  // Calculate left padding based on depth
  const leftPadding = 12 + depth * 16

  return (
    <div className={cn('relative', className)}>
      {/* Depth connector line */}
      {depth > 0 && (
        <div
          className="absolute top-0 bottom-0 w-px bg-border-subtle/60"
          style={{ left: depth * 16 + 4 }}
        />
      )}

      {/* Session row — outer wrapper keeps layout position, buttons anchor here */}
      <div
        className="relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Active indicator */}
        {isActive && (
          <div className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-primary rounded-full z-10" />
        )}

        {/* Visual layer: receives hover animation */}
        <motion.div
          onClick={onClick}
          whileHover={shouldAnimate ? { x: 2 } : undefined}
          transition={springPresets.snappy}
          className={cn(
            'relative cursor-pointer py-2.5 rounded-lg',
            'transition-colors duration-150',
            isActive ? 'bg-primary/8 pl-3' : 'hover:bg-surface-hover',
          )}
          style={{
            paddingLeft: isActive ? Math.max(12, leftPadding) : leftPadding,
            paddingRight: 40, // reserve space for delete button
            boxShadow: isActive
              ? '0 1px 6px rgba(245, 158, 11, 0.08)'
              : isHovered
              ? '0 2px 10px rgba(0,0,0,0.06)'
              : undefined,
          }}
        >
          <div className="flex items-center gap-2.5">
            {/* Expand/collapse chevron */}
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleExpand?.()
                }}
                className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded text-text-tertiary hover:text-text-primary hover:bg-surface-elevated transition-colors cursor-pointer"
                aria-label={isExpanded ? 'Collapse' : 'Expand'}
                aria-expanded={isExpanded}
              >
                <motion.div
                  animate={{ rotate: isExpanded ? 90 : 0 }}
                  transition={shouldAnimate ? springPresets.snappy : { duration: 0 }}
                >
                  <ChevronRight size={12} />
                </motion.div>
              </button>
            )}

            {/* Avatar */}
            <Avatar src={agentAvatarUrl} name={agentName} size="sm" variant="agent" />

            {/* Text content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-semibold text-text-primary truncate leading-snug">
                  {agentName}
                </h4>
                {hasChildren && (
                  <span className="flex-shrink-0 px-1 py-0.5 text-[9px] font-semibold text-text-tertiary bg-surface-elevated rounded-full leading-none">
                    {childCount}
                  </span>
                )}
              </div>
              {lastMessage && (
                <p className="text-[11px] text-text-secondary truncate mt-0.5 leading-snug">
                  {lastMessage}
                </p>
              )}
              <p className="text-[10px] text-text-tertiary mt-0.5 font-medium tracking-tight">
                {formatRelativeTime(lastActivity)}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Delete button — anchored to outer wrapper, never moves */}
        <AnimatePresence>
          {isHovered && onDelete && (
            <motion.button
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.12, ease: 'easeOut' }}
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className={cn(
                'absolute right-2 top-1/2 -translate-y-1/2',
                'p-1.5 rounded-lg text-text-tertiary z-10',
                'hover:text-error hover:bg-error/10',
                'transition-colors duration-150',
                'cursor-pointer',
              )}
              aria-label="Delete session"
            >
              <Trash2 size={12} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Child sessions (recursive) */}
      <AnimatePresence initial={false}>
        {isExpanded && children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={shouldAnimate ? springPresets.default : { duration: 0 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
