/**
 * AGUI Event Types and Handlers
 * 
 * Complete TypeScript definitions for AGUI events based on the protocol
 * reference and Java event classes from agent-engine.
 */

// ============================================================================
// Base Event Types
// ============================================================================

export interface BaseAGUIEvent {
  type: string
  timestamp: number
  runId?: string
  threadId?: string
  messageId?: string
  toolCallId?: string
  stepName?: string
}

// ============================================================================
// Run Events
// ============================================================================

export interface RunStartedEvent extends BaseAGUIEvent {
  type: 'RUN_STARTED'
  runId: string
  threadId: string
  parentRunId?: string
  agentId: string
}

export interface RunFinishedEvent extends BaseAGUIEvent {
  type: 'RUN_FINISHED'
  runId: string
  result?: string
  error?: string
}

export interface RunErrorEvent extends BaseAGUIEvent {
  type: 'RunError'
  runId: string
  error: string
  code?: string
}

// ============================================================================
// Step Events
// ============================================================================

export interface StepStartedEvent extends BaseAGUIEvent {
  type: 'StepStarted'
  runId: string
  stepName: string
}

export interface StepFinishedEvent extends BaseAGUIEvent {
  type: 'StepFinished'
  runId: string
  stepName: string
  result?: string
}

// ============================================================================
// Message Events
// ============================================================================

export interface TextMessageStartEvent extends BaseAGUIEvent {
  type: 'TEXT_MESSAGE_START'
  messageId: string
  role: 'user' | 'assistant' | 'system'
  runId: string
}

export interface TextMessageChunkEvent extends BaseAGUIEvent {
  type: 'TEXT_MESSAGE_CHUNK'
  messageId: string
  delta: string
}

export interface TextMessageEndEvent extends BaseAGUIEvent {
  type: 'TEXT_MESSAGE_END'
  messageId: string
  content?: string
}

// ============================================================================
// Tool Call Events
// ============================================================================

export interface ToolCallStartEvent extends BaseAGUIEvent {
  type: 'ToolCallStart'
  toolCallId: string
  toolName: string
  parentMessageId?: string
  runId: string
}

export interface ToolCallArgsEvent extends BaseAGUIEvent {
  type: 'ToolCallArgs'
  toolCallId: string
  arguments: string // JSON string fragment
  delta: string
}

export interface ToolCallEndEvent extends BaseAGUIEvent {
  type: 'ToolCallEnd'
  toolCallId: string
  arguments: string // Complete JSON string
}

export interface ToolCallResultEvent extends BaseAGUIEvent {
  type: 'ToolCallResult'
  toolCallId: string
  content: string
  success: boolean
  error?: string
  duration?: number
}

// ============================================================================
// Reasoning Events
// ============================================================================

export interface ReasoningStartEvent extends BaseAGUIEvent {
  type: 'ReasoningStart'
  messageId: string // Outer reasoning block ID
  runId: string
}

export interface ReasoningMessageStartEvent extends BaseAGUIEvent {
  type: 'ReasoningMessageStart'
  messageId: string // Inner thought message ID
  parentMessageId: string // Outer reasoning block ID
  role: 'assistant'
}

export interface ReasoningMessageContentEvent extends BaseAGUIEvent {
  type: 'ReasoningMessageContent'
  messageId: string // Inner thought message ID
  content: string
  delta: string
}

export interface ReasoningMessageEndEvent extends BaseAGUIEvent {
  type: 'ReasoningMessageEnd'
  messageId: string // Inner thought message ID
  content: string
}

export interface ReasoningEndEvent extends BaseAGUIEvent {
  type: 'ReasoningEnd'
  messageId: string // Outer reasoning block ID
}

// ============================================================================
// Custom Events (HITL, Planning, etc.)
// ============================================================================

export interface CustomEvent extends BaseAGUIEvent {
  type: 'Custom'
  name: string
  [key: string]: unknown
}

export interface ConfirmationRequestedEvent extends CustomEvent {
  name: 'confirmation_requested'
  confirmationId: string
  prompt: string
  originalToolCallId?: string
  options?: string[]
  kind: 'DECISION' | 'TEXT'
  timeout?: number
}

export interface ConfirmedEvent extends CustomEvent {
  name: 'confirmed'
  confirmationId: string
  confirmed: boolean
  answer?: string
}

export interface CorrectionEvent extends CustomEvent {
  name: 'correction'
  correctionType: string
  code: string
  message: string
}

// ============================================================================
// Union Type
// ============================================================================

export type AGUIEvent = 
  | RunStartedEvent
  | RunFinishedEvent
  | RunErrorEvent
  | StepStartedEvent
  | StepFinishedEvent
  | TextMessageStartEvent
  | TextMessageChunkEvent
  | TextMessageEndEvent
  | ToolCallStartEvent
  | ToolCallArgsEvent
  | ToolCallEndEvent
  | ToolCallResultEvent
  | ReasoningStartEvent
  | ReasoningMessageStartEvent
  | ReasoningMessageContentEvent
  | ReasoningMessageEndEvent
  | ReasoningEndEvent
  | ConfirmationRequestedEvent
  | ConfirmedEvent
  | CorrectionEvent
  | CustomEvent

// ============================================================================
// Event Parser
// ============================================================================

export function parseAGUIEvent(eventData: string): AGUIEvent | null {
  try {
    const parsed = JSON.parse(eventData)
    
    // Add timestamp if not present
    if (!parsed.timestamp) {
      parsed.timestamp = Date.now()
    }
    
    return parsed as AGUIEvent
  } catch (error) {
    console.error('Failed to parse AGUI event:', error, eventData)
    return null
  }
}

// ============================================================================
// Event Type Guards
// ============================================================================

export function isRunStartedEvent(event: AGUIEvent): event is RunStartedEvent {
  return event.type === 'RUN_STARTED'
}

export function isRunFinishedEvent(event: AGUIEvent): event is RunFinishedEvent {
  return event.type === 'RUN_FINISHED'
}

export function isTextMessageStartEvent(event: AGUIEvent): event is TextMessageStartEvent {
  return event.type === 'TEXT_MESSAGE_START'
}

export function isTextMessageChunkEvent(event: AGUIEvent): event is TextMessageChunkEvent {
  return event.type === 'TEXT_MESSAGE_CHUNK'
}

export function isTextMessageEndEvent(event: AGUIEvent): event is TextMessageEndEvent {
  return event.type === 'TEXT_MESSAGE_END'
}

export function isToolCallStartEvent(event: AGUIEvent): event is ToolCallStartEvent {
  return event.type === 'ToolCallStart'
}

export function isToolCallArgsEvent(event: AGUIEvent): event is ToolCallArgsEvent {
  return event.type === 'ToolCallArgs'
}

export function isToolCallEndEvent(event: AGUIEvent): event is ToolCallEndEvent {
  return event.type === 'ToolCallEnd'
}

export function isToolCallResultEvent(event: AGUIEvent): event is ToolCallResultEvent {
  return event.type === 'ToolCallResult'
}

export function isConfirmationRequestedEvent(event: AGUIEvent): event is ConfirmationRequestedEvent {
  return event.type === 'Custom' && (event as CustomEvent).name === 'confirmation_requested'
}

export function isConfirmedEvent(event: AGUIEvent): event is ConfirmedEvent {
  return event.type === 'Custom' && (event as CustomEvent).name === 'confirmed'
}

export function isReasoningStartEvent(event: AGUIEvent): event is ReasoningStartEvent {
  return event.type === 'ReasoningStart'
}

export function isReasoningEndEvent(event: AGUIEvent): event is ReasoningEndEvent {
  return event.type === 'ReasoningEnd'
}

// ============================================================================
// Planning Tool Event Helpers
// ============================================================================

export function isPlanningToolCall(toolName: string): boolean {
  const planningTools = [
    'create_plan',
    'update_plan', 
    'add_task',
    'update_task_info',
    'start_task',
    'complete_task',
    'update_task_status',
    'finish_plan',
    'view_plan'
  ]
  return planningTools.includes(toolName)
}

export function isStandardToolCall(toolName: string): boolean {
  const standardTools = [
    'spawn_agent',
    'send_message', 
    'await_agent',
    'web_research'
  ]
  return standardTools.includes(toolName)
}