'use client'

/**
 * Await Agent Tool Display
 * 
 * Specialized display for await_agent tool with pulsing clock animation.
 * Shows waiting state with progress indicator.
 * 
 * Design Philosophy:
 * - Amber theme (#F59E0B) for waiting state
 * - Pulsing animation shows active waiting
 * - Progress bar shows indeterminate progress
 * - Clear completion or timeout messaging
 */

import { motion } from 'framer-motion'
import { Clock, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { springPresets } from '@/lib/constants/animations'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'
import { ToolExecutionCard, ToolExecutionProps } from '../ToolExecutionCard'

interface AwaitAgentResult {
  status?: 'waiting_for_child' | 'completed' | 'failed' | 'timeout'
  child_session_id?: string
  result?: string
  error?: string
}

export function AwaitAgentTool(props: ToolExecutionProps) {
  const { shouldAnimate } = useReducedMotion()
  const result = props.result as AwaitAgentResult | undefined

  // Show waiting state
  if (props.status === 'executing' || result?.status === 'waiting_for_child') {
    return (
      <ToolExecutionCard {...props}>
        <motion.div
          className="mt-3 p-3 rounded-lg border-l-[3px]"
          style={{
            borderLeftColor: '#F59E0B',
          }}
          animate={
            shouldAnimate
              ? {
                  background: [
                    'rgba(245, 158, 11, 0.05)',
                    'rgba(245, 158, 11, 0.12)',
                    'rgba(245, 158, 11, 0.05)',
                  ],
                }
              : { background: 'rgba(245, 158, 11, 0.05)' }
          }
          transition={
            shouldAnimate
              ? {
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }
              : { duration: 0 }
          }
        >
          {/* Waiting Message */}
          <div className="flex items-center gap-2 mb-3">
            <motion.div
              animate={shouldAnimate ? { rotate: 360 } : {}}
              transition={
                shouldAnimate
                  ? { duration: 2, repeat: Infinity, ease: 'linear' }
                  : { duration: 0 }
              }
            >
              <Loader2 size={16} style={{ color: '#F59E0B' }} strokeWidth={2} />
            </motion.div>
            <span className="text-[13px] text-text-secondary">
              Waiting for child agent to complete...
            </span>
          </div>

          {/* Progress Indicator */}
          <div
            className="h-0.5 rounded-full overflow-hidden"
            style={{ background: 'rgba(245, 158, 11, 0.2)' }}
          >
            <motion.div
              className="h-full"
              style={{ background: '#F59E0B', width: '50%' }}
              animate={
                shouldAnimate
                  ? {
                      x: ['-100%', '200%'],
                    }
                  : {}
              }
              transition={
                shouldAnimate
                  ? {
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'linear',
                    }
                  : { duration: 0 }
              }
            />
          </div>
        </motion.div>
      </ToolExecutionCard>
    )
  }

  // Show completion state
  if (props.status === 'completed' && result?.status === 'completed') {
    return (
      <ToolExecutionCard {...props}>
        <motion.div
          initial={shouldAnimate ? { opacity: 0, scale: 0.9 } : false}
          animate={shouldAnimate ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1 }}
          transition={shouldAnimate ? springPresets.gentle : { duration: 0 }}
          className="mt-3 p-3 rounded-lg border-l-[3px]"
          style={{
            background: 'rgba(16, 185, 129, 0.08)',
            borderLeftColor: '#10B981',
          }}
        >
          {/* Success Header */}
          <div className="flex items-center gap-2 mb-2">
            <motion.div
              initial={shouldAnimate ? { scale: 0, rotate: -90 } : false}
              animate={shouldAnimate ? { scale: 1, rotate: 0 } : { scale: 1, rotate: 0 }}
              transition={shouldAnimate ? { ...springPresets.bouncy, delay: 0.1 } : { duration: 0 }}
            >
              <CheckCircle size={16} style={{ color: '#10B981' }} strokeWidth={2} />
            </motion.div>
            <span className="text-[13px] font-medium" style={{ color: '#10B981' }}>
              Child Agent Completed
            </span>
          </div>

          {/* Result */}
          {result.result && (
            <div className="text-[13px] text-text-primary whitespace-pre-wrap mt-2">
              {result.result}
            </div>
          )}
        </motion.div>
      </ToolExecutionCard>
    )
  }

  // Show timeout/failure state
  if (props.status === 'failed' || result?.status === 'timeout') {
    return (
      <ToolExecutionCard {...props}>
        <motion.div
          initial={shouldAnimate ? { opacity: 0, scale: 0.9 } : false}
          animate={shouldAnimate ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1 }}
          transition={shouldAnimate ? springPresets.gentle : { duration: 0 }}
          className="mt-3 p-3 rounded-lg border-l-[3px]"
          style={{
            background: 'rgba(239, 68, 68, 0.08)',
            borderLeftColor: '#EF4444',
          }}
        >
          <div className="flex items-start gap-2">
            <XCircle size={16} className="flex-shrink-0 mt-0.5" style={{ color: '#EF4444' }} strokeWidth={2} />
            <div className="flex-1">
              <div className="text-[13px] font-medium mb-1" style={{ color: '#EF4444' }}>
                {result?.status === 'timeout' ? 'Timeout' : 'Failed'}
              </div>
              <div className="text-[13px] text-text-secondary">
                {result?.error || 'Child agent did not complete in time'}
              </div>
            </div>
          </div>
        </motion.div>
      </ToolExecutionCard>
    )
  }

  // Default rendering for other states
  return <ToolExecutionCard {...props} />
}
