'use client'

/**
 * AttachmentPreview
 *
 * Renders a file attachment that arrived via a CUSTOM/attachment SSE event.
 * Images are downloaded from the storage API and shown as inline thumbnails.
 * Non-image files show a file-type icon with name and size.
 * A copy button copies the FileDetails JSON to the clipboard.
 */

import { useState, useEffect } from 'react'
import { FileIcon, ImageIcon, Loader2, Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MessageAttachment } from '@/lib/api/types'

interface AttachmentPreviewProps {
  attachment: MessageAttachment
  className?: string
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function isImageMime(mimeType: string): boolean {
  return mimeType.startsWith('image/')
}

async function downloadAttachment(attachment: MessageAttachment): Promise<string> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
  const response = await fetch(`${baseUrl}/v1/storage/download`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: attachment.name,
      source: attachment.source,
      type: attachment.type,
      mimeType: attachment.mimeType,
      size: attachment.size,
    }),
  })
  if (!response.ok) throw new Error(`Download failed: HTTP ${response.status}`)
  const blob = await response.blob()
  return URL.createObjectURL(blob)
}

function CopyButton({ attachment }: { attachment: MessageAttachment }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const text = JSON.stringify({
      name: attachment.name,
      source: attachment.source,
      type: attachment.type,
      mimeType: attachment.mimeType,
      size: attachment.size,
    }, null, 2)
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className={cn(
        'flex items-center justify-center w-6 h-6 rounded-md transition-all duration-150',
        'bg-surface/80 border border-border-subtle hover:bg-surface-hover cursor-pointer',
        copied && 'bg-success/10 border-success/30'
      )}
      aria-label={copied ? 'Copied!' : 'Copy file details'}
    >
      {copied
        ? <Check size={11} className="text-success" strokeWidth={2.5} />
        : <Copy size={11} className="text-text-tertiary" strokeWidth={2} />
      }
    </button>
  )
}

export function AttachmentPreview({ attachment, className }: AttachmentPreviewProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  const isImage = isImageMime(attachment.mimeType)

  useEffect(() => {
    if (!isImage) return
    let revoked = false
    setLoading(true)
    setError(false)
    downloadAttachment(attachment)
      .then((url) => { if (!revoked) setObjectUrl(url) })
      .catch(() => { if (!revoked) setError(true) })
      .finally(() => { if (!revoked) setLoading(false) })
    return () => {
      revoked = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attachment.source])

  if (isImage) {
    return (
      <div className={cn('relative inline-flex flex-col gap-1.5 mt-2', className)}>
        <div className={cn(
          'relative rounded-xl overflow-hidden border border-border-subtle',
          'bg-surface-hover/40 max-w-[320px]'
        )}>
          {loading && (
            <div className="flex items-center justify-center w-[320px] h-[200px]">
              <Loader2 size={20} className="text-text-tertiary animate-spin" />
            </div>
          )}
          {error && (
            <div className="flex items-center justify-center gap-2 w-[320px] h-[200px] text-text-tertiary text-sm">
              <ImageIcon size={16} />
              <span>Failed to load image</span>
            </div>
          )}
          {objectUrl && !error && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={objectUrl}
              alt={attachment.name}
              className="block max-w-full max-h-[400px] object-contain"
            />
          )}
        </div>

        {/* Footer: filename · size + copy button */}
        <div className="flex items-center gap-1.5 max-w-[320px]">
          <span className="text-xs text-text-tertiary truncate flex-1">
            {attachment.name} · {formatBytes(attachment.size)}
          </span>
          <CopyButton attachment={attachment} />
        </div>
      </div>
    )
  }

  // Non-image file — compact pill with copy button
  return (
    <div className={cn(
      'inline-flex items-center gap-2 mt-2 px-3 py-2',
      'rounded-xl border border-border-subtle bg-surface-hover/40 max-w-[320px]',
      className
    )}>
      <FileIcon size={16} className="flex-shrink-0 text-text-tertiary" />
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-sm text-text-primary truncate">{attachment.name}</span>
        <span className="text-xs text-text-tertiary">{formatBytes(attachment.size)}</span>
      </div>
      <CopyButton attachment={attachment} />
    </div>
  )
}
