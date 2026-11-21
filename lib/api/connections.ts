/**
 * Connection API Functions
 *
 * A connection holds what an agent needs to reach an external app, such as an MCP server: the app,
 * the auth type and the app's inputs. Its form comes from the backend's schema for `Connection`.
 */

import { apiClient } from './client'
import type { RequestOptions } from './client'
import type { PaginatedResult, Query } from './services'

export interface Connection {
  id?: string
  version?: number
  name: string
  appName: string
  authType: string
  inputs?: Record<string, any>
}

/**
 * List the connections the caller can read, through the generic resource catalog
 */
export async function listConnections(
  query?: Query,
  options?: RequestOptions
): Promise<PaginatedResult<Pick<Connection, 'id' | 'name'>>> {
  return apiClient.post<PaginatedResult<Pick<Connection, 'id' | 'name'>>>(
    '/v1/catalog/list',
    { assetType: 'Connection', query: query || {} },
    options
  )
}

/**
 * Get a single connection by ID
 */
export async function getConnection(id: string, options?: RequestOptions): Promise<Connection> {
  return apiClient.get<Connection>(`/v1/connection/${id}`, options)
}

/**
 * Create a connection, or update one that has an id
 */
export async function saveConnection(
  connection: Connection,
  options?: RequestOptions
): Promise<Connection> {
  return apiClient.post<Connection>('/v1/connection/', connection, options)
}

/**
 * Delete a connection
 */
export async function deleteConnection(id: string, options?: RequestOptions): Promise<void> {
  return apiClient.delete<void>(`/v1/connection/${id}`, options)
}

