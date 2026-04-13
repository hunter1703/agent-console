'use client'

import { motion } from 'framer-motion'
import { Check, AlertCircle } from 'lucide-react'
import { springPresets, fadeIn } from '@/lib/constants/animations'
import { getValueByPointer } from '@/lib/utils/jsonPointer'
import type { LayoutField } from '@/lib/types/schema'

interface StepSummaryProps {
  steps: Array<{
    id: string
    name: string
    sections: Array<{
      name: string
      fields: Array<{
        pointer: string
        field: LayoutField
      }>
    }>
    isComplete: boolean
  }>
  formData: Record<string, any>
  errors: Record<string, string>
  onStepClick: (stepIndex: number) => void
}

export function StepSummary({ steps, formData, errors, onStepClick }: StepSummaryProps) {
  const getFieldValue = (pointer: string, field: LayoutField): string => {
    const value = getValueByPointer(formData, pointer)
    
    if (value === null || value === undefined || value === '') {
      return '—'
    }

    if (field.sensitive) {
      return '••••••••'
    }

    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No'
    }

    if (Array.isArray(value)) {
      return `${value.length} items`
    }

    if (typeof value === 'object') {
      return 'Configured'
    }

    return String(value)
  }

  const getStepErrors = (stepIndex: number): number => {
    const step = steps[stepIndex]
    let errorCount = 0

    step.sections.forEach(section => {
      section.fields.forEach(({ pointer }) => {
        if (errors[pointer]) {
          errorCount++
        }
      })
    })

    return errorCount
  }

  return (
    <motion.div
      className="step-summary space-y-6 p-6 bg-surface border border-border-subtle rounded-lg"
      initial="initial"
      animate="animate"
      variants={fadeIn}
      transition={springPresets.gentle}
    >
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-text-primary">Review Your Configuration</h3>
        <p className="text-sm text-text-secondary">
          Review all settings before submitting. Click any step to make changes.
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((step, stepIndex) => {
          const errorCount = getStepErrors(stepIndex)
          const hasErrors = errorCount > 0

          return (
            <motion.button
              key={step.id}
              type="button"
              onClick={() => onStepClick(stepIndex)}
              className="w-full text-left p-4 bg-background hover:bg-surface-hover border border-border-subtle rounded-lg transition-colors cursor-pointer"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {/* Step Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold
                    ${step.isComplete && !hasErrors
                      ? 'bg-success text-white'
                      : hasErrors
                      ? 'bg-error text-white'
                      : 'bg-surface text-text-tertiary border border-border-medium'
                    }
                  `}>
                    {step.isComplete && !hasErrors ? (
                      <Check className="w-4 h-4" />
                    ) : hasErrors ? (
                      <AlertCircle className="w-4 h-4" />
                    ) : (
                      stepIndex + 1
                    )}
                  </div>
                  <h4 className="font-semibold text-text-primary">{step.name}</h4>
                </div>

                {hasErrors && (
                  <span className="text-xs text-error font-medium">
                    {errorCount} {errorCount === 1 ? 'error' : 'errors'}
                  </span>
                )}
              </div>

              {/* Step Fields Summary */}
              <div className="space-y-2 pl-9">
                {step.sections.map(section => (
                  <div key={section.name} className="space-y-1">
                    {section.fields.slice(0, 3).map(({ pointer, field }) => {
                      const value = getFieldValue(pointer, field)
                      const hasError = !!errors[pointer]

                      return (
                        <div
                          key={pointer}
                          className={`flex items-start justify-between text-sm ${
                            hasError ? 'text-error' : 'text-text-secondary'
                          }`}
                        >
                          <span className="truncate">{field.label}:</span>
                          <span className="font-medium ml-2 truncate max-w-[200px]">
                            {value}
                          </span>
                        </div>
                      )
                    })}
                    {section.fields.length > 3 && (
                      <div className="text-xs text-text-tertiary">
                        +{section.fields.length - 3} more fields
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}
