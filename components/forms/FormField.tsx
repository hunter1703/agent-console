'use client'

import { motion } from 'framer-motion'
import type { LayoutField } from '@/lib/types/schema'
import { WidgetFactory } from './widgets/WidgetFactory'
import { FieldPresetSelector } from './FieldPresetSelector'

interface FormFieldProps {
  pointer: string
  field: LayoutField
  value: any
  onChange: (value: any) => void
  error?: string
  visible?: boolean
  disabled?: boolean
  required?: boolean  // Computed from rules or access level
  formData?: Record<string, any>
  allFields?: Record<string, LayoutField> // All fields from layout
}

export function FormField({ 
  pointer, 
  field, 
  value, 
  onChange, 
  error, 
  visible = true,
  disabled = false,
  required = false,
  formData = {},
  allFields = {}
}: FormFieldProps) {
  if (!visible) {
    return null
  }

  const isRequired = required
  const isReadOnly = field.currentAccess === 'READ_ONLY' || disabled
  const hasPresets = field.presets && field.presets.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-2"
    >
      {/* Label and Preset Selector */}
      <div className="flex items-center justify-between">
        <label className="block">
          <span className="text-sm font-medium text-text-primary">
            {field.label}
            {isRequired && <span className="text-error ml-1">*</span>}
          </span>
          {field.helpText && (
            <span className="block text-xs text-text-tertiary mt-1">
              {field.helpText}
            </span>
          )}
        </label>

        {/* Field-level preset selector */}
        {hasPresets && !isReadOnly && (
          <FieldPresetSelector
            presets={field.presets!}
            onSelect={onChange}
            currentValue={value}
            disabled={isReadOnly}
          />
        )}
      </div>

      <WidgetFactory
        field={field}
        value={value}
        onChange={onChange}
        error={error}
        disabled={isReadOnly}
        formData={formData}
        allFields={allFields}
        pointer={pointer}
      />
    </motion.div>
  )
}
