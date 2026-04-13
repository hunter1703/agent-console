'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import { springPresets, fadeIn, scaleIn } from '@/lib/constants/animations'
import type { LayoutField } from '@/lib/types/schema'
import { WidgetFactory } from './WidgetFactory'
import { getValueByPointer, setValueByPointer } from '@/lib/utils/jsonPointer'

interface CollectionWidgetProps {
  field: LayoutField
  value: any[] | null
  onChange: (value: any[] | null) => void
  error?: string
  disabled?: boolean
  allFields?: Record<string, LayoutField> // All fields from layout for finding nested fields
  formData?: Record<string, any> // Full form data for context
  parentPointer?: string // The JSON pointer to this collection field
}

export function CollectionWidget({ 
  field, 
  value, 
  onChange, 
  error, 
  disabled,
  allFields = {},
  formData = {},
  parentPointer = ''
}: CollectionWidgetProps) {
  // Ensure items is always an array
  const items = Array.isArray(value) ? value : []
  const [draggedItem, setDraggedItem] = useState<number | null>(null)

  // Check if this is a complex object collection (no widget means nested fields)
  const isComplexObject = !field.widget

  // Find nested fields for this collection
  // Pattern: /parentPath/*/childField
  const nestedFields = useMemo(() => {
    if (!isComplexObject || !parentPointer) return []

    // Match pattern like: /guardrails/rules/*/fieldName
    const pattern = `^${parentPointer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/\\*/[^/]+$`
    const regex = new RegExp(pattern)
    
    return Object.entries(allFields)
      .filter(([pointer]) => regex.test(pointer))
      .map(([pointer, fieldDef]) => ({
        pointer,
        // Extract the property name (e.g., "toolName" from "/tools/*/toolName")
        propertyName: pointer.split('/').pop()!,
        field: fieldDef,
      }))
      .sort((a, b) => a.field.order - b.field.order)
  }, [isComplexObject, parentPointer, allFields])

  // Get the item type from the field (for rendering individual items)
  const itemField: LayoutField = {
    ...field,
    collection: false,
    label: '', // Individual items don't need labels
  }

  const handleAdd = () => {
    const newItem = isComplexObject ? {} : getDefaultValue(field.widget)
    onChange([...items, newItem])
  }

  const handleRemove = (index: number) => {
    const newItems = items.filter((_, i) => i !== index)
    onChange(newItems.length > 0 ? newItems : null)
  }

  const handleItemChange = (index: number, newValue: any) => {
    const newItems = [...items]
    newItems[index] = newValue
    onChange(newItems)
  }

  const handleNestedFieldChange = (index: number, propertyName: string, newValue: any) => {
    const newItems = [...items]
    if (!newItems[index]) {
      newItems[index] = {}
    }
    newItems[index] = {
      ...newItems[index],
      [propertyName]: newValue,
    }
    onChange(newItems)
  }

  const handleReorder = (newOrder: any[]) => {
    onChange(newOrder)
  }

  return (
    <div className="collection-widget space-y-3">
      {/* Items */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {items.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6 border-2 border-dashed border-border-medium rounded-lg text-center"
            >
              <p className="text-sm text-text-tertiary">No items yet</p>
            </motion.div>
          ) : (
            <Reorder.Group
              axis="y"
              values={items}
              onReorder={handleReorder}
              className="space-y-3"
            >
              {items.map((item, index) => {
                // Use index as the stable key to prevent unmounting when item data changes
                // This ensures widgets maintain their state during edits
                const itemKey = `item-${index}`
                
                return (
                <Reorder.Item
                  key={itemKey}
                  value={item}
                  dragListener={!disabled}
                  dragControls={undefined}
                  onDragStart={() => setDraggedItem(index)}
                  onDragEnd={() => setDraggedItem(null)}
                  className={`
                    relative group
                    ${draggedItem === index ? 'z-50' : ''}
                  `}
                >
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={springPresets.gentle}
                    className={`
                      p-4 bg-surface border border-border-subtle rounded-lg
                      ${!disabled ? 'hover:border-border-medium' : ''}
                      transition-colors
                    `}
                  >
                    <div className="flex items-start gap-3">
                      {/* Drag Handle */}
                      {!disabled && (
                        <button
                          type="button"
                          className="mt-2 cursor-grab active:cursor-grabbing text-text-tertiary hover:text-text-secondary transition-colors"
                          aria-label="Drag to reorder"
                        >
                          <GripVertical className="w-5 h-5" />
                        </button>
                      )}

                      {/* Item Content */}
                      <div className="flex-1 min-w-0 space-y-4">
                        {isComplexObject && nestedFields.length > 0 ? (
                          // Render nested fields for complex objects
                          nestedFields.map(({ propertyName, field: nestedField }) => (
                            <div key={propertyName}>
                              <label className="block text-sm font-medium text-text-primary mb-2">
                                {nestedField.label}
                                {nestedField.currentAccess === 'REQUIRED' && (
                                  <span className="text-error ml-1">*</span>
                                )}
                              </label>
                              <WidgetFactory
                                field={nestedField}
                                value={item[propertyName]}
                                onChange={(newValue) => handleNestedFieldChange(index, propertyName, newValue)}
                                disabled={disabled || nestedField.currentAccess === 'READ_ONLY'}
                                formData={formData}
                                allFields={allFields}
                                pointer={`${parentPointer}/*/${propertyName}`}
                                itemData={item}
                              />
                            </div>
                          ))
                        ) : isComplexObject ? (
                          // Complex object but no nested fields found - shouldn't happen
                          <div className="text-sm text-error">
                            Error: Complex object with no nested fields
                          </div>
                        ) : (
                          // Render simple widget for primitive collections
                          <WidgetFactory
                            field={itemField}
                            value={item}
                            onChange={(newValue) => handleItemChange(index, newValue)}
                            disabled={disabled}
                            formData={formData}
                            allFields={allFields}
                            pointer={parentPointer}
                          />
                        )}
                      </div>

                      {/* Remove Button */}
                      {!disabled && (
                        <motion.button
                          type="button"
                          onClick={() => handleRemove(index)}
                          className="mt-2 p-2 text-text-tertiary hover:text-error hover:bg-error-light rounded-lg transition-colors cursor-pointer"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                </Reorder.Item>
              )})}
            </Reorder.Group>
          )}
        </AnimatePresence>
      </div>

      {/* Add Button */}
      {!disabled && (
        <motion.button
          type="button"
          onClick={handleAdd}
          className="w-full p-3 border-2 border-dashed border-border-medium rounded-lg text-text-secondary hover:text-primary hover:border-primary transition-colors flex items-center justify-center gap-2 cursor-pointer"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">Add {field.label || 'Item'}</span>
        </motion.button>
      )}

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

// Helper to get default value based on widget type
function getDefaultValue(widget: string | null): any {
  switch (widget) {
    case 'TEXT':
    case 'TEXTAREA':
      return ''
    case 'NUMBER':
      return 0
    case 'SWITCH':
      return false
    case 'SELECT':
      return null
    default:
      return null
  }
}
