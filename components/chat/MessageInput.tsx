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

  // Auto-resize textarea
  useEffect(() => {
    if (!textareaRef.current) return

    textareaRef.current.style.height = 'auto'
    const scrollHeight = textareaRef.current.scrollHeight
    const maxHeight = 200 // 200px max height

    textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`
  }, [value])

  // Handle send
  const handleSend = () => {
    if (!value.trim() || disabled || isStreaming) return

    onSend?.(value.trim())
    setValue('')

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
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

  const canSend = value.trim().length > 0 && !disabled && !isStreaming
  const showCharCount = value.length > maxLength * 0.8

  return (
    <div className={cn('relative', className)}>
      {/* Textarea Container with sophisticated styling */}
      <motion.div
        animate={
          isFocused && shouldAnimate
            ? {
                boxShadow: [
                  '0 4px 20px rgba(0, 0, 0, 0.08)',
                  '0 8px 30px rgba(245, 158, 11, 0.12)',
                ],
              }
            : {}
        }
        transition={{ duration: 0.4, ease: 'easeOut' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          'relative flex items-end gap-4',
          'px-6 py-4',
          'rounded-[28px]',
          'bg-surface',
          'border',
          'transition-all duration-300',
          'shadow-[0_2px_12px_rgba(0,0,0,0.08)]',
          isFocused
            ? 'border-primary/40 shadow-[0_8px_30px_rgba(0,0,0,0.12)]'
            : 'border-border-subtle hover:border-border-medium hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)]'
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
          disabled={disabled || isStreaming}
          maxLength={maxLength}
          rows={1}
          className={cn(
            'flex-1 resize-none',
            'bg-transparent border-none outline-none',
            'text-[15px] text-text-primary placeholder:text-text-tertiary/60',
            'min-h-[56px] max-h-[280px]',
            'py-4 px-2',
            'leading-[1.6]',
            'scrollbar-thin scrollbar-thumb-border-subtle scrollbar-track-transparent',
            'placeholder:font-normal'
          )}
          style={{
            minHeight: '56px',
            maxHeight: '280px',
          }}
        />

        {/* Send Button with sophisticated styling */}
        <motion.button
          whileHover={canSend && shouldAnimate ? { scale: 1.08, y: -2 } : undefined}
          whileTap={
            canSend && shouldAnimate
              ? { scale: 0.92 }
              : undefined
          }
          transition={springPresets.snappy}
          onClick={handleSend}
          disabled={!canSend}
          className={cn(
            'relative flex-shrink-0 w-12 h-12 rounded-2xl overflow-hidden',
            'flex items-center justify-center',
            'transition-all duration-300',
            'cursor-pointer',
            canSend
              ? 'bg-primary text-white shadow-[0_4px_16px_rgba(245,158,11,0.35)] hover:shadow-[0_6px_24px_rgba(245,158,11,0.45)]'
              : 'bg-surface-hover text-text-tertiary cursor-not-allowed opacity-50'
          )}
          aria-label="Send message"
        >
          {/* Gradient overlay on hover */}
          {canSend && shouldAnimate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-gradient-to-br from-white/25 via-white/10 to-transparent"
            />
          )}
          
          <motion.div
            animate={
              canSend && shouldAnimate
                ? {
                    x: [0, 1, 0],
                  }
                : {}
            }
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="relative z-10"
          >
            <Send size={20} strokeWidth={2.5} />
          </motion.div>
        </motion.button>
      </motion.div>

      {/* Character Count */}
      {showCharCount && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldAnimate ? springPresets.default : { duration: 0 }}
          className={cn(
            'absolute -top-6 right-0',
            'text-xs',
            value.length >= maxLength ? 'text-error' : 'text-text-tertiary'
          )}
        >
          {value.length} / {maxLength}
        </motion.div>
      )}

      {/* Keyboard Hint */}
      {isFocused && !isStreaming && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute -bottom-6 left-0 text-xs text-text-tertiary"
        >
          Press Enter to send • Shift+Enter for new line
        </motion.div>
      )}
    </div>
  )
}
