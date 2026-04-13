/**
 * Chat State Store
 * 
 * Zustand store for managing chat-specific state including active sessions,
 * messages, streaming state, and multi-agent session management.
 */

import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import { DEV_CONFIG } from '@/lib/config/env'
import type { Session, Message, ToolCall, Confirmation } from '@/lib/api/types'

// ============================================================================
// Types
// ============================================================================

export interface ChatSession extends Session {
  messages: Message[]
  isStreaming: boolean
  typingIndicator?: {
    visible: boolean
    agentName?: string
  }
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error'
  lastActivity: string
}

export interface ActiveToolCall {
  toolCallId: string
  toolName: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  arguments?: Record<string, unknown>
  result?: any
  startTime: string
  endTime?: string
  parentMessageId?: string
}

export interface ActiveConfirmation {
  confirmationId: string
  prompt: string
  kind: 'DECISION' | 'TEXT'
  options?: string[]
  originalToolCallId?: string
  timeout?: number
}

export interface StreamingMessage {
  messageId: string
  role: 'assistant' | 'user' | 'system'
  content: string
  isComplete: boolean
  toolCalls: ActiveToolCall[]
  reasoning?: {
    blockId: string
    thoughts: Array<{
      thoughtId: string
      content: string
      isComplete: boolean
    }>
    isComplete: boolean
  }[]
}

export interface ChatState {
  // Session management
  sessions: Record<string, ChatSession>
  activeSessionId: string | null
  sessionTabs: string[]
  
  // Message state
  streamingMessages: Record<string, StreamingMessage>
  activeToolCalls: Record<string, ActiveToolCall>
  activeConfirmations: Record<string, ActiveConfirmation>
  
  // UI state
  messageInput: string
  isInputDisabled: boolean
  scrollToBottom: boolean
  
  // SSE connection
  sseConnection: EventSource | null
  reconnectAttempts: number
  maxReconnectAttempts: number
  
  // Actions
  setActiveSession: (sessionId: string | null) => void
  addSession: (session: ChatSession) => void
  updateSession: (sessionId: string, updates: Partial<ChatSession>) => void
  removeSession: (sessionId: string) => void
  
  // Message actions
  addMessage: (sessionId: string, message: Message) => void
  updateMessage: (sessionId: string, messageId: string, updates: Partial<Message>) => void
  startStreamingMessage: (messageId: string, role: 'assistant' | 'user' | 'system') => void
  appendToStreamingMessage: (messageId: string, content: string) => void
  completeStreamingMessage: (messageId: string) => void
  
  // Tool call actions
  startToolCall: (toolCall: Omit<ActiveToolCall, 'startTime'>) => void
  updateToolCall: (toolCallId: string, updates: Partial<ActiveToolCall>) => void
  completeToolCall: (toolCallId: string, result: any) => void
  
  // Confirmation actions
  showConfirmation: (confirmation: ActiveConfirmation) => void
  hideConfirmation: (confirmationId: string) => void
  
  // Input actions
  setMessageInput: (input: string) => void
  setInputDisabled: (disabled: boolean) => void
  
  // SSE actions
  setSSEConnection: (connection: EventSource | null) => void
  incrementReconnectAttempts: () => void
  resetReconnectAttempts: () => void
  
  // Utility actions
  getActiveSession: () => ChatSession | null
  getSessionMessages: (sessionId: string) => Message[]
  clearSession: (sessionId: string) => void
  clearAllSessions: () => void
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useChatStore = create<ChatState>()(
  devtools(
    subscribeWithSelector(
      (set, get) => ({
        // Initial state
        sessions: {},
        activeSessionId: null,
        sessionTabs: [],
        streamingMessages: {},
        activeToolCalls: {},
        activeConfirmations: {},
        messageInput: '',
        isInputDisabled: false,
        scrollToBottom: false,
        sseConnection: null,
        reconnectAttempts: 0,
        maxReconnectAttempts: 5,
        
        // Session actions
        setActiveSession: (sessionId) => {
          set({ activeSessionId: sessionId })
        },
        
        addSession: (session) => {
          set((state) => ({
            sessions: {
              ...state.sessions,
              [session.sessionId]: session,
            },
            sessionTabs: state.sessionTabs.includes(session.sessionId)
              ? state.sessionTabs
              : [...state.sessionTabs, session.sessionId],
          }))
        },
        
        updateSession: (sessionId, updates) => {
          set((state) => ({
            sessions: {
              ...state.sessions,
              [sessionId]: state.sessions[sessionId]
                ? { ...state.sessions[sessionId], ...updates }
                : state.sessions[sessionId],
            },
          }))
        },
        
        removeSession: (sessionId) => {
          set((state) => {
            const { [sessionId]: removed, ...remainingSessions } = state.sessions
            return {
              sessions: remainingSessions,
              sessionTabs: state.sessionTabs.filter(id => id !== sessionId),
              activeSessionId: state.activeSessionId === sessionId 
                ? state.sessionTabs.find(id => id !== sessionId) || null
                : state.activeSessionId,
            }
          })
        },
        
        // Message actions
        addMessage: (sessionId, message) => {
          set((state) => {
            const session = state.sessions[sessionId]
            if (!session) return state
            
            return {
              sessions: {
                ...state.sessions,
                [sessionId]: {
                  ...session,
                  messages: [...session.messages, message],
                  lastActivity: new Date().toISOString(),
                },
              },
              scrollToBottom: true,
            }
          })
        },
        
        updateMessage: (sessionId, messageId, updates) => {
          set((state) => {
            const session = state.sessions[sessionId]
            if (!session) return state
            
            return {
              sessions: {
                ...state.sessions,
                [sessionId]: {
                  ...session,
                  messages: session.messages.map(msg =>
                    msg.messageId === messageId ? { ...msg, ...updates } : msg
                  ),
                },
              },
            }
          })
        },
        
        startStreamingMessage: (messageId, role) => {
          set((state) => ({
            streamingMessages: {
              ...state.streamingMessages,
              [messageId]: {
                messageId,
                role,
                content: '',
                isComplete: false,
                toolCalls: [],
              },
            },
          }))
        },
        
        appendToStreamingMessage: (messageId, content) => {
          set((state) => {
            const message = state.streamingMessages[messageId]
            if (!message) return state
            
            return {
              streamingMessages: {
                ...state.streamingMessages,
                [messageId]: {
                  ...message,
                  content: message.content + content,
                },
              },
            }
          })
        },
        
        completeStreamingMessage: (messageId) => {
          set((state) => {
            const message = state.streamingMessages[messageId]
            if (!message) return state
            
            const { [messageId]: completed, ...remainingMessages } = state.streamingMessages
            
            return {
              streamingMessages: remainingMessages,
              scrollToBottom: true,
            }
          })
        },
        
        // Tool call actions
        startToolCall: (toolCall) => {
          const toolCallWithTime: ActiveToolCall = {
            ...toolCall,
            startTime: new Date().toISOString(),
          }
          
          set((state) => ({
            activeToolCalls: {
              ...state.activeToolCalls,
              [toolCall.toolCallId]: toolCallWithTime,
            },
          }))
        },
        
        updateToolCall: (toolCallId, updates) => {
          set((state) => {
            const toolCall = state.activeToolCalls[toolCallId]
            if (!toolCall) return state
            
            return {
              activeToolCalls: {
                ...state.activeToolCalls,
                [toolCallId]: { ...toolCall, ...updates },
              },
            }
          })
        },
        
        completeToolCall: (toolCallId, result) => {
          set((state) => {
            const toolCall = state.activeToolCalls[toolCallId]
            if (!toolCall) return state
            
            return {
              activeToolCalls: {
                ...state.activeToolCalls,
                [toolCallId]: {
                  ...toolCall,
                  result,
                  status: 'completed',
                  endTime: new Date().toISOString(),
                },
              },
            }
          })
        },
        
        // Confirmation actions
        showConfirmation: (confirmation) => {
          set((state) => ({
            activeConfirmations: {
              ...state.activeConfirmations,
              [confirmation.confirmationId]: confirmation,
            },
            isInputDisabled: true,
          }))
        },
        
        hideConfirmation: (confirmationId) => {
          set((state) => {
            const { [confirmationId]: removed, ...remaining } = state.activeConfirmations
            return {
              activeConfirmations: remaining,
              isInputDisabled: Object.keys(remaining).length > 0,
            }
          })
        },
        
        // Input actions
        setMessageInput: (input) => {
          set({ messageInput: input })
        },
        
        setInputDisabled: (disabled) => {
          set({ isInputDisabled: disabled })
        },
        
        // SSE actions
        setSSEConnection: (connection) => {
          set({ sseConnection: connection })
        },
        
        incrementReconnectAttempts: () => {
          set((state) => ({
            reconnectAttempts: state.reconnectAttempts + 1,
          }))
        },
        
        resetReconnectAttempts: () => {
          set({ reconnectAttempts: 0 })
        },
        
        // Utility actions
        getActiveSession: () => {
          const state = get()
          return state.activeSessionId ? state.sessions[state.activeSessionId] || null : null
        },
        
        getSessionMessages: (sessionId) => {
          const state = get()
          return state.sessions[sessionId]?.messages || []
        },
        
        clearSession: (sessionId) => {
          set((state) => {
            const session = state.sessions[sessionId]
            if (!session) return state
            
            return {
              sessions: {
                ...state.sessions,
                [sessionId]: {
                  ...session,
                  messages: [],
                  isStreaming: false,
                  typingIndicator: undefined,
                },
              },
            }
          })
        },
        
        clearAllSessions: () => {
          set({
            sessions: {},
            activeSessionId: null,
            sessionTabs: [],
            streamingMessages: {},
            activeToolCalls: {},
            activeConfirmations: {},
            messageInput: '',
            isInputDisabled: false,
          })
        },
      })
    ),
    {
      name: 'chat-store',
      enabled: DEV_CONFIG.debug,
    }
  )
)

// ============================================================================
// Convenience Hooks
// ============================================================================

/**
 * Hook for active session
 */
export function useActiveSession() {
  const activeSessionId = useChatStore(state => state.activeSessionId)
  const sessions = useChatStore(state => state.sessions)
  const setActiveSession = useChatStore(state => state.setActiveSession)
  
  const activeSession = activeSessionId ? sessions[activeSessionId] : null
  
  return {
    activeSession,
    activeSessionId,
    setActiveSession,
  }
}

/**
 * Hook for session messages
 */
export function useSessionMessages(sessionId?: string) {
  const activeSessionId = useChatStore(state => state.activeSessionId)
  const getSessionMessages = useChatStore(state => state.getSessionMessages)
  const addMessage = useChatStore(state => state.addMessage)
  const updateMessage = useChatStore(state => state.updateMessage)
  
  const targetSessionId = sessionId || activeSessionId
  const messages = targetSessionId ? getSessionMessages(targetSessionId) : []
  
  return {
    messages,
    addMessage: targetSessionId 
      ? (message: Message) => addMessage(targetSessionId, message)
      : undefined,
    updateMessage: targetSessionId
      ? (messageId: string, updates: Partial<Message>) => 
          updateMessage(targetSessionId, messageId, updates)
      : undefined,
  }
}

/**
 * Hook for streaming state
 */
export function useStreamingState() {
  const streamingMessages = useChatStore(state => state.streamingMessages)
  const startStreamingMessage = useChatStore(state => state.startStreamingMessage)
  const appendToStreamingMessage = useChatStore(state => state.appendToStreamingMessage)
  const completeStreamingMessage = useChatStore(state => state.completeStreamingMessage)
  
  const isStreaming = Object.keys(streamingMessages).length > 0
  
  return {
    streamingMessages,
    isStreaming,
    startStreamingMessage,
    appendToStreamingMessage,
    completeStreamingMessage,
  }
}

/**
 * Hook for tool calls
 */
export function useToolCalls() {
  const activeToolCalls = useChatStore(state => state.activeToolCalls)
  const startToolCall = useChatStore(state => state.startToolCall)
  const updateToolCall = useChatStore(state => state.updateToolCall)
  const completeToolCall = useChatStore(state => state.completeToolCall)
  
  return {
    activeToolCalls,
    startToolCall,
    updateToolCall,
    completeToolCall,
  }
}

/**
 * Hook for confirmations
 */
export function useConfirmations() {
  const activeConfirmations = useChatStore(state => state.activeConfirmations)
  const showConfirmation = useChatStore(state => state.showConfirmation)
  const hideConfirmation = useChatStore(state => state.hideConfirmation)
  
  return {
    activeConfirmations,
    showConfirmation,
    hideConfirmation,
    hasActiveConfirmations: Object.keys(activeConfirmations).length > 0,
  }
}