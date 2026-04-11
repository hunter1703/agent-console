'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'

interface MermaidDiagramProps {
  chart: string
  className?: string
}

export function MermaidDiagram({ chart, className = '' }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { theme } = useTheme()

  useEffect(() => {
    const renderDiagram = async () => {
      if (!containerRef.current) return

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

        if (containerRef.current) {
          containerRef.current.innerHTML = svg
        }

        setIsLoading(false)
      } catch (err) {
        console.error('Failed to render Mermaid diagram:', err)
        setError('Failed to render diagram')
        setIsLoading(false)
      }
    }

    renderDiagram()
  }, [chart, theme])

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
        my-4 p-6
        bg-surface
        rounded-xl
        border border-border-subtle
        flex items-center justify-center
        overflow-x-auto
        ${className}
      `}
    >
      {isLoading ? (
        <div className="text-text-tertiary text-sm animate-pulse">
          Loading diagram...
        </div>
      ) : (
        <div
          ref={containerRef}
          className="mermaid-diagram w-full flex justify-center"
        />
      )}
    </div>
  )
}
