'use client'

/**
 * KnowledgeToolCard Component
 * 
 * Specialized, polished tool card for Knowledge Base and Document Reading tools
 * (e.g., read_knowledge_source, query_knowledge_source, search_knowledge).
 * 
 * Replaces raw JSON dumps with a clean, customer-grade document reader:
 * - Document Source header with file/URI chips and 1-click copy
 * - Metadata badges (MIME type, encoding, status, line & word counts)
 * - Beautiful document typography (proper line break and formatting handling)
 * - Expand / collapse for large documents with smooth transition
 * - Copy content action with tactile feedback
 * - Dual view toggle: "Visual Presentation" (default) & "Raw JSON"
 */

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  FileText,
  Database,
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  Code,
  Layers,
  Sparkles,
  ExternalLink,
  Search,
} from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { cn, safeStringify } from '@/lib/utils'
import { springPresets } from '@/lib/constants/animations'
import { getToolConfig } from '@/lib/constants/toolConfigs'
import { formatDuration } from '@/lib/utils/formatDate'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'

export interface KnowledgeToolProps {
  toolCallId: string
  toolName: string
  parameters: Record<string, any>
  result?: Record<string, any>
  status: 'pending' | 'running' | 'completed' | 'failed' | 'awaiting_interrupt'
  timestamp: Date
  duration?: number
  agentName?: string
  className?: string
}

/**
 * Check whether a tool call represents a knowledge-reading or document-retrieval operation
 */
export function isKnowledgeTool(toolName?: string, parameters?: any, result?: any): boolean {
  const name = (toolName || '').toLowerCase()
  if (
    name.includes('knowledge') ||
    name.includes('read_source') ||
    name.includes('read_doc') ||
    name.includes('get_doc') ||
    name.includes('fetch_doc') ||
    name.includes('read_knowledge_source')
  ) {
    return true
  }

  // Check parameters for knowledge source signatures
  if (parameters?.source && typeof parameters.source === 'string') {
    if (
      parameters.source.includes('agentengine') ||
      parameters.source.includes('knowledge') ||
      parameters.source.includes('dataset') ||
      /\.(txt|md|csv|json|pdf|tsv)$/i.test(parameters.source)
    ) {
      return true
    }
  }

  // Check result structure for knowledge source signatures (e.g. content + encoding + mime_type)
  if (result) {
    if (result.mime_type && (result.encoding || result.content)) {
      return true
    }
    if (result.knowledge_source || result.source_id || result.document_id) {
      return true
    }
  }

  return false
}

/**
 * Helper to extract clean document title and filename
 */
function extractDocMeta(parameters: Record<string, any>, result?: Record<string, any>): {
  title: string
  sourceId: string
  fileName?: string
  mimeType?: string
  encoding?: string
  status?: string
  hasSource: boolean
} {
  const hasExplicitSource = Boolean(
    parameters?.source || parameters?.source_id || parameters?.id || parameters?.name
  )
  const source = parameters?.source || parameters?.source_id || parameters?.id || parameters?.name || 'Knowledge Source'
  const sourceId = typeof source === 'string' ? source : String(source)

  let mimeType = result?.mime_type || result?.mimeType || parameters?.mime_type
  let encoding = result?.encoding || parameters?.encoding
  let status = result?.status || (result ? 'success' : undefined)

  // Try to find filename mentioned in result content or source
  let fileName: string | undefined
  const content = typeof result?.content === 'string' ? result.content : ''

  // Look for patterns like (filename.txt) or file: filename.txt
  const fileMatch = content.match(/\(([\w.-]+\.[a-zA-Z0-9]+)\)/) || content.match(/file[:\s]+([\w.-]+\.[a-zA-Z0-9]+)/i)
  if (fileMatch && fileMatch[1]) {
    fileName = fileMatch[1]
  } else if (sourceId.includes('/')) {
    const parts = sourceId.split('/')
    const last = parts[parts.length - 1]
    if (last.includes('.')) {
      fileName = last
    }
  }

  // Title: use first non-empty line of content if short, or filename, or sourceId
  let title = 'Knowledge Document'
  if (fileName) {
    title = fileName
  } else if (content) {
    const firstLine = content.split('\n')[0].replace(/^[#*\s-]+/, '').trim()
    if (firstLine && firstLine.length < 60) {
      title = firstLine
    }
  }

  return {
    title,
    sourceId,
    fileName,
    mimeType,
    encoding,
    status,
    hasSource: hasExplicitSource || Boolean(fileName),
  }
}

export function KnowledgeToolCard({
  toolCallId,
  toolName,
  parameters,
  result,
  status,
  timestamp,
  duration,
  agentName,
  className,
}: KnowledgeToolProps) {
  const [viewMode, setViewMode] = useState<'visual' | 'raw'>('visual')
  const [isExpanded, setIsExpanded] = useState(false)
  const [isContentCopied, setIsContentCopied] = useState(false)
  const [isSourceCopied, setIsSourceCopied] = useState(false)
  const [isQueryCopied, setIsQueryCopied] = useState(false)
  const [isRawParamsCopied, setIsRawParamsCopied] = useState(false)
  const [isRawResultCopied, setIsRawResultCopied] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)

  const { shouldAnimate } = useReducedMotion()
  const config = getToolConfig(toolName || 'read_knowledge_source')
  const Icon = config.icon || BookOpen

  // Extract query if this is a knowledge search/query tool
  const query = useMemo(() => {
    if (!parameters) return ''
    const q =
      parameters.query ||
      parameters.search_query ||
      parameters.q ||
      parameters.search ||
      parameters.keywords ||
      parameters.keyword ||
      parameters.term ||
      parameters.topic
    return typeof q === 'string' && q.trim().length > 0 ? q.trim() : ''
  }, [parameters])

  // Live timer for running tools
  useEffect(() => {
    if (status === 'running' || status === 'pending') {
      const startTime = Date.now()
      const interval = setInterval(() => {
        setElapsedTime((Date.now() - startTime) / 1000)
      }, 100)
      return () => clearInterval(interval)
    }
  }, [status])

  const meta = useMemo(() => extractDocMeta(parameters, result), [parameters, result])

  // Extract clean text content
  const content = useMemo(() => {
    if (!result) return ''
    if (typeof result.content === 'string') {
      // Clean up Windows CRLF carriage returns to standard line breaks
      return result.content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim()
    }
    if (result.text && typeof result.text === 'string') {
      return result.text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim()
    }
    if (result.data) {
      if (typeof result.data === 'string') {
        return result.data.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim()
      }
      if (Array.isArray(result.data)) {
        if (result.data.length === 0) return ''
        return result.data
          .map((item: any) => (typeof item === 'string' ? item : item.content || item.text || safeStringify(item, 2)))
          .join('\n\n---\n\n')
      }
      return safeStringify(result.data, 2)
    }
    // Handle array of results or documents or articles or snippets
    const items = result.results || result.documents || result.articles || result.snippets || result.matches
    if (Array.isArray(items)) {
      if (items.length === 0) return ''
      return items
        .map((item: any) => {
          if (typeof item === 'string') return item
          const itemTitle = item.title || item.name || item.id ? `### ${item.title || item.name || item.id}\n` : ''
          const body = item.content || item.snippet || item.text || item.description || safeStringify(item, 2)
          return `${itemTitle}${body}`
        })
        .join('\n\n---\n\n')
    }
    // Avoid stringifying empty object or object with only status/metadata
    if (typeof result === 'object') {
      const keys = Object.keys(result)
      if (keys.length === 0) return ''
      if (keys.every(k => ['status', 'success', 'mime_type', 'encoding', 'mimeType'].includes(k))) return ''
    }
    return safeStringify(result, 2)
  }, [result])

  const contentLines = useMemo(() => (content ? content.split('\n') : []), [content])
  const wordCount = useMemo(() => (content ? content.trim().split(/\s+/).length : 0), [content])
  const charCount = useMemo(() => (content ? content.length : 0), [content])

  // Needs truncation if more than 10 lines or > 600 characters
  const isLongContent = contentLines.length > 10 || charCount > 600
  const displayedContent = isExpanded || !isLongContent ? content : contentLines.slice(0, 10).join('\n')

  const copyText = async (text: string, setFn: (v: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text)
      setFn(true)
      setTimeout(() => setFn(false), 2000)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  // Status configuration
  const statusConfig = {
    pending: { icon: Clock, label: 'Pending', color: '#6B7280', animate: false },
    running: { icon: Loader2, label: 'Reading', color: config.color, animate: true },
    completed: { icon: CheckCircle, label: 'Loaded', color: '#10B981', animate: false },
    failed: { icon: AlertCircle, label: 'Failed', color: '#EF4444', animate: false },
    awaiting_interrupt: { icon: AlertCircle, label: 'Awaiting Input', color: '#F59E0B', animate: false },
  }
  const currentStatus = statusConfig[status] || statusConfig.completed
  const StatusIcon = currentStatus.icon

  return (
    <motion.div
      data-testid="tool-execution-card"
      initial={shouldAnimate ? { opacity: 0, scale: 0.98, y: 8 } : false}
      animate={shouldAnimate ? { opacity: 1, scale: 1, y: 0 } : { opacity: 1, scale: 1, y: 0 }}
      transition={shouldAnimate ? springPresets.default : { duration: 0 }}
      className={cn(
        'rounded-xl border transition-all duration-300 overflow-hidden mb-4 shadow-sm',
        className
      )}
      style={{
        background: config.background || 'rgba(99, 102, 241, 0.05)',
        borderColor: config.borderColor || 'rgba(99, 102, 241, 0.25)',
      }}
    >
      {/* ─── Header ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border-subtle bg-surface/40 backdrop-blur-sm">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg shadow-xs"
            style={{
              background: 'rgba(99, 102, 241, 0.12)',
              color: config.color || '#6366F1',
            }}
          >
            <Icon size={17} strokeWidth={2.2} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4
                data-testid="tool-name"
                className="text-[14px] font-semibold tracking-tight text-text-primary truncate"
              >
                {config.displayName || 'Read Knowledge Source'}
              </h4>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-500 font-medium">
                Knowledge
              </span>
            </div>
            {agentName && (
              <p className="text-[11px] text-text-tertiary truncate leading-none mt-0.5">
                {agentName}
              </p>
            )}
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2">
          {/* Duration */}
          {(duration || status === 'running' || status === 'pending') && (
            <span className="text-[11px] text-text-tertiary font-mono hidden sm:inline-block">
              {duration ? formatDuration(duration) : formatDuration(elapsedTime)}
            </span>
          )}

          {/* Mode Switcher */}
          <div className="flex items-center bg-surface border border-border-subtle rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('visual')}
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-all duration-150',
                viewMode === 'visual'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-text-tertiary hover:text-text-primary'
              )}
              title="Visual Document Reader"
            >
              <Eye size={12} />
              <span className="hidden sm:inline">Visual</span>
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-all duration-150',
                viewMode === 'raw'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-text-tertiary hover:text-text-primary'
              )}
              title="Raw JSON Payload"
            >
              <Code size={12} />
              <span className="hidden sm:inline">JSON</span>
            </button>
          </div>

          {/* Status Badge */}
          <div
            data-testid="tool-status"
            data-status={status}
            className="flex items-center justify-center w-7 h-7 rounded-lg bg-surface border border-border-subtle shadow-xs"
          >
            <StatusIcon
              size={14}
              style={{ color: currentStatus.color }}
              className={currentStatus.animate ? 'animate-spin' : ''}
              strokeWidth={2.2}
            />
          </div>
        </div>
      </div>

      {/* ─── Body ─────────────────────────────────────────────── */}
      <div className="p-4 space-y-3.5">
        {viewMode === 'visual' ? (
          <>
            {/* Search Query Bar (if query provided) */}
            {query && (
              <div className="rounded-lg bg-surface/70 border border-border-subtle p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1.5 rounded bg-indigo-500/10 text-indigo-500 flex-shrink-0">
                    <Search size={15} strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider block">
                      Search Query
                    </span>
                    <p className="text-[13px] font-medium text-text-primary truncate">
                      &ldquo;{query}&rdquo;
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => copyText(String(query), setIsQueryCopied)}
                  className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-all duration-150 border bg-surface text-text-secondary border-border-subtle hover:bg-surface-hover hover:text-text-primary flex-shrink-0 cursor-pointer"
                  title={isQueryCopied ? 'Copied query' : 'Copy query'}
                >
                  {isQueryCopied ? (
                    <>
                      <Check size={11} className="text-success" strokeWidth={2.5} />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={11} strokeWidth={2} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Document Source Card (shown when source exists or when not a pure query) */}
            {(meta.hasSource || !query) && (
              <div className="rounded-lg bg-surface/70 border border-border-subtle p-3 transition-all duration-200 hover:border-indigo-500/30">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="p-1.5 rounded bg-indigo-500/10 text-indigo-500 mt-0.5">
                      <FileText size={16} strokeWidth={2} />
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-[13px] font-medium text-text-primary truncate">
                        {meta.title}
                      </h5>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[11px] font-mono text-text-tertiary truncate max-w-[280px] sm:max-w-md">
                          {meta.sourceId}
                        </span>
                        <button
                          onClick={() => copyText(meta.sourceId, setIsSourceCopied)}
                          className="p-1 rounded text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors"
                          title={isSourceCopied ? 'Copied URI' : 'Copy source identifier'}
                        >
                          {isSourceCopied ? (
                            <Check size={11} className="text-success" />
                          ) : (
                            <Copy size={11} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Metadata Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 justify-end flex-shrink-0">
                    {meta.mimeType && (
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-surface border border-border-subtle text-text-secondary">
                        {meta.mimeType}
                      </span>
                    )}
                    {meta.encoding && (
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-surface border border-border-subtle text-text-tertiary">
                        {meta.encoding}
                      </span>
                    )}
                    {meta.status && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-success" />
                        {meta.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Document Content View */}
            {status === 'running' || status === 'pending' ? (
              <div className="flex items-center justify-center gap-2 py-8 rounded-lg bg-surface/40 border border-border-subtle text-text-tertiary">
                <Loader2 size={16} className="animate-spin text-indigo-500" />
                <span className="text-[13px]">
                  {query ? 'Searching knowledge repository...' : 'Reading document source...'}
                </span>
              </div>
            ) : content ? (
              <div className="rounded-lg bg-surface border border-border-subtle overflow-hidden">
                {/* Content Header Bar */}
                <div className="flex items-center justify-between px-3.5 py-2 border-b border-border-subtle bg-surface-hover/30">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-medium text-text-secondary">
                      {query ? 'Knowledge Results' : 'Document Content'}
                    </span>
                    <span className="text-[11px] text-text-tertiary font-mono">
                      {contentLines.length} {contentLines.length === 1 ? 'line' : 'lines'} • {wordCount} words
                    </span>
                  </div>

                  <button
                    onClick={() => copyText(content, setIsContentCopied)}
                    className={cn(
                      'flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-all duration-150 border',
                      isContentCopied
                        ? 'bg-success/10 text-success border-success/30'
                        : 'bg-surface text-text-secondary border-border-subtle hover:bg-surface-hover hover:text-text-primary'
                    )}
                  >
                    {isContentCopied ? (
                      <>
                        <Check size={11} className="text-success" strokeWidth={2.5} />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={11} strokeWidth={2} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Content Text Viewer */}
                <div className="p-4 relative">
                  <div className="font-sans text-[13.5px] leading-relaxed text-text-primary whitespace-pre-wrap break-words selection:bg-indigo-500/20">
                    {displayedContent}
                  </div>

                  {/* Gradient Fade if collapsed */}
                  {isLongContent && !isExpanded && (
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-surface via-surface/80 to-transparent pointer-events-none" />
                  )}
                </div>

                {/* Expand / Collapse Button */}
                {isLongContent && (
                  <div className="px-4 py-2 border-t border-border-subtle bg-surface/50 flex justify-center">
                    <button
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="inline-flex items-center gap-1.5 text-[12px] font-medium text-indigo-500 hover:text-indigo-400 transition-colors"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp size={14} />
                          <span>Show Less</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown size={14} />
                          <span>Show Full Content ({contentLines.length - 10} more lines)</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : status === 'completed' ? (
              <div className="p-4 rounded-xl bg-surface/60 border border-border-subtle text-center text-xs text-text-secondary">
                {query
                  ? 'Knowledge search completed. No matching documents or articles were found.'
                  : 'Knowledge reading completed. No content was returned.'}
              </div>
            ) : status === 'failed' ? (
              <div className="p-4 rounded-lg bg-danger/5 border border-danger/20 text-danger text-[13px]">
                {query ? 'Knowledge search failed or was interrupted.' : 'Failed to read knowledge source document.'}
              </div>
            ) : null}
          </>
        ) : (
          /* ─── Raw JSON Mode ─────────────────────────────────────────── */
          <div className="space-y-3">
            {/* Parameters */}
            <div data-testid="tool-arguments">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[12px] font-medium text-text-secondary">Parameters</span>
                <button
                  onClick={() => copyText(safeStringify(parameters, 2), setIsRawParamsCopied)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] text-text-tertiary hover:text-text-primary bg-surface border border-border-subtle"
                >
                  {isRawParamsCopied ? <Check size={11} className="text-success" /> : <Copy size={11} />}
                  <span>{isRawParamsCopied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="rounded-lg overflow-hidden border border-border-subtle">
                <SyntaxHighlighter
                  language="json"
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    padding: '14px',
                    background: '#1E1E1E',
                    fontSize: '12px',
                    lineHeight: '1.5',
                  }}
                >
                  {safeStringify(parameters, 2)}
                </SyntaxHighlighter>
              </div>
            </div>

            {/* Result */}
            {result && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12px] font-medium text-text-secondary">Result</span>
                  <button
                    onClick={() => copyText(safeStringify(result, 2), setIsRawResultCopied)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] text-text-tertiary hover:text-text-primary bg-surface border border-border-subtle"
                  >
                    {isRawResultCopied ? <Check size={11} className="text-success" /> : <Copy size={11} />}
                    <span>{isRawResultCopied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="rounded-lg overflow-hidden border border-border-subtle">
                  <SyntaxHighlighter
                    language="json"
                    style={vscDarkPlus}
                    customStyle={{
                      margin: 0,
                      padding: '14px',
                      background: '#1E1E1E',
                      fontSize: '12px',
                      lineHeight: '1.5',
                    }}
                  >
                    {safeStringify(result, 2)}
                  </SyntaxHighlighter>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

function areKnowledgeToolPropsEqual(prev: KnowledgeToolProps, next: KnowledgeToolProps) {
  return (
    prev.toolCallId === next.toolCallId &&
    prev.toolName === next.toolName &&
    prev.status === next.status &&
    prev.duration === next.duration &&
    prev.agentName === next.agentName &&
    prev.className === next.className &&
    safeStringify(prev.parameters) === safeStringify(next.parameters) &&
    safeStringify(prev.result) === safeStringify(next.result) &&
    prev.timestamp.getTime() === next.timestamp.getTime()
  )
}

export default React.memo(KnowledgeToolCard, areKnowledgeToolPropsEqual)
