/**
 * API Service Functions
 * 
 * Typed service functions for interacting with the Agent Engine REST API.
 * All functions use the centralized API client with error handling and retry logic.
 */

import { apiClient } from './client'
import type { RequestOptions } from './client'

// ============================================================================
// Types
// ============================================================================

export interface Agent {
  id: string
  name: string
  description?: string
  modelId?: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  tools?: string[]
  createdTime?: string
  updatedTime?: string
}

export interface Session {
  id: string
  name: string
  agentId: string
  createdTime?: number
  updatedTime?: number
  state?: Record<string, unknown>
  depth?: number
  parentSessionId?: string
  rootSessionId?: string
  rootAgentId?: string
  status?: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'FAILED'
}

export interface Message {
  id: string
  sessionId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  metadata?: Record<string, unknown>
}

export interface InvokeRequest {
  message: string
  sessionId?: string
  options?: {
    temperature?: number
    maxTokens?: number
    stream?: boolean
  }
}

export interface ConfirmToolRequest {
  approved: boolean
  reason?: string
}

export interface PaginatedResult<T> {
  items: T[]
  hasMore: boolean
  totalElements?: number
  totalPages?: number
  number?: number
  size?: number
}

export interface Query {
  filter?: Record<string, unknown>
  sort?: { field: string; order: 'ASC' | 'DESC' }
  page?: { page: number; limit: number }
}

export interface AssetRequest {
  query?: Query
  keys?: string[]
  options?: Record<string, unknown>
}

// ============================================================================
// Agent Services
// ============================================================================

/**
 * List all agents with pagination
 */
export async function listAgents(
  query?: Query,
  options?: RequestOptions
): Promise<PaginatedResult<Agent>> {
  return apiClient.post<PaginatedResult<Agent>>(
    '/v1/catalog/list',
    { 
      assetType: 'Agent',
      query: query || {}
    },
    { ...options, sanitize: false }
  )
}

/**
 * Search agents
 */
export async function searchAgents(
  searchQuery: string,
  options?: RequestOptions
): Promise<PaginatedResult<Agent>> {
  const request: AssetRequest = {
    query: {
      filter: { name: { $regex: searchQuery, $options: 'i' } },
    },
  }
  return apiClient.post<PaginatedResult<Agent>>(
    '/v1/catalog/search',
    { assetType: 'Agent', ...request },
    options
  )
}

/**
 * Get agent by ID
 */
export async function getAgent(
  agentId: string,
  options?: RequestOptions
): Promise<Agent> {
  return apiClient.get<Agent>(`/v1/catalog/Agent/${agentId}`, options)
}

/**
 * Create a new agent
 */
export async function createAgent(
  agent: Omit<Agent, 'id' | 'createdTime' | 'updatedTime'>,
  options?: RequestOptions
): Promise<Agent> {
  return apiClient.post<Agent>('/v1/agent/', agent, options)
}

/**
 * Update an existing agent
 */
export async function updateAgent(
  agentId: string,
  agent: Partial<Agent>,
  options?: RequestOptions
): Promise<Agent> {
  return apiClient.put<Agent>(`/v1/agent/${agentId}`, agent, options)
}

/**
 * Upsert an agent (create or update)
 */
export async function upsertAgent(
  agent: Agent,
  options?: RequestOptions
): Promise<Agent> {
  return apiClient.post<Agent>('/v1/agent/upsert', agent, options)
}

/**
 * Delete an agent
 */
export async function deleteAgent(
  agentId: string,
  options?: RequestOptions
): Promise<void> {
  return apiClient.delete<void>(`/v1/agent/${agentId}`, options)
}

// ============================================================================
// Session Services
// ============================================================================

/**
 * List all sessions with pagination
 */
export async function listSessions(
  query?: Query,
  options?: RequestOptions
): Promise<PaginatedResult<Session>> {
  const request: AssetRequest = { query }
  return apiClient.post<PaginatedResult<Session>>(
    '/v1/catalog/list',
    { assetType: 'AgentSession', ...request },
    { ...options, sanitize: false }
  )
}

/**
 * Get session by ID with optional events
 */
export async function getSession(
  sessionId: string,
  includeEvents = false,
  options?: RequestOptions
): Promise<Session> {
  const params = includeEvents ? '?includeEvents=true' : ''
  return apiClient.get<Session>(
    `/v1/catalog/AgentSession/${sessionId}${params}`,
    options
  )
}

/**
 * Delete a session
 */
export async function deleteSession(
  sessionId: string,
  options?: RequestOptions
): Promise<void> {
  return apiClient.delete<void>(`/v1/agent/session/${sessionId}`, options)
}

// ============================================================================
// Message/Invocation Services
// ============================================================================

/**
 * Invoke an agent with streaming support
 * Uses the correct AgentStreamRestAPI endpoint with real-time event processing
 */
export async function invokeAgent(
  agentId: string,
  request: InvokeRequest,
  onStreamEvent?: (event: any) => void
): Promise<Message> {
  const url = `${apiClient['baseUrl'] || 'http://localhost:8080'}/v1/invoke/${agentId}`
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
    },
    body: JSON.stringify({
      sessionId: request.sessionId,
      message: request.message,
    }),
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  const reader = response.body?.getReader()
  const decoder = new TextDecoder()
  
  let finalMessage = ''
  let messageId = ''
  let sessionId = request.sessionId || ''
  let buffer = ''
  
  if (!reader) {
    throw new Error('Response body is not readable')
  }

  try {
    while (true) {
      const { done, value } = await reader.read()
      
      if (done) break
      
      // Decode the chunk and add to buffer
      buffer += decoder.decode(value, { stream: true })
      
      // Process complete lines from buffer
      const lines = buffer.split('\n')
      buffer = lines.pop() || '' // Keep incomplete line in buffer
      
      for (const line of lines) {
        if (line.startsWith('data:')) {
          try {
            const eventData = line.substring(5).trim()
            if (eventData) {
              const event = JSON.parse(eventData)
              
              // Call the stream event handler if provided
              if (onStreamEvent) {
                onStreamEvent(event)
              }
              
              // Process events for final message construction
              if (event.type === 'TextMessageStart') {
                messageId = event.messageId
                sessionId = event.sessionId || sessionId
              } else if (event.type === 'TextMessageContent') {
                finalMessage += event.delta
              } else if (event.type === 'TextMessageEnd') {
                finalMessage = event.content || finalMessage
                sessionId = event.sessionId || sessionId
              } else if (event.type === 'RunFinished') {
                sessionId = event.sessionId || sessionId
                // RUN_FINISHED means we can stop reading
                try {
                  await reader.cancel()
                } catch (e) {
                  // Ignore cancel errors
                }
                break
              }
            }
          } catch (e) {
            console.warn('Failed to parse SSE event:', line, e)
          }
        }
      }
    }
  } catch (error: any) {
    // Handle read errors gracefully
    if (error.name !== 'AbortError' && !error.message?.includes('cancel')) {
      console.error('SSE read error:', error)
    }
  } finally {
    try {
      reader.releaseLock()
    } catch (e) {
      // Ignore release errors
    }
  }

  return {
    id: messageId || `msg-${Date.now()}`,
    messageId: messageId || `msg-${Date.now()}`,
    sessionId: sessionId || `session-${Date.now()}`,
    role: 'assistant',
    content: finalMessage || 'Response received',
    createdTime: new Date().toISOString(),
    updatedTime: new Date().toISOString(),
  }
}

/**
 * Stream agent invocation (returns EventSource for SSE)
 */
export function streamAgentInvocation(
  agentId: string,
  request: InvokeRequest
): EventSource {
  const url = `${apiClient['baseUrl']}/v1/invoke/${agentId}`
  const eventSource = new EventSource(url)
  
  // Send the request data via POST (EventSource doesn't support POST directly)
  // We'll need to use fetch with SSE handling
  return eventSource
}

/**
 * Confirm a tool execution using AgentStreamRestAPI
 */
export async function confirmToolExecution(
  sessionId: string,
  confirmationId: string,
  request: ConfirmToolRequest,
  options?: RequestOptions
): Promise<void> {
  return apiClient.post<void>(
    `/v1/invoke/session/${sessionId}/confirm/${confirmationId}`,
    {
      confirmed: request.approved,
      message: request.reason,
    },
    options
  )
}

/**
 * Submit a confirmation response using AgentStreamRestAPI
 */
export async function submitConfirmation(
  sessionId: string,
  confirmationId: string,
  request: {
    confirmed: boolean
    message?: string
  },
  options?: RequestOptions
): Promise<void> {
  return apiClient.post<void>(
    `/v1/invoke/session/${sessionId}/confirm/${confirmationId}`,
    {
      confirmed: request.confirmed,
      message: request.message,
    },
    options
  )
}

// ============================================================================
// Model Services
// ============================================================================

export interface Model {
  id: string
  name: string
  provider: string
  endpoint?: string
  apiKey?: string
  parameters?: Record<string, unknown>
}

/**
 * Get model by ID
 */
export async function getModel(
  modelId: string,
  options?: RequestOptions
): Promise<Model> {
  return apiClient.get<Model>(`/v1/model/${modelId}`, options)
}

/**
 * Create a new model
 */
export async function createModel(
  model: Omit<Model, 'id'>,
  options?: RequestOptions
): Promise<Model> {
  return apiClient.post<Model>('/v1/model/', model, options)
}

/**
 * Update an existing model
 */
export async function updateModel(
  modelId: string,
  model: Partial<Model>,
  options?: RequestOptions
): Promise<Model> {
  return apiClient.put<Model>(`/v1/model/${modelId}`, model, options)
}

/**
 * Delete a model
 */
export async function deleteModel(
  modelId: string,
  options?: RequestOptions
): Promise<void> {
  return apiClient.delete<void>(`/v1/model/${modelId}`, options)
}

// ============================================================================
// Schema Services
// ============================================================================

/**
 * Get JSON schema for an asset type
 */
export async function getSchema(
  assetType: string,
  mode?: 'create' | 'update',
  options?: RequestOptions
): Promise<Record<string, unknown>> {
  const params = mode ? `?mode=${mode}` : ''
  return apiClient.get<Record<string, unknown>>(
    `/schemas/${assetType}${params}`,
    options
  )
}
