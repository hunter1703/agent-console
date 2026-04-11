'use client'

/**
 * Spawn Agent Tool Display
 * 
 * Specialized display for spawn_agent tool with branching animation.
 * Shows agent creation with visual branching effect.
 * 
 * Design Philosophy:
 * - Purple theme (#8B5CF6) for agent spawning
 * - Branching animation shows parent-child relationship
 * - Link to child session on success
 * - Clear error messaging
 */

import { motion } from 'framer-motion'
import { GitBranch, User, MessageSquare, ExternalLink } from 'lucide-react'
import { springPresets } from '@/lib/constants/animations'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'
import { ToolExecutionCard, ToolExecutionProps } from '../ToolExecutionCard'

interface SpawnAgentResult {
  child_session_id?: string
  error?: string
}

export function SpawnAgentTool(props: ToolExecutionProps) {
  const { shouldAnimate } = useReducedMotion()
  const result = props.result as SpawnAgentResult | undefined

  // If completed successfully, show enhanced result
  if (props.status === 'completed' && result?.child_session_id) {
    return (
      <ToolExecutionCard {...props}>
        {/* Branching Animation */}
        <motion.div
          initial={shouldAnimate ? { opacity: 0, scale: 0.9 } : false}
          animate={shouldAnimate ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1 }}
          transition={shouldAnimate ? springPresets.gentle : { duration: 0 }}
          className="mt-3 p-3 rounded-lg border-l-[3px]"
          style={{
            background: 'rgba(139, 92, 246, 0.08)',
            borderLeftColor: '#8B5CF6',
          }}
        >
          {/* Success Header */}
          <div className="flex items-center gap-2 mb-3">
            <motion.div
              initial={shouldAnimate ? { scale: 0, rotate: -180 } : false}
              animate={shouldAnimate ? { scale: 1, rotate: 0 } : { scale: 1, rotate: 0 }}
              transition={shouldAnimate ? { ...springPresets.bouncy, delay: 0.2 } : { duration: 0 }}
            >
              <GitBranch size={16} style={{ color: '#8B5CF6' }} strokeWidth={2} />
            </motion.div>
            <span className="text-[13px] font-medium" style={{ color: '#8B5CF6' }}>
              Child Session Created
            </span>
          </div>

          {/* Session ID */}
          <div className="mb-3">
            <div className="text-[11px] text-text-tertiary mb-1">Session ID</div>
            <div className="text-[13px] text-text-primary font-mono bg-surface px-2 py-1 rounded border border-border-subtle">
              {result.child_session_id}
            </div>
          </div>

          {/* Link to Child Session */}
          <motion.button
            whileHover={shouldAnimate ? { scale: 1.02, x: 2 } : undefined}
            whileTap={shouldAnimate ? { scale: 0.98 } : undefined}
            onClick={() => {
              // TODO: Navigate to child session
              console.log('Navigate to session:', result.child_session_id)
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium text-white transition-all"
            style={{
              background: '#8B5CF6',
            }}
          >
            <span>View Child Session</span>
            <ExternalLink size={14} strokeWidth={2} />
          </motion.button>
        </motion.div>
      </ToolExecutionCard>
    )
  }

  // Default rendering for other states
  return <ToolExecutionCard {...props} />
}
