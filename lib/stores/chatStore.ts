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
  
  // Actions
  setMessages: (sessionId: string, messages: Message[]) => void
  addMessage: (sessionId: string, message: Message) => void
  updateMessage: (sessionId: string, messageId: string, updates: Partial<Message>) => void
  appendToMessage: (sessionId: string, messageId: string, content: string) => void
  deleteMessage: (sessionId: string, messageId: string) => void
  clearMessages: (sessionId: string) => void
  
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
