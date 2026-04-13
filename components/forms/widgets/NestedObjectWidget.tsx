'use client'

import { useMemo } from 'react'
import type { LayoutField } from '@/lib/types/schema'
import { WidgetFactory } from './WidgetFactory'

interface NestedObjectWidgetProps {
  field: LayoutField
  value: Record<string, any> | null
  onChange: (value: Record<string, any> | null) => void
  error?: string
  disabled?: boolean
  allFields?: Record<string, LayoutField>
  formData?: Record<string, any>
  parentPointer?: string
}

export function NestedObjectWidget({
  field,
  value,
  onChange,
  error,
  disabled,
  allFields = {},
  formData = {},
  parentPointer = '',
}: NestedObjectWidgetProps) {
  const objectValue = value || {}

  // Find nested fields for this object
  // Pattern: /parentPath/childField (not /parentPath/*/childField)
  const nestedFields = useMemo(() => {
    if (!parentPointer) return []

    const pattern = `${parentPointer}/[^/]+$`
    const regex = new RegExp(pattern.replace(/\//g, '\\/'))

    return Object.entries(allFields)
      .filter(([pointer]) => {
        // Match direct children only (not grandchildren)
        if (!pointer.startsWith(parentPointer + '/')) return false
        const relativePath = pointer.substring(parentPointer.length + 1)
        return !relativePath.includes('/') && !relativePath.includes('*')
      })
      .map(([pointer, fieldDef]) => ({
        pointer,
        propertyName: pointer.split('/').pop()!,
        field: fieldDef,
      }))
      .sort((a, b) => a.field.order - b.field.order)
  }, [parentPointer, allFields])

  const handleNestedFieldChange = (propertyName: string, newValue: any) => {
    const newObject = {
      ...objectValue,
      [propertyName]: newValue,
    }
    onChange(newObject)
  }

  if (nestedFields.length === 0) {
    return (
      <div className="text-sm text-text-tertiary">
        No nested fields found for this object
      </div>
    )
  }

  return (
    <div className="space-y-4 pl-4 border-l-2 border-border-subtle">
      {nestedFields.map(({ propertyName, field: nestedField }) => (
        <div key={propertyName}>
          <label className="block text-sm font-medium text-text-primary mb-2">
            {nestedField.label}
            {nestedField.currentAccess === 'REQUIRED' && (
              <span className="text-error ml-1">*</span>
            )}
          </label>
          {nestedField.helpText && (
            <p className="text-xs text-text-tertiary mb-2">{nestedField.helpText}</p>
          )}
          <WidgetFactory
            field={nestedField}
            value={objectValue[propertyName]}
            onChange={(newValue) => handleNestedFieldChange(propertyName, newValue)}
            disabled={disabled || nestedField.currentAccess === 'READ_ONLY'}
            formData={formData}
            allFields={allFields}
            pointer={`${parentPointer}/${propertyName}`}
          />
        </div>
      ))}
      {error && (
        <p className="text-sm text-error mt-2">{error}</p>
      )}
    </div>
  )
}
