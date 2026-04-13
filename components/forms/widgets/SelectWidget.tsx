'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check } from 'lucide-react'
import type { LayoutField } from '@/lib/types/schema'
import { springPresets } from '@/lib/constants/animations'

interface SelectWidgetProps {
  field: LayoutField
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
}

export function SelectWidget({ field, value, onChange, error, disabled }: SelectWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom')
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const options = field.options || []

  // Calculate dropdown position to keep it on screen
  useEffect(() => {
    if (!isOpen || !triggerRef.current) return

    const updatePosition = () => {
      const triggerRect = triggerRef.current!.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const spaceBelow = viewportHeight - triggerRect.bottom
      const spaceAbove = triggerRect.top
      const estimatedDropdownHeight = Math.min(options.length * 42 + 50, 240) // Estimate height

      // If not enough space below and more space above, open upward
      if (spaceBelow < estimatedDropdownHeight && spaceAbove > spaceBelow) {
        setDropdownPosition('top')
      } else {
        setDropdownPosition('bottom')
      }
    }

    updatePosition()
  }, [isOpen, options.length])

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        dropdownRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
    triggerRef.current?.focus()
  }

  const selectedOption = options.find(opt => opt === value)

  return (
    <div className="space-y-1">
      <div className="relative">
        {/* Trigger Button */}
        <button
          ref={triggerRef}
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full px-4 py-2 pr-10 bg-background border rounded-lg text-left
            transition-all duration-200
            ${error 
              ? 'border-error focus:ring-2 focus:ring-error' 
              : isOpen
                ? 'border-primary ring-2 ring-primary'
                : 'border-border-subtle hover:border-border-medium focus:ring-2 focus:ring-primary'
            } 
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <span className={selectedOption ? 'text-text-primary' : 'text-text-tertiary'}>
            {selectedOption || `Select ${field.label}...`}
          </span>
        </button>

        {/* Chevron Icon */}
        <motion.div
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={springPresets.snappy}
        >
          <ChevronDown className="w-5 h-5 text-text-tertiary" />
        </motion.div>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={dropdownRef}
              initial={{ 
                opacity: 0, 
                scale: 0.98,
              }}
              animate={{ 
                opacity: 1, 
                scale: 1,
              }}
              exit={{ 
                opacity: 0, 
                scale: 0.98,
              }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className={`
                absolute left-0 right-0 z-50
                bg-surface border border-border-subtle rounded-lg shadow-lg
                max-h-60 overflow-y-auto
                ${dropdownPosition === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2'}
              `}
              style={{
                minWidth: triggerRef.current?.offsetWidth || 'auto',
              }}
            >
              {/* Empty state option */}
              <button
                type="button"
                onClick={() => handleSelect('')}
                className={`
                  w-full px-4 py-2.5 text-left transition-colors
                  flex items-center justify-between gap-2
                  ${!value 
                    ? 'bg-primary-light text-primary' 
                    : 'hover:bg-surface-hover text-text-secondary'
                  }
                `}
              >
                <span className="text-sm">Select {field.label}...</span>
                {!value && <Check className="w-4 h-4" />}
              </button>

              {/* Options */}
              {options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={`
                    w-full px-4 py-2.5 text-left transition-colors
                    flex items-center justify-between gap-2
                    ${value === option 
                      ? 'bg-primary-light text-primary' 
                      : 'hover:bg-surface-hover text-text-primary'
                    }
                  `}
                >
                  <span className="text-sm">{option}</span>
                  {value === option && <Check className="w-4 h-4" />}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-error"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}
