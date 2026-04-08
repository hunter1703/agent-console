'use client'

/**
 * Agent List Component
 * 
 * Container for displaying list of agents with stagger animation.
 * Includes loading state, empty state, and smooth animations.
 * 
 * Design Philosophy:
 * - Stagger animation for delightful entrance
 * - Clear empty state with call-to-action
 * - Smooth loading transitions
 */

import { motion } from 'framer-motion'
import { Plus, Users } from 'lucide-react'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { springPresets } from '@/lib/constants/animations'
import { AgentCard } from './AgentCard'
import { Skeleton } from '@/components/common/Skeleton'
import { Button } from '@/components/common/Button'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'

export interface Agent {
  id: string
  name: string
  description?: string
  avatarUrl?: string
}

export interface AgentListProps {
  agents: Agent[]
  activeAgentId?: string
  isLoading?: boolean
  onAgentClick?: (agentId: string) => void
  onAgentEdit?: (agentId: string) => void
  onAgentDelete?: (agentId: string) => void
  onCreateAgent?: () => void
  className?: string
}

export function AgentList({
  agents,
  activeAgentId,
  isLoading = false,
  onAgentClick,
  onAgentEdit,
  onAgentDelete,
  onCreateAgent,
  className,
}: AgentListProps) {
  const { shouldAnimate } = useReducedMotion()

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

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: springPresets.default,
    },
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('space-y-2 p-4', className)}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-3 rounded-xl">
            <div className="flex items-start gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Empty state
  if (agents.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={shouldAnimate ? springPresets.default : { duration: 0 }}
        className={cn(
          'flex flex-col items-center justify-center',
          'p-8 text-center',
          className
        )}
      >
        <div className="w-12 h-12 rounded-full bg-surface-elevated flex items-center justify-center mb-4">
          <Users size={24} className="text-text-tertiary" />
        </div>
        <h3 className="text-sm font-semibold text-text-primary mb-2">
          No agents yet
        </h3>
        <p className="text-xs text-text-secondary mb-4 max-w-[200px]">
          Create your first agent to get started with conversations
        </p>
        {onCreateAgent && (
          <Button
            size="sm"
            icon={<Plus size={16} />}
            onClick={onCreateAgent}
          >
            Create Agent
          </Button>
        )}
      </motion.div>
    )
  }

  // Agent list
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn('space-y-3', className)}
    >
      {agents.map((agent) => (
        <motion.div
          key={agent.id}
          variants={shouldAnimate ? itemVariants : undefined}
          initial={shouldAnimate ? "hidden" : false}
          animate={shouldAnimate ? "visible" : undefined}
        >
          <AgentCard
            id={agent.id}
            name={agent.name}
            description={agent.description}
            avatarUrl={agent.avatarUrl}
            isActive={agent.id === activeAgentId}
            onClick={() => onAgentClick?.(agent.id)}
            onEdit={() => onAgentEdit?.(agent.id)}
            onDelete={() => onAgentDelete?.(agent.id)}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}
