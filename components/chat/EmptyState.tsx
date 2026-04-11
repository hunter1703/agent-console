'use client'

/**
 * Chat Empty State Component
 * 
 * Empty state with suggested prompts for starting conversations.
 * Clickable prompts populate the input field.
 * 
 * Design Philosophy:
 * - Welcoming and encouraging
 * - Clear call-to-action
 * - Smooth animations
 */

import { motion } from 'framer-motion'
import { Sparkles, Code, HelpCircle } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { springPresets } from '@/lib/constants/animations'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'
import { AnimatedEyes } from '@/components/common/AnimatedEyes'

export interface SuggestedPrompt {
  icon: React.ReactNode
  text: string
  prompt: string
}

export interface EmptyStateProps {
  onPromptClick?: (prompt: string) => void
  className?: string
}

const defaultPrompts: SuggestedPrompt[] = [
  {
    icon: <Sparkles size={18} />,
    text: 'Help me brainstorm ideas',
    prompt: 'Can you help me brainstorm some creative ideas for my project?',
  },
  {
    icon: <Code size={18} />,
    text: 'Write some code',
    prompt: 'Can you help me write a function that...',
  },
  {
    icon: <HelpCircle size={18} />,
    text: 'Explain a concept',
    prompt: 'Can you explain how... works?',
  },
]

export function EmptyState({ onPromptClick, className }: EmptyStateProps) {
  const { shouldAnimate } = useReducedMotion()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={shouldAnimate ? springPresets.default : { duration: 0 }}
      className={cn(
        'flex flex-col items-center justify-center',
        'text-center max-w-md mx-auto',
        'py-12',
        className
      )}
    >
      {/* Animated Eyes */}
      <motion.div
        initial={shouldAnimate ? { scale: 0, rotate: -180 } : false}
        animate={shouldAnimate ? { scale: 1, rotate: 0 } : { scale: 1, rotate: 0 }}
        transition={shouldAnimate ? { ...springPresets.snappy, delay: 0.2 } : { duration: 0 }}
        className="mb-8"
      >
        <AnimatedEyes size="lg" showHearts={hoveredIndex !== null} />
      </motion.div>

      {/* Heading with stagger animation */}
      <motion.h2
        initial={shouldAnimate ? { opacity: 0, y: 10 } : false}
        animate={shouldAnimate ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
        transition={shouldAnimate ? { delay: 0.1 } : { duration: 0 }}
        className="text-xl font-semibold text-text-primary mb-2"
      >
        Start a conversation
      </motion.h2>

      {/* Description */}
      <motion.p
        initial={shouldAnimate ? { opacity: 0, y: 10 } : false}
        animate={shouldAnimate ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
        transition={shouldAnimate ? { delay: 0.2 } : { duration: 0 }}
        className="text-sm text-text-secondary mb-8"
      >
        Choose a prompt below or type your own message to begin
      </motion.p>

      {/* Suggested Prompts with enhanced animations */}
      <div className="w-full space-y-3">
        {defaultPrompts.map((prompt, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={
              shouldAnimate
                ? { ...springPresets.snappy, delay: 0.4 + index * 0.1 }
                : { duration: 0 }
            }
            whileHover={shouldAnimate ? { scale: 1.02, x: 4 } : undefined}
            whileTap={shouldAnimate ? { scale: 0.98 } : undefined}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => onPromptClick?.(prompt.prompt)}
            className={cn(
              'w-full flex items-center gap-3 relative overflow-hidden',
              'p-4 rounded-xl',
              'bg-surface border border-border-subtle',
              'text-left',
              'hover:bg-surface-hover hover:border-border-medium',
              'hover:shadow-md',
              'transition-all duration-300',
              'cursor-pointer group'
            )}
          >
            {/* Shimmer effect on hover */}
            <motion.div
              initial={{ x: '-100%' }}
              whileHover={{ x: '200%' }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent pointer-events-none"
              style={{ transform: 'skewX(-20deg)' }}
            />
            
            <motion.div
              whileHover={shouldAnimate ? { rotate: [0, -10, 10, 0], scale: 1.1 } : undefined}
              transition={{ duration: 0.5 }}
              className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary relative z-10"
            >
              {prompt.icon}
            </motion.div>
            <span className="text-sm font-medium text-text-primary relative z-10 group-hover:text-primary transition-colors">
              {prompt.text}
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}
