/**
 * API Client
 * 
 * Base HTTP client for Agent Engine API.
 */

import {
  APIError,
  NetworkError,
  TimeoutError,
  ValidationError,
  UnauthorizedError,
  NotFoundError,
  ServerError,
  parseAPIError,
} from './errors'
import { env } from '@/lib/config/env'
import type {
  Agent,
  AgentRequest,
  AgentResponse,
  AgentListResponse,
} from '@/types/agent'
import type {
  Session,
  SessionRequest,
  SessionResponse,
  SessionListResponse,
} from '@/types/session'
import type {
  Message,
  MessageRequest,
  MessageResponse,
  SSEEvent,
} from '@/types/message'

export interface APIClientConfig {
  baseURL?: string
  timeout?: number
  headers?: Record<string, string>
}

export class APIClient {
  private baseURL: string
  private timeout: number
  private headers: Record<string, string>
  private abortControllers: Map<string, AbortController>

  constructor(config: APIClientConfig = {}) {
    this.baseURL = config.baseURL || env.apiBaseUrl
    this.timeout = config.timeout || env.apiTimeout
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...config.headers,
    }
    this.abortControllers = new Map()
  }

  /**
   * Make HTTP request
   */
  private async request<T>(
    method: string,
    path: string,
    options: {
      body?: any
      headers?: Record<string, string>
      timeout?: number
      signal?: AbortSignal
    } = {}
  ): Promise<T> {
    const url = `${this.baseURL}${path}`
    const timeout = options.timeout || this.timeout

    // Create abort controller for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    // Use provided signal or controller signal
    const signal = options.signal || controller.signal

    try {
      const response = await fetch(url, {
        method,
        headers: {
          ...this.headers,
          ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal,
      })

      clearTimeout(timeoutId)

      // Handle HTTP errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        switch (response.status) {
          case 400:
            throw new ValidationError(
              errorData.message || 'Invalid request',
              errorData.details
            )
          case 401:
            throw new UnauthorizedError(errorData.message)
          case 404:
            throw new NotFoundError(errorData.message)
          case 500:
          case 502:
          case 503:
            throw new ServerError(errorData.message)
          default:
            throw new APIError(
              errorData.message || 'Request failed',
              response.status,
              errorData.code,
              errorData.details
            )
        }
      }

      // Parse response
      const data = await response.json()
      return data as T
    } catch (error: any) {
      clearTimeout(timeoutId)
      throw parseAPIError(error)
    }
  }

  /**
   * Cancel a request by key
   */
  cancelRequest(key: string) {
    const controller = this.abortControllers.get(key)
    if (controller) {
      controller.abort()
      this.abortControllers.delete(key)
    }
  }

  /**
   * Cancel all requests
   */
  cancelAllRequests() {
    this.abortControllers.forEach((controller) => controller.abort())
    this.abortControllers.clear()
  }

  // ============================================================================
  // Agent API Methods
  // ============================================================================

  /**
   * List all agents using catalog API
   */
  async listAgents(): Promise<Agent[]> {
    const response = await this.request<any>('POST', '/v1/catalog/list', {
      body: {
        assetType: 'Agent',
        query: {},
        options: {}
      }
    })
    // The response is a PaginatedResult with items array
    return response?.items || response?.agents || []
  }

  /**
   * Get agent by ID using catalog API
   */
  async getAgent(id: string): Promise<Agent> {
    const response = await this.request<any>('GET', `/v1/catalog/Agent/${id}`)
    return response
  }

  /**
   * Create new agent
   */
  async createAgent(data: AgentRequest): Promise<Agent> {
    const response = await this.request<Agent>('POST', '/v1/agent/', {
      body: data,
    })
    return response
  }

  /**
   * Update agent
   */
  async updateAgent(id: string, data: Partial<AgentRequest>): Promise<Agent> {
    const response = await this.request<Agent>('PUT', `/v1/agent/${id}`, {
      body: { ...data, id },
    })
    return response
  }

  /**
   * Delete agent
   */
  async deleteAgent(id: string): Promise<void> {
    await this.request('DELETE', `/v1/agent/${id}`)
  }

  // ============================================================================
  // Session API Methods
  // ============================================================================

  /**
   * List all sessions using catalog API
   */
  async listSessions(): Promise<Session[]> {
    const response = await this.request<any>('POST', '/v1/catalog/list', {
      body: {
        assetType: 'AgentSession',
        query: {},
        options: {}
      }
    })
    // The response is a PaginatedResult with items array
    return response?.items || response?.sessions || []
  }

  /**
   * Get session by ID
   */
  async getSession(id: string): Promise<Session> {
    const response = await this.request<Session>('GET', `/v1/catalog/AgentSession/${id}`)
    return response
  }

  /**
   * Create new session
   */
  async createSession(data: SessionRequest): Promise<Session> {
    // Sessions are created implicitly when sending first message
    // For now, return a mock session
    throw new Error('Session creation not yet implemented in backend')
  }

  /**
   * Delete session
   */
  async deleteSession(id: string): Promise<void> {
    await this.request('DELETE', `/v1/agent/session/${id}`)
  }

  // ============================================================================
  // Message API Methods
  // ============================================================================

  /**
   * Send message and stream response with automatic reconnection
   */
  async sendMessage(
    sessionId: string,
    data: MessageRequest,
    onEvent: (event: SSEEvent) => void,
    onError?: (error: APIError) => void,
    options: {
      maxRetries?: number
      retryDelay?: number
      onReconnect?: () => void
    } = {}
  ): Promise<void> {
    const {
      maxRetries = 3,
      retryDelay = 1000,
      onReconnect,
    } = options

    let retryCount = 0
    let lastEventId: string | undefined

    const attemptConnection = async (): Promise<void> => {
      const url = `${this.baseURL}/v1/agent/session/${sessionId}/stream`
      const controller = new AbortController()
      const requestKey = `stream-${sessionId}`
      
      this.abortControllers.set(requestKey, controller)

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            ...this.headers,
            'Accept': 'text/event-stream',
            ...(lastEventId && { 'Last-Event-ID': lastEventId }),
          },
          body: JSON.stringify(data),
          signal: controller.signal,
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new APIError(
            errorData.message || 'Stream failed',
            response.status,
            errorData.code
          )
        }

        // Reset retry count on successful connection
        retryCount = 0

        // Read SSE stream
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()

        if (!reader) {
          throw new Error('Response body is not readable')
        }

        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              
              if (data === '[DONE]') {
                continue
              }

              try {
                const event = JSON.parse(data) as SSEEvent
                
                // Store event ID for reconnection
                if ('id' in event) {
                  lastEventId = (event as any).id
                }
                
                onEvent(event)
              } catch (error) {
                console.error('Failed to parse SSE event:', error)
              }
            }
          }
        }
      } catch (error: any) {
        // Don't retry if manually cancelled
        if (error.name === 'AbortError') {
          return
        }

        const apiError = parseAPIError(error)
        
        // Retry on network errors or 5xx status codes
        const shouldRetry = 
          (apiError instanceof NetworkError || 
           apiError instanceof ServerError ||
           apiError.statusCode === 429) &&
          retryCount < maxRetries

        if (shouldRetry) {
          retryCount++
          const delay = retryDelay * Math.pow(2, retryCount - 1) // Exponential backoff
          
          console.log(`Reconnecting in ${delay}ms (attempt ${retryCount}/${maxRetries})...`)
          
          await new Promise(resolve => setTimeout(resolve, delay))
          
          if (onReconnect) {
            onReconnect()
          }
          
          return attemptConnection()
        } else {
          if (onError) {
            onError(apiError)
          } else {
            throw apiError
          }
        }
      } finally {
        this.abortControllers.delete(requestKey)
      }
    }

    return attemptConnection()
  }

  /**
   * Cancel message stream
   */
  cancelMessageStream(sessionId: string) {
    this.cancelRequest(`stream-${sessionId}`)
  }
}

// Export singleton instance
export const apiClient = new APIClient()
