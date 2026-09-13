'use client'

import { Toggle } from '@/components/common'
import type { LayoutField } from '@/lib/types/schema'

interface SwitchWidgetProps {
  field: LayoutField
  value: boolean
  onChange: (value: boolean) => void
  error?: string
  disabled?: boolean
}

export function SwitchWidget({ field, value, onChange, error, disabled }: SwitchWidgetProps) {
  return (
    <div className="space-y-1">
      <Toggle
        checked={value || false}
        onChange={onChange}
        disabled={disabled}
      />
      {error && (
        <p className="text-sm text-error">{error}</p>
      )}
    </div>
  )
}
