'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, X, Loader2, Check } from 'lucide-react'
import { springPresets, slideDown } from '@/lib/constants/animations'
import type { LayoutField } from '@/lib/types/schema'

interface LookupWidgetProps {
  field: LayoutField
  value: string | string[] | null
  onChange: (value: string | string[] | null) => void
  error?: string
  disabled?: boolean
  formData?: Record<string, any>
  itemData?: Record<string, any>
}

interface LookupOption {
  id: string
  name: string
  description?: string
}

export function LookupWidget({ 
  field, 
  value, 
  onChange, 
  error, 
  disabled,
  formData,
  itemData 
}: LookupWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [options, setOptions] = useState<LookupOption[]>([])
  const [selectedOptions, setSelectedOptions] = useState<LookupOption[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const justSelectedRef = useRef(false) // Track if we just made a selection

  const assetType = field.lookup?.assetType || 'Agent'
  const isMultiple = field.lookup?.multiSelect || false
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

  const getByPath = (obj: any, path: string): any => {
    if (!obj || !path) return null
    return path.split('.').reduce((acc, part) => acc?.[part], obj) ?? null
  }

  const evaluateExpression = (expr: any): any => {
    if (typeof expr !== 'string') return expr
    if (!expr.startsWith('$')) return expr
    try {
      if (expr.startsWith('$item.')) {
        // Sibling in the current collection item / object
        return getByPath(itemData, expr.substring(6))
      } else if (expr.startsWith('$parent.')) {
        // Immediate parent / enclosing entity
        return getByPath(formData, expr.substring(8))
      } else if (expr.startsWith('$.')) {
        // Root entity being edited
        return getByPath(formData, expr.substring(2))
      }
    } catch (err) {
      console.error('Failed to evaluate lookup expression:', expr, err)
    }
    return expr
  }

  const resolveLookupOptions = (): Record<string, any> | undefined => {
    if (!field.lookup?.options) return undefined
    const resolved: Record<string, any> = {}
    for (const [key, expr] of Object.entries(field.lookup.options)) {
      const val = evaluateExpression(expr)
      if (val !== null && val !== undefined && val !== '') {
        resolved[key] = val
      }
    }
    return Object.keys(resolved).length > 0 ? resolved : undefined
  }

  const optionsKey = JSON.stringify(resolveLookupOptions() || {})

  // Reset loaded options whenever dependent lookup options change
  useEffect(() => {
    setOptions([])
  }, [optionsKey])

  // Load initial selected options
  useEffect(() => {
    // If we just made a selection locally, don't fetch from API
    if (justSelectedRef.current) {
      justSelectedRef.current = false
      return
    }

    if (!value) {
      setSelectedOptions([])
      return
    }

    const ids = Array.isArray(value) ? value : [value]
    
    const fetchSelected = async () => {
      try {
        const resolvedOptions = resolveLookupOptions()
        const queryParams = resolvedOptions ? '?' + new URLSearchParams(resolvedOptions).toString() : ''
        const responses = await Promise.all(
          ids.map(id => 
            fetch(`${baseUrl}/v1/catalog/${assetType}/${id}${queryParams}`)
              .then(res => res.ok ? res.json() : null)
          )
        )
        
        const validOptions = responses
          .filter(Boolean)
          .map(item => ({
            id: item.id,
            name: item.name || item.id,
            description: item.description,
          }))
        
        setSelectedOptions(validOptions)
      } catch (err) {
        console.error('Failed to load selected options:', err)
      }
    }

    fetchSelected()
  }, [value, assetType, optionsKey])

  // Load all options on focus
  const loadOptions = async () => {
    if (options.length > 0) return // Already loaded

    setIsLoading(true)

    try {
      const resolvedOptions = resolveLookupOptions()
      const response = await fetch(
        `${baseUrl}/v1/catalog/list`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            assetType: assetType,
            options: resolvedOptions,
            limit: 100,
          }),
        }
      )
      
      if (!response.ok) {
        throw new Error('Failed to load options')
      }

      const data = await response.json()
      const items = data.items || []
      
      setOptions(
        items.map((item: any) => ({
          id: item.id,
          name: item.name || item.id,
          description: item.description,
        }))
      )
    } catch (err) {
      console.error('Load options error:', err)
      setOptions([])
    } finally {
      setIsLoading(false)
    }
  }

  // Handle dropdown open
  const handleFocus = () => {
    if (!disabled) {
      setIsOpen(true)
      loadOptions()
    }
  }

  // Handle option selection
  const handleSelect = (option: LookupOption) => {
    justSelectedRef.current = true // Mark that we just made a selection
    
    if (isMultiple) {
      const isAlreadySelected = selectedOptions.some(o => o.id === option.id)
      
      if (isAlreadySelected) {
        const newSelected = selectedOptions.filter(o => o.id !== option.id)
        setSelectedOptions(newSelected)
        onChange(newSelected.map(o => o.id))
      } else {
        const newSelected = [...selectedOptions, option]
        setSelectedOptions(newSelected)
        onChange(newSelected.map(o => o.id))
      }
    } else {
      setSelectedOptions([option])
      onChange(option.id)
      setIsOpen(false)
    }
  }

  // Handle chip removal
  const handleRemove = (optionId: string) => {
    justSelectedRef.current = true // Mark that we just made a change
    
    const newSelected = selectedOptions.filter(o => o.id !== optionId)
    setSelectedOptions(newSelected)
    
    if (isMultiple) {
      onChange(newSelected.map(o => o.id))
    } else {
      onChange(null)
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isSelected = (optionId: string) => selectedOptions.some(o => o.id === optionId)

  return (
    <div ref={containerRef} className="lookup-widget">
      {/* Dropdown Trigger */}
      <div className="relative">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleFocus}
            disabled={disabled}
            className={`
              flex-1 px-3 py-2 rounded-lg border-2 text-left
              bg-background text-text-primary
              focus:outline-none focus:border-primary
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors flex items-center justify-between
              ${error ? 'border-error' : 'border-border-subtle hover:border-border-medium'}
              ${disabled ? '' : 'cursor-pointer'}
            `}
          >
            <span className={selectedOptions.length === 0 ? 'text-text-tertiary' : ''}>
              {selectedOptions.length === 0 
                ? `Select ${assetType.toLowerCase()}...` 
                : isMultiple 
                  ? `${selectedOptions.length} selected`
                  : selectedOptions[0].name
              }
            </span>
            
            <ChevronDown className={`w-4 h-4 text-text-tertiary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Clear button (only for single select with value) - outside main button */}
          {!isMultiple && selectedOptions.length > 0 && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleRemove(selectedOptions[0].id)
              }}
              className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-text-tertiary hover:text-text-primary" />
            </button>
          )}
        </div>

        {/* Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="absolute z-50 w-full mt-2 bg-surface border border-border-medium rounded-lg shadow-lg overflow-hidden"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={slideDown}
              transition={springPresets.snappy}
            >
              {isLoading ? (
                <div className="p-4 text-center text-text-secondary">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                  <p className="text-sm">Loading...</p>
                </div>
              ) : options.length === 0 ? (
                <div className="p-4 text-center text-text-secondary">
                  <p className="text-sm">No options available</p>
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto">
                  {/* Multi-select: show selected chips at top */}
                  {isMultiple && selectedOptions.length > 0 && (
                    <div className="p-3 border-b border-border-subtle bg-background">
                      <div className="flex flex-wrap gap-2">
                        {selectedOptions.map(option => (
                          <motion.div
                            key={option.id}
                            className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-primary-light text-primary text-sm"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={springPresets.bouncy}
                          >
                            <span>{option.name}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRemove(option.id)
                              }}
                              className="hover:bg-primary-hover rounded-full p-0.5 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Options list */}
                  {options.map(option => {
                    const selected = isSelected(option.id)
                    
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleSelect(option)}
                        className={`
                          w-full p-3 text-left hover:bg-surface-hover
                          transition-colors flex items-start gap-3
                          ${selected ? 'bg-primary-light' : ''}
                        `}
                      >
                        {/* Checkbox for multiple selection */}
                        {isMultiple && (
                          <div className={`
                            w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5
                            ${selected ? 'bg-primary border-primary' : 'border-border-medium'}
                          `}>
                            {selected && <Check className="w-3 h-3 text-white" />}
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-text-primary">
                            {option.name}
                          </div>
                          {option.description && (
                            <div className="text-sm text-text-secondary truncate">
                              {option.description}
                            </div>
                          )}
                        </div>
                        
                        {/* Check icon for single select */}
                        {!isMultiple && selected && (
                          <Check className="w-5 h-5 text-primary flex-shrink-0" />
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
