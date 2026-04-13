/**
 * SSE Connection Management
 * 
 * Handles EventSource connections to Agent Engine SSE streams with
 * automatic reconnection, error handling, and connection status tracking.
 */

import React from 'react'
import { getApiUrl } from '@/lib/config/env'

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error'

export interface SSEConnectionOptions {
  agentId: string
  sessionId?: string
  message: string
  onMessage: (event: MessageEvent) => void
  onStatusChange: (status: ConnectionStatus) => void
  maxReconnectAttempts?: number
  reconnectDelay?: number
}

export class SSEConnection {
  private eventSource: EventSource | null = null
  private status: ConnectionStatus = 'disconnected'
  private reconnectAttempts = 0
  private reconnectTimer: NodeJS.Timeout | null = null
  private isDestroyed = false

  constructor(private options: SSEConnectionOptions) {
    this.maxReconnectAttempts = options.maxReconnectAttempts || 5
    this.reconnectDelay = options.reconnectDelay || 1000
  }

  private maxReconnectAttempts: number
  private reconnectDelay: number

  connect(): void {
    if (this.isDestroyed) return

    this.setStatus('connecting')
    
    const url = getApiUrl(`/v1/invoke/${this.options.agentId}`)
    
    try {
      // For SSE with POST data, we need to use fetch with EventSource-like handling
      this.connectWithFetch(url)
      
    } catch (error) {
      console.error('Failed to create SSE connection:', error)
      this.handleError()
    }
  }

  private async connectWithFetch(url: string): Promise<void> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({
          sessionId: this.options.sessionId,
          message: this.options.message,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      if (!response.body) {
        throw new Error('Response body is not readable')
      }

      this.setStatus('connected')
      this.reconnectAttempts = 0

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      const processStream = async () => {
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
                    // Create a MessageEvent-like object
                    const event = new MessageEvent('message', {
                      data: eventData
                    })
                    this.options.onMessage(event)
                  }
                } catch (e) {
                  console.warn('Failed to parse SSE data:', line)
                }
              }
            }
          }
        } catch (error) {
          if (!this.isDestroyed) {
            console.error('SSE stream error:', error)
            this.handleError()
          }
        } finally {
          try {
            reader.releaseLock()
          } catch (e) {
            // Ignore release errors
          }
        }
      }

      processStream()
      
    } catch (error) {
      console.error('Failed to connect SSE:', error)
      this.handleError()
    }
  }

  private handleError(): void {
    this.setStatus('error')
    this.closeConnection()
    
    if (this.reconnectAttempts < this.maxReconnectAttempts && !this.isDestroyed) {
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts)
      
      this.reconnectTimer = setTimeout(() => {
        this.reconnectAttempts++
        this.connect()
      }, delay)
    }
  }

  private setStatus(status: ConnectionStatus): void {
    if (this.status !== status) {
      this.status = status
      this.options.onStatusChange(status)
    }
  }

  private closeConnection(): void {
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }
  }

  disconnect(): void {
    this.isDestroyed = true
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    
    this.closeConnection()
    this.setStatus('disconnected')
  }

  getStatus(): ConnectionStatus {
    return this.status
  }

  retry(): void {
    if (this.status === 'error' || this.status === 'disconnected') {
      this.reconnectAttempts = 0
      this.connect()
    }
  }
}

/**
 * Hook for managing SSE connections
 */
export function useSSEConnection(options: SSEConnectionOptions) {
  const connectionRef = React.useRef<SSEConnection | null>(null)
  
  React.useEffect(() => {
    if (options.agentId && options.message) {
      connectionRef.current = new SSEConnection(options)
      connectionRef.current.connect()
      
      return () => {
        connectionRef.current?.disconnect()
        connectionRef.current = null
      }
    }
  }, [options.agentId, options.sessionId, options.message])
  
  const retry = React.useCallback(() => {
    connectionRef.current?.retry()
  }, [])
  
  return { retry }
}