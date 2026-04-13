/**
 * Chat Store
 * 
 * Manages message state and streaming for chat sessions.
 */

import { create } from 'zustand'
import type { Message, ToolCall } from '@/types/message'

interface ChatState {
  // State
  messagesBySession: Record<string, Message[]>
  streamingMessageId: string | null
  isThinking: boolean
  thinkingMessage: string | null
  activeToolCalls: ToolCall[]
  loading: boolean
  error: string | null
  
  // Actions
  setMessages: (sessionId: string, messages: Message[]) => void
  addMessage: (sessionId: string, message: Message) => void
  updateMessage: (sessionId: string, messageId: string, updates: Partial<Message>) => void
  appendToMessage: (sessionId: string, messageId: string, content: string) => void
  deleteMessage: (sessionId: string, messageId: string) => void
  clearMessages: (sessionId: string) => void
  
  // Async actions
  fetchMessages: (sessionId: string) => Promise<void>
  sendMessageAsync: (sessionId: string, content: string, parentMessageId?: string) => Promise<Message>
  deleteMessageAsync: (sessionId: string, messageId: string) => Promise<void>
  
  // Streaming actions
  startStreaming: (sessionId: string, messageId: string) => void
  stopStreaming: () => void
  setThinking: (isThinking: boolean, message?: string) => void
  
  // Tool call actions
  addToolCall: (toolCall: ToolCall) => void
  updateToolCall: (toolCallId: string, updates: Partial<ToolCall>) => void
  clearToolCalls: () => void
  
  // Selectors
  getMessages: (sessionId: string) => Message[]
  getMessageById: (sessionId: string, messageId: string) => Message | undefined
  getLastMessage: (sessionId: string) => Message | undefined
  isStreaming: () => boolean
}

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial state
  messagesBySession: {},
  streamingMessageId: null,
  isThinking: false,
  thinkingMessage: null,
  activeToolCalls: [],
  loading: false,
  error: null,
  
  // Actions
  setMessages: (sessionId, messages) => set((state) => ({
    messagesBySession: {
      ...state.messagesBySession,
      [sessionId]: messages,
    },
  })),
  
  addMessage: (sessionId, message) => set((state) => {
    const existingMessages = state.messagesBySession[sessionId] || []
    return {
      messagesBySession: {
        ...state.messagesBySession,
        [sessionId]: [...existingMessages, message],
      },
    }
  }),
  
  updateMessage: (sessionId, messageId, updates) => set((state) => {
    const messages = state.messagesBySession[sessionId] || []
    return {
      messagesBySession: {
        ...state.messagesBySession,
        [sessionId]: messages.map((msg) =>
          msg.id === messageId ? { ...msg, ...updates } : msg
        ),
      },
    }
  }),
  
  appendToMessage: (sessionId, messageId, content) => set((state) => {
    const messages = state.messagesBySession[sessionId] || []
    return {
      messagesBySession: {
        ...state.messagesBySession,
        [sessionId]: messages.map((msg) =>
          msg.id === messageId 
            ? { ...msg, content: msg.content + content }
            : msg
        ),
      },
    }
  }),
  
  deleteMessage: (sessionId, messageId) => set((state) => {
    const messages = state.messagesBySession[sessionId] || []
    return {
      messagesBySession: {
        ...state.messagesBySession,
        [sessionId]: messages.filter((msg) => msg.id !== messageId),
      },
    }
  }),
  
  clearMessages: (sessionId) => set((state) => ({
    messagesBySession: {
      ...state.messagesBySession,
      [sessionId]: [],
    },
  })),
  
  // Async actions
  fetchMessages: async (sessionId) => {
    set({ loading: true, error: null })
    try {
      const { messageService } = await import('@/lib/api/services')
      const messages = await messageService.list(sessionId)
      set((state) => ({
        messagesBySession: {
          ...state.messagesBySession,
          [sessionId]: messages,
        },
        loading: false,
      }))
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch messages',
        loading: false 
      })
    }
  },
  
  sendMessageAsync: async (sessionId, content, parentMessageId) => {
    set({ loading: true, error: null })
    try {
      const { messageService } = await import('@/lib/api/services')
      const response = await messageService.send(sessionId, { content, parentMessageId })
      
      // Add user message
      const userMessage: Message = {
        id: response.userMessageId || `temp-${Date.now()}`,
        sessionId,
        role: 'user',
        content,
        createdAt: new Date().toISOString(),
        parentMessageId,
      }
      
      get().addMessage(sessionId, userMessage)
      
      // Add assistant message
      const assistantMessage: Message = {
        id: response.assistantMessageId || `temp-${Date.now()}-assistant`,
        sessionId,
        role: 'assistant',
        content: response.content || '',
        createdAt: new Date().toISOString(),
        parentMessageId: userMessage.id,
      }
      
      get().addMessage(sessionId, assistantMessage)
      set({ loading: false })
      
      return assistantMessage
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to send message',
        loading: false 
      })
      throw error
    }
  },
  
  deleteMessageAsync: async (sessionId, messageId) => {
    set({ loading: true, error: null })
    try {
      const { messageService } = await import('@/lib/api/services')
      await messageService.delete(sessionId, messageId)
      get().deleteMessage(sessionId, messageId)
      set({ loading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete message',
        loading: false 
      })
      throw error
    }
  },
  
  // Streaming actions
  startStreaming: (sessionId, messageId) => set({ 
    streamingMessageId: messageId 
  }),
  
  stopStreaming: () => set({ 
    streamingMessageId: null,
    isThinking: false,
    thinkingMessage: null,
  }),
  
  setThinking: (isThinking, message) => set({ 
    isThinking, 
    thinkingMessage: message || null 
  }),
  
  // Tool call actions
  addToolCall: (toolCall) => set((state) => ({
    activeToolCalls: [...state.activeToolCalls, toolCall],
  })),
  
  updateToolCall: (toolCallId, updates) => set((state) => ({
    activeToolCalls: state.activeToolCalls.map((tc) =>
      tc.id === toolCallId ? { ...tc, ...updates } : tc
    ),
  })),
  
  clearToolCalls: () => set({ activeToolCalls: [] }),
  
  // Selectors
  getMessages: (sessionId) => get().messagesBySession[sessionId] || [],
  
  getMessageById: (sessionId, messageId) => {
    const messages = get().messagesBySession[sessionId] || []
    return messages.find((msg) => msg.id === messageId)
  },
  
  getLastMessage: (sessionId) => {
    const messages = get().messagesBySession[sessionId] || []
    return messages[messages.length - 1]
  },
  
  isStreaming: () => get().streamingMessageId !== null,
}))
