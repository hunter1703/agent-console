'use client'

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAgentDisplayName } from './useAgentInfo'
import type { Agent } from '@/lib/api/types'

/**
 * Resolves agent IDs to display names.
 * Seeded from a pre-loaded agents list; fetches unknown IDs on demand.
 */
export function useAgentNameResolver(
  agentsData: { items: Agent[] } | undefined,
  displayAgent: Agent | undefined | null,
) {
  const [extraAgentIds, setExtraAgentIds] = useState<Set<string>>(new Set())

  // Collect unknown IDs encountered during render without triggering a state
  // update mid-render (which would cause an infinite re-render loop).
  const pendingIdsRef = useRef<Set<string>>(new Set())

  // Flush any IDs collected during render into state after the render commits.
  useEffect(() => {
    if (pendingIdsRef.current.size === 0) return
    const newIds = pendingIdsRef.current
    pendingIdsRef.current = new Set()
    setExtraAgentIds(prev => {
      const merged = new Set(prev)
      let changed = false
      for (const id of newIds) {
        if (!merged.has(id)) {
          merged.add(id)
          changed = true
        }
      }
      return changed ? merged : prev
    })
  })

  const agentNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const a of (agentsData?.items || [])) {
      map.set(a.id, (a as any).displayName || a.name)
    }
    return map
  }, [agentsData])

  const extraAgentQuery = useQuery({
    queryKey: ['agents', 'extra', Array.from(extraAgentIds).sort().join(',')],
    queryFn: async () => {
      const { getAgent } = await import('@/lib/api/services')
      const results = await Promise.allSettled(
        Array.from(extraAgentIds)
          .filter(id => !agentNameById.has(id))
          .map(id => getAgent(id))
      )
      const map = new Map<string, string>()
      for (const r of results) {
        if (r.status === 'fulfilled' && r.value) {
          map.set(r.value.id, (r.value as any).displayName || r.value.name)
        }
      }
      return map
    },
    enabled: extraAgentIds.size > 0,
    staleTime: 5 * 60 * 1000,
  })

  const resolveAgentName = useCallback((agentId?: string): string => {
    if (!agentId) return getAgentDisplayName(displayAgent)
    if (agentNameById.has(agentId)) return agentNameById.get(agentId)!
    if (extraAgentQuery.data?.has(agentId)) return extraAgentQuery.data.get(agentId)!
    // Queue a fetch for this unknown ID — do NOT call setState here (render-time side effect).
    pendingIdsRef.current.add(agentId)
    return getAgentDisplayName(displayAgent)
  }, [agentNameById, extraAgentQuery.data, displayAgent])

  return resolveAgentName
}
