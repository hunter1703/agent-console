'use client'

import { useState, useEffect, memo } from 'react'
import { Check, Copy } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { codeToHtml } from 'shiki'

interface CodeBlockProps {
  code: string
  language?: string
  className?: string
}

// Custom comparison function for memoization
function arePropsEqual(prevProps: CodeBlockProps, nextProps: CodeBlockProps): boolean {
  return (
    prevProps.code === nextProps.code &&
    prevProps.language === nextProps.language &&
    prevProps.className === nextProps.className
  )
}

const CodeBlockComponent = function CodeBlock({ code, language = 'text', className = '' }: CodeBlockProps) {
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
            dark: 'tokyo-night',
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
    <div className={`code-block-wrapper rounded-xl border-2 border-border overflow-hidden shadow-sm ${className}`}>
      {/* Header with gradient */}
      <div className="flex items-center justify-between h-10 px-3 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border backdrop-blur-sm">
        <span className="text-[11px] uppercase tracking-wide text-primary font-semibold">
          {language}
        </span>
        
        <motion.button
          onClick={handleCopy}
          className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-primary/10 transition-colors cursor-pointer"
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
                <Check size={13} className="text-primary" />
              </motion.div>
            ) : (
              <motion.div
                key="copy"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
              >
                <Copy size={13} className="text-text-secondary hover:text-primary transition-colors" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Code content - let Shiki handle the background colors */}
      <div className="overflow-x-auto relative">
        {isLoading ? (
          <div className="p-4 font-mono text-[13px] leading-relaxed text-text-primary bg-[#f6f8fa] dark:bg-[#1a1b26]">
            <div className="animate-pulse">Loading...</div>
          </div>
        ) : (
          <div
            className="code-content [&_pre]:!p-4 [&_pre]:!m-0 [&_pre]:!font-mono [&_pre]:!text-[13px] [&_pre]:!leading-relaxed"
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

// Export memoized component
export const CodeBlock = memo(CodeBlockComponent, arePropsEqual)
