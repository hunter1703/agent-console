'use client'

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { springPresets } from '@/lib/constants/animations'

interface EmptyChatViewProps {
  agentName?: string
  className?: string
}

export function EmptyChatView({
  agentName = 'Agent',
  className = '',
}: EmptyChatViewProps) {
  const suggestions = [
    'What can you help me with?',
    'Tell me about your capabilities',
    'How do I get started?',
  ]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={springPresets.gentle}
      className={`flex flex-col items-center justify-center p-6 space-y-6 text-center min-h-[400px] ${className}`}
    >
      {/* Icon with sparkle animation */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.1, ...springPresets.bouncy }}
        className="text-tertiary"
      >
        <motion.div
          animate={{
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Sparkles size={48} strokeWidth={1.5} />
        </motion.div>
      </motion.div>

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, ...springPresets.gentle }}
        className="space-y-2"
      >
        <h3 className="text-xl font-semibold text-primary">
          Start a conversation with {agentName}
        </h3>
        <p className="text-sm text-secondary max-w-md">
          Ask a question or choose a suggestion below to get started.
        </p>
      </motion.div>

      {/* Suggestions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, ...springPresets.gentle }}
        className="flex flex-col gap-3 w-full max-w-md"
      >
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={suggestion}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: 0.4 + index * 0.1,
              ...springPresets.gentle,
            }}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-3 text-left text-sm text-secondary bg-surface hover:bg-surface-hover border border-subtle rounded-lg transition-colors"
          >
            {suggestion}
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  )
}
