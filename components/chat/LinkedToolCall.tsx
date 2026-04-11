'use client'

import { motion } from 'framer-motion'
import { Link2 } from 'lucide-react'
import { springPresets } from '@/lib/constants/animations'

interface LinkedToolCallProps {
  toolName: string
  toolColor?: string
}

export function LinkedToolCall({ toolName, toolColor = '#3B82F6' }: LinkedToolCallProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={springPresets.snappy}
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/5 dark:bg-white/5"
    >
      <Link2 className="w-3 h-3 text-text-tertiary" />
      <span className="text-xs text-text-secondary">
        <span className="font-medium" style={{ color: toolColor }}>
          {toolName}
        </span>
      </span>
    </motion.div>
  )
}
