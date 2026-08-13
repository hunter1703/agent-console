'use client'

/**
 * Send Message Tool Display
 * 
 * Specialized display for send_message tool with flying message animation.
 * Shows message being sent to child session.
 * 
 * Design Philosophy:
 * - Blue theme (#3B82F6) for message sending
 * - Flying animation shows message in transit
 * - Clear target session display
 * - Success interrupt
 */

import { motion } from 'framer-motion'
import { Send, Link2, MessageSquare, CheckCircle } from 'lucide-react'
import { springPresets } from '@/lib/constants/animations'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'
import { ToolExecutionCard, ToolExecutionProps } from '../ToolExecutionCard'

interface SendMessageResult {
  success?: boolean
  error?: string
}

export function SendMessageTool(props: ToolExecutionProps) {
  const { shouldAnimate } = useReducedMotion()
  const result = props.result as SendMessageResult | undefined

  // Show flying animation while executing
  if (props.status === 'executing') {
    return (
      <ToolExecutionCard {...props}>
        <motion.div
          className="mt-3 p-3 rounded-lg border-l-[3px]"
          style={{
            background: 'rgba(59, 130, 246, 0.08)',
            borderLeftColor: '#3B82F6',
          }}
          animate={
            shouldAnimate
              ? {
                  background: [
                    'rgba(59, 130, 246, 0.08)',
                    'rgba(59, 130, 246, 0.15)',
                    'rgba(59, 130, 246, 0.08)',
                  ],
                }
              : {}
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
          <div className="flex items-center gap-2">
            <motion.div
              animate={
                shouldAnimate
                  ? {
                      x: [0, 20, 0],
                      y: [0, -5, 0],
                    }
                  : {}
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
              <Send size={16} style={{ color: '#3B82F6' }} strokeWidth={2} />
            </motion.div>
            <span className="text-[13px] text-text-secondary">
              Sending message to child session...
            </span>
          </div>
        </motion.div>
      </ToolExecutionCard>
    )
  }

  // Show success state
  if (props.status === 'completed' && result?.success) {
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
          <div className="flex items-center gap-2">
            <motion.div
              initial={shouldAnimate ? { scale: 0, rotate: -90 } : false}
              animate={shouldAnimate ? { scale: 1, rotate: 0 } : { scale: 1, rotate: 0 }}
              transition={shouldAnimate ? { ...springPresets.bouncy, delay: 0.1 } : { duration: 0 }}
            >
              <CheckCircle size={16} style={{ color: '#10B981' }} strokeWidth={2} />
            </motion.div>
            <span className="text-[13px] font-medium" style={{ color: '#10B981' }}>
              Message sent successfully
            </span>
          </div>
        </motion.div>
      </ToolExecutionCard>
    )
  }

  // Default rendering for other states
  return <ToolExecutionCard {...props} />
}
