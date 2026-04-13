'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, ChevronDown, ChevronRight } from 'lucide-react'
import { springPresets, fadeIn, slideDown } from '@/lib/constants/animations'
import type { LayoutField, BuilderDefinition } from '@/lib/types/schema'
import { WidgetFactory } from './WidgetFactory'

interface DynamicSchemaWidgetProps {
  field: LayoutField
  value: Record<string, any> | null
  onChange: (value: Record<string, any> | null) => void
  error?: string
  disabled?: boolean
  formData: Record<string, any> // Parent form data for expression evaluation
  itemData?: Record<string, any> // Current collection item data for $item expressions
}

export function DynamicSchemaWidget({ 
  field, 
  value, 
  onChange, 
  error, 
  disabled,
  formData,
  itemData
}: DynamicSchemaWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [nestedSchema, setNestedSchema] = useState<BuilderDefinition | null>(null)
  const [schemaError, setSchemaError] = useState<string | null>(null)

  const dynamicSchema = field.dynamicSchema

  // Helper to render a field from raw JSON Schema
  const renderSchemaField = (propName: string, propSchema: any, fieldValue: any, isRequired: boolean) => {
    const handleChange = (newValue: any) => {
      const newData = { ...(value || {}), [propName]: newValue }
      onChange(newData)
    }

    // Determine widget type from JSON Schema type
    const schemaType = propSchema.type
    const hasEnum = propSchema.enum && propSchema.enum.length > 0

    if (hasEnum) {
      // Render as select dropdown
      return (
        <select
          value={fieldValue || ''}
          onChange={(e) => handleChange(e.target.value || null)}
          disabled={disabled}
          className="w-full px-3 py-2 rounded-lg border-2 border-border-subtle bg-background text-text-primary focus:outline-none focus:border-primary disabled:opacity-50"
        >
          <option value="">Select...</option>
          {propSchema.enum.map((opt: any) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      )
    }

    switch (schemaType) {
      case 'string':
        return (
          <input
            type="text"
            value={fieldValue || ''}
            onChange={(e) => handleChange(e.target.value || null)}
            disabled={disabled}
            placeholder={propSchema.default || ''}
            className="w-full px-3 py-2 rounded-lg border-2 border-border-subtle bg-background text-text-primary focus:outline-none focus:border-primary disabled:opacity-50"
          />
        )
      
      case 'number':
      case 'integer':
        return (
          <input
            type="number"
            value={fieldValue ?? ''}
            onChange={(e) => handleChange(e.target.value ? Number(e.target.value) : null)}
            disabled={disabled}
            placeholder={propSchema.default?.toString() || ''}
            className="w-full px-3 py-2 rounded-lg border-2 border-border-subtle bg-background text-text-primary focus:outline-none focus:border-primary disabled:opacity-50"
          />
        )
      
      case 'boolean':
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={fieldValue || false}
              onChange={(e) => handleChange(e.target.checked)}
              disabled={disabled}
              className="w-5 h-5 rounded border-2 border-border-subtle"
            />
            <span className="text-sm text-text-secondary">
              {propSchema.description || 'Enable'}
            </span>
          </label>
        )
      
      case 'array':
        return (
          <textarea
            value={Array.isArray(fieldValue) ? fieldValue.join(', ') : ''}
            onChange={(e) => {
              const items = e.target.value.split(',').map(s => s.trim()).filter(Boolean)
              handleChange(items.length > 0 ? items : null)
            }}
            disabled={disabled}
            placeholder="Enter comma-separated values"
            rows={3}
            className="w-full px-3 py-2 rounded-lg border-2 border-border-subtle bg-background text-text-primary focus:outline-none focus:border-primary disabled:opacity-50 resize-none"
          />
        )
      
      case 'object':
        return (
          <textarea
            value={fieldValue ? JSON.stringify(fieldValue, null, 2) : ''}
            onChange={(e) => {
              try {
                const parsed = e.target.value ? JSON.parse(e.target.value) : null
                handleChange(parsed)
              } catch (err) {
                // Invalid JSON, don't update
              }
            }}
            disabled={disabled}
            placeholder="{}"
            rows={4}
            className="w-full px-3 py-2 rounded-lg border-2 border-border-subtle bg-background text-text-primary focus:outline-none focus:border-primary disabled:opacity-50 resize-none font-mono text-sm"
          />
        )
      
      default:
        return (
          <input
            type="text"
            value={fieldValue || ''}
            onChange={(e) => handleChange(e.target.value || null)}
            disabled={disabled}
            className="w-full px-3 py-2 rounded-lg border-2 border-border-subtle bg-background text-text-primary focus:outline-none focus:border-primary disabled:opacity-50"
          />
        )
    }
  }

  // Evaluate expressions in the schema config
  // Supports: $item.field, $.field, $parent.field
  const evaluateExpression = (expr: any, itemData?: Record<string, any>): any => {
    if (typeof expr !== 'string') return expr
    
    // Check if it's an expression
    if (!expr.startsWith('$')) return expr

    try {
      if (expr.startsWith('$item.')) {
        // Reference to current collection item
        const fieldName = expr.substring(6) // Remove "$item."
        return itemData?.[fieldName] ?? null
      } else if (expr.startsWith('$.')) {
        // Reference to root form data
        const fieldName = expr.substring(2) // Remove "$."
        return formData[fieldName] ?? null
      }
    } catch (err) {
      console.error('Failed to evaluate expression:', expr, err)
    }

    return expr
  }

  // Fetch nested schema
  useEffect(() => {
    if (!dynamicSchema) return

    const fetchSchema = async () => {
      setIsLoading(true)
      setSchemaError(null)

      try {
        // Build request body with evaluated expressions
        const body: Record<string, any> = {}
        
        if (dynamicSchema.body) {
          Object.entries(dynamicSchema.body).forEach(([key, val]) => {
            body[key] = evaluateExpression(val, itemData)
          })
        }

        console.log('[DynamicSchemaWidget] Evaluated body:', body)

        // Check if required fields are present (e.g., assetId should not be null/empty)
        if (body.assetId === null || body.assetId === undefined || body.assetId === '') {
          // Don't fetch schema if required parameters are missing
          console.log('[DynamicSchemaWidget] Skipping fetch - assetId is empty')
          setNestedSchema(null)
          setIsLoading(false)
          return
        }

        // Build URL (prepend backend URL if relative)
        let url = dynamicSchema.url
        if (url.startsWith('/')) {
          url = `http://localhost:8080${url}`
        }

        console.log('[DynamicSchemaWidget] Fetching schema:', { url, method: dynamicSchema.method || 'POST', body })

        // Fetch schema using POST /schemas endpoint
        const response = await fetch(url, {
          method: dynamicSchema.method || 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('[DynamicSchemaWidget] Fetch failed:', response.status, errorText)
          throw new Error(`Failed to fetch schema: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        console.log('[DynamicSchemaWidget] Schema fetched successfully:', data)
        
        // The POST /schemas endpoint returns raw JSON Schema, not BuilderDefinition
        // Wrap it in a BuilderDefinition structure for consistent handling
        const wrappedSchema: BuilderDefinition = {
          schema: data,
          layout: {
            fields: {},
            presets: null,
            steps: null
          }
        }
        
        setNestedSchema(wrappedSchema)
      } catch (err) {
        console.error('[DynamicSchemaWidget] Error fetching nested schema:', err)
        setSchemaError(err instanceof Error ? err.message : 'Failed to load schema')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSchema()
  }, [dynamicSchema, itemData?.toolName])

  return (
    <div className="dynamic-schema-widget space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          disabled={disabled}
          className="flex items-center gap-2 text-sm font-medium text-text-primary hover:text-primary transition-colors cursor-pointer"
        >
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={springPresets.snappy}
          >
            <ChevronRight className="w-4 h-4" />
          </motion.div>
          {field.label}
          {field.currentAccess === 'REQUIRED' && (
            <span className="text-error">*</span>
          )}
        </button>

        {isLoading && (
          <Loader2 className="w-4 h-4 text-text-tertiary animate-spin" />
        )}
      </div>

      {/* Description */}
      {field.description && (
        <p className="text-sm text-text-secondary">{field.description}</p>
      )}

      {/* Nested Form */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={slideDown}
            transition={springPresets.gentle}
            className="pl-4 border-l-2 border-border-subtle"
          >
            {isLoading ? (
              <div className="p-6 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                <p className="text-sm text-text-secondary">Loading nested form...</p>
              </div>
            ) : schemaError ? (
              <div className="p-4 bg-error-light border border-error rounded-lg">
                <p className="text-sm text-error">{schemaError}</p>
              </div>
            ) : nestedSchema ? (
              <div className="p-4 bg-surface rounded-lg">
                {/* Render fields from layout if available, otherwise from JSON Schema */}
                {nestedSchema.layout?.fields && Object.keys(nestedSchema.layout.fields).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(nestedSchema.layout.fields)
                      .sort(([, a], [, b]) => a.order - b.order)
                      .map(([pointer, fieldDef]) => {
                        const fieldName = pointer.substring(1) // Remove leading "/"
                        const fieldValue = value?.[fieldName]
                        
                        return (
                          <div key={pointer}>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                              {fieldDef.label}
                              {fieldDef.currentAccess === 'REQUIRED' && (
                                <span className="text-error ml-1">*</span>
                              )}
                            </label>
                            <WidgetFactory
                              field={fieldDef}
                              value={fieldValue}
                              onChange={(newValue) => {
                                const newData = { ...(value || {}), [fieldName]: newValue }
                                onChange(newData)
                              }}
                              disabled={disabled || fieldDef.currentAccess === 'READ_ONLY'}
                              formData={formData}
                            />
                          </div>
                        )
                      })}
                  </div>
                ) : nestedSchema.schema?.properties ? (
                  // Render from raw JSON Schema properties
                  <div className="space-y-4">
                    {Object.entries(nestedSchema.schema.properties).map(([propName, propSchema]: [string, any]) => {
                      const fieldValue = value?.[propName]
                      const isRequired = nestedSchema.schema.required?.includes(propName)
                      
                      return (
                        <div key={propName}>
                          <label className="block text-sm font-medium text-text-primary mb-2">
                            {propSchema.title || propName.charAt(0).toUpperCase() + propName.slice(1).replace(/([A-Z])/g, ' $1')}
                            {isRequired && <span className="text-error ml-1">*</span>}
                          </label>
                          {propSchema.description && (
                            <p className="text-xs text-text-tertiary mb-2">{propSchema.description}</p>
                          )}
                          {renderSchemaField(propName, propSchema, fieldValue, isRequired)}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-text-tertiary">No configuration fields available</p>
                )}
              </div>
            ) : (
              <div className="p-4 text-sm text-text-tertiary">
                No schema available
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      {error && (
        <motion.p
          className="text-sm text-error"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}
