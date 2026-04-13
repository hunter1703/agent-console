'use client'

import { useEffect, useRef, useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface MathRendererProps {
  math: string
  displayMode?: boolean
  className?: string
}

export function MathRenderer({ math, displayMode = false, className = '' }: MathRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const renderMath = async () => {
      if (!containerRef.current) return

      try {
        // KaTeX is already loaded via rehype-katex in MarkdownRenderer
        // This component is for standalone math rendering if needed
        const katex = await import('katex')
        
        katex.default.render(math, containerRef.current, {
          displayMode,
          throwOnError: false,
          errorColor: '#ef4444',
        })
        setError(null)
      } catch (err) {
        console.error('Failed to render math:', err)
        setError('Failed to render math expression')
      }
    }

    renderMath()
  }, [math, displayMode])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(math)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy math expression:', error)
    }
  }

  if (error) {
    return (
      <div className="text-error text-sm">
        {error}
      </div>
    )
  }

  if (displayMode) {
    return (
      <div
        className={`
          my-4
          bg-surface
          rounded-xl
          border border-border-subtle
          overflow-hidden
          ${className}
        `}
      >
        {/* Header with copy button */}
        <div className="flex items-center justify-between h-10 px-3 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border backdrop-blur-sm">
          <span className="text-[11px] uppercase tracking-wide text-primary font-semibold">
            Math Expression
          </span>
          
          <motion.button
            onClick={handleCopy}
            className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-primary/10 transition-colors cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={copied ? 'Copied' : 'Copy math expression'}
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

        {/* Math content */}
        <div className="p-4 text-center overflow-x-auto">
          <div ref={containerRef} />
        </div>
      </div>
    )
  }

  return (
    <span
      ref={containerRef}
      className={`inline-block ${className}`}
    />
  )
}
