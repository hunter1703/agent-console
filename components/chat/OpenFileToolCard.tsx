'use client'

/**
 * OpenFileToolCard
 *
 * Specialized tool card for the `open_file` tool.
 * Instead of showing raw JSON in the Result section, it fetches and renders
 * image previews for every entry in `result.files` that has an image MIME type.
 * Non-image files fall back to a compact file pill.
 *
 * Visual language inspired by Figma / Linear file-picker patterns:
 * - Rounded image tiles with subtle border + shadow
 * - Filename + size caption below each tile
 * - Horizontal scroll when multiple files
 * - Skeleton shimmer while loading
 */

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FolderOpen, CheckCircle, Loader2, AlertCircle, Clock, FileIcon, ImageIcon } from 'lucide-react'
import { cn, safeStringify } from '@/lib/utils'
import { springPresets } from '@/lib/constants/animations'
import { formatDuration } from '@/lib/utils/formatDate'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'

interface FileEntry {
  name: string
  source: string
  type: string
  mimeType: string
  size: number
}

export interface OpenFileToolCardProps {
  toolCallId: string
  parameters: Record<string, any>
  result?: Record<string, any>
  status: 'pending' | 'running' | 'completed' | 'failed'
  timestamp: Date
  duration?: number
  agentName?: string
  className?: string
}

// ─── helpers ────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function isImage(mimeType: string): boolean {
  return mimeType?.startsWith('image/')
}

async function fetchObjectUrl(file: FileEntry): Promise<string> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
  const res = await fetch(`${baseUrl}/v1/storage/download`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: file.name,
      source: file.source,
      type: file.type,
      mimeType: file.mimeType,
      size: file.size,
    }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return URL.createObjectURL(await res.blob())
}

// ─── single image tile ───────────────────────────────────────────────────────

function ImageTile({ file }: { file: FileEntry }) {
  const [url, setUrl] = useState<string | null>(null)
  const [err, setErr] = useState(false)
  // Tracks the latest object URL for cleanup — `url` state is still null at the moment this
  // effect is created (fetchObjectUrl is async), so a cleanup closing over `url` directly
  // always revoked null instead of the real blob URL set later, leaking one blob per image
  // result for the life of the tab.
  const urlRef = useRef<string | null>(null)

  useEffect(() => {
    let alive = true
    fetchObjectUrl(file)
      .then((u) => {
        if (!alive) {
          URL.revokeObjectURL(u)
          return
        }
        urlRef.current = u
        setUrl(u)
      })
      .catch(() => { if (alive) setErr(true) })
    return () => {
      alive = false
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current)
        urlRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file.source])

  return (
    <div className="flex flex-col gap-1.5 flex-shrink-0">
      <div className={cn(
        'relative rounded-xl overflow-hidden',
        'border border-border-subtle bg-surface-hover/40',
        'w-[200px] h-[140px]',
        'flex items-center justify-center',
      )}>
        {!url && !err && (
          /* shimmer skeleton */
          <div className="absolute inset-0 bg-surface-hover animate-pulse" />
        )}
        {err && (
          <div className="flex flex-col items-center gap-1.5 text-text-tertiary">
            <ImageIcon size={20} />
            <span className="text-xs">Failed to load</span>
          </div>
        )}
        {url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={file.name}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="px-0.5">
        <p className="text-xs text-text-primary truncate w-[200px] font-medium">{file.name}</p>
        {file.size > 0 && (
          <p className="text-[11px] text-text-tertiary">{formatBytes(file.size)}</p>
        )}
      </div>
    </div>
  )
}

// ─── non-image file pill ─────────────────────────────────────────────────────

function FilePill({ file }: { file: FileEntry }) {
  return (
    <div className={cn(
      'flex items-center gap-2 px-3 py-2.5 flex-shrink-0',
      'rounded-xl border border-border-subtle bg-surface-hover/40',
      'w-[200px]',
    )}>
      <FileIcon size={16} className="flex-shrink-0 text-text-tertiary" />
      <div className="min-w-0">
        <p className="text-sm text-text-primary truncate font-medium">{file.name}</p>
        {file.size > 0 && (
          <p className="text-[11px] text-text-tertiary">{formatBytes(file.size)}</p>
        )}
      </div>
    </div>
  )
}

// ─── main card ───────────────────────────────────────────────────────────────

const COLOR = '#F97316'   // orange — file/media category
const BG    = 'rgba(249, 115, 22, 0.05)'
const BORDER = 'rgba(249, 115, 22, 0.2)'

const OpenFileToolCardComponent = function OpenFileToolCard({
  toolCallId,
  parameters,
  result,
  status,
  timestamp,
  duration,
  agentName,
  className,
}: OpenFileToolCardProps) {
  const [elapsed, setElapsed] = useState(0)
  const { shouldAnimate } = useReducedMotion()

  useEffect(() => {
    if (status !== 'running' && status !== 'pending') return
    const t0 = Date.now()
    const id = setInterval(() => setElapsed((Date.now() - t0) / 1000), 100)
    return () => clearInterval(id)
  }, [status])

  // Parse files from result
  const files: FileEntry[] = (() => {
    if (!result) return []
    const raw = result.content
    try {
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
      return Array.isArray(parsed?.files) ? parsed.files : []
    } catch {
      return []
    }
  })()

  const StatusIcon =
    status === 'completed' ? CheckCircle :
    status === 'failed'    ? AlertCircle :
    status === 'running'   ? Loader2 :
    Clock

  const statusColor =
    status === 'completed' ? '#10B981' :
    status === 'failed'    ? '#EF4444' :
    status === 'running'   ? COLOR :
    '#6B7280'

  return (
    <motion.div
      initial={shouldAnimate ? { opacity: 0, scale: 0.95, y: 10 } : false}
      animate={shouldAnimate ? { opacity: 1, scale: 1, y: 0 } : { opacity: 1 }}
      transition={shouldAnimate ? springPresets.default : { duration: 0 }}
      className={cn('rounded-xl p-4 mb-4 border transition-all duration-300', className)}
      style={{ background: BG, borderColor: BORDER }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <FolderOpen size={20} style={{ color: COLOR }} strokeWidth={2} className="flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-[15px] font-semibold" style={{ color: COLOR }}>
            Open File
          </span>
          {agentName && (
            <p className="text-[11px] text-text-tertiary mt-0.5">{agentName}</p>
          )}
        </div>
        {(duration != null || status === 'running' || status === 'pending') && (
          <span className="text-[11px] text-text-tertiary font-mono">
            {formatDuration(duration ?? elapsed)}
          </span>
        )}
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-surface border border-border-subtle">
          <AnimatePresence mode="wait">
            <motion.div
              key={status}
              initial={shouldAnimate ? { scale: 0, rotate: -180 } : false}
              animate={shouldAnimate ? { scale: 1, rotate: 0 } : { scale: 1 }}
              exit={shouldAnimate ? { scale: 0, rotate: 180 } : undefined}
              transition={shouldAnimate ? springPresets.bouncy : { duration: 0 }}
            >
              <motion.div
                animate={shouldAnimate && status === 'running' ? { rotate: 360 } : {}}
                transition={status === 'running' ? { duration: 1, repeat: Infinity, ease: 'linear' } : { duration: 0 }}
              >
                <StatusIcon size={14} style={{ color: statusColor }} strokeWidth={2} />
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* File previews — shown once result arrives. Opacity-only: this card renders inside
          VirtualTimelineList's rows, and a replay burst can mount several of these with
          results already present at once. Animating height (previously here) fights the
          virtualizer's measurement of this row's final size — the same bug already fixed
          in ToolExecutionCard's Result block. */}
      {files.length > 0 && (
        <motion.div
          initial={shouldAnimate ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={shouldAnimate ? springPresets.gentle : { duration: 0 }}
          className="mt-4 pt-3 border-t border-border-subtle"
        >
          <p className="text-[12px] font-medium text-text-secondary mb-3">
            {files.length === 1 ? '1 file' : `${files.length} files`}
          </p>
          {/* Horizontal scroll strip */}
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-border-subtle">
            {files.map((f, i) =>
              isImage(f.mimeType)
                ? <ImageTile key={f.source ?? i} file={f} />
                : <FilePill  key={f.source ?? i} file={f} />
            )}
          </div>
        </motion.div>
      )}

      {/* Error state */}
      {status === 'failed' && result?.error && (
        <div className="mt-3 pt-3 border-t border-border-subtle">
          <div className="flex items-start gap-2 p-3 rounded-lg bg-error/5 border-l-[3px] border-error text-error">
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
            <span className="text-[13px]">{result.error}</span>
          </div>
        </div>
      )}
    </motion.div>
  )
}

function areOpenFileToolCardPropsEqual(prev: OpenFileToolCardProps, next: OpenFileToolCardProps) {
  return (
    prev.toolCallId === next.toolCallId &&
    prev.status === next.status &&
    prev.duration === next.duration &&
    prev.agentName === next.agentName &&
    prev.className === next.className &&
    // safeStringify, not raw JSON.stringify: this runs outside any render try/catch, so a
    // circular reference or BigInt in a malformed result would otherwise throw here and
    // break reconciliation for the whole list, not just this card.
    safeStringify(prev.parameters) === safeStringify(next.parameters) &&
    safeStringify(prev.result) === safeStringify(next.result) &&
    prev.timestamp.getTime() === next.timestamp.getTime()
  )
}

export const OpenFileToolCard = React.memo(OpenFileToolCardComponent, areOpenFileToolCardPropsEqual)
