/**
 * Model API Functions
 * 
 * API functions for managing AI models using the catalog asset API.
 */

import { apiClient } from './client'
import type { RequestOptions } from './client'
import type { PaginatedResult, Query } from './services'

export interface Model {
  id: string
  name: string
  description?: string
  type?: string // Provider type (e.g., "open_ai_compatible")
  model?: string // Model identifier
  baseUrl?: string
  serverCommand?: string
  serverArgs?: string[]
  toolCallingEnabled?: boolean
  thoughtsEnabled?: boolean
  temperature?: number
  topK?: number
  topP?: number
  repeatPenalty?: number
  createdTime?: string
  updatedTime?: string
}

/**
 * List all models with pagination
 */
export async function listModels(
  query?: Query,
  options?: RequestOptions
): Promise<PaginatedResult<Model>> {
  return apiClient.post<PaginatedResult<Model>>(
    '/v1/catalog/list',
    {
      assetType: 'Model',
      query: query || {}
    },
    options
  )
}

/**
 * Get a single model by ID
 */
export async function getModel(
  id: string,
  options?: RequestOptions
): Promise<Model> {
  return apiClient.get<Model>(
    `/v1/model/${id}`,
    options
  )
}

/**
 * Create a new model
 */
export async function createModel(
  model: Omit<Model, 'id' | 'createdTime' | 'updatedTime'>,
  options?: RequestOptions
): Promise<Model> {
  return apiClient.post<Model>(
    '/v1/model/',
    model,
    options
  )
}

/**
 * Update an existing model
 */
export async function updateModel(
  id: string,
  updates: Partial<Model>,
  options?: RequestOptions
): Promise<Model> {
  return apiClient.put<Model>(
    `/v1/model/${id}`,
    updates,
    options
  )
}

/**
 * Delete a model
 */
export async function deleteModel(
  id: string,
  options?: RequestOptions
): Promise<void> {
  return apiClient.delete<void>(
    `/v1/model/${id}`,
    options
  )
}
