/**
 * useAgentInfo Hook
 * 
 * Fetches and caches agent information with automatic expiry.
 * Used to display agent names and avatars in chat messages.
 */

import { useQuery } from '@tanstack/react-query'
import { getAgent } from '@/lib/api/services'
import { queryKeys } from '@/lib/query/client'

export interface AgentInfo {
  id: string
  name: string
  displayName?: string
  avatar?: string
  description?: string
}

/**
 * Hook to fetch agent information with caching
 * @param agentId - The agent ID to fetch
 * @param enabled - Whether to enable the query (default: true)
 * @returns Agent information with loading and error states
 */
export function useAgentInfo(agentId: string | undefined, enabled = true) {
  const query = useQuery({
    queryKey: queryKeys.agents.detail(agentId!),
    queryFn: () => getAgent(agentId!),
    enabled: enabled && !!agentId,
    staleTime: 60 * 1000, // 1 minute cache
    gcTime: 5 * 60 * 1000, // 5 minutes garbage collection
  })

  const agentInfo: AgentInfo | undefined = query.data
    ? {
        id: query.data.id,
        name: query.data.name,
        displayName: query.data.displayName,
        avatar: query.data.avatar,
        description: query.data.description,
      }
    : undefined

  return {
    agentInfo,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  }
}

/**
 * Get agent display name with fallback. Accepts any agent-shaped object with at least
 * `name` — not just AgentInfo — since callers also pass the (structurally different)
 * Agent type from lib/api/types.ts, and this only ever reads these two fields.
 */
export function getAgentDisplayName(
  agentInfo: { name: string; displayName?: string } | null | undefined,
  fallback = 'Assistant'
): string {
  if (!agentInfo) return fallback
  return agentInfo.displayName || agentInfo.name || fallback
}
