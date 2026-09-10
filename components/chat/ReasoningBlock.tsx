'use client'

import React, { useState } from 'react'
import { BrainCircuit, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { springPresets } from '@/lib/constants/animations'
import type { StreamingMessage } from '@/lib/store/chat'

interface ReasoningBlockProps {
  block: NonNullable<StreamingMessage['reasoning']>[number]
}

const ReasoningBlockComponent = function ReasoningBlock({ block }: ReasoningBlockProps) {
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
          // Opacity-only: this renders inside VirtualTimelineList's rows, and reasoning
          // blocks default to expanded while incomplete — a replay burst can mount several
          // of these at once. Animating height fights the virtualizer's own measurement of
          // this row's final size (the same bug already fixed in ToolExecutionCard's Result
          // block); an opacity fade has no layout impact so there's nothing to race.
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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

function areReasoningBlockPropsEqual(prev: ReasoningBlockProps, next: ReasoningBlockProps) {
  return JSON.stringify(prev.block) === JSON.stringify(next.block)
}

export const ReasoningBlock = React.memo(ReasoningBlockComponent, areReasoningBlockPropsEqual)
