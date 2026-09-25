'use client'

/**
 * Tool Execution Card Component
 * 
 * Base component for displaying agent tool executions.
 * Each tool has a distinct visual identity with unique colors, icons, and animations.
 * 
 * Includes:
 * - Direct routing to specialized cards (WebSearchToolCard, KnowledgeToolCard)
 * - Dual-mode view: "Visual Presentation" (default) & "Raw JSON"
 * - Human-readable parameter tags, command blocks, agent pills, and prompt callouts
 * - Clean document and output typography with line break preservation
 * - Morphing status badge, live duration timer, and copy actions
 */

import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  Copy,
  Check,
  Eye,
  Code,
  Terminal,
  Bot,
  MessageSquare,
  GitBranch,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import React, { useState, useEffect, useMemo, memo } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { cn, safeStringify } from '@/lib/utils'
import { springPresets } from '@/lib/constants/animations'
import { getToolConfig } from '@/lib/constants/toolConfigs'
import { formatDuration } from '@/lib/utils/formatDate'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'
import { WebSearchToolCard, isWebSearchTool } from './WebSearchToolCard'
import { KnowledgeToolCard, isKnowledgeTool } from './KnowledgeToolCard'

export interface ToolExecutionProps {
  toolCallId: string
  toolName: string
  parameters: Record<string, any>
  result?: Record<string, any>
  status: 'pending' | 'running' | 'completed' | 'failed' | 'awaiting_interrupt'
  timestamp: Date
  duration?: number // Duration in seconds
  agentName?: string // Display name of the agent that called this tool
  className?: string
}

// Copy button component
function CopyButton({
  isCopied,
  onClick,
}: {
  isCopied: boolean
  onClick: () => void
}) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.15 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={cn(
        'flex-shrink-0 p-1.5 rounded-md transition-all duration-200',
        'bg-surface shadow-xs border border-border-subtle',
        'hover:bg-surface-hover cursor-pointer',
        isCopied && 'bg-success/10 border-success/30'
      )}
      aria-label={isCopied ? 'Copied!' : 'Copy'}
    >
      <motion.div
        animate={
          isCopied
            ? {
                scale: [1, 1.3, 1],
                rotate: [0, 360, 360],
              }
            : {}
        }
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        {isCopied ? (
          <Check size={12} className="text-success" strokeWidth={2.5} />
        ) : (
          <Copy size={12} className="text-text-tertiary" strokeWidth={2} />
        )}
      </motion.div>
    </motion.button>
  )
}

const ToolExecutionCardComponent = function ToolExecutionCard({
  toolCallId,
  toolName,
  parameters,
  result,
  status,
  timestamp,
  duration,
  agentName,
  className,
}: ToolExecutionProps) {
  // If this tool call is a web search / grounding operation, render the specialized WebSearchToolCard
  if (isWebSearchTool(toolName, parameters, result)) {
    return (
      <WebSearchToolCard
        toolCallId={toolCallId}
        toolName={toolName}
        parameters={parameters}
        result={result}
        status={status}
        timestamp={timestamp}
        duration={duration}
        agentName={agentName}
        className={className}
      />
    )
  }

  // If this tool call is a knowledge source reading or document query, render KnowledgeToolCard
  if (isKnowledgeTool(toolName, parameters, result)) {
    return (
      <KnowledgeToolCard
        toolCallId={toolCallId}
        toolName={toolName}
        parameters={parameters}
        result={result}
        status={status}
        timestamp={timestamp}
        duration={duration}
        agentName={agentName}
        className={className}
      />
    )
  }

  const [viewMode, setViewMode] = useState<'visual' | 'raw'>('visual')
  const [isParamsCopied, setIsParamsCopied] = useState(false)
  const [isResultCopied, setIsResultCopied] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const { shouldAnimate } = useReducedMotion()

  // Get tool config with fallback - ensure we always have a valid config
  const getConfigSafely = () => {
    try {
      const cfg = getToolConfig(toolName || 'unknown')
      if (!cfg || !cfg.icon) {
        throw new Error('Invalid config')
      }
      return cfg
    } catch (error) {
      console.error('Failed to get tool config for:', toolName, error)
      return {
        displayName: toolName || 'Unknown Tool',
        description: 'Executing tool',
        icon: Clock,
        color: '#6B7280',
        background: 'rgba(107, 114, 128, 0.05)',
        borderColor: 'rgba(107, 114, 128, 0.2)',
        category: 'other' as const,
      }
    }
  }

  const config = getConfigSafely()
  const Icon = config?.icon || Clock

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

  // Status badge configuration
  const statusConfig = {
    pending: {
      icon: Clock,
      label: 'Pending',
      color: '#6B7280',
      animate: false,
    },
    running: {
      icon: Loader2,
      label: 'Running',
      color: config?.color || '#6B7280',
      animate: true,
    },
    completed: {
      icon: CheckCircle,
      label: 'Completed',
      color: '#10B981',
      animate: false,
    },
    failed: {
      icon: AlertCircle,
      label: 'Failed',
      color: '#EF4444',
      animate: false,
    },
    awaiting_interrupt: {
      icon: AlertCircle,
      label: 'Awaiting Interrupt',
      color: '#F59E0B',
      animate: false,
    },
  }

  const getStatusConfig = () => {
    const statusKey = status as keyof typeof statusConfig
    if (statusConfig[statusKey]) {
      return statusConfig[statusKey]
    }
    return {
      icon: Clock,
      label: status || 'Unknown',
      color: '#6B7280',
      animate: false,
    }
  }

  const currentStatusConfig = getStatusConfig()
  const StatusIcon = currentStatusConfig.icon

  // Copy handlers
  const handleCopyParams = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(parameters, null, 2))
      setIsParamsCopied(true)
      setTimeout(() => setIsParamsCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleCopyResult = async () => {
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
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Parse result text content if present
  const resultContentText = useMemo(() => {
    if (!result) return null
    if (typeof result === 'string') return result
    if (typeof result.content === 'string') {
      try {
        const parsed = JSON.parse(result.content)
        if (typeof parsed === 'string') return parsed
        if (parsed.message) return parsed.message
        if (parsed.output) return parsed.output
        if (parsed.text) return parsed.text
      } catch {
        return result.content.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
      }
    }
    if (typeof result.text === 'string') return result.text.replace(/\r\n/g, '\n')
    if (typeof result.output === 'string') return result.output.replace(/\r\n/g, '\n')
    if (typeof result.stdout === 'string') return result.stdout.replace(/\r\n/g, '\n')
    if (typeof result.message === 'string') return result.message.replace(/\r\n/g, '\n')
    return null
  }, [result])

  const hasParameters = parameters && Object.keys(parameters).length > 0
  const paramEntries = useMemo(() => Object.entries(parameters || {}), [parameters])

  // Extract notable parameters
  const promptParam = parameters?.prompt || parameters?.message || parameters?.instruction || parameters?.query
  const agentIdParam = parameters?.agent_id || parameters?.agentId
  const sessionIdParam = parameters?.session_id || parameters?.sessionId || parameters?.child_session_id
  const commandParam = parameters?.command || parameters?.cmd || parameters?.script

  return (
    <motion.div
      data-testid="tool-execution-card"
      initial={shouldAnimate ? { opacity: 0, scale: 0.95, y: 10 } : false}
      animate={shouldAnimate ? { opacity: 1, scale: 1, y: 0 } : { opacity: 1, scale: 1, y: 0 }}
      transition={shouldAnimate ? springPresets.default : { duration: 0 }}
      className={cn(
        'rounded-xl border transition-all duration-300 overflow-hidden mb-4 shadow-xs',
        className
      )}
      style={{
        background: config?.background || 'rgba(107, 114, 128, 0.05)',
        borderColor: config?.borderColor || 'rgba(107, 114, 128, 0.2)',
      }}
    >
      {/* ─── Header ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border-subtle bg-surface/40 backdrop-blur-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg shadow-xs flex-shrink-0"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              color: config?.color || '#6B7280',
            }}
          >
            <Icon size={17} strokeWidth={2.2} />
          </div>

          <div className="min-w-0">
            <h4
              data-testid="tool-name"
              className="text-[14px] font-semibold tracking-tight truncate"
              style={{ color: config?.color || '#6B7280' }}
            >
              {config?.displayName || 'Unknown Tool'}
            </h4>
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
                  ? 'bg-surface-hover text-text-primary shadow-xs font-semibold'
                  : 'text-text-tertiary hover:text-text-primary'
              )}
              title="Visual Formatted Presentation"
            >
              <Eye size={12} />
              <span className="hidden sm:inline">Visual</span>
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-all duration-150',
                viewMode === 'raw'
                  ? 'bg-surface-hover text-text-primary shadow-xs font-semibold'
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
            <AnimatePresence mode="wait">
              <motion.div
                key={status}
                initial={shouldAnimate ? { scale: 0, rotate: -180 } : false}
                animate={shouldAnimate ? { scale: 1, rotate: 0 } : { scale: 1, rotate: 0 }}
                exit={shouldAnimate ? { scale: 0, rotate: 180 } : undefined}
                transition={shouldAnimate ? springPresets.bouncy : { duration: 0 }}
              >
                <motion.div
                  animate={
                    shouldAnimate && currentStatusConfig.animate
                      ? { rotate: 360 }
                      : {}
                  }
                  transition={
                    shouldAnimate && currentStatusConfig.animate
                      ? { duration: 1, repeat: Infinity, ease: 'linear' }
                      : { duration: 0 }
                  }
                >
                  <StatusIcon
                    size={14}
                    style={{ color: currentStatusConfig.color }}
                    strokeWidth={2}
                  />
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ─── Body ─────────────────────────────────────────────── */}
      <div className="p-4 space-y-3">
        {viewMode === 'visual' ? (
          <>
            {/* Visual Parameters Section */}
            {hasParameters && (
              <div data-testid="tool-arguments" className="space-y-2">
                {/* Specific Highlight: Agent ID */}
                {agentIdParam && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface/80 border border-border-subtle">
                    <Bot size={14} className="text-purple-400" />
                    <span className="text-[11px] text-text-tertiary font-medium">Target Agent:</span>
                    <span className="text-[12px] font-mono font-semibold text-text-primary">
                      {String(agentIdParam)}
                    </span>
                  </div>
                )}

                {/* Specific Highlight: Session ID */}
                {sessionIdParam && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface/80 border border-border-subtle">
                    <GitBranch size={14} className="text-blue-400" />
                    <span className="text-[11px] text-text-tertiary font-medium">Session ID:</span>
                    <span className="text-[11px] font-mono text-text-secondary truncate">
                      {String(sessionIdParam)}
                    </span>
                  </div>
                )}

                {/* Specific Highlight: Terminal Command */}
                {commandParam && (
                  <div className="rounded-lg bg-surface/90 border border-border-subtle p-2.5">
                    <div className="flex items-center gap-1.5 text-[11px] text-text-tertiary mb-1 font-mono">
                      <Terminal size={13} className="text-emerald-400" />
                      <span>Command</span>
                    </div>
                    <code className="text-[12px] font-mono text-emerald-300 break-all">
                      {String(commandParam)}
                    </code>
                  </div>
                )}

                {/* Specific Highlight: Prompt / Message preview */}
                {promptParam && typeof promptParam === 'string' && (
                  <div className="rounded-lg bg-surface/80 border border-border-subtle p-3">
                    <div className="text-[11px] font-medium text-text-tertiary mb-1 flex items-center gap-1.5">
                      <MessageSquare size={13} />
                      <span>Instruction / Prompt</span>
                    </div>
                    <div className="text-[13px] text-text-primary leading-relaxed whitespace-pre-wrap break-words max-h-48 overflow-y-auto">
                      {promptParam}
                    </div>
                  </div>
                )}

                {/* Key-Value Tag Pills for other parameters */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {paramEntries
                    .filter(
                      ([key]) =>
                        !['prompt', 'message', 'instruction', 'agent_id', 'agentId', 'session_id', 'sessionId', 'command', 'cmd', 'script'].includes(
                          key
                        )
                    )
                    .map(([key, value]) => (
                      <div
                        key={key}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface border border-border-subtle text-[11px]"
                      >
                        <span className="text-text-tertiary">{key}:</span>
                        <span className="font-mono text-text-secondary font-medium">
                          {typeof value === 'object' ? safeStringify(value) : String(value)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Visual Result Section */}
            {result && (
              <div className="pt-2 border-t border-border-subtle space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-medium text-text-secondary">
                    Execution Result
                  </span>
                  <CopyButton isCopied={isResultCopied} onClick={handleCopyResult} />
                </div>

                {/* Child session ID confirmation card */}
                {result.child_session_id && (
                  <div className="p-3 rounded-lg bg-surface border border-purple-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded bg-purple-500/10 text-purple-400">
                        <GitBranch size={15} />
                      </div>
                      <div>
                        <div className="text-[12px] font-medium text-text-primary">
                          Child Agent Session Started
                        </div>
                        <div className="text-[11px] font-mono text-text-tertiary">
                          {result.child_session_id}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20">
                      Active
                    </span>
                  </div>
                )}

                {/* Clean formatted content / text */}
                {resultContentText ? (
                  <div className="rounded-lg bg-surface border border-border-subtle p-3.5 relative overflow-hidden">
                    <div className="text-[13px] leading-relaxed text-text-primary whitespace-pre-wrap break-words">
                      {isExpanded || resultContentText.length < 500
                        ? resultContentText
                        : `${resultContentText.slice(0, 500)}...`}
                    </div>

                    {resultContentText.length >= 500 && (
                      <div className="mt-2 pt-2 border-t border-border-subtle flex justify-center">
                        <button
                          onClick={() => setIsExpanded(!isExpanded)}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-text-secondary hover:text-text-primary transition-colors"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp size={13} />
                              <span>Show Less</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown size={13} />
                              <span>Show Full Output</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Standard structured key-value display if no raw text */
                  <div className="rounded-lg bg-surface border border-border-subtle p-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px]">
                      {Object.entries(result).map(([k, v]) => (
                        <div key={k} className="p-2 rounded bg-surface-hover/40 border border-border-subtle">
                          <span className="text-[11px] text-text-tertiary block font-mono">{k}</span>
                          <span className="font-medium text-text-primary break-all">
                            {typeof v === 'object' ? safeStringify(v) : String(v)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          /* ─── Raw JSON Mode ─────────────────────────────────────────── */
          <div className="space-y-3">
            {/* Parameters */}
            {hasParameters && (
              <div data-testid="tool-arguments">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12px] font-medium text-text-secondary">Parameters</span>
                  <CopyButton isCopied={isParamsCopied} onClick={handleCopyParams} />
                </div>
                <div
                  className="rounded-lg overflow-hidden border"
                  style={{
                    borderColor: config?.borderColor || 'rgba(107, 114, 128, 0.2)',
                  }}
                >
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
                    codeTagProps={{
                      style: {
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                      },
                    }}
                  >
                    {safeStringify(parameters, 2)}
                  </SyntaxHighlighter>
                </div>
              </div>
            )}

            {/* Result */}
            {result && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12px] font-medium text-text-secondary">Result</span>
                  <CopyButton isCopied={isResultCopied} onClick={handleCopyResult} />
                </div>

                <div
                  className="rounded-lg overflow-hidden border"
                  style={{
                    borderColor: config?.borderColor || 'rgba(107, 114, 128, 0.2)',
                  }}
                >
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
                    codeTagProps={{
                      style: {
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                      },
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
      </div>
    </motion.div>
  )
}

function areToolExecutionPropsEqual(prev: ToolExecutionProps, next: ToolExecutionProps) {
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

export const ToolExecutionCard = React.memo(ToolExecutionCardComponent, areToolExecutionPropsEqual)
