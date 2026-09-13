/**
 * React Query Client Configuration
 * 
 * Centralized configuration for React Query with proper error handling,
 * caching strategies, and retry logic optimized for the Agent Engine API.
 */

import { QueryClient, DefaultOptions } from '@tanstack/react-query'
import { APIError } from '@/lib/api/client'
import { DEV_CONFIG } from '@/lib/config/env'

// ============================================================================
// Query Configuration
// ============================================================================

/**
 * Default query options optimized for Agent Engine API
 */
const defaultQueryOptions: DefaultOptions = {
  queries: {
    // Cache for 5 minutes by default
    staleTime: 5 * 60 * 1000,
    
    // Keep in cache for 10 minutes
    gcTime: 10 * 60 * 1000,
    
    // Retry configuration
    retry: (failureCount, error) => {
      // Don't retry client errors (4xx)
      if (error instanceof APIError && error.status && error.status < 500) {
        return false
      }
      
      // Retry network errors and server errors up to 3 times
      return failureCount < 3
    },
    
    // Retry delay with exponential backoff
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    
    // Refetch on window focus for critical data
    refetchOnWindowFocus: true,
    
    // Refetch on reconnect
    refetchOnReconnect: true,
    
    // Don't refetch on mount if data is fresh
    refetchOnMount: true,
  },
  
  mutations: {
    // Retry mutations for server errors only
    retry: (failureCount, error) => {
      if (error instanceof APIError && error.status >= 500 && failureCount < 2) {
        return true
      }
      return false
    },
    
    // Shorter retry delay for mutations
    retryDelay: (attemptIndex) => Math.min(500 * 2 ** attemptIndex, 5000),
  }
}

// ============================================================================
// Query Client Instance
// ============================================================================

/**
 * Create React Query client with optimized configuration
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: defaultQueryOptions,
    
    // Global error handler
    mutationCache: undefined, // Will be set up with error handling
    queryCache: undefined,    // Will be set up with error handling
  })
}

/**
 * Default query client instance
 */
export const queryClient = createQueryClient()

// ============================================================================
// Query Keys
// ============================================================================

/**
 * Centralized query key factory for consistent caching
 */
export const queryKeys = {
  // Agent queries
  agents: {
    all: ['agents'] as const,
    lists: () => [...queryKeys.agents.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => 
      [...queryKeys.agents.lists(), filters] as const,
    details: () => [...queryKeys.agents.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.agents.details(), id] as const,
    schema: (mode: string) => [...queryKeys.agents.all, 'schema', mode] as const,
  },

  // Schedule queries
  schedules: {
    all: ['schedules'] as const,
    list: (agentId: string) => [...queryKeys.schedules.all, 'list', agentId] as const,
  },

  // Session queries
  sessions: {
    all: ['sessions'] as const,
    lists: () => [...queryKeys.sessions.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => 
      [...queryKeys.sessions.lists(), filters] as const,
    details: () => [...queryKeys.sessions.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.sessions.details(), id] as const,
    messages: (sessionId: string) => 
      [...queryKeys.sessions.detail(sessionId), 'messages'] as const,
    recent: (limit?: number) => 
      [...queryKeys.sessions.lists(), 'recent', limit] as const,
  },
  
  // Dashboard queries
  dashboard: {
    all: ['dashboard'] as const,
    stats: () => [...queryKeys.dashboard.all, 'stats'] as const,
    recent: () => [...queryKeys.dashboard.all, 'recent'] as const,
  },
  
  // Schema queries
  schema: {
    all: ['schema'] as const,
    byType: (type: string, mode: string) => 
      [...queryKeys.schema.all, type, mode] as const,
  },
} as const

// ============================================================================
// Cache Management
// ============================================================================

/**
 * Invalidate all agent-related queries
 */
export function invalidateAgents(): Promise<void> {
  return queryClient.invalidateQueries({ queryKey: queryKeys.agents.all })
}

/**
 * Invalidate all session-related queries
 */
export function invalidateSessions(): Promise<void> {
  return queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all })
}

/**
 * Invalidate dashboard queries
 */
export function invalidateDashboard(): Promise<void> {
  return queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
}

/**
 * Invalidate specific agent
 */
export function invalidateAgent(agentId: string): Promise<void> {
  return queryClient.invalidateQueries({ 
    queryKey: queryKeys.agents.detail(agentId) 
  })
}

/**
 * Invalidate specific session
 */
export function invalidateSession(sessionId: string): Promise<void> {
  return queryClient.invalidateQueries({ 
    queryKey: queryKeys.sessions.detail(sessionId) 
  })
}

/**
 * Update agent in cache
 */
export function updateAgentCache(agentId: string, updater: (old: any) => any): void {
  queryClient.setQueryData(queryKeys.agents.detail(agentId), updater)
  
  // Also update in lists
  queryClient.setQueriesData(
    { queryKey: queryKeys.agents.lists() },
    (old: any) => {
      if (!old?.items) return old
      return {
        ...old,
        items: old.items.map((agent: any) => 
          agent.id === agentId ? updater(agent) : agent
        )
      }
    }
  )
}

/**
 * Update session in cache
 */
export function updateSessionCache(sessionId: string, updater: (old: any) => any): void {
  queryClient.setQueryData(queryKeys.sessions.detail(sessionId), updater)
  
  // Also update in lists
  queryClient.setQueriesData(
    { queryKey: queryKeys.sessions.lists() },
    (old: any) => {
      if (!old?.items) return old
      return {
        ...old,
        items: old.items.map((session: any) => 
          session.id === sessionId ? updater(session) : session
        )
      }
    }
  )
}

// ============================================================================
// Prefetching Utilities
// ============================================================================

/**
 * Prefetch agent details
 */
export function prefetchAgent(agentId: string): Promise<void> {
  return queryClient.prefetchQuery({
    queryKey: queryKeys.agents.detail(agentId),
    queryFn: () => import('@/lib/api/services').then(m => m.getAgent(agentId)),
    staleTime: 2 * 60 * 1000, // 2 minutes for prefetch
  })
}

/**
 * Prefetch session details
 */
export function prefetchSession(sessionId: string): Promise<void> {
  return queryClient.prefetchQuery({
    queryKey: queryKeys.sessions.detail(sessionId),
    queryFn: () => import('@/lib/api/services').then(m => m.getSession(sessionId)),
    staleTime: 2 * 60 * 1000, // 2 minutes for prefetch
  })
}

// ============================================================================
// Development Utilities
// ============================================================================

/**
 * Clear all caches (development only)
 */
export function clearAllCaches(): void {
  if (DEV_CONFIG.debug) {
    queryClient.clear()
    console.log('All React Query caches cleared')
  }
}

/**
 * Log cache contents (development only)
 */
export function logCacheContents(): void {
  if (DEV_CONFIG.debug) {
    const cache = queryClient.getQueryCache()
    console.log('React Query Cache:', {
      queries: cache.getAll().map(query => ({
        queryKey: query.queryKey,
        state: query.state,
        dataUpdatedAt: query.state.dataUpdatedAt,
      }))
    })
  }
}

// ============================================================================
// Error Handling Setup
// ============================================================================

/**
 * Set up global error handling for queries and mutations
 */
export function setupErrorHandling(): void {
  // Query error handler
  queryClient.getQueryCache().subscribe((event) => {
    if (event.type === 'updated' && event.query.state.status === 'error') {
      const error = event.query.state.error
      if (DEV_CONFIG.debug) {
        console.error('Query error:', {
          queryKey: event.query.queryKey,
          error,
        })
      }
      
      // TODO: Send to error tracking service
    }
  })
  
  // Mutation error handler
  queryClient.getMutationCache().subscribe((event) => {
    if (event.type === 'updated' && event.mutation.state.status === 'error') {
      const error = event.mutation.state.error
      if (DEV_CONFIG.debug) {
        console.error('Mutation error:', {
          mutationKey: event.mutation.options.mutationKey,
          error,
        })
      }
      
      // TODO: Send to error tracking service
    }
  })
}