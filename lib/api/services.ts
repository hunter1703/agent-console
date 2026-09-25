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
  displayName?: string
  avatar?: string
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
  status: 'sending' | 'sent' | 'streaming' | 'complete' | 'error'
  timestamp: string
  metadata?: Record<string, unknown>
}

export interface InvokeRequest {
  /**
   * The conversation thread ID. Pass the existing backend session ID when
   * continuing a session. Omit (or leave undefined) for the first message —
   * the backend will create the session and return its ID via the RUN_STARTED
   * event's threadId field.
   */
  threadId?: string;
  /**
   * File attachments previously uploaded via POST /v1/storage/upload.
   * Each is sent as a Context entry so the backend can resolve them separately
   * from the text message.
   */
  files?: FileDetails[];
  /**
   * The user's text message. May be empty when the user sends files only.
   */
  text?: string;
  options?: {
    temperature?: number
    maxTokens?: number
    stream?: boolean
  }
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
    options
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
// Schedule Services
// ============================================================================

export interface ScheduleAgentRequest {
  cron: string
  message: string
  singletonSession: boolean
}

export interface JobDefinition {
  id: string
  jobClassName: string
  jobTags?: string[]
  cronSchedule: string
  payload: {
    agentId: string
    message: string
    singletonSession: boolean
    sessionId?: string
  }
  createdTime?: number
  updatedTime?: number
}

/**
 * Schedule a recurring invocation of an agent
 */
export async function scheduleAgent(
  agentId: string,
  request: ScheduleAgentRequest,
  options?: RequestOptions
): Promise<JobDefinition> {
  return apiClient.post<JobDefinition>(`/v1/agent/${agentId}/schedule`, request, options)
}

/**
 * List scheduled jobs for an agent, via the generic resource catalog. The backend scopes the
 * "InvokeAgentJob" asset type to that job class server-side, so no client-side job-type filter
 * is needed (or possible) here.
 */
export async function listAgentSchedules(
  agentId: string,
  options?: RequestOptions
): Promise<JobDefinition[]> {
  const result = await apiClient.post<PaginatedResult<JobDefinition>>(
    '/v1/catalog/search',
    {
      assetType: 'InvokeAgentJob',
      query: {
        filter: { field: 'payload.agentId', op: 'EQ', values: [agentId] },
      },
    },
    options
  )
  return result.items
}

/**
 * Cancel a scheduled job
 */
export async function cancelAgentSchedule(
  jobId: string,
  options?: RequestOptions
): Promise<void> {
  return apiClient.delete<void>(`/v1/agent/schedule/${jobId}`, options)
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
    options
  )
}

/**
 * Get session by ID
 */
export async function getSession(
  sessionId: string,
  options?: RequestOptions
): Promise<Session> {
  return apiClient.get<Session>(
    `/v1/catalog/AgentSession/${sessionId}`,
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
  return apiClient.delete<void>(`/v1/session/${sessionId}`, options)
}

/**
 * Roll back a session to before the given run.
 * POST /v1/session/{sessionId}/rollback?runId={runId}
 */
export async function rollbackSession(
  sessionId: string,
  runId: string,
  options?: RequestOptions
): Promise<void> {
  return apiClient.post<void>(
    `/v1/session/${sessionId}/rollback?runId=${encodeURIComponent(runId)}`,
    undefined,
    options
  )
}

// ============================================================================
// Message/Invocation Services
// ============================================================================

export interface FileDetails {
  name: string
  source: string
  type: 'CLOUDSTORAGE' | 'UNKNOWN'
  mimeType: string
  size: number
}

/**
 * Uploads a file as a raw byte stream to cloud storage.
 * Returns the stored FileDetails (name, source, type, mimeType, size).
 *
 * Calls the backend directly rather than through /api/proxy: the proxy route buffers the
 * whole request body inside a Next.js serverless function, which hits Vercel's request-body
 * size limit for anything but small files.
 */
export async function uploadToStorage(file: File): Promise<FileDetails> {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'

  const response = await fetch(
    `${baseUrl}/v1/storage/upload?name=${encodeURIComponent(file.name)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
        'Content-Length': String(file.size),
      },
      body: file,
    }
  )

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Storage upload failed: HTTP ${response.status}${text ? ` — ${text}` : ''}`)
  }

  return response.json()
}

export interface InvokeStreamCallbacks {
  /** Called as soon as RUN_STARTED arrives — use this to migrate the temp session ID. */
  onSessionId: (sessionId: string) => void
  /** Called for every raw SSE event string in sequence. */
  onEvent: (rawData: string, sessionId: string) => void
  onError?: (error: Error) => void
}

/**
 * Invoke an agent and stream the resulting AG-UI events.
 *
 * POST /v1/agent/{agentId}/invoke returns an SSE stream directly (live-only).
 * The request body follows the AG-UI RunAgentInput spec:
 *   - threadId   = existing session ID, or a temporary client ID for new sessions
 *   - runId      = fresh UUID for this specific invocation
 *   - messages   = [{ id, role: "user", content: text }] when text is provided
 *   - context    = [{ description, value: JSON(FileDetails) }] per file attachment
 *
 * The real sessionId is extracted from the first RUN_STARTED event's threadId
 * and delivered via onSessionId before any onEvent calls are made, so callers
 * can migrate temp sessions before processing events.
 */
export async function invokeAgentStream(
  agentId: string,
  request: InvokeRequest,
  callbacks: InvokeStreamCallbacks,
  signal?: AbortSignal
): Promise<void> {
  const { createAGUIStream } = await import('@/lib/sse/streaming')
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

  // Build messages[] — only include a UserMessage when there is text.
  const messages: Array<{ id: string; role: 'user'; content: string }> = []
  if (request.text?.trim()) {
    messages.push({
      id: crypto.randomUUID(),
      role: 'user',
      content: request.text.trim(),
    })
  }

  // Build context[] — one entry per file attachment.
  const context: Array<{ description: string; value: string }> =
    (request.files ?? []).map((fd) => ({
      description: fd.name,
      value: JSON.stringify(fd),
    }))

  const body: Record<string, unknown> = {
    messages,
    context,
  }
  if (request.threadId) body.threadId = request.threadId

  try {
    const response = await fetch(`${baseUrl}/v1/agent/${agentId}/invoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    })

    if (!response.ok || !response.body) {
      const text = await response.text().catch(() => '')
      throw new Error(`Invoke failed: HTTP ${response.status}${text ? ` — ${text}` : ''}`)
    }

    const stream = await createAGUIStream(response.body)
    let resolvedSessionId: string | null = null

    for await (const update of stream) {
      if (update.done) break
      if (update.error) {
        callbacks.onError?.(new Error(update.error))
        break
      }

      const event = update.event
      if (!event) continue

      // Extract session ID from the first RUN_STARTED event before forwarding it.
      if (event.type === 'RUN_STARTED' && event.threadId && !resolvedSessionId) {
        resolvedSessionId = event.threadId as string
        callbacks.onSessionId(resolvedSessionId)
      }

      const sid = resolvedSessionId ?? (request.threadId ?? '')
      callbacks.onEvent(JSON.stringify(event), sid)
    }
  } catch (err) {
    // A deliberate cancellation (caller aborted `signal`, e.g. navigating away or starting a
    // new chat mid-send) surfaces here as an AbortError from either `fetch` itself or the
    // stream reader it feeds. That's an intentional stop, not a failure — swallow it instead
    // of routing it through onError, which would otherwise add a spurious "❌ Error" message
    // to a session the caller has already abandoned.
    if (signal?.aborted) return
    throw err
  }
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
 * Get agent name by ID (cached lookup)
 * Uses the catalog list API to fetch agent details
 */
const agentNameCache = new Map<string, string>()

/**
 * Generate a human-readable name from an agent ID
 * Converts snake_case to Title Case
 */
function generateFallbackAgentName(agentId: string): string {
  return agentId
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export async function getAgentName(agentId: string): Promise<string> {
  // Check cache first
  if (agentNameCache.has(agentId)) {
    return agentNameCache.get(agentId)!
  }
  
  try {
    // Use the catalog API to get the agent by ID
    const agent = await getAgent(agentId)
    
    // If API returns a valid name (not "Unknown Agent"), use it
    if (agent?.name && agent.name !== 'Unknown Agent') {
      agentNameCache.set(agentId, agent.name)
      return agent.name
    }
    
    // Otherwise, generate a human-readable fallback from the agent ID
    const fallbackName = generateFallbackAgentName(agentId)
    agentNameCache.set(agentId, fallbackName)
    return fallbackName
  } catch (error) {
    console.warn(`Failed to lookup agent name for ${agentId}:`, error)
    // Generate human-readable fallback name from agent ID
    const fallbackName = generateFallbackAgentName(agentId)
    agentNameCache.set(agentId, fallbackName)
    return fallbackName
  }
}

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