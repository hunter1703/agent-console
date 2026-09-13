'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSchema } from '@/lib/api/schemas'
import { evaluateRule } from '@/lib/utils/jsonLogic'
import { getValueByPointer, setValueByPointer } from '@/lib/utils/jsonPointer'
import { useFormDraft } from '@/lib/hooks/useFormDraft'
import { useUnsavedChanges } from '@/lib/hooks/useUnsavedChanges'
import type { AssetType, BuilderMode, LayoutField, FieldState } from '@/lib/types/schema'
import { FormSection } from './FormSection'
import { StepWizard } from './StepWizard'
import { PresetSelector } from './PresetSelector'
import { StepSummary } from './StepSummary'
import { Button } from '@/components/common'
import { Loader2, RotateCcw, Save } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { springPresets, fadeIn } from '@/lib/constants/animations'

interface DynamicFormProps {
  assetType: AssetType
  mode: BuilderMode
  initialData?: Record<string, any>
  onSubmit: (data: Record<string, any>) => Promise<void>
  onCancel?: () => void
}

const DEFAULT_INITIAL_DATA = {}

export function DynamicForm({ 
  assetType, 
  mode, 
  initialData = DEFAULT_INITIAL_DATA, 
  onSubmit, 
  onCancel 
}: DynamicFormProps) {
  const { schema: builderDef, layout, loading, error } = useSchema(assetType, mode)
  const schema = builderDef?.schema // Extract the actual JSON Schema
  const [formData, setFormData] = useState<Record<string, any>>(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const [showPresetSelector, setShowPresetSelector] = useState(true)
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [showSummary, setShowSummary] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  console.log('[DynamicForm] Render - mode:', mode, 'showPresetSelector:', showPresetSelector, 'layout.presets:', layout?.presets?.length)

  // Draft auto-save
  const draftKey = `${assetType}-${mode}`
  const { loadDraft, clearDraft, getDraftMetadata } = useFormDraft({
    key: draftKey,
    data: formData,
    enabled: mode === 'CREATE',
  })

  // Unsaved changes warning
  useUnsavedChanges({
    hasUnsavedChanges: hasUnsavedChanges && mode === 'CREATE',
  })

  // Load draft on mount (silently, no popup)
  useEffect(() => {
    if (mode === 'CREATE' && !selectedPreset) {
      const draft = loadDraft()
      
      if (draft) {
        console.log('[DynamicForm] Draft found, but not loading it yet - showing presets first')
        // Don't load draft automatically - let user choose preset first
        // They can load draft manually if needed
      }
    }
  }, [mode, selectedPreset])

  // Update form data when initialData changes
  useEffect(() => {
    setFormData((prev) => {
      if (JSON.stringify(prev) !== JSON.stringify(initialData)) {
        return initialData
      }
      return prev
    })
  }, [initialData])

  // Track unsaved changes
  useEffect(() => {
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialData)
    setHasUnsavedChanges(hasChanges)
  }, [formData, initialData])

  // Handle preset selection
  const handlePresetSelect = (presetId: string | null) => {
    if (presetId && layout?.presets) {
      const preset = layout.presets.find(p => p.id === presetId)
      if (preset) {
        try {
          console.log('[DynamicForm] Applying preset:', preset.id)
          console.log('[DynamicForm] Preset object:', preset)
          
          // Backend returns 'preset' field with nested structure, not 'values'
          const presetData = (preset as any).preset || (preset as any).values
          
          if (!presetData) {
            console.warn('[DynamicForm] No preset data found in preset object')
            setShowPresetSelector(false)
            return
          }
          
          console.log('[DynamicForm] Preset data:', presetData)
          
          // Flatten nested structure (capabilities, inference, etc.) into top-level fields
          const flattenedValues: Record<string, any> = {}
          
          if (typeof presetData === 'object') {
            Object.entries(presetData).forEach(([key, value]) => {
              if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                // Nested object - flatten it
                Object.entries(value).forEach(([nestedKey, nestedValue]) => {
                  flattenedValues[nestedKey] = nestedValue
                })
              } else {
                // Top-level value
                flattenedValues[key] = value
              }
            })
          }
          
          console.log('[DynamicForm] Flattened preset values:', flattenedValues)
          console.log('[DynamicForm] Initial data:', initialData)
          
          const newFormData = { ...initialData, ...flattenedValues }
          console.log('[DynamicForm] New form data after preset:', newFormData)
          
          setFormData(newFormData)
          setSelectedPreset(presetId)
        } catch (err) {
          console.error('[DynamicForm] Failed to parse preset values:', err)
        }
      }
    }
    setShowPresetSelector(false)
  }

  // Handle skipping preset selection
  const handleSkipPresets = () => {
    setShowPresetSelector(false)
  }

  // Handle form reset
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all fields? This cannot be undone.')) {
      setFormData(initialData)
      setErrors({})
      setCurrentStepIndex(0)
      setCompletedSteps(new Set())
      clearDraft()
      setHasUnsavedChanges(false)
    }
  }

  // Compute field states based on conditional rules
  const fieldStates = useMemo(() => {
    if (!layout || !schema) return {}

    const states: Record<string, FieldState> = {}

    // Helper to check if a field is required in the JSON Schema
    const isFieldRequired = (pointer: string): boolean => {
      // Extract field path from pointer (e.g., "/contextStrategy/modelId" -> ["contextStrategy", "modelId"])
      const parts = pointer.split('/').filter(Boolean)
      
      if (parts.length === 0) return false
      
      // For top-level fields, check the root schema's required array
      if (parts.length === 1) {
        const schemaRequired = (schema as any).required || []
        return schemaRequired.includes(parts[0])
      }
      
      // For nested fields, navigate through the schema to find the parent object
      let currentSchema: any = schema
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i]
        
        if (part === '*' && currentSchema.type === 'array' && currentSchema.items) {
          currentSchema = currentSchema.items
        } else {
          const properties = currentSchema.properties || {}
          currentSchema = properties[part]
        }
        
        if (!currentSchema) {
          return false
        }
      }
      
      // Check if the final field is in the required array of its parent schema
      const fieldName = parts[parts.length - 1]
      const required = currentSchema.required || []
      return required.includes(fieldName)
    }

    Object.entries(layout.fields).forEach(([pointer, field]) => {
      // Check if field is required from:
      // 1. UiAccess annotation (field.currentAccess === 'REQUIRED')
      // 2. JSON Schema required array (from @NotNull, @NotBlank)
      const fromAccess = field.currentAccess === 'REQUIRED'
      const fromSchema = isFieldRequired(pointer)
      const isBaseRequired = fromAccess || fromSchema
      
      const state: FieldState = {
        visible: true,
        enabled: true,
        required: isBaseRequired,
      }

      // Evaluate rules
      if (field.rules) {
        field.rules.forEach(rule => {
          const result = evaluateRule(rule.expr, formData)
          
          if (rule.effect === 'VISIBLE') {
            state.visible = result
          } else if (rule.effect === 'ENABLED') {
            state.enabled = result
          } else if (rule.effect === 'REQUIRED') {
            state.required = result
          }
        })
      }

      states[pointer] = state
    })

    return states
  }, [layout, schema, formData])

  // Group fields by step and section
  const steps = useMemo(() => {
    if (!layout) return []

    console.log('[DynamicForm] Layout fields:', Object.keys(layout.fields))
    console.log('[DynamicForm] Layout steps:', layout.steps)

    // Helper to check if a field is a container (has nested fields but no widget and not a collection)
    const isContainerField = (pointer: string): boolean => {
      const field = layout.fields[pointer]
      if (!field) return false
      
      // Has widget or is collection = not a container
      if (field.widget || field.collection) return false
      
      // Check if there are nested fields
      const hasNestedFields = Object.keys(layout.fields).some(p => 
        p.startsWith(pointer + '/') && p !== pointer
      )
      
      return hasNestedFields
    }

    // If backend provides explicit step ordering, use it
    if (layout.steps && layout.steps.length > 0) {
      const processedSteps = layout.steps
        .sort((a, b) => a.order - b.order)
        .map(step => {
          console.log(`[DynamicForm] Processing step: ${step.id}`)
          
          // If step has explicit sections, only show fields matching those sections
          if (step.sections && step.sections.length > 0) {
            const sections = step.sections
              .sort((a, b) => a.order - b.order)
              .map(section => {
                console.log(`[DynamicForm]   Processing section: ${section.id}`)
                
                // Find ALL fields for this step/section (including nested), excluding only pure containers
                const fields = Object.entries(layout.fields)
                  .filter(([pointer, field]) => {
                    // Must match step and section
                    if (field.step !== step.id || field.section !== section.id) {
                      return false
                    }
                    
                    console.log(`[DynamicForm]     Field ${pointer} matches step/section`)
                    
                    // Include if it has a widget or is a collection (renderable)
                    if (field.widget || field.collection) {
                      console.log(`[DynamicForm]     Field ${pointer} has widget/collection - INCLUDE`)
                      return true
                    }
                    
                    // For fields without widget/collection, check if they're pure containers
                    // Pure containers have nested fields but shouldn't be rendered themselves
                    const hasNestedFields = Object.keys(layout.fields).some(p => 
                      p.startsWith(pointer + '/') && p !== pointer
                    )
                    
                    console.log(`[DynamicForm]     Field ${pointer} hasNestedFields=${hasNestedFields} - ${hasNestedFields ? 'EXCLUDE' : 'INCLUDE'}`)
                    
                    // If no nested fields, it's a leaf field - include it
                    // If has nested fields, it's a container - exclude it
                    return !hasNestedFields
                  })
                  .sort(([, a], [, b]) => a.order - b.order)
                  .map(([pointer, field]) => ({ pointer, field }))

                console.log(`[DynamicForm]   Section ${section.id} has ${fields.length} fields`)
                
                return {
                  name: section.label,
                  fields,
                }
              })
              .filter(section => section.fields.length > 0) // Only include sections with fields

            console.log(`[DynamicForm] Step ${step.id} has ${sections.length} sections with fields`)

            return {
              id: step.id,
              name: step.label,
              sections,
              isComplete: completedSteps.has(step.id),
            }
          }

          // No explicit sections - show all fields for this step without section grouping
          const fields = Object.entries(layout.fields)
            .filter(([pointer, field]) => {
              if (field.step !== step.id) return false
              
              // Include if it has a widget or is a collection
              if (field.widget || field.collection) return true
              
              // Check if it's a pure container
              const hasNestedFields = Object.keys(layout.fields).some(p => 
                p.startsWith(pointer + '/') && p !== pointer
              )
              
              return !hasNestedFields
            })
            .sort(([, a], [, b]) => a.order - b.order)
            .map(([pointer, field]) => ({ pointer, field }))

          return {
            id: step.id,
            name: step.label,
            sections: [{
              name: '', // Empty name = no section header
              fields,
            }],
            isComplete: completedSteps.has(step.id),
          }
        })
        .filter(step => {
          const hasFields = step.sections.some(s => s.fields.length > 0)
          console.log(`[DynamicForm] Step ${step.id} hasFields=${hasFields}`)
          return hasFields
        })
      
      console.log('[DynamicForm] Final steps:', processedSteps.map(s => s.id))
      return processedSteps
    }

    // Fallback: infer steps/sections from field metadata (old behavior)
    const stepMap = new Map<string, Map<string, Array<{ pointer: string; field: LayoutField }>>>()

    Object.entries(layout.fields)
      .filter(([pointer]) => !isContainerField(pointer)) // Filter out container fields
      .sort(([, a], [, b]) => a.order - b.order)
      .forEach(([pointer, field]) => {
        const stepName = field.step || 'general'
        const sectionName = field.section || 'general'
        
        if (!stepMap.has(stepName)) {
          stepMap.set(stepName, new Map())
        }
        
        const sections = stepMap.get(stepName)!
        if (!sections.has(sectionName)) {
          sections.set(sectionName, [])
        }
        
        sections.get(sectionName)!.push({ pointer, field })
      })

    // Convert to array structure
    return Array.from(stepMap.entries()).map(([stepName, sections]) => ({
      id: stepName,
      name: stepName.charAt(0).toUpperCase() + stepName.slice(1),
      sections: Array.from(sections.entries()).map(([sectionName, fields]) => ({
        name: sectionName.charAt(0).toUpperCase() + sectionName.slice(1),
        fields,
      })),
      isComplete: completedSteps.has(stepName),
    }))
  }, [layout, completedSteps])

  // Handle field value change
  const handleFieldChange = (pointer: string, value: any) => {
    const newData = { ...formData }
    setValueByPointer(newData, pointer, value)
    setFormData(newData)

    // Clear error for this field
    if (errors[pointer]) {
      const newErrors = { ...errors }
      delete newErrors[pointer]
      setErrors(newErrors)
    }
  }

  // Validate current step
  const validateStep = (stepIndex: number): boolean => {
    if (!steps[stepIndex]) return true

    const newErrors: Record<string, string> = {}
    const currentStep = steps[stepIndex]

    currentStep.sections.forEach(section => {
      section.fields.forEach(({ pointer, field }) => {
        const state = fieldStates[pointer]
        
        if (!state?.visible) return

        const value = getValueByPointer(formData, pointer)
        
        // Check required fields
        if (state.required) {
          // Handle different value types
          const isEmpty = 
            value === undefined || 
            value === null || 
            value === '' ||
            (Array.isArray(value) && value.length === 0) ||
            (typeof value === 'string' && value.trim() === '')
          
          if (isEmpty) {
            newErrors[pointer] = `${field.label} is required`
          }
        }
      })
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle step navigation
  const handleNext = () => {
    if (validateStep(currentStepIndex)) {
      setCompletedSteps(prev => new Set(prev).add(steps[currentStepIndex].id))
      setCurrentStepIndex(prev => Math.min(prev + 1, steps.length - 1))
    }
  }

  const handlePrevious = () => {
    setCurrentStepIndex(prev => Math.max(prev - 1, 0))
  }

  const handleStepChange = (index: number) => {
    // Validate current step before allowing navigation
    if (index > currentStepIndex && !validateStep(currentStepIndex)) {
      return
    }
    setCurrentStepIndex(index)
  }

  // Handle form submission
  const handleSubmit = async () => {
    // Validate all steps
    let allValid = true
    for (let i = 0; i < steps.length; i++) {
      if (!validateStep(i)) {
        allValid = false
        setCurrentStepIndex(i) // Jump to first invalid step
        setShowSummary(false)
        break
      }
    }

    if (!allValid) return

    setIsSubmitting(true)

    try {
      await onSubmit(formData)
      clearDraft() // Clear draft on successful submit
      setHasUnsavedChanges(false)
    } catch (err) {
      console.error('Form submission error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show summary before final submit
  const handleShowSummary = () => {
    // Validate current step first
    if (validateStep(currentStepIndex)) {
      setCompletedSteps(prev => new Set(prev).add(steps[currentStepIndex].id))
      setShowSummary(true)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-text-secondary">Loading form...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 bg-error-light border border-error rounded-lg">
        <h3 className="text-lg font-semibold text-error mb-2">Error Loading Form</h3>
        <p className="text-text-secondary">{error.message}</p>
      </div>
    )
  }

  // No schema
  if (!schema || !layout || steps.length === 0) {
    return (
      <div className="p-6 bg-surface border border-border-subtle rounded-lg">
        <p className="text-text-secondary">No schema available</p>
      </div>
    )
  }

  // Show preset selector first (only in CREATE mode)
  if (mode === 'CREATE' && showPresetSelector && layout.presets && layout.presets.length > 0) {
    console.log('[DynamicForm] Showing preset selector with presets:', layout.presets)
    return (
      <PresetSelector
        presets={layout.presets}
        onSelect={handlePresetSelect}
        onSkip={handleSkipPresets}
      />
    )
  }

  const currentStep = steps[currentStepIndex]
  const isLastStep = currentStepIndex === steps.length - 1
  const canGoNext = currentStepIndex < steps.length - 1
  const canGoPrevious = currentStepIndex > 0

  // Show summary view
  if (showSummary) {
    return (
      <div className="space-y-6">
        <StepSummary
          steps={steps}
          formData={formData}
          errors={errors}
          onStepClick={(index) => {
            setCurrentStepIndex(index)
            setShowSummary(false)
          }}
        />

        <div className="flex items-center justify-between pt-6 border-t border-border-subtle">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setShowSummary(false)}
          >
            Back to Form
          </Button>

          <div className="flex items-center gap-3">
            {mode === 'CREATE' && (
              <Button
                type="button"
                variant="secondary"
                onClick={handleReset}
                disabled={isSubmitting}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            )}

            <Button
              type="button"
              variant="primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <StepWizard
      steps={steps}
      currentStep={currentStepIndex}
      onStepChange={handleStepChange}
      onPrevious={handlePrevious}
      onNext={isLastStep ? handleShowSummary : handleNext}
      onSubmit={handleSubmit}
      canGoNext={canGoNext}
      canGoPrevious={canGoPrevious}
      isLastStep={isLastStep}
      isSubmitting={isSubmitting}
    >
      {/* Current Step Content */}
      <div className="space-y-8 min-h-[400px]">
        {currentStep.sections.map((section) => (
          <FormSection
            key={section.name}
            name={section.name}
            fields={section.fields.map(({ pointer, field }) => ({
              pointer,
              field,
              value: getValueByPointer(formData, pointer),
              onChange: (value) => handleFieldChange(pointer, value),
              error: errors[pointer],
              visible: fieldStates[pointer]?.visible,
              disabled: !fieldStates[pointer]?.enabled || mode === 'VIEW',
              required: fieldStates[pointer]?.required,
            }))}
            collapsible={false}
            defaultExpanded={true}
            formData={formData}
            allFields={layout?.fields || {}}
          />
        ))}

        {/* Reset Button (only show on first step in CREATE mode) */}
        {currentStepIndex === 0 && mode === 'CREATE' && (
          <div className="flex items-center gap-3">
            {onCancel && (
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}

            <Button
              type="button"
              variant="secondary"
              onClick={handleReset}
              disabled={isSubmitting || !hasUnsavedChanges}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Form
            </Button>
          </div>
        )}
      </div>
    </StepWizard>
  )
}
