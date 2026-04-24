'use client'

/**
 * Tool Execution Card Component
 * 
 * Base component for displaying agent tool executions.
 * Each tool has a distinct visual identity with unique colors, icons, and animations.
 * 
 * Design Philosophy:
 * - Clear visual feedback about tool status
 * - Distinct identity for each tool type
 * - Smooth animations for state changes
 * - Expandable details for parameters and results
 * - Liquid morphing status badge on hover
 * - Copy functionality for parameters and results
 */

import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, CheckCircle, Clock, Loader2, Copy, Check } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { cn } from '@/lib/utils'
import { springPresets } from '@/lib/constants/animations'
import { getToolConfig } from '@/lib/constants/toolConfigs'
import { formatDuration } from '@/lib/utils/formatDate'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'

export interface ToolExecutionProps {
  toolCallId: string
  toolName: string
  parameters: Record<string, any>
  result?: Record<string, any>
  status: 'pending' | 'running' | 'completed' | 'failed' | 'awaiting_confirmation'
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
        'bg-surface shadow-sm border border-border-subtle',
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

export function ToolExecutionCard({
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
  const [isParamsCopied, setIsParamsCopied] = useState(false)
  const [isResultCopied, setIsResultCopied] = useState(false)
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
        // Convert elapsed milliseconds to seconds
        setElapsedTime((Date.now() - startTime) / 1000)
      }, 100) // Update every 100ms for smooth animation
      
      return () => clearInterval(interval)
    }
  }, [status])

  // Status badge configuration - defined after config is initialized
  const statusConfig = {
    pending: {
      icon: Clock,
      label: 'Pending',
      color: '#6B7280', // Gray
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
      color: '#10B981', // Green
    },
    failed: {
      icon: AlertCircle,
      label: 'Failed',
      color: '#EF4444', // Red
    },
    awaiting_confirmation: {
      icon: AlertCircle,
      label: 'Awaiting Confirmation',
      color: '#F59E0B', // Amber
    },
  }

  // Get status config with fallback for unknown status values
  const getStatusConfig = () => {
    const statusKey = status as keyof typeof statusConfig
    if (statusConfig[statusKey]) {
      return statusConfig[statusKey]
    }
    
    // Fallback for unknown status values
    console.warn('Unknown tool execution status:', status, 'for tool:', toolName)
    return {
      icon: Clock,
      label: status || 'Unknown',
      color: '#6B7280', // Gray
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
      const text = typeof raw === 'string'
        ? (() => { try { return JSON.stringify(JSON.parse(raw), null, 2) } catch { return raw } })()
        : JSON.stringify(result, null, 2)
      await navigator.clipboard.writeText(text)
      setIsResultCopied(true)
      setTimeout(() => setIsResultCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <motion.div
      initial={shouldAnimate ? { opacity: 0, scale: 0.95, y: 10 } : false}
      animate={shouldAnimate ? { opacity: 1, scale: 1, y: 0 } : { opacity: 1, scale: 1, y: 0 }}
      transition={shouldAnimate ? springPresets.default : { duration: 0 }}
      className={cn(
        'rounded-xl p-4 mb-4',
        'border transition-all duration-300',
        className
      )}
      style={{
        background: config?.background || 'rgba(107, 114, 128, 0.05)',
        borderColor: config?.borderColor || 'rgba(107, 114, 128, 0.2)',
      }}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        {/* Tool Icon - Static, no rotation */}
        <div className="flex-shrink-0 mt-0.5">
          <Icon size={20} style={{ color: config?.color || '#6B7280' }} strokeWidth={2} />
        </div>

        {/* Tool Info */}
        <div className="flex-1 min-w-0">
          <h4
            className="text-[15px] font-semibold"
            style={{ color: config?.color || '#6B7280' }}
          >
            {config?.displayName || 'Unknown Tool'}
          </h4>
          {agentName && (
            <p className="text-[11px] text-text-tertiary mt-0.5">{agentName}</p>
          )}
        </div>

        {/* Duration/Timer - Before status badge */}
        {(duration || status === 'running' || status === 'pending') && (
          <div className="flex-shrink-0 text-[11px] text-text-tertiary font-mono">
            {duration ? formatDuration(duration) : formatDuration(elapsedTime)}
          </div>
        )}

        {/* Status Badge - Icon only */}
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-surface border border-border-subtle">
          {/* Morphing Status Icon */}
          <AnimatePresence mode="wait">
            <motion.div
              key={status}
              initial={shouldAnimate ? { scale: 0, rotate: -180 } : false}
              animate={shouldAnimate ? { scale: 1, rotate: 0 } : { scale: 1, rotate: 0 }}
              exit={shouldAnimate ? { scale: 0, rotate: 180 } : false}
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

      {/* Parameters (always visible, displayed as code) */}
      {status !== 'pending' && parameters && Object.keys(parameters).length > 0 && (
        <div className="mt-3 pt-3 border-t border-border-subtle">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[12px] font-medium text-text-secondary">
              Parameters
            </div>
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
                padding: '16px',
                background: '#1E1E1E',
                fontSize: '13px',
                lineHeight: '1.6',
              }}
              codeTagProps={{
                style: {
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                },
              }}
            >
              {JSON.stringify(parameters, null, 2)}
            </SyntaxHighlighter>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <motion.div
          initial={shouldAnimate ? { opacity: 0, height: 0 } : false}
          animate={shouldAnimate ? { opacity: 1, height: 'auto' } : { opacity: 1, height: 'auto' }}
          transition={shouldAnimate ? springPresets.gentle : { duration: 0 }}
          className="mt-3 pt-3 border-t border-border-subtle"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-[12px] font-medium text-text-secondary">
              Result
            </div>
            {!result.error && <CopyButton isCopied={isResultCopied} onClick={handleCopyResult} />}
          </div>
          
          {/* Terminal-style result display */}
          {status === 'failed' && result.error ? (
            <div
              className="p-3 rounded-lg border-l-[3px]"
              style={{
                background: 'rgba(239, 68, 68, 0.05)',
                borderLeftColor: '#EF4444',
              }}
            >
              <div className="flex items-start gap-2 text-error">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span className="text-[13px]">{result.error}</span>
              </div>
            </div>
          ) : (
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
                  padding: '16px',
                  background: '#1E1E1E',
                  fontSize: '13px',
                  lineHeight: '1.6',
                }}
                codeTagProps={{
                  style: {
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  },
                }}
              >
                {(() => {
                  // result.content is the raw tool response string from the backend.
                  // Parse it if it's valid JSON so we display the actual object,
                  // not a stringified wrapper like {"content": "{...escaped...}"}.
                  const raw = result?.content
                  if (typeof raw === 'string') {
                    try {
                      return JSON.stringify(JSON.parse(raw), null, 2)
                    } catch {
                      return raw
                    }
                  }
                  return JSON.stringify(result, null, 2)
                })()}
              </SyntaxHighlighter>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
