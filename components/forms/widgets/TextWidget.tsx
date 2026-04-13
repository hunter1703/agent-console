'use client'

import { Input, Textarea } from '@/components/common'
import type { LayoutField } from '@/lib/types/schema'

interface TextWidgetProps {
  field: LayoutField
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
}

export function TextWidget({ field, value, onChange, error, disabled }: TextWidgetProps) {
  const isMultiline = field.multiline || field.widget === 'TEXTAREA'
  const isSensitive = field.sensitive

  if (isMultiline) {
    return (
      <Textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.label}
        rows={field.rows || 4}
        disabled={disabled}
        error={error}
      />
    )
  }

  return (
    <Input
      type={isSensitive ? 'password' : 'text'}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.label}
      disabled={disabled}
      error={error}
    />
  )
}
