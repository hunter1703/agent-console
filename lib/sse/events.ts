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
  rawEvent?: {
    agentId?: string
    threadId?: string
    messageId?: string
    runId?: string
    [key: string]: unknown
  }
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
  type: 'RUN_ERROR'
  runId: string
  error: string
  code?: string
}

// ============================================================================
// Step Events
// ============================================================================

export interface StepStartedEvent extends BaseAGUIEvent {
  type: 'STEP_STARTED'
  runId: string
  stepName: string
}

export interface StepFinishedEvent extends BaseAGUIEvent {
  type: 'STEP_FINISHED'
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
  type: 'TOOL_CALL_START'
  toolCallId: string
  toolName: string
  toolCallName?: string // Backend uses toolCallName instead of toolName
  parentMessageId?: string
  runId: string
}

export interface ToolCallArgsEvent extends BaseAGUIEvent {
  type: 'TOOL_CALL_ARGS'
  toolCallId: string
  arguments: string // JSON string fragment
  delta: string
}

export interface ToolCallEndEvent extends BaseAGUIEvent {
  type: 'TOOL_CALL_END'
  toolCallId: string
  arguments: string // Complete JSON string
}

export interface ToolCallResultEvent extends BaseAGUIEvent {
  type: 'TOOL_CALL_RESULT'
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
  type: 'REASONING_START'
  messageId: string // Outer reasoning block ID
  runId: string
}

export interface ReasoningMessageStartEvent extends BaseAGUIEvent {
  type: 'REASONING_MESSAGE_START'
  messageId: string // Inner thought message ID
  parentMessageId: string // Outer reasoning block ID
  role: 'assistant'
}

export interface ReasoningMessageContentEvent extends BaseAGUIEvent {
  type: 'REASONING_MESSAGE_CONTENT'
  messageId: string // Inner thought message ID
  content: string
  delta: string
}

export interface ReasoningMessageEndEvent extends BaseAGUIEvent {
  type: 'REASONING_MESSAGE_END'
  messageId: string // Inner thought message ID
  content: string
}

export interface ReasoningEndEvent extends BaseAGUIEvent {
  type: 'REASONING_END'
  messageId: string // Outer reasoning block ID
}

// ============================================================================
// Custom Events (HITL, Planning, etc.)
// ============================================================================

export interface CustomEvent extends BaseAGUIEvent {
  type: 'CUSTOM'
  name: string
  value?: unknown
  [key: string]: unknown
}

export interface ConfirmationRequestedEvent extends CustomEvent {
  name: 'confirmation_requested'
  value: {
    confirmationId: string
    prompt: string
    originalToolCallId?: string
    options?: string[]
    kind: 'DECISION' | 'TEXT'
    timeout?: number
  }
}

export interface ConfirmedEvent extends CustomEvent {
  name: 'confirmed'
  value: {
    confirmationId: string
    confirmed: boolean
    answer?: string
  }
}

export interface CorrectionEvent extends CustomEvent {
  name: 'correction'
  value: {
    correctionType?: string
    code?: string
    message: string
  }
}

export interface AttachmentFileDetails {
  name: string
  source: string
  type: 'CLOUDSTORAGE' | 'UNKNOWN'
  mimeType: string
  size: number
}

export interface AttachmentEvent extends CustomEvent {
  name: 'attachment'
  value: {
    parentMessageId: string
    fileDetails: AttachmentFileDetails
  }
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
  | AttachmentEvent
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
  return event.type === 'TOOL_CALL_START'
}

export function isToolCallArgsEvent(event: AGUIEvent): event is ToolCallArgsEvent {
  return event.type === 'TOOL_CALL_ARGS'
}

export function isToolCallEndEvent(event: AGUIEvent): event is ToolCallEndEvent {
  return event.type === 'TOOL_CALL_END'
}

export function isToolCallResultEvent(event: AGUIEvent): event is ToolCallResultEvent {
  return event.type === 'TOOL_CALL_RESULT'
}

export function isConfirmationRequestedEvent(event: AGUIEvent): event is ConfirmationRequestedEvent {
  return event.type === 'CUSTOM' && (event as CustomEvent).name === 'confirmation_requested'
}

export function isConfirmedEvent(event: AGUIEvent): event is ConfirmedEvent {
  return event.type === 'CUSTOM' && (event as CustomEvent).name === 'confirmed'
}

export function isAttachmentEvent(event: AGUIEvent): event is AttachmentEvent {
  return event.type === 'CUSTOM' && (event as CustomEvent).name === 'attachment'
}

export function isReasoningStartEvent(event: AGUIEvent): event is ReasoningStartEvent {
  return event.type === 'REASONING_START'
}

export function isReasoningMessageStartEvent(event: AGUIEvent): event is ReasoningMessageStartEvent {
  return event.type === 'REASONING_MESSAGE_START'
}

export function isReasoningMessageContentEvent(event: AGUIEvent): event is ReasoningMessageContentEvent {
  return event.type === 'REASONING_MESSAGE_CONTENT'
}

export function isReasoningMessageEndEvent(event: AGUIEvent): event is ReasoningMessageEndEvent {
  return event.type === 'REASONING_MESSAGE_END'
}

export function isReasoningEndEvent(event: AGUIEvent): event is ReasoningEndEvent {
  return event.type === 'REASONING_END'
}

export function isRunErrorEvent(event: AGUIEvent): event is RunErrorEvent {
  return event.type === 'RUN_ERROR'
}

export function isStepStartedEvent(event: AGUIEvent): event is StepStartedEvent {
  return event.type === 'STEP_STARTED'
}

export function isStepFinishedEvent(event: AGUIEvent): event is StepFinishedEvent {
  return event.type === 'STEP_FINISHED'
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