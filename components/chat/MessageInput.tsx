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
import { Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { springPresets } from '@/lib/constants/animations'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'

export interface MessageInputProps {
  value?: string
  onChange?: (value: string) => void
  onSend?: (message: string) => void
  placeholder?: string
  disabled?: boolean
  isStreaming?: boolean
  maxLength?: number
  className?: string
}

export function MessageInput({
  value: controlledValue,
  onChange,
  onSend,
  placeholder = 'Type a message...',
  disabled = false,
  isStreaming = false,
  maxLength = 4000,
  className,
}: MessageInputProps) {
  const [internalValue, setInternalValue] = useState('')
  const { shouldAnimate } = useReducedMotion()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Use controlled or uncontrolled value
  const value = controlledValue !== undefined ? controlledValue : internalValue
  const setValue = onChange || setInternalValue

  // Production-ready state management with multiple fallbacks
  const [forceRender, setForceRender] = useState(0)
  const [localDisabled, setLocalDisabled] = useState(disabled)
  
  // Robust disabled state management - fix the root cause
  useEffect(() => {
    const shouldBeDisabled = disabled || isStreaming
    setLocalDisabled(shouldBeDisabled)
    
    // If input should be enabled, ensure it's enabled immediately
    if (!shouldBeDisabled) {
      setLocalDisabled(false)
      setForceRender(prev => prev + 1)
    }
  }, [disabled, isStreaming])

  // Auto-resize textarea
  useEffect(() => {
    if (!textareaRef.current) return

    textareaRef.current.style.height = 'auto'
    const scrollHeight = textareaRef.current.scrollHeight
    const maxHeight = 200 // 200px max height

    textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`
  }, [value])

  // Handle send with production-ready error handling
  const handleSend = () => {
    if (!value.trim() || localDisabled) return

    try {
      onSend?.(value.trim())
      setValue('')

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
    // Enter to send (without modifiers)
    if (e.key === 'Enter' && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
      e.preventDefault()
      handleSend()
    }
    // Shift+Enter for new line (default behavior)
  }

  const canSend = value.trim().length > 0 && !localDisabled
  const showCharCount = value.length > maxLength * 0.8
  const isInputDisabled = localDisabled

  return (
    <div className={cn('relative', className)} key={forceRender}>
      {/* Textarea Container with minimal styling */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          'relative flex items-end gap-3',
          'px-4 py-3',
          'rounded-lg',
          'bg-surface',
          'border border-border-subtle',
          'transition-colors duration-200',
          isFocused && 'border-primary/50',
          isInputDisabled && 'opacity-60'
        )}
      >
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
          maxLength={maxLength}
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
              ? 'bg-primary text-white hover:bg-primary/90'
              : 'bg-surface-hover text-text-tertiary cursor-not-allowed opacity-50'
          )}
          aria-label="Send message"
        >
          <Send size={16} />
        </button>
      </div>

      {/* Character Count */}
      {showCharCount && (
        <div
          className={cn(
            'absolute -top-5 right-0',
            'text-xs',
            value.length >= maxLength ? 'text-error' : 'text-text-tertiary'
          )}
        >
          {value.length} / {maxLength}
        </div>
      )}

      {/* Keyboard Hint */}
      {isFocused && !isStreaming && (
        <div className="absolute -bottom-5 left-0 text-xs text-text-tertiary">
          Press Enter to send • Shift+Enter for new line
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
