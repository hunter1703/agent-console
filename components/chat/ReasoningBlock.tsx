'use client'

import { useState } from 'react'
import { BrainCircuit, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { springPresets } from '@/lib/constants/animations'
import type { StreamingMessage } from '@/lib/store/chat'

interface ReasoningBlockProps {
  block: NonNullable<StreamingMessage['reasoning']>[number]
}

export function ReasoningBlock({ block }: ReasoningBlockProps) {
  const [isExpanded, setIsExpanded] = useState(!block.isComplete)
  const text = block.thoughts.map((t) => t.content).join('\n\n')

  return (
    <div className="mt-6 rounded-lg border border-border-subtle bg-surface/50">
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left"
      >
        <BrainCircuit
          size={16}
          className={cn('text-text-tertiary', !block.isComplete && 'animate-pulse')}
        />
        <span className="text-[13px] font-medium text-text-secondary">
          {block.isComplete ? 'Thought process' : 'Thinking…'}
        </span>
        <ChevronDown
          size={14}
          className={cn(
            'ml-auto text-text-tertiary transition-transform duration-200',
            isExpanded && 'rotate-180'
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && text && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={springPresets.gentle}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 text-[13px] leading-relaxed text-text-tertiary whitespace-pre-wrap break-words border-t border-border-subtle pt-3">
              {text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
