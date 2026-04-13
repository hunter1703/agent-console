'use client'

import type { LayoutField } from '@/lib/types/schema'
import { TextWidget } from './TextWidget'
import { NumberWidget } from './NumberWidget'
import { SelectWidget } from './SelectWidget'
import { SwitchWidget } from './SwitchWidget'
import { LookupWidget } from './LookupWidget'
import { DynamicSchemaWidget } from './DynamicSchemaWidget'
import { CollectionWidget } from './CollectionWidget'
import { NestedObjectWidget } from './NestedObjectWidget'

interface WidgetFactoryProps {
  field: LayoutField
  value: any
  onChange: (value: any) => void
  error?: string
  disabled?: boolean
  formData?: Record<string, any> // For dynamic schema expression evaluation
  allFields?: Record<string, LayoutField> // All fields from layout for collection nested fields
  pointer?: string // JSON pointer to this field
  itemData?: Record<string, any> // Current collection item data for $item expressions
}

export function WidgetFactory({ 
  field, 
  value, 
  onChange, 
  error, 
  disabled, 
  formData = {},
  allFields = {},
  pointer = '',
  itemData
}: WidgetFactoryProps) {
  // Handle collection fields
  if (field.collection) {
    return (
      <CollectionWidget
        field={field}
        value={value}
        onChange={onChange}
        error={error}
        disabled={disabled}
        allFields={allFields}
        formData={formData}
        parentPointer={pointer}
      />
    )
  }

  // Handle nested objects (no widget, not a collection)
  if (!field.widget) {
    // Check if this might be a leaf field that's missing a widget annotation
    // If we have no nested fields, default to TEXT widget
    const hasNestedFields = Object.keys(allFields).some(p => 
      p.startsWith(pointer + '/') && p !== pointer
    )
    
    if (!hasNestedFields) {
      // Treat as TEXT field
      return (
        <TextWidget
          field={{ ...field, widget: 'TEXT' }}
          value={value}
          onChange={onChange}
          error={error}
          disabled={disabled}
        />
      )
    }
    
    return (
      <NestedObjectWidget
        field={field}
        value={value}
        onChange={onChange}
        error={error}
        disabled={disabled}
        allFields={allFields}
        formData={formData}
        parentPointer={pointer}
      />
    )
  }

  switch (field.widget) {
    case 'TEXT':
    case 'TEXTAREA':
      return (
        <TextWidget
          field={field}
          value={value}
          onChange={onChange}
          error={error}
          disabled={disabled}
        />
      )

    case 'NUMBER':
      return (
        <NumberWidget
          field={field}
          value={value}
          onChange={onChange}
          error={error}
          disabled={disabled}
        />
      )

    case 'SELECT':
      return (
        <SelectWidget
          field={field}
          value={value}
          onChange={onChange}
          error={error}
          disabled={disabled}
        />
      )

    case 'SWITCH':
      return (
        <SwitchWidget
          field={field}
          value={value}
          onChange={onChange}
          error={error}
          disabled={disabled}
        />
      )

    case 'LOOKUP':
      return (
        <LookupWidget
          field={field}
          value={value}
          onChange={onChange}
          error={error}
          disabled={disabled}
        />
      )

    case 'DYNAMIC_SCHEMA':
      return (
        <DynamicSchemaWidget
          field={field}
          value={value}
          onChange={onChange}
          error={error}
          disabled={disabled}
          formData={formData}
          itemData={itemData}
        />
      )

    default:
      return (
        <div className="text-text-tertiary text-sm">
          Unknown widget type: {field.widget}
        </div>
      )
  }
}
