'use client'

import { useState, memo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { CodeBlock } from './CodeBlock'
import { InlineCode } from './InlineCode'
import { Blockquote } from './Blockquote'
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from './Table'
import { Link } from './Link'
import { MermaidDiagram } from './MermaidDiagram'

// Characters above which we truncate and show a "Show more" button
const TRUNCATE_THRESHOLD = 8000

interface MarkdownRendererProps {
  content: string
  className?: string
  showCopyButton?: boolean
}

const MarkdownContent = memo(function MarkdownContent({ content, className = '' }: { content: string; className?: string }) {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ children }) => <h1 className="text-[32px] font-bold text-text-primary mt-6 mb-4">{children}</h1>,
          h2: ({ children }) => <h2 className="text-[24px] font-semibold text-text-primary mt-5 mb-3">{children}</h2>,
          h3: ({ children }) => <h3 className="text-[20px] font-semibold text-text-primary mt-4 mb-2">{children}</h3>,
          h4: ({ children }) => <h4 className="text-[17px] font-medium text-text-primary mt-3 mb-2">{children}</h4>,
          h5: ({ children }) => <h5 className="text-[17px] font-medium text-text-primary mt-3 mb-2">{children}</h5>,
          h6: ({ children }) => <h6 className="text-[17px] font-medium text-text-primary mt-3 mb-2">{children}</h6>,
          p: ({ children }) => <p className="text-[15px] leading-relaxed text-text-primary mb-3">{children}</p>,
          pre: ({ children }) => <div className="my-4">{children}</div>,
          ul: ({ children }) => <ul className="list-disc pl-6 mb-3 space-y-2">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-6 mb-3 space-y-2">{children}</ol>,
          li: ({ children }) => <li className="text-[15px] text-text-primary">{children}</li>,
          code: ({ inline, className, children, node, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '')
            const language = match ? match[1] : 'text'
            const code = String(children).replace(/\n$/, '')
            if (match && language === 'mermaid') return <MermaidDiagram chart={code} />
            if (inline || !match) return <InlineCode>{children}</InlineCode>
            return <CodeBlock code={code} language={language} />
          },
          blockquote: ({ children }) => <Blockquote>{children}</Blockquote>,
          a: ({ href, children }) => <Link href={href || '#'}>{children}</Link>,
          table: ({ children }) => <Table>{children}</Table>,
          thead: ({ children }) => <TableHead>{children}</TableHead>,
          tbody: ({ children }) => <TableBody>{children}</TableBody>,
          tr: ({ children }) => <TableRow>{children}</TableRow>,
          th: ({ children, style }) => {
            const align = style?.textAlign as 'left' | 'center' | 'right' | undefined
            return <TableHeaderCell align={align}>{children}</TableHeaderCell>
          },
          td: ({ children, style }) => {
            const align = style?.textAlign as 'left' | 'center' | 'right' | undefined
            return <TableCell align={align}>{children}</TableCell>
          },
          hr: () => <hr className="border-0 h-px bg-border-subtle my-6" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
})

export function MarkdownRenderer({ content, className = '', showCopyButton = true }: MarkdownRendererProps) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const isLong = content.length > TRUNCATE_THRESHOLD
  const displayContent = isLong && !expanded ? content.slice(0, TRUNCATE_THRESHOLD) : content

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
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
