'use client'

/**
 * Message Input Component
 * 
 * Auto-resizing textarea with liquid send button.
 * Supports keyboard shortcuts and character count.
 * 
 * Design Philosophy:
 * - Smooth auto-resize animation
 * - Clear visual feedback
 * - Accessible keyboard shortcuts
 * - Liquid morphing send button
 */

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { motion } from 'framer-motion'
import { Send, Paperclip, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { springPresets } from '@/lib/constants/animations'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'

export interface MessageInputProps {
  value?: string
  onChange?: (value: string) => void
  onSend?: (message: string, attachments?: Array<{ type: 'file'; fileDetails: import('@/lib/api/services').FileDetails }>) => void
  placeholder?: string
  disabled?: boolean
  isStreaming?: boolean
  className?: string
}

export function MessageInput({
  value: controlledValue,
  onChange,
  onSend,
  placeholder = 'Type a message...',
  disabled = false,
  isStreaming = false,
  className,
}: MessageInputProps) {
  const [internalValue, setInternalValue] = useState('')
  const { shouldAnimate } = useReducedMotion()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [attachments, setAttachments] = useState<Array<{ type: 'file'; fileDetails: import('@/lib/api/services').FileDetails; preview?: string }>>([])
  // Kept in sync so the unmount-cleanup effect below (deliberately empty deps — it must run
  // only once, on unmount) can read the *latest* attachments instead of the empty array
  // from the render it was created on, which meant attachments added after mount were
  // never revoked on unmount.
  const attachmentsRef = useRef(attachments)
  attachmentsRef.current = attachments
  const [isProcessingFile, setIsProcessingFile] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  // Use controlled or uncontrolled value
  const value = controlledValue !== undefined ? controlledValue : internalValue
  const setValue = onChange || setInternalValue

  // Simplified disabled state - trust the props
  const isInputDisabled = disabled || isStreaming
  
  // File handling functions
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsProcessingFile(true)
    
    try {
      const { uploadToStorage } = await import('@/lib/api/services')
      const newAttachments: Array<{ type: 'file'; fileDetails: import('@/lib/api/services').FileDetails; preview?: string }> = []
      const errors = []
      
      for (const file of Array.from(files)) {
        if (file.size > 100 * 1024 * 1024) {
          errors.push(`${file.name}: File too large (max 100MB)`)
          continue
        }
        
        try {
          const fileDetails = await uploadToStorage(file)
          const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
          newAttachments.push({ type: 'file' as const, fileDetails, preview })
        } catch (fileError) {
          errors.push(`${file.name}: Failed to upload file`)
          console.error('Upload error:', fileError)
        }
      }
      
      if (errors.length > 0) {
        console.warn('File processing errors:', errors)
      }
      if (newAttachments.length > 0) {
        setAttachments(prev => [...prev, ...newAttachments])
      }
    } catch (error) {
      console.error('Error processing files:', error)
    } finally {
      setIsProcessingFile(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => {
      const updated = [...prev]
      // Revoke object URL to prevent memory leaks
      if (updated[index].preview) URL.revokeObjectURL(updated[index].preview!)
      updated.splice(index, 1)
      return updated
    })
  }

  const handleAttachClick = () => {
    fileInputRef.current?.click()
  }

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length === 0) return

    // Create a fake event to reuse the existing file handling logic
    const fakeEvent = {
      target: { files: e.dataTransfer.files }
    } as React.ChangeEvent<HTMLInputElement>
    
    await handleFileSelect(fakeEvent)
  }
  
  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      attachmentsRef.current.forEach(att => { if (att.preview) URL.revokeObjectURL(att.preview) })
    }
  }, [])

  // Auto-resize textarea
  useEffect(() => {
    if (!textareaRef.current) return

    textareaRef.current.style.height = 'auto'
    const scrollHeight = textareaRef.current.scrollHeight
    const maxHeight = 120 // 120px max height to match CSS

    textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`
  }, [value])

  // Handle send with production-ready error handling
  const handleSend = () => {
    if ((!value.trim() && attachments.length === 0) || isInputDisabled) return

    try {
      // Convert attachments to the format expected by the API
      const apiAttachments = attachments.map(att => ({
        type: att.type,
        fileDetails: att.fileDetails,
      }))
      
      onSend?.(value.trim(), apiAttachments)
      setValue('')
      
      // Clear attachments and revoke object URLs
      attachments.forEach(att => { if (att.preview) URL.revokeObjectURL(att.preview) })
      setAttachments([])

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  // Handle keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter to send (without modifiers). isComposing excludes the Enter that confirms an
    // IME candidate (Japanese/Chinese/Korean input) — without it, that Enter both commits
    // the composition *and* sends the message immediately, before the user meant to.
    if (e.key === 'Enter' && !e.shiftKey && !e.metaKey && !e.ctrlKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      handleSend()
    }
    // Shift+Enter for new line (default behavior)
  }

  const canSend = (value.trim().length > 0 || attachments.length > 0) && !isInputDisabled

  return (
    <div className={cn('relative', className)}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="*/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map((attachment, index) => (
            <div
              key={attachment.fileDetails.source}
              className="relative group rounded-lg overflow-hidden border border-border-subtle bg-surface"
              role="group"
              aria-label={`Attached file: ${attachment.fileDetails.name}`}
            >
              {attachment.preview ? (
                <img
                  src={attachment.preview}
                  alt={attachment.fileDetails.name}
                  className="w-16 h-16 object-cover"
                />
              ) : (
                <div className="w-16 h-16 flex items-center justify-center bg-surface-hover">
                  <Paperclip size={20} className="text-text-tertiary" />
                </div>
              )}
              <button
                onClick={() => removeAttachment(index)}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-error text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Remove ${attachment.fileDetails.name}`}
                type="button"
              >
                <X size={12} />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                {attachment.fileDetails.name}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Textarea Container with minimal styling */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative flex items-end gap-3',
          'px-4 py-3',
          'rounded-lg',
          'bg-surface',
          'border border-border-subtle',
          'transition-colors duration-200',
          isFocused && 'border-primary/50',
          isDragOver && 'border-primary bg-primary/5',
          isInputDisabled && 'opacity-60'
        )}
      >
        {/* Attach Button */}
        <button
          onClick={handleAttachClick}
          disabled={isInputDisabled || isProcessingFile}
          className={cn(
            'flex-shrink-0 w-8 h-8 rounded-md',
            'flex items-center justify-center',
            'transition-colors duration-200',
            'text-text-tertiary hover:text-text-secondary hover:bg-surface-hover',
            isInputDisabled && 'cursor-not-allowed opacity-40'
          )}
          aria-label="Attach file"
        >
          {isProcessingFile ? (
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <Paperclip size={16} />
          )}
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={isInputDisabled}
          rows={1}
          className={cn(
            'flex-1 resize-none',
            'bg-transparent border-none outline-none',
            'text-sm text-text-primary placeholder:text-text-tertiary',
            'min-h-[40px] max-h-[120px]',
            'py-2 px-1',
            'leading-relaxed',
            isInputDisabled && 'cursor-not-allowed'
          )}
          style={{
            minHeight: '40px',
            maxHeight: '120px',
          }}
        />

        {/* Send Button with simple styling */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          className={cn(
            'flex-shrink-0 w-10 h-10 rounded-md',
            'flex items-center justify-center',
            'transition-colors duration-200',
            canSend
              ? 'bg-primary text-background hover:bg-primary/90'
              : 'bg-transparent text-text-tertiary cursor-not-allowed opacity-40'
          )}
          aria-label="Send message"
        >
          <Send size={16} />
        </button>

        {/* Drag overlay */}
        {isDragOver && (
          <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center pointer-events-none">
            <div className="flex items-center gap-2 text-primary font-medium">
              <Paperclip size={20} />
              Drop files here
            </div>
          </div>
        )}
      </div>

      {/* Keyboard Hint */}
      {isFocused && !isStreaming && (
        <div className="absolute -bottom-5 left-0 text-xs text-text-tertiary">
          Press Enter to send • Shift+Enter for new line • Drag & drop files
        </div>
      )}

      {/* Loading indicator when streaming */}
      {isStreaming && (
        <div className="absolute -bottom-5 right-0 text-xs text-text-tertiary flex items-center gap-1">
          <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
          Sending...
        </div>
      )}
    </div>
  )
}
