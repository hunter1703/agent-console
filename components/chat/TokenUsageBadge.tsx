'use client'

/**
 * The tokens a session's model calls have used so far, its child sessions' included, updated
 * live as each call's usage arrives on the stream.
 */

import { useMemo } from 'react'
import type { TokenUsagePayload } from '@/lib/sse/events'

export interface TokenUsageBadgeProps {
  usage: Record<string, TokenUsagePayload> | undefined
}

const formatter = new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 })

export function TokenUsageBadge({ usage }: TokenUsageBadgeProps) {
  const totals = useMemo(() => {
    const sum = { input: 0, output: 0, thinking: 0, cached: 0, total: 0 }
    for (const entry of Object.values(usage ?? {})) {
      sum.input += entry.inputTokens
      sum.output += entry.outputTokens
      sum.thinking += entry.thinkingTokens
      sum.cached += entry.cachedTokens
      sum.total += entry.totalTokens
    }
    return sum
  }, [usage])

  if (totals.total === 0) return null

  const categories = [
    { label: 'In', value: totals.input },
    { label: 'Out', value: totals.output },
    { label: 'Thinking', value: totals.thinking },
    { label: 'Cached', value: totals.cached },
    { label: 'Total', value: totals.total },
  ]

  return (
    <div
      className="flex items-center gap-3 text-xs text-text-tertiary tabular-nums whitespace-nowrap"
      data-testid="token-usage"
    >
      {categories.map(({ label, value }) => (
        <span key={label} title={`${label}: ${value.toLocaleString()} tokens`}>
          <span className={label === 'Total' ? 'text-text-secondary' : undefined}>{label}</span>{' '}
          <span className={label === 'Total' ? 'text-text-primary font-medium' : 'text-text-secondary'}>
            {formatter.format(value)}
          </span>
        </span>
      ))}
    </div>
  )
}
