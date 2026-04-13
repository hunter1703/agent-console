'use client'

/**
 * Enhanced Input Component
 * 
 * Input and Textarea with smooth focus animations and validation.
 * 
 * Design Philosophy:
 * - Immediate feedback through animations
 * - Clear visual hierarchy
 * - Accessible and semantic
 */

import { motion, AnimatePresence } from 'framer-motion'
import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { springPresets } from '@/lib/constants/animations'
import { AlertCircle } from 'lucide-react'

interface BaseInputProps {
  label?: string
  error?: string
  helperText?: string
  maxLength?: number
  showCharCount?: boolean
}

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    BaseInputProps {
  floatingLabel?: boolean
}

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>,
    BaseInputProps {
  autoResize?: boolean
  minRows?: number
  maxRows?: number
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      maxLength,
      showCharCount,
      floatingLabel = false,
      disabled,
      className,
      placeholder,
      value,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false)
    const [charCount, setCharCount] = useState(value?.toString().length || 0)
    const [hasValue, setHasValue] = useState(!!value)

    const hasError = !!error
    const isLabelFloating = floatingLabel && (isFocused || hasValue)

    return (
      <div className="w-full">
        {/* Input wrapper */}
        <div className="relative">
          {/* Floating or static label */}
          {label && (
            <motion.label
              animate={{
                y: floatingLabel && isLabelFloating ? -10 : 0,
                scale: floatingLabel && isLabelFloating ? 0.85 : 1,
                x: floatingLabel && isLabelFloating ? -2 : 0,
              }}
              transition={springPresets.snappy}
              className={cn(
                'absolute left-3 pointer-events-none origin-left',
                floatingLabel
                  ? 'top-1/2 -translate-y-1/2'
                  : 'top-0 -translate-y-full mb-2',
                'text-sm font-medium',
                isLabelFloating || !floatingLabel
                  ? 'text-text-primary'
                  : 'text-text-tertiary'
              )}
              style={{
                ...(floatingLabel &&
                  isLabelFloating && {
                    background: 'var(--background)',
                    padding: '0 4px',
                  }),
              }}
            >
              {label}
            </motion.label>
          )}

          <motion.input
            ref={ref}
            disabled={disabled}
            maxLength={maxLength}
            placeholder={floatingLabel ? undefined : placeholder}
            value={value}
            className={cn(
              // Base styles
              'w-full px-3 rounded-md',
              floatingLabel ? 'py-3' : 'py-2.5',
              'bg-background border-2 transition-all duration-200',
              'text-base text-text-primary placeholder:text-text-tertiary',
              'focus:outline-none',
              // Cursor affordances
              disabled ? 'cursor-not-allowed' : 'cursor-text',
              // Border styles with enhanced focus
              hasError
                ? 'border-error focus:border-error'
                : isFocused
                ? 'border-primary'
                : 'border-border-subtle hover:border-border-medium',
              // Disabled styles
              'disabled:opacity-50 disabled:bg-surface',
              className
            )}
            onFocus={(e) => {
              setIsFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              props.onBlur?.(e)
            }}
            onChange={(e) => {
              setCharCount(e.target.value.length)
              setHasValue(e.target.value.length > 0)
              props.onChange?.(e)
            }}
            {...(props as any)}
          />

          {/* Error icon */}
          <AnimatePresence>
            {hasError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={springPresets.snappy}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <AlertCircle size={16} className="text-error" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Helper text, error, or character count */}
        <div className="mt-1 flex items-center justify-between gap-2">
          <AnimatePresence mode="wait">
            {error ? (
              <motion.p
                key="error"
                initial={{ opacity: 0, x: -10 }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                }}
                exit={{ opacity: 0, x: -10 }}
                transition={springPresets.snappy}
                className="text-sm text-error"
              >
                {error}
              </motion.p>
            ) : helperText ? (
              <motion.p
                key="helper"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm text-text-secondary"
              >
                {helperText}
              </motion.p>
            ) : (
              <div />
            )}
          </AnimatePresence>

          {showCharCount && maxLength && (
            <span className="text-xs text-text-tertiary">
              {charCount}/{maxLength}
            </span>
          )}
        </div>
      </div>
    )
  }
)

Input.displayName = 'Input'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      maxLength,
      showCharCount,
      autoResize = false,
      minRows = 3,
      maxRows = 10,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false)
    const [charCount, setCharCount] = useState(props.value?.toString().length || 0)

    const hasError = !!error

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-text-primary mb-2">
            {label}
          </label>
        )}

        {/* Textarea wrapper */}
        <div className="relative">
          <motion.textarea
            ref={ref}
            disabled={disabled}
            maxLength={maxLength}
            rows={minRows}
            className={cn(
              // Base styles
              'w-full px-3 py-2.5 rounded-md resize-none',
              'bg-background border-2 transition-all duration-200',
              'text-base text-text-primary placeholder:text-text-tertiary',
              'focus:outline-none',
              // Cursor affordances
              disabled ? 'cursor-not-allowed' : 'cursor-text',
              // Border styles with enhanced focus
              hasError
                ? 'border-error focus:border-error'
                : isFocused
                ? 'border-primary'
                : 'border-border-subtle hover:border-border-medium',
              // Disabled styles
              'disabled:opacity-50 disabled:bg-surface',
              className
            )}
            onFocus={(e) => {
              setIsFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              props.onBlur?.(e)
            }}
            onChange={(e) => {
              setCharCount(e.target.value.length)
              
              // Auto-resize
              if (autoResize) {
                const target = e.target
                target.style.height = 'auto'
                const scrollHeight = target.scrollHeight
                const maxHeight = minRows * 24 * maxRows / minRows
                target.style.height = `${Math.min(scrollHeight, maxHeight)}px`
              }
              
              props.onChange?.(e)
            }}
            {...(props as any)}
          />

          {/* Error icon */}
          <AnimatePresence>
            {hasError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={springPresets.snappy}
                className="absolute right-3 top-3"
              >
                <AlertCircle size={16} className="text-error" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Helper text, error, or character count */}
        <div className="mt-1 flex items-center justify-between gap-2">
          <AnimatePresence mode="wait">
            {error ? (
              <motion.p
                key="error"
                initial={{ opacity: 0, x: -10 }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                }}
                exit={{ opacity: 0, x: -10 }}
                transition={springPresets.snappy}
                className="text-sm text-error"
              >
                {error}
              </motion.p>
            ) : helperText ? (
              <motion.p
                key="helper"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm text-text-secondary"
              >
                {helperText}
              </motion.p>
            ) : (
              <div />
            )}
          </AnimatePresence>

          {showCharCount && maxLength && (
            <span className="text-xs text-text-tertiary">
              {charCount}/{maxLength}
            </span>
          )}
        </div>
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
