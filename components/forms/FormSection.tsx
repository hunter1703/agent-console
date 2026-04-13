'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import type { LayoutField } from '@/lib/types/schema'
import { FormField } from './FormField'
import { AdvancedFieldsSection } from './AdvancedFieldsSection'

interface FormSectionProps {
  name: string
  fields: Array<{
    pointer: string
    field: LayoutField
    value: any
    onChange: (value: any) => void
    error?: string
    visible?: boolean
    disabled?: boolean
    required?: boolean
  }>
  collapsible?: boolean
  defaultExpanded?: boolean
  formData?: Record<string, any> // For passing to widgets
  allFields?: Record<string, LayoutField> // All fields from layout
}

export function FormSection({ 
  name, 
  fields, 
  collapsible = false,
  defaultExpanded = true,
  formData = {},
  allFields = {}
}: FormSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  // Filter visible fields
  const visibleFields = fields.filter(f => f.visible !== false)

  // Separate advanced and regular fields
  const regularFields = visibleFields.filter(f => !f.field.advanced)
  const advancedFields = visibleFields.filter(f => f.field.advanced)

  if (visibleFields.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Section Header */}
      {name && (
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-text-primary">
            {name}
          </h3>
          {collapsible && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-surface-hover rounded transition-colors cursor-pointer"
            >
              <motion.div
                animate={{ rotate: isExpanded ? 0 : -90 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-5 h-5 text-text-secondary" />
              </motion.div>
            </button>
          )}
        </div>
      )}

      {/* Section Fields */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Regular Fields */}
            {regularFields.map(({ pointer, field, value, onChange, error, disabled, required }) => (
              <FormField
                key={pointer}
                pointer={pointer}
                field={field}
                value={value}
                onChange={onChange}
                error={error}
                visible={true}
                disabled={disabled}
                required={required}
                formData={formData}
                allFields={allFields}
              />
            ))}

            {/* Advanced Fields */}
            {advancedFields.length > 0 && (
              <AdvancedFieldsSection>
                {advancedFields.map(({ pointer, field, value, onChange, error, disabled, required }) => (
                  <FormField
                    key={pointer}
                    pointer={pointer}
                    field={field}
                    value={value}
                    onChange={onChange}
                    error={error}
                    visible={true}
                    disabled={disabled}
                    required={required}
                    formData={formData}
                    allFields={allFields}
                  />
                ))}
              </AdvancedFieldsSection>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
