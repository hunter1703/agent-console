/**
 * Schema API client
 * 
 * Fetches JSON Schema + UI Layout from backend
 * API: GET /schemas/{assetType}?mode={mode}
 */

import { useState, useEffect } from 'react'
import type { BuilderDefinition, AssetType, BuilderMode } from '@/lib/types/schema'

/**
 * Base API URL
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

/**
 * Schema cache to avoid redundant fetches
 */
const schemaCache = new Map<string, BuilderDefinition>()

/**
 * Generate cache key for schema
 */
function getCacheKey(assetType: AssetType, mode: BuilderMode): string {
  return `${assetType}:${mode}`
}

/**
 * Fetch schema from backend
 * 
 * @param assetType - Asset type (e.g., "Agent", "Model")
 * @param mode - Builder mode (CREATE, EDIT, VIEW)
 * @returns Promise resolving to BuilderDefinition
 * 
 * @throws Error if fetch fails
 * 
 * @example
 * const schema = await fetchSchema('Agent', 'CREATE')
 */
export async function fetchSchema(
  assetType: AssetType,
  mode: BuilderMode
): Promise<BuilderDefinition> {
  // Check cache first
  const cacheKey = getCacheKey(assetType, mode)
  const cached = schemaCache.get(cacheKey)
  
  if (cached) {
    return cached
  }
  
  // Fetch from API
  const url = `${API_BASE_URL}/v1/schemas/${assetType}?mode=${mode}`
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch schema: ${response.status} ${response.statusText}`)
    }
    
    const data: BuilderDefinition = await response.json()
    
    // Validate response structure
    if (!data.schema || !data.layout) {
      throw new Error('Invalid schema response: missing schema or layout')
    }
    
    // Cache the result
    schemaCache.set(cacheKey, data)
    
    return data
  } catch (error) {
    console.error('Error fetching schema:', error, { assetType, mode })
    throw error
  }
}

/**
 * Clear schema cache
 * 
 * Useful for testing or when schemas change
 */
export function clearSchemaCache(): void {
  schemaCache.clear()
}

/**
 * Clear specific schema from cache
 * 
 * @param assetType - Asset type
 * @param mode - Builder mode
 */
export function clearSchema(assetType: AssetType, mode: BuilderMode): void {
  const cacheKey = getCacheKey(assetType, mode)
  schemaCache.delete(cacheKey)
}

/**
 * Hook result for useSchema
 */
export interface UseSchemaResult {
  schema: BuilderDefinition | null
  layout: BuilderDefinition['layout'] | null
  loading: boolean
  error: Error | null
  refetch: () => void
}

/**
 * React hook to fetch schema
 * 
 * Handles loading state, errors, and caching
 * 
 * @param assetType - Asset type (e.g., "Agent", "Model")
 * @param mode - Builder mode (CREATE, EDIT, VIEW)
 * @returns Hook result with schema, loading, error, and refetch
 * 
 * @example
 * function AgentForm() {
 *   const { schema, layout, loading, error } = useSchema('Agent', 'CREATE')
 *   
 *   if (loading) return <div>Loading...</div>
 *   if (error) return <div>Error: {error.message}</div>
 *   
 *   return <DynamicForm schema={schema} layout={layout} />
 * }
 */
export function useSchema(
  assetType: AssetType,
  mode: BuilderMode
): UseSchemaResult {
  const [schema, setSchema] = useState<BuilderDefinition | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [refetchTrigger, setRefetchTrigger] = useState(0)
  
  useEffect(() => {
    let cancelled = false
    
    async function load() {
      setLoading(true)
      setError(null)
      
      try {
        const data = await fetchSchema(assetType, mode)
        
        if (!cancelled) {
          setSchema(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }
    
    load()
    
    return () => {
      cancelled = true
    }
  }, [assetType, mode, refetchTrigger])
  
  const refetch = () => {
    // Clear cache and trigger refetch
    clearSchema(assetType, mode)
    setRefetchTrigger(prev => prev + 1)
  }
  
  return {
    schema,
    layout: schema?.layout || null,
    loading,
    error,
    refetch,
  }
}
