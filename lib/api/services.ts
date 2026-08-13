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
 * Get session messages from session events
 * Converts session events to displayable messages
 */
export async function getSessionMessages(
  sessionId: string,
  options?: RequestOptions
): Promise<Message[]> {
  try {
    // Get session with events
    const session = await getSession(sessionId, true, options)
    
    // Check for aguiEvents (new format) or events (legacy format)
    const events = (session as any).aguiEvents || session.events
    if (!events || !Array.isArray(events)) {
      return []
    }
    
    const messages: Message[] = []
    const messageMap = new Map<string, Partial<Message>>()
    
    // Process events to reconstruct messages
    // Preserve the order from the backend - do NOT sort
    // Track the order in which TEXT_MESSAGE_END events appear
    const messageOrder: string[] = []
    
    for (const event of events) {
      const eventData = event.rawEvent || event.data || event
      const eventType = event.type || event.eventType
      
      switch (eventType) {
        case 'TEXT_MESSAGE_START':
          if (eventData.messageId) {
            messageMap.set(eventData.messageId, {
              id: eventData.messageId,
              sessionId: sessionId,
              role: eventData.role || 'assistant',
              content: '',
              status: 'streaming' as const,
              timestamp: new Date(event.timestamp || eventData.timestamp || Date.now()).toISOString(),
              // Store agentId in metadata for later resolution
              metadata: {
                agentId: eventData.agentId,
              }
            })
          }
          break
          
        case 'TEXT_MESSAGE_CHUNK':
        case 'TEXT_MESSAGE_CONTENT':  // Handle both CHUNK and CONTENT events
          if (eventData.messageId && messageMap.has(eventData.messageId)) {
            const message = messageMap.get(eventData.messageId)!
            message.content = (message.content || '') + (eventData.delta || '')
          }
          break
          
        case 'TEXT_MESSAGE_END':
          if (eventData.messageId && messageMap.has(eventData.messageId)) {
            const message = messageMap.get(eventData.messageId)!
            if (eventData.content) {
              message.content = eventData.content
            }
            message.status = 'complete'
            message.timestamp = new Date(event.timestamp || eventData.timestamp || Date.now()).toISOString()
            
            // Track the order in which messages complete
            messageOrder.push(eventData.messageId)
          }
          break
      }
    }
    
    // Build final messages array in the order TEXT_MESSAGE_END events appeared
    for (const messageId of messageOrder) {
      const message = messageMap.get(messageId)
      if (message && message.id && message.role && message.content !== undefined) {
        messages.push(message as Message)
      }
    }
    
    return messages
  } catch (error) {
    console.warn(`Failed to load session messages for ${sessionId}:`, error)
    return []
  }
}

/**
 * Tool call interface for reconstructed tool calls
 */
export interface ReconstructedToolCall {
  toolCallId: string
  toolName: string
  status: 'pending' | 'executing' | 'completed' | 'failed'
  arguments?: Record<string, unknown>
  result?: any
  startTime: string
  endTime?: string
  parentMessageId?: string
}

/**
 * Get session tool calls from session events
 * Reconstructs tool call state from historical events
 */
export async function getSessionToolCalls(
  sessionId: string,
  options?: RequestOptions
): Promise<ReconstructedToolCall[]> {
  try {
    // Get session with events
    const session = await getSession(sessionId, true, options)
    
    // Check for aguiEvents (new format) or events (legacy format)
    const events = (session as any).aguiEvents || session.events
    if (!events || !Array.isArray(events)) {
      return []
    }
    
    const toolCalls: ReconstructedToolCall[] = []
    const toolCallMap = new Map<string, Partial<ReconstructedToolCall>>()
    
    // Process events to reconstruct tool calls
    for (const event of events) {
      const eventData = event.rawEvent || event.data || event
      const eventType = event.type || event.eventType
      
      switch (eventType) {
        case 'TOOL_CALL_START':
        case 'ToolCallStart':
          if (eventData.toolCallId) {
            toolCallMap.set(eventData.toolCallId, {
              toolCallId: eventData.toolCallId,
              toolName: eventData.toolCallName || eventData.toolName || 'unknown',
              status: 'pending',
              arguments: {},
              startTime: new Date(event.timestamp || eventData.timestamp || Date.now()).toISOString(),
              parentMessageId: eventData.parentMessageId,
            })
          }
          break
          
        case 'TOOL_CALL_ARGS':
        case 'ToolCallArgs':
          if (eventData.toolCallId && toolCallMap.has(eventData.toolCallId)) {
            const toolCall = toolCallMap.get(eventData.toolCallId)!
            const currentArgsString = (toolCall.arguments as any)?.raw || ''
            const newArgsString = currentArgsString + (eventData.delta || '')
            
            try {
              // Try to parse accumulated arguments as JSON
              const parsedArgs = JSON.parse(newArgsString)
              toolCall.arguments = parsedArgs
              toolCall.status = 'executing'
            } catch {
              // If not valid JSON yet, keep accumulating
              toolCall.arguments = {
                ...(toolCall.arguments || {}),
                raw: newArgsString,
              }
              toolCall.status = 'executing'
            }
          }
          break
          
        case 'TOOL_CALL_END':
        case 'ToolCallEnd':
          if (eventData.toolCallId && toolCallMap.has(eventData.toolCallId)) {
            const toolCall = toolCallMap.get(eventData.toolCallId)!
            if (eventData.arguments) {
              try {
                const finalArgs = JSON.parse(eventData.arguments)
                toolCall.arguments = finalArgs
              } catch (error) {
                console.warn('Failed to parse final tool arguments:', error)
              }
            }
            toolCall.status = 'executing'
          }
          break
          
        case 'TOOL_CALL_RESULT':
        case 'ToolCallResult':
          if (eventData.toolCallId && toolCallMap.has(eventData.toolCallId)) {
            const toolCall = toolCallMap.get(eventData.toolCallId)!
            
            // Parse result content
            let resultContent = eventData.content
            if (typeof resultContent === 'string') {
              try {
                resultContent = JSON.parse(resultContent)
              } catch {
                // Keep as string if not JSON
              }
            }
            
            // Store the parsed result directly (not wrapped)
            // If there's an error, include it in the result
            if (eventData.error) {
              toolCall.result = { error: eventData.error }
            } else {
              toolCall.result = resultContent
            }
            
            toolCall.status = eventData.success === false ? 'failed' : 'completed'
            toolCall.endTime = new Date(event.timestamp || eventData.timestamp || Date.now()).toISOString()
            
            // Add completed tool call to results
            if (toolCall.toolCallId && toolCall.toolName && toolCall.startTime) {
              toolCalls.push(toolCall as ReconstructedToolCall)
            }
          }
          break
      }
    }
    
    // Sort tool calls by start time
    return toolCalls.sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    )
  } catch (error) {
    console.warn(`Failed to load session tool calls for ${sessionId}:`, error)
    return []
  }
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
 */
export async function uploadToStorage(file: File): Promise<FileDetails> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

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
  callbacks: InvokeStreamCallbacks
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

  const response = await fetch(`${baseUrl}/v1/agent/${agentId}/invoke`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
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
}

/**
 * Open a GET SSE stream for a session using native EventSource.
 * liveOnly=false (default): replays committed history + current turn events + live.
 * liveOnly=true: live events only (no history replay).
 */
export function openSessionStream(
  sessionId: string,
  onEvent: (event: MessageEvent) => void,
  onError?: (error: Event) => void,
  liveOnly = false
): EventSource {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
  const url = `${baseUrl}/v1/session/${sessionId}/stream${liveOnly ? '?liveOnly=true' : ''}`
  
  console.log('Opening EventSource to:', url)
  
  const eventSource = new EventSource(url, {
    withCredentials: false, // Don't send credentials for CORS
  })
  
  let eventCount = 0
  
  eventSource.onmessage = (event) => {
    eventCount++
    if (eventCount <= 5) {
      console.log(`SSE event #${eventCount}:`, event.data.substring(0, 100))
    }
    onEvent(event)
  }
  
  eventSource.onerror = (error) => {
    // EventSource fires onerror when connection closes, even for normal closures
    // This is expected behavior after the backend finishes streaming the response
    console.log('EventSource closed')
    console.log('EventSource readyState:', eventSource.readyState)
    console.log(`Received ${eventCount} events total`)
    
    // CRITICAL: Close the EventSource immediately to prevent browser auto-reconnect
    // The browser will try to reconnect automatically when the connection closes,
    // but we want to control when to reconnect (only after user sends a message)
    eventSource.close()
    
    if (onError) {
      onError(error)
    }
  }
  
  eventSource.onopen = () => {
    console.log('EventSource connection opened successfully')
  }
  
  return eventSource
}

/**
 * Confirm a tool execution.
 * POST /v1/session/{sessionId}/confirm — AG-UI Resume payload.
 */
export async function confirmToolExecution(
  sessionId: string,
  confirmationId: string,
  request: ConfirmToolRequest,
  options?: RequestOptions
): Promise<void> {
  return apiClient.post<void>(
    `/v1/session/${sessionId}/confirm`,
    {
      interruptId: confirmationId,
      status: 'resolved',
      payload: {
        confirmed: request.approved,
        answer: request.reason,
      },
    },
    options
  )
}

/**
 * Submit a confirmation response.
 * POST /v1/session/{sessionId}/confirm — AG-UI Resume payload.
 */
export async function submitConfirmation(
  sessionId: string,
  confirmationId: string,
  request: {
    confirmed: boolean
    answer?: string
  },
  options?: RequestOptions
): Promise<void> {
  return apiClient.post<void>(
    `/v1/session/${sessionId}/confirm`,
    {
      interruptId: confirmationId,
      status: 'resolved',
      payload: {
        confirmed: request.confirmed,
        answer: request.answer,
      },
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