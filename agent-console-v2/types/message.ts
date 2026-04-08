/**
 * Message Types
 * 
 * Type definitions for messages and streaming events.
 */

export type MessageRole = 'user' | 'assistant' | 'system'
export type MessageStatus = 'sending' | 'sent' | 'streaming' | 'complete' | 'error'

export interface Message {
  id: string
  sessionId: string
  role: MessageRole
  content: string
  status: MessageStatus
  timestamp: string
  toolCalls?: ToolCall[]
  error?: string
}

export interface ToolCall {
  id: string
  name: string
  arguments: Record<string, any>
  result?: any
  status: 'pending' | 'running' | 'complete' | 'error'
  timestamp: string
}

export interface MessageRequest {
  content: string
}

export interface MessageResponse {
  message: Message
}

// SSE Event Types
export type SSEEventType = 
  | 'TEXT_MESSAGE_START'
  | 'TEXT_DELTA'
  | 'TEXT_MESSAGE_END'
  | 'THINKING_START'
  | 'THINKING_END'
  | 'TOOL_CALL_START'
  | 'TOOL_CALL_END'
  | 'ERROR'

export interface SSEEvent {
  type: SSEEventType
  data: any
}

export interface TextDeltaEvent {
  delta: string
}

export interface ThinkingEvent {
  message?: string
}

export interface ToolCallEvent {
  toolCall: ToolCall
}

export interface ErrorEvent {
  error: string
  code?: string
}
