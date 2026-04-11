'use client'

/**
 * Web Research Tool Display
 * 
 * Specialized display for web_research tool with scanning animation.
 * Shows search query and results with expandable details.
 * 
 * Design Philosophy:
 * - Green theme (#10B981) for research/search
 * - Scanning animation shows active search
 * - Expandable results with source links
 * - Clear result count and status
 */

import { motion } from 'framer-motion'
import { Search, ExternalLink, CheckCircle, Globe } from 'lucide-react'
import { useState } from 'react'
import { springPresets } from '@/lib/constants/animations'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'
import { ToolExecutionCard, ToolExecutionProps } from '../ToolExecutionCard'

interface SearchResult {
  title: string
  url: string
  snippet: string
}

interface WebResearchResult {
  results?: SearchResult[]
  result_count?: number
  error?: string
}

export function WebResearchTool(props: ToolExecutionProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { shouldAnimate } = useReducedMotion()
  const result = props.result as WebResearchResult | undefined

  // Show scanning animation while executing
  if (props.status === 'executing') {
    return (
      <ToolExecutionCard {...props}>
        <motion.div
          className="mt-3 p-3 rounded-lg border-l-[3px]"
          style={{
            borderLeftColor: '#10B981',
          }}
          animate={
            shouldAnimate
              ? {
                  background: [
                    'rgba(16, 185, 129, 0.05)',
                    'rgba(16, 185, 129, 0.12)',
                    'rgba(16, 185, 129, 0.05)',
                  ],
                }
              : { background: 'rgba(16, 185, 129, 0.05)' }
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
            <div className="relative">
              <Search size={16} style={{ color: '#10B981' }} strokeWidth={2} />
              {shouldAnimate && (
                <motion.div
                  className="absolute inset-0 border-2 rounded-full"
                  style={{ borderColor: '#10B981' }}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.6, 0, 0.6],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeOut',
                  }}
                />
              )}
            </div>
            <span className="text-[13px] text-text-secondary">
              Searching the web...
            </span>
          </div>
        </motion.div>
      </ToolExecutionCard>
    )
  }

  // Show results
  if (props.status === 'completed' && result?.results) {
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
          {/* Results Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <motion.div
                initial={shouldAnimate ? { scale: 0, rotate: -90 } : false}
                animate={shouldAnimate ? { scale: 1, rotate: 0 } : { scale: 1, rotate: 0 }}
                transition={shouldAnimate ? { ...springPresets.bouncy, delay: 0.1 } : { duration: 0 }}
              >
                <CheckCircle size={16} style={{ color: '#10B981' }} strokeWidth={2} />
              </motion.div>
              <span className="text-[13px] font-medium" style={{ color: '#10B981' }}>
                Found {result.result_count || result.results.length} results
              </span>
            </div>

            {result.results.length > 0 && (
              <motion.button
                whileHover={shouldAnimate ? { scale: 1.05 } : undefined}
                whileTap={shouldAnimate ? { scale: 0.95 } : undefined}
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-[12px] font-medium px-2 py-1 rounded-md hover:bg-surface-hover transition-colors"
                style={{ color: '#10B981' }}
              >
                {isExpanded ? 'Hide Results' : 'Show Results'}
              </motion.button>
            )}
          </div>

          {/* Expandable Results */}
          <motion.div
            initial={false}
            animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
            transition={shouldAnimate ? springPresets.gentle : { duration: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 pt-2">
              {result.results.slice(0, 5).map((searchResult, index) => (
                <motion.div
                  key={index}
                  initial={shouldAnimate ? { opacity: 0, x: -10 } : false}
                  animate={shouldAnimate ? { opacity: 1, x: 0 } : { opacity: 1, x: 0 }}
                  transition={shouldAnimate ? { delay: index * 0.1 } : { duration: 0 }}
                  className="p-2 rounded-lg bg-surface border border-border-subtle hover:border-border-medium transition-colors"
                >
                  {/* Title with Link */}
                  <a
                    href={searchResult.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2 group"
                  >
                    <Globe size={14} className="flex-shrink-0 mt-0.5 text-text-tertiary" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-primary group-hover:underline truncate">
                        {searchResult.title}
                      </div>
                      <div className="text-[12px] text-text-secondary mt-1 line-clamp-2">
                        {searchResult.snippet}
                      </div>
                      <div className="text-[11px] text-text-tertiary mt-1 truncate font-mono">
                        {searchResult.url}
                      </div>
                    </div>
                    <ExternalLink size={12} className="flex-shrink-0 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </ToolExecutionCard>
    )
  }

  // Default rendering for other states
  return <ToolExecutionCard {...props} />
}
