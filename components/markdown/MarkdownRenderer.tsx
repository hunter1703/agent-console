'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { cleanMessageContent } from '@/lib/utils'

// Characters above which we truncate and show a "Show more" button
const TRUNCATE_THRESHOLD = 8000

interface MarkdownRendererProps {
  content: string
  className?: string
  showCopyButton?: boolean
}

// ReactMarkdown + KaTeX + Shiki (via CodeBlock) are real weight — deferred out of the
// initial bundle so a plain-text conversation doesn't pay to load a math renderer and a
// syntax highlighter it never uses. Cached after first use, so this only costs anything
// once per session, not once per message.
const MarkdownContent = dynamic(
  () => import('./MarkdownContent').then((mod) => mod.MarkdownContent),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-2 py-1 animate-pulse">
        <div className="h-3 w-3/4 rounded bg-surface-elevated" />
        <div className="h-3 w-1/2 rounded bg-surface-elevated" />
      </div>
    ),
  }
)

export function MarkdownRenderer({ content, className = '', showCopyButton = true }: MarkdownRendererProps) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const cleanedContent = cleanMessageContent(content)
  const isLong = cleanedContent.length > TRUNCATE_THRESHOLD
  const displayContent = isLong && !expanded ? cleanedContent.slice(0, TRUNCATE_THRESHOLD) : cleanedContent

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cleanedContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy markdown:', error)
    }
  }

  return (
    <div className="relative">
      {showCopyButton && (
        <div className="absolute top-0 right-0 z-10">
          <motion.button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-elevated hover:bg-surface-hover border border-border-subtle transition-colors cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            aria-label={copied ? 'Copied' : 'Copy markdown'}
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.div key="check" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.15 }} className="flex items-center gap-2">
                  <Check size={14} className="text-primary" />
                  <span className="text-[13px] text-primary font-medium">Copied!</span>
                </motion.div>
              ) : (
                <motion.div key="copy" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.15 }} className="flex items-center gap-2">
                  <Copy size={14} className="text-text-secondary" />
                  <span className="text-[13px] text-text-secondary font-medium">Copy All</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      )}

      <MarkdownContent content={displayContent} className={className} />

      {isLong && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="mt-2 flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer"
        >
          {expanded ? (
            <><ChevronUp size={14} /> Show less</>
          ) : (
            <><ChevronDown size={14} /> Show more ({Math.round(content.length / 1000)}k chars)</>
          )}
        </button>
      )}
    </div>
  )
}
