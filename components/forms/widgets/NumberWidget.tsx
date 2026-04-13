'use client'

import { Input } from '@/components/common'
import type { LayoutField } from '@/lib/types/schema'

interface NumberWidgetProps {
  field: LayoutField
  value: number | null
  onChange: (value: number | null) => void
  error?: string
  disabled?: boolean
}

export function NumberWidget({ field, value, onChange, error, disabled }: NumberWidgetProps) {
  const step = field.numberType === 'integer' ? 1 : 0.01

  return (
    <Input
      type="number"
      value={value?.toString() || ''}
      onChange={(e) => {
        const val = e.target.value
        if (val === '') {
          onChange(null)
        } else {
          const num = field.numberType === 'integer' ? parseInt(val, 10) : parseFloat(val)
          onChange(isNaN(num) ? null : num)
        }
      }}
      step={step}
      placeholder={field.label}
      disabled={disabled}
      error={error}
    />
  )
}
