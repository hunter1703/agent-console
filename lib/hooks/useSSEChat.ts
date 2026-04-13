/**
 * SSE Chat Hook
 * 
 * Manages SSE connection for chat sessions with automatic reconnection
 * and integration with the chat store.
 */

import { useEffect, useRef, useState } from 'react'
import { SSEConnection, ConnectionStatus } from '@/lib/sse/connection'
import { getAGUIEventHandler } from '@/lib/sse/handler'
import { useChatStore } from '@/lib/store/chat'
import { useToasts } from '@/lib/store/ui'

export interface UseSSEChatOptions {
  sessionId?: string
  enabled?: boolean
}

export function useSSEChat({ sessionId, enabled = true }: UseSSEChatOptions) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')
  const connectionRef = useRef<SSEConnection | null>(null)
  const { error, info } = useToasts()
  const updateSession = useChatStore(state => state.updateSession)

  // Handle connection status changes
  const handleStatusChange = (status: ConnectionStatus) => {
    setConnectionStatus(status)
    
    if (sessionId) {
      updateSession(sessionId, { connectionStatus: status })
    }

    // Show user-friendly notifications
    switch (status) {
      case 'connected':
        if (connectionRef.current && connectionRef.current.getStatus() === 'connected') {
          info('Connected', 'Real-time updates are now active')
        }
        break
      case 'error':
        error('Connection Error', 'Lost connection to chat server. Attempting to reconnect...')
        break
      case 'disconnected':
        // Don't show notification for normal disconnection
        break
    }
  }

  // Handle incoming messages
  const handleMessage = (event: MessageEvent) => {
    getAGUIEventHandler().handleSSEMessage(event)
  }

  // Connect when sessionId is available
  useEffect(() => {
    if (!sessionId || !enabled) {
      return
    }

    const connection = new SSEConnection({
      sessionId,
      onMessage: handleMessage,
      onStatusChange: handleStatusChange,
      maxReconnectAttempts: 5,
      reconnectDelay: 1000,
    })

    connectionRef.current = connection
    connection.connect()

    return () => {
      connection.disconnect()
      connectionRef.current = null
    }
  }, [sessionId, enabled])

  // Manual retry function
  const retry = () => {
    connectionRef.current?.retry()
  }

  return {
    connectionStatus,
    retry,
    isConnected: connectionStatus === 'connected',
    isConnecting: connectionStatus === 'connecting',
    hasError: connectionStatus === 'error',
  }
}