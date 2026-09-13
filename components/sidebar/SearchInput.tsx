'use client'

/**
 * Search Input Component
 * 
 * Debounced search input for filtering agents and sessions.
 * Provides immediate visual feedback with loading states.
 * 
 * Performance:
 * - 300ms debounce to reduce unnecessary searches
 * - Local filtering first, then API call if needed
 */

import { Search, X } from 'lucide-react'
import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'

const DEBOUNCE_DELAY = 300

export interface SearchInputProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  onSearch?: (value: string) => void
  isLoading?: boolean
  className?: string
}

export function SearchInput({
  placeholder = 'Search...',
  value: controlledValue,
  onChange,
  onSearch,
  isLoading = false,
  className,
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(controlledValue || '')
  const [isFocused, setIsFocused] = useState(false)
  const { shouldAnimate } = useReducedMotion()
  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const inputRef = useRef<HTMLInputElement>(null)

  const value = controlledValue !== undefined ? controlledValue : internalValue

  // Debounced search handler
  const debouncedSearch = useCallback(
    (searchValue: string) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      debounceTimerRef.current = setTimeout(() => {
        onSearch?.(searchValue)
      }, DEBOUNCE_DELAY)
    },
    [onSearch]
  )

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    
    if (controlledValue === undefined) {
      setInternalValue(newValue)
    }
    
    onChange?.(newValue)
    debouncedSearch(newValue)
  }

  // Handle clear
  const handleClear = () => {
    const newValue = ''
    
    if (controlledValue === undefined) {
      setInternalValue(newValue)
    }
    
    onChange?.(newValue)
    onSearch?.(newValue)
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    
    inputRef.current?.focus()
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  return (
    <div className={cn('relative', className)}>
      {/* Search icon */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <Search
          size={16}
          className={cn(
            'transition-colors duration-200',
            isFocused ? 'text-primary' : 'text-text-tertiary'
          )}
        />
      </div>

      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className={cn(
          'w-full h-10 pl-10 pr-10',
          'bg-surface border border-border-subtle rounded-lg',
          'text-sm text-text-primary placeholder:text-text-tertiary',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
          'hover:border-border'
        )}
        aria-label="Search"
      />

      {/* Clear button or loading spinner */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={shouldAnimate ? { opacity: 0, scale: 0.8 } : undefined}
              animate={{ opacity: 1, scale: 1 }}
              exit={shouldAnimate ? { opacity: 0, scale: 0.8 } : undefined}
              transition={{ duration: 0.15 }}
            >
              <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </motion.div>
          ) : value ? (
            <motion.button
              key="clear"
              initial={shouldAnimate ? { opacity: 0, scale: 0.8 } : undefined}
              animate={{ opacity: 1, scale: 1 }}
              exit={shouldAnimate ? { opacity: 0, scale: 0.8 } : undefined}
              transition={{ duration: 0.15 }}
              onClick={handleClear}
              className="p-1 rounded-md text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
              aria-label="Clear search"
            >
              <X size={14} />
            </motion.button>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  )
}
