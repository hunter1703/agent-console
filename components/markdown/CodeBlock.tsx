'use client'

import { useState, useEffect } from 'react'
import { Check, Copy } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { codeToHtml } from 'shiki'

interface CodeBlockProps {
  code: string
  language?: string
  className?: string
}

export function CodeBlock({ code, language = 'text', className = '' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const [highlightedCode, setHighlightedCode] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const highlightCode = async () => {
      try {
        setIsLoading(true)
        const html = await codeToHtml(code, {
          lang: language,
          themes: {
            light: 'github-light',
            dark: 'github-dark',
          },
        })
        setHighlightedCode(html)
      } catch (error) {
        console.error('Failed to highlight code:', error)
        // Fallback to plain text
        setHighlightedCode(`<pre><code>${escapeHtml(code)}</code></pre>`)
      } finally {
        setIsLoading(false)
      }
    }

    highlightCode()
  }, [code, language])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy code:', error)
    }
  }

  return (
    <div className={`code-block-wrapper rounded-xl border border-border-subtle overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between h-8 px-3 bg-surface border-b border-border-subtle">
        <span className="text-[11px] uppercase tracking-wide text-text-tertiary font-medium">
          {language}
        </span>
        
        <motion.button
          onClick={handleCopy}
          className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-surface-hover transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={copied ? 'Copied' : 'Copy code'}
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.div
                key="check"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
              >
                <Check size={14} className="text-text-primary" />
              </motion.div>
            ) : (
              <motion.div
                key="copy"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
              >
                <Copy size={14} className="text-text-secondary" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Code content */}
      <div className="overflow-x-auto bg-surface">
        {isLoading ? (
          <div className="p-4 font-mono text-[13px] leading-relaxed text-text-primary">
            <div className="animate-pulse">Loading...</div>
          </div>
        ) : (
          <div
            className="code-content p-4 font-mono text-[13px] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        )}
      </div>
    </div>
  )
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}
