'use client'

/**
 * Agent Card Component
 * 
 * Card displaying agent information with elegant hover effect.
 * Shows avatar, name, and description with edit/delete actions on hover.
 * 
 * Design Philosophy:
 * - Simple scale + lift for elegant interaction
 * - Generous spacing for breathing room
 * - Immediate feedback with smooth animations
 * 
 * Note: Magnetic hover removed - it caused clipping issues and was distracting.
 * Simple scale + lift is more elegant and predictable.
 */

import { motion, AnimatePresence } from 'framer-motion'
import { Edit2, Trash2 } from 'lucide-react'
import { useState, memo } from 'react'
import { cn } from '@/lib/utils'
import { springPresets } from '@/lib/constants/animations'
import { Avatar } from '@/components/common/Avatar'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'

export interface AgentCardProps {
  id: string
  name: string
  description?: string
  avatarUrl?: string
  isActive?: boolean
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
  className?: string
}

// Custom comparison function for memoization
function arePropsEqual(prevProps: AgentCardProps, nextProps: AgentCardProps): boolean {
  return (
    prevProps.id === nextProps.id &&
    prevProps.name === nextProps.name &&
    prevProps.description === nextProps.description &&
    prevProps.avatarUrl === nextProps.avatarUrl &&
    prevProps.isActive === nextProps.isActive &&
    prevProps.className === nextProps.className
  )
}

const AgentCardComponent = function AgentCard({
  id,
  name,
  description,
  avatarUrl,
  isActive = false,
  onClick,
  onEdit,
  onDelete,
  className,
}: AgentCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { shouldAnimate } = useReducedMotion()

  return (
    <motion.div
      whileHover={shouldAnimate ? { scale: 1.02, y: -2 } : undefined}
      transition={springPresets.snappy}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      data-testid="agent-card"
      className={cn(
        'relative group',
        'p-4 rounded-xl',
        'transition-all duration-200',
        'cursor-pointer',
        // Active state
        isActive && 'bg-surface-hover border-l-4 border-primary',
        // Hover state
        'hover:bg-surface-hover hover:shadow-lg',
        className
      )}
      style={{
        // Add glow on hover
        boxShadow: isHovered
          ? '0 4px 16px rgba(245, 158, 11, 0.15)'
          : undefined,
      }}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <Avatar
          src={avatarUrl}
          name={name}
          size="md"
          variant="agent"
        />

        {/* Content - fixed width to prevent reflow */}
        <div className="flex-1 min-w-0 pr-16">
          {/* Name */}
          <h3 className="text-sm font-semibold text-text-primary truncate">
            {name}
          </h3>

          {/* Description */}
          {description && (
            <p className="text-xs text-text-secondary line-clamp-2 mt-1">
              {description}
            </p>
          )}
        </div>

        {/* Actions (show on hover) - absolute positioned to prevent reflow */}
        <AnimatePresence>
          {isHovered && (onEdit || onDelete) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="absolute right-3 top-3 flex items-center gap-1"
            >
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit()
                  }}
                  className="p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface transition-colors cursor-pointer"
                  aria-label="Edit agent"
                >
                  <Edit2 size={14} />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete()
                  }}
                  className="p-1.5 rounded-md text-text-secondary hover:text-error hover:bg-error/10 transition-colors cursor-pointer"
                  aria-label="Delete agent"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// Export memoized component
export const AgentCard = memo(AgentCardComponent, arePropsEqual)
