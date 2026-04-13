'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'
import { Copy, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface MermaidDiagramProps {
  chart: string
  className?: string
}

export function MermaidDiagram({ chart, className = '' }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [svgContent, setSvgContent] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    const renderDiagram = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Lazy load mermaid
        const mermaid = (await import('mermaid')).default

        // Configure mermaid with theme
        mermaid.initialize({
          startOnLoad: false,
          theme: theme === 'dark' ? 'dark' : 'default',
          securityLevel: 'strict',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto',
        })

        // Generate unique ID for this diagram
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`

        // Render the diagram
        const { svg } = await mermaid.render(id, chart)

        setSvgContent(svg)
        setIsLoading(false)
      } catch (err) {
        console.error('Failed to render Mermaid diagram:', err)
        setError('Failed to render diagram')
        setIsLoading(false)
      }
    }

    renderDiagram()
  }, [chart, theme])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(chart)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy diagram code:', error)
    }
  }

  if (error) {
    return (
      <div className="my-4 p-6 bg-surface rounded-xl border border-border-subtle">
        <div className="text-error text-sm text-center">
          {error}
        </div>
      </div>
    )
  }

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
          Mermaid Diagram
        </span>
        
        <motion.button
          onClick={handleCopy}
          className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-primary/10 transition-colors cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={copied ? 'Copied' : 'Copy diagram code'}
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

      {/* Diagram content */}
      <div className="p-6 flex items-center justify-center overflow-x-auto">
        {isLoading ? (
          <div className="text-text-tertiary text-sm animate-pulse">
            Loading diagram...
          </div>
        ) : (
          <div
            ref={containerRef}
            className="mermaid-diagram w-full flex justify-center"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}
      </div>
    </div>
  )
}
