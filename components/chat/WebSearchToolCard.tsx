'use client'

/**
 * WebSearchToolCard Component
 * 
 * Specialized, premium tool execution card for web search & grounding tools
 * (e.g., Brave Web Search, Google Search, Web Research, Tavily).
 * 
 * Replaces raw JSON dumps with a polished, customer-ready experience:
 * - Query hero bar with copy action
 * - Structured web source & grounding cards with domain favicons and citations
 * - Clean markdown/typography rendering for snippets (no escaped # or \n)
 * - Extracted business / entity chips (e.g., LLPIN, Registration, Address)
 * - Expand / collapse for multiple sources
 * - Dual mode: "Visual Presentation" (default) & "Raw JSON" toggle
 */

import React, { useState, useEffect, useMemo, memo } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Globe,
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Code,
  Eye,
} from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { cn, safeStringify } from '@/lib/utils'
import { springPresets } from '@/lib/constants/animations'
import { getToolConfig } from '@/lib/constants/toolConfigs'
import { formatDuration } from '@/lib/utils/formatDate'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'

export interface WebSearchToolProps {
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

export interface ParsedSearchItem {
  id: string
  title: string
  snippet: string
  url?: string
  domain?: string
  favicon?: string
  badges?: string[]
}

/**
 * Check whether a tool call or result corresponds to a web search or grounding action
 */
export function isWebSearchTool(toolName?: string, parameters?: any, result?: any): boolean {
  const name = (toolName || '').toLowerCase()
  if (
    name.includes('search') ||
    name.includes('brave') ||
    name.includes('web') ||
    name.includes('google') ||
    name.includes('bing') ||
    name.includes('duckduckgo') ||
    name.includes('tavily') ||
    name.includes('serp') ||
    name.includes('perplexity') ||
    name.includes('browse') ||
    name.includes('grounding') ||
    name.includes('internet')
  ) {
    return true
  }

  // Check result structure for grounding / search signatures
  if (result) {
    const raw = result.content
    let parsed = result
    if (typeof raw === 'string') {
      try {
        parsed = JSON.parse(raw)
      } catch {
        // ignore
      }
    }
    if (
      parsed?.grounding ||
      parsed?.result?.grounding ||
      parsed?.groundingMetadata ||
      parsed?.web?.results ||
      parsed?.search_results ||
      parsed?.organic_results ||
      parsed?.results ||
      parsed?.items ||
      parsed?.snippets ||
      parsed?.sources ||
      (Array.isArray(parsed) && parsed.length > 0)
    ) {
      return true
    }
  }

  // Check parameters for query
  if (parameters) {
    const p = parameters
    if (
      p.query ||
      p.q ||
      p.search_query ||
      p.search_term ||
      p.search ||
      p.keywords ||
      p.keyword ||
      p.term ||
      p.prompt ||
      p.topic ||
      p.question
    ) {
      return true
    }
  }

  return false
}

/**
 * Extract domain and favicon from URL
 */
function extractDomain(url?: string): { domain: string; favicon: string } | null {
  if (!url) return null
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`)
    const domain = parsed.hostname.replace(/^www\./, '')
    return {
      domain,
      favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
    }
  } catch {
    return null
  }
}

/**
 * Parse any raw result into structured search items across any search engine format
 */
function parseSearchResults(rawResult?: Record<string, any>): ParsedSearchItem[] {
  if (!rawResult) return []

  let data: any = rawResult
  if (typeof rawResult.content === 'string') {
    try {
      data = JSON.parse(rawResult.content)
    } catch {
      // If it's a plain string result, display cleanly as a search response
      return [
        {
          id: 'item-0',
          title: 'Search Overview',
          snippet: rawResult.content,
        },
      ]
    }
  }

  // Handle nested wraps like { result: { ... } } or { data: { ... } } or { response: { ... } }
  if (data?.result && typeof data.result === 'object') {
    data = data.result
  } else if (data?.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
    data = data.data
  } else if (data?.response && typeof data.response === 'object' && !Array.isArray(data.response)) {
    data = data.response
  }

  // Pattern 1: Direct Array of results
  if (Array.isArray(data)) {
    if (data.length === 0) return []
    return data.map((item: any, idx: number) => {
      if (typeof item === 'string') {
        return parseSnippetText(item, idx + 1)
      }
      const url = item.url || item.link || item.href || item.uri
      const domainInfo = extractDomain(url)
      const title = item.title || item.name || domainInfo?.domain || `Result #${idx + 1}`
      const snippet = item.snippet || item.description || item.content || item.text || ''
      return {
        id: `res-${idx}`,
        title,
        snippet,
        url,
        domain: domainInfo?.domain,
        favicon: domainInfo?.favicon,
        badges: item.age || item.date ? [item.age || item.date] : undefined,
      }
    })
  }

  // Pattern 2: Grounding generic format (e.g. Brave Grounding, Vertex/Gemini generic grounding)
  const genericList = data?.grounding?.generic || data?.generic
  if (Array.isArray(genericList) && genericList.length > 0) {
    const items: ParsedSearchItem[] = []
    let index = 0
    for (const group of genericList) {
      const groupUrl = group.url || group.uri || group.link
      const groupTitle = group.title || group.name

      if (Array.isArray(group.snippets)) {
        for (const snippetText of group.snippets) {
          if (!snippetText || typeof snippetText !== 'string') continue
          index++
          items.push(parseSnippetText(snippetText, index, groupUrl, groupTitle))
        }
      } else if (group.snippet || group.text || group.content) {
        index++
        const text = group.snippet || group.text || group.content
        items.push(parseSnippetText(text, index, groupUrl, groupTitle))
      }
    }
    if (items.length > 0) return items
  }

  // Pattern 3: Google Gemini Grounding chunks format (groundingMetadata.groundingChunks)
  const groundingChunks = data?.groundingMetadata?.groundingChunks || data?.grounding_chunks
  if (Array.isArray(groundingChunks) && groundingChunks.length > 0) {
    return groundingChunks.map((chunk: any, idx: number) => {
      const web = chunk.web || chunk
      const url = web.uri || web.url
      const domainInfo = extractDomain(url)
      return {
        id: `grounding-${idx}`,
        title: web.title || domainInfo?.domain || `Grounding Source #${idx + 1}`,
        snippet: web.snippet || web.content || web.text || '',
        url,
        domain: domainInfo?.domain,
        favicon: domainInfo?.favicon,
      }
    })
  }

  // Pattern 4: Web results array (Brave API, Tavily, SerpAPI, Perplexity, Google Custom Search)
  const webResults =
    data?.web?.results ||
    data?.results ||
    data?.search_results ||
    data?.organic_results ||
    data?.items ||
    data?.sources ||
    data?.hits ||
    data?.documents ||
    data?.passages
  if (Array.isArray(webResults) && webResults.length > 0) {
    return webResults.map((item: any, idx: number) => {
      if (typeof item === 'string') {
        return parseSnippetText(item, idx + 1)
      }
      const url = item.url || item.link || item.href || item.uri
      const domainInfo = extractDomain(url)
      const title = item.title || item.name || domainInfo?.domain || `Result #${idx + 1}`
      const snippet = item.description || item.snippet || item.content || item.text || ''
      const badges: string[] = []
      if (item.age) badges.push(item.age)
      if (item.date) badges.push(item.date)
      if (item.source && typeof item.source === 'string') badges.push(item.source)

      return {
        id: `web-${idx}`,
        title,
        snippet,
        url,
        domain: domainInfo?.domain,
        favicon: domainInfo?.favicon,
        badges: badges.length > 0 ? badges : undefined,
      }
    })
  }

  // Pattern 5: Direct snippets array { snippets: [ "..." ] }
  if (Array.isArray(data?.snippets) && data.snippets.length > 0) {
    return data.snippets.map((snip: any, idx: number) => {
      if (typeof snip === 'string') {
        return parseSnippetText(snip, idx + 1)
      }
      return {
        id: `snip-${idx}`,
        title: snip.title || `Source #${idx + 1}`,
        snippet: snip.text || snip.snippet || snip.content || '',
        url: snip.url || snip.link,
      }
    })
  }

  // Pattern 6: Synthesized answer or text overview
  const synthesized = data?.answer || data?.summary || data?.synthesis || data?.overview || data?.text || data?.output || data?.content
  if (synthesized && typeof synthesized === 'string' && synthesized.trim().length > 0) {
    return [
      {
        id: 'overview-1',
        title: 'Search Summary',
        snippet: synthesized.trim(),
      },
    ]
  }

  return []
}

/**
 * Universal snippet parser: extracts headings, dates, URLs, entity attributes, and badges
 */
function parseSnippetText(
  text: string,
  index: number,
  fallbackUrl?: string,
  fallbackTitle?: string
): ParsedSearchItem {
  let cleanText = text.trim()
  let title = fallbackTitle || ''
  let url = fallbackUrl
  const badges: string[] = []

  // Check if first line is a markdown heading (# Heading or ## Heading)
  const lines = cleanText.split('\n')
  if (lines.length > 0) {
    const firstLine = lines[0].trim()
    const headingMatch = firstLine.match(/^#{1,4}\s+(.+)$/)
    if (headingMatch) {
      title = headingMatch[1].trim()
      cleanText = lines.slice(1).join('\n').trim()
    } else if (firstLine.startsWith('**') && firstLine.endsWith('**') && firstLine.length < 120) {
      title = firstLine.replace(/\*\*/g, '').trim()
      cleanText = lines.slice(1).join('\n').trim()
    }
  }

  // Check for URL in the text if not present
  if (!url) {
    const urlMatch = cleanText.match(/https?:\/\/[^\s)"]+/)
    if (urlMatch) {
      url = urlMatch[0]
    }
  }

  // 1. Date / Recency extraction (e.g., "Jul 13, 2026", "2026-07-13", "2 hours ago")
  const dateMatch = cleanText.match(
    /\b(\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4}|\d{4}-\d{2}-\d{2}|[A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4}|\d+\s+(?:hours?|days?|mins?|weeks?|months?|years?)\s+ago)\b/i
  )
  if (dateMatch && dateMatch[1].length < 25) {
    badges.push(dateMatch[1])
  }

  // 2. Specific identifiers & key business/technical attributes (e.g. LLPIN, CIN, ISBN, v1.0, RFC)
  const idMatch = cleanText.match(/\b(LLPIN|CIN|Registration\s*No|ISBN|CVE|RFC|Version|v):\s*([A-Z0-9.-]+)\b/i)
  if (idMatch) {
    badges.push(`${idMatch[1].toUpperCase()}: ${idMatch[2]}`)
  }

  // 3. Status indicator words
  const statusMatch = cleanText.match(/\b(Active|Verified|Official|Updated|Stable|Released|Incorporated)\b/i)
  if (statusMatch && !badges.includes(statusMatch[1])) {
    badges.push(statusMatch[1])
  }

  const domainInfo = extractDomain(url)

  if (!title) {
    title = domainInfo?.domain ? `Source from ${domainInfo.domain}` : `Web Source #${index}`
  }

  return {
    id: `snippet-${index}`,
    title,
    snippet: cleanText,
    url,
    domain: domainInfo?.domain,
    favicon: domainInfo?.favicon,
    badges: badges.length > 0 ? badges : undefined,
  }
}

/**
 * Format markdown snippet safely into clean structured display
 */
function FormattedSnippet({ text }: { text: string }) {
  const lines = text.split('\n').filter((l) => l.trim().length > 0)

  return (
    <div className="space-y-1.5 text-[13px] leading-relaxed text-text-primary/90">
      {lines.map((line, idx) => {
        const trimmed = line.trim()

        // Markdown Subheading
        if (trimmed.startsWith('### ') || trimmed.startsWith('## ')) {
          const headerText = trimmed.replace(/^#{2,3}\s+/, '')
          return (
            <h5 key={idx} className="font-semibold text-text-primary text-[13px] pt-1 text-primary/90">
              {headerText}
            </h5>
          )
        }

        // Bullet point
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const bulletText = trimmed.replace(/^[-*]\s+/, '')
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="text-primary mt-1 text-[10px] leading-none">•</span>
              <span className="flex-1">{formatInlineEmphasis(bulletText)}</span>
            </div>
          )
        }

        // Regular line
        return <p key={idx}>{formatInlineEmphasis(trimmed)}</p>
      })}
    </div>
  )
}

/**
 * Formats inline bold text like **bold** cleanly
 */
function formatInlineEmphasis(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  if (parts.length === 1) return text

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-text-primary">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return part
  })
}

// ─── Main Component ──────────────────────────────────────────────────────────

const WebSearchToolCardComponent = function WebSearchToolCard({
  toolCallId,
  toolName,
  parameters,
  result,
  status,
  timestamp,
  duration,
  agentName,
  className,
}: WebSearchToolProps) {
  const [activeTab, setActiveTab] = useState<'visual' | 'raw'>('visual')
  const [isExpanded, setIsExpanded] = useState(false)
  const [isQueryCopied, setIsQueryCopied] = useState(false)
  const [isResultCopied, setIsResultCopied] = useState(false)
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const { shouldAnimate } = useReducedMotion()

  const config = getToolConfig(toolName || 'brave_web_search')
  const primaryColor = config?.color || '#FB542B'

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

  // Extract query from any parameter structure or name
  const query = useMemo(() => {
    if (!parameters) return ''
    if (typeof parameters === 'string') return parameters
    if (typeof parameters === 'object') {
      const q =
        parameters.query ||
        parameters.q ||
        parameters.search_query ||
        parameters.search_term ||
        parameters.search ||
        parameters.keywords ||
        parameters.keyword ||
        parameters.term ||
        parameters.prompt ||
        parameters.topic ||
        parameters.question ||
        parameters.input ||
        parameters.text
      if (typeof q === 'string' && q.trim().length > 0) return q
      // Fallback: check if any string field exists
      const firstStr = Object.values(parameters).find(
        (v) => typeof v === 'string' && v.trim().length > 0 && v.length < 300
      )
      if (firstStr) return String(firstStr)
    }
    return ''
  }, [parameters])

  // Parse results
  const searchItems = useMemo(() => parseSearchResults(result), [result])

  // Handlers
  const handleCopyQuery = async () => {
    if (!query) return
    try {
      await navigator.clipboard.writeText(String(query))
      setIsQueryCopied(true)
      setTimeout(() => setIsQueryCopied(false), 2000)
    } catch (e) {
      console.error(e)
    }
  }

  const handleCopySnippet = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedSnippetId(id)
      setTimeout(() => setCopiedSnippetId(null), 2000)
    } catch (e) {
      console.error(e)
    }
  }

  const handleCopyRaw = async () => {
    try {
      const raw = result?.content
      const text =
        typeof raw === 'string'
          ? (() => {
              try {
                return JSON.stringify(JSON.parse(raw), null, 2)
              } catch {
                return raw
              }
            })()
          : JSON.stringify(result, null, 2)
      await navigator.clipboard.writeText(text)
      setIsResultCopied(true)
      setTimeout(() => setIsResultCopied(false), 2000)
    } catch (e) {
      console.error(e)
    }
  }

  const displayedItems = isExpanded ? searchItems : searchItems.slice(0, 3)
  const hasMore = searchItems.length > 3

  const StatusIcon =
    status === 'completed'
      ? CheckCircle
      : status === 'failed'
      ? AlertCircle
      : status === 'running'
      ? Loader2
      : Clock

  const statusColor =
    status === 'completed'
      ? '#10B981'
      : status === 'failed'
      ? '#EF4444'
      : status === 'running'
      ? primaryColor
      : '#6B7280'

  return (
    <motion.div
      initial={shouldAnimate ? { opacity: 0, scale: 0.98, y: 8 } : false}
      animate={shouldAnimate ? { opacity: 1, scale: 1, y: 0 } : { opacity: 1 }}
      transition={shouldAnimate ? springPresets.default : { duration: 0 }}
      className={cn(
        'rounded-2xl p-5 mb-5 border transition-all duration-300 relative shadow-sm overflow-hidden',
        className
      )}
      style={{
        background: 'linear-gradient(180deg, rgba(251, 84, 43, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)',
        borderColor: 'rgba(251, 84, 43, 0.22)',
      }}
    >
      {/* Top Accent Gradient Bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r"
        style={{
          backgroundImage: `linear-gradient(90deg, ${primaryColor}, #FF8A00, ${primaryColor})`,
        }}
      />

      {/* Card Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Icon Badge */}
          <div
            className="flex items-center justify-center w-9 h-9 rounded-xl shadow-xs border flex-shrink-0"
            style={{
              background: 'rgba(251, 84, 43, 0.1)',
              borderColor: 'rgba(251, 84, 43, 0.3)',
            }}
          >
            <Search size={18} style={{ color: primaryColor }} strokeWidth={2.2} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-[15px] font-bold tracking-tight text-text-primary">
                {config.displayName || 'Brave Web Search'}
              </h4>
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider border"
                style={{
                  color: primaryColor,
                  background: 'rgba(251, 84, 43, 0.08)',
                  borderColor: 'rgba(251, 84, 43, 0.25)',
                }}
              >
                Web Grounding
              </span>
            </div>
            {agentName && (
              <p className="text-[11px] text-text-tertiary mt-0.5 flex items-center gap-1.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                {agentName}
              </p>
            )}
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Duration Badge */}
          {(duration != null || status === 'running' || status === 'pending') && (
            <span className="text-[11px] font-mono text-text-tertiary bg-surface/80 px-2 py-1 rounded-md border border-border-subtle shadow-xs">
              {formatDuration(duration ?? elapsedTime)}
            </span>
          )}

          {/* Status Indicator */}
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-surface border border-border-subtle">
            <motion.div
              animate={status === 'running' ? { rotate: 360 } : {}}
              transition={status === 'running' ? { duration: 1, repeat: Infinity, ease: 'linear' } : { duration: 0 }}
            >
              <StatusIcon size={14} style={{ color: statusColor }} strokeWidth={2.2} />
            </motion.div>
          </div>

          {/* View Mode Toggle (Visual vs Raw JSON) */}
          <div className="flex items-center bg-surface/80 p-0.5 rounded-lg border border-border-subtle ml-1 shadow-xs">
            <button
              onClick={() => setActiveTab('visual')}
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer',
                activeTab === 'visual'
                  ? 'bg-primary/10 text-primary shadow-xs font-semibold'
                  : 'text-text-tertiary hover:text-text-secondary'
              )}
              title="Formatted Search View"
            >
              <Eye size={12} />
              <span>Visual</span>
            </button>
            <button
              onClick={() => setActiveTab('raw')}
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer',
                activeTab === 'raw'
                  ? 'bg-primary/10 text-primary shadow-xs font-semibold'
                  : 'text-text-tertiary hover:text-text-secondary'
              )}
              title="Raw JSON Payload"
            >
              <Code size={12} />
              <span>JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Query Hero Bar */}
      {query && (
        <div className="mt-4 p-3 rounded-xl bg-surface/80 border border-border-subtle flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-primary/10 text-primary flex-shrink-0">
              <Search size={13} strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider font-semibold text-text-tertiary">
                Search Query
              </div>
              <div className="text-[14px] font-semibold text-text-primary truncate">
                &ldquo;{query}&rdquo;
              </div>
            </div>
          </div>

          <button
            onClick={handleCopyQuery}
            className={cn(
              'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0 cursor-pointer',
              'border border-border-subtle bg-surface hover:bg-surface-hover shadow-xs',
              isQueryCopied && 'border-success/40 bg-success/10 text-success'
            )}
            title="Copy search query"
          >
            {isQueryCopied ? (
              <>
                <Check size={12} className="text-success" />
                <span className="text-success text-[11px]">Copied</span>
              </>
            ) : (
              <>
                <Copy size={12} className="text-text-tertiary" />
                <span className="text-text-secondary text-[11px]">Copy</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Visual Presentation Mode */}
      {activeTab === 'visual' && (
        <div className="mt-4 pt-3 border-t border-border-subtle">
          {/* Running State Banner */}
          {status === 'running' && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-primary/5 border border-primary/20 text-primary text-sm animate-pulse">
              <Loader2 size={16} className="animate-spin flex-shrink-0" />
              <span>Querying live web engines and synthesizing sources...</span>
            </div>
          )}

          {/* Results Summary Bar */}
          {searchItems.length > 0 && (
            <div className="flex items-center justify-between mb-3 text-xs">
              <div className="flex items-center gap-2 text-text-secondary font-medium">
                <Globe size={14} className="text-primary" />
                <span>
                  Found <strong className="text-text-primary">{searchItems.length}</strong> web grounding source
                  {searchItems.length === 1 ? '' : 's'}
                </span>
              </div>
              <button
                onClick={handleCopyRaw}
                className="text-[11px] text-text-tertiary hover:text-text-primary flex items-center gap-1 cursor-pointer transition-colors"
                title="Copy all search content"
              >
                {isResultCopied ? (
                  <>
                    <Check size={11} className="text-success" />
                    <span className="text-success">Copied All</span>
                  </>
                ) : (
                  <>
                    <Copy size={11} />
                    <span>Copy All</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Source Cards */}
          {searchItems.length > 0 ? (
            <div className="space-y-3">
              {displayedItems.map((item, idx) => (
                <div
                  key={item.id}
                  className={cn(
                    'group relative rounded-xl p-3.5 bg-surface/90 border border-border-subtle/80 shadow-xs',
                    'hover:border-primary/40 hover:shadow-md transition-all duration-200'
                  )}
                >
                  {/* Card Header: Citation Chip + Title + Domain + Favicon */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0 flex-wrap">
                      {/* Citation Chip */}
                      <span
                        className="inline-flex items-center justify-center w-5 h-5 rounded-md text-[11px] font-bold text-white shadow-xs flex-shrink-0"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {idx + 1}
                      </span>

                      {/* Domain Favicon */}
                      {item.favicon ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.favicon}
                          alt={item.domain || 'Source'}
                          className="w-4 h-4 rounded-sm flex-shrink-0 object-contain"
                          onError={(e) => {
                            ;(e.target as HTMLElement).style.display = 'none'
                          }}
                        />
                      ) : (
                        <Globe size={14} className="text-text-tertiary flex-shrink-0" />
                      )}

                      {/* Title */}
                      <h5 className="text-[13px] font-bold text-text-primary truncate">
                        {item.title}
                      </h5>

                      {/* Domain Badge */}
                      {item.domain && (
                        <span className="text-[11px] text-text-tertiary font-mono">
                          • {item.domain}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded-md hover:bg-surface-hover text-text-tertiary hover:text-primary transition-colors cursor-pointer"
                          title="Open original source URL"
                        >
                          <ExternalLink size={13} />
                        </a>
                      )}
                      <button
                        onClick={() => handleCopySnippet(item.id, item.snippet)}
                        className="p-1 rounded-md hover:bg-surface-hover text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
                        title="Copy snippet"
                      >
                        {copiedSnippetId === item.id ? (
                          <Check size={13} className="text-success" />
                        ) : (
                          <Copy size={13} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Badges / Key Attributes */}
                  {item.badges && item.badges.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
                      {item.badges.map((badge, bIdx) => (
                        <span
                          key={bIdx}
                          className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Snippet Content */}
                  <div className="pt-1">
                    <FormattedSnippet text={item.snippet} />
                  </div>
                </div>
              ))}

              {/* Expand / Collapse Button */}
              {hasMore && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="w-full py-2 px-3 rounded-xl border border-dashed border-border-subtle bg-surface/50 hover:bg-surface-hover text-xs font-medium text-text-secondary hover:text-text-primary transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp size={14} />
                      <span>Show top 3 sources only</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown size={14} />
                      <span>Show all {searchItems.length} sources ({searchItems.length - 3} more)</span>
                    </>
                  )}
                </button>
              )}
            </div>
          ) : (
            status === 'completed' && (
              <div className="p-4 rounded-xl bg-surface/60 border border-border-subtle text-center text-xs text-text-secondary">
                Web search completed. No text snippets were returned.
              </div>
            )
          )}

          {/* Failed Error Banner */}
          {status === 'failed' && (
            <div className="mt-3 p-3 rounded-xl bg-error/10 border border-error/20 text-error flex items-start gap-2.5 text-xs">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
              <span>Search failed or was interrupted. Check network or search engine quota.</span>
            </div>
          )}
        </div>
      )}

      {/* Raw Technical JSON Mode */}
      {activeTab === 'raw' && (
        <div className="mt-4 pt-3 border-t border-border-subtle space-y-3">
          {/* Raw Parameters */}
          {parameters && Object.keys(parameters).length > 0 && (
            <div>
              <div className="text-[11px] font-medium text-text-secondary mb-1.5 flex items-center justify-between">
                <span>Parameters</span>
                <span className="font-mono text-[10px] text-text-tertiary">application/json</span>
              </div>
              <div className="rounded-lg overflow-hidden border border-border-subtle">
                <SyntaxHighlighter
                  language="json"
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    padding: '12px',
                    background: '#1E1E1E',
                    fontSize: '12px',
                    lineHeight: '1.5',
                  }}
                >
                  {safeStringify(parameters, 2)}
                </SyntaxHighlighter>
              </div>
            </div>
          )}

          {/* Raw Result */}
          {result && (
            <div>
              <div className="text-[11px] font-medium text-text-secondary mb-1.5 flex items-center justify-between">
                <span>Result Payload</span>
                <button
                  onClick={handleCopyRaw}
                  className="flex items-center gap-1 text-[11px] text-text-tertiary hover:text-text-primary cursor-pointer"
                >
                  {isResultCopied ? <Check size={11} className="text-success" /> : <Copy size={11} />}
                  <span>{isResultCopied ? 'Copied' : 'Copy JSON'}</span>
                </button>
              </div>
              <div className="rounded-lg overflow-hidden border border-border-subtle">
                <SyntaxHighlighter
                  language="json"
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    padding: '12px',
                    background: '#1E1E1E',
                    fontSize: '12px',
                    lineHeight: '1.5',
                  }}
                >
                  {(() => {
                    const raw = result?.content
                    if (typeof raw === 'string') {
                      try {
                        return JSON.stringify(JSON.parse(raw), null, 2)
                      } catch {
                        return raw
                      }
                    }
                    return safeStringify(result, 2)
                  })()}
                </SyntaxHighlighter>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

function areWebSearchToolPropsEqual(prev: WebSearchToolProps, next: WebSearchToolProps) {
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

export const WebSearchToolCard = memo(WebSearchToolCardComponent, areWebSearchToolPropsEqual)
