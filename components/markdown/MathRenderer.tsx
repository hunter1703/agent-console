'use client'

import { useEffect, useRef, useState } from 'react'

interface MathRendererProps {
  math: string
  displayMode?: boolean
  className?: string
}

export function MathRenderer({ math, displayMode = false, className = '' }: MathRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)

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
          my-4 p-4
          bg-surface
          rounded-xl
          text-center
          overflow-x-auto
          ${className}
        `}
      >
        <div ref={containerRef} />
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
