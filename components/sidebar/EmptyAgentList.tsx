'use client'

import { motion } from 'framer-motion'
import { Bot, Plus } from 'lucide-react'
import { Button } from '../common/Button'
import { springPresets } from '@/lib/constants/animations'

interface EmptyAgentListProps {
  onCreateAgent?: () => void
  className?: string
}

export function EmptyAgentList({
  onCreateAgent,
  className = '',
}: EmptyAgentListProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={springPresets.gentle}
      className={`flex flex-col items-center justify-center p-6 space-y-4 text-center ${className}`}
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, ...springPresets.bouncy }}
        className="text-tertiary"
      >
        <Bot size={48} strokeWidth={1.5} />
      </motion.div>

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, ...springPresets.gentle }}
        className="space-y-2"
      >
        <h3 className="text-lg font-semibold text-primary">No Agents Yet</h3>
        <p className="text-sm text-secondary max-w-xs">
          Get started by creating your first agent. Agents help you automate
          tasks and answer questions.
        </p>
      </motion.div>

      {/* CTA Button */}
      {onCreateAgent && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, ...springPresets.gentle }}
        >
          <Button onClick={onCreateAgent} variant="primary" size="md">
            <Plus size={16} />
            Create Agent
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}
