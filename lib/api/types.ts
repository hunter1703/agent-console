/**
 * API Type Definitions
 * 
 * TypeScript interfaces for Agent Engine REST API responses.
 * Based on actual Java classes from agent-engine backend.
 */

// ============================================================================
// Base Types
// ============================================================================

export interface BaseEntity {
  id: string
  createdTime: string
  updatedTime: string
}

export interface NamedEntity extends BaseEntity {
  name: string
  description?: string
}

export interface PaginatedResult<T> {
  items: T[]
  totalCount: number
  pageSize: number
  pageNumber: number
  hasMore: boolean
}

export interface Query {
  filter?: Filter
  sort?: Sort[]
  pageSize?: number
  pageNumber?: number
  includeFields?: string[]
  excludeFields?: string[]
}

export interface Filter {
  field?: string
  operator?: FilterOperator
  value?: unknown
  filters?: Filter[]
  logic?: 'AND' | 'OR'
}

export type FilterOperator = 
  | 'EQUALS' 
  | 'NOT_EQUALS' 
  | 'CONTAINS' 
  | 'STARTS_WITH' 
  | 'ENDS_WITH'
  | 'GREATER_THAN' 
  | 'LESS_THAN' 
  | 'GREATER_THAN_OR_EQUAL' 
  | 'LESS_THAN_OR_EQUAL'
  | 'IN' 
  | 'NOT_IN' 
  | 'EXISTS' 
  | 'NOT_EXISTS'
  | 'IS_NULL' 
  | 'IS_NOT_NULL'

export interface Sort {
  field: string
  direction: 'ASC' | 'DESC'
}

// ============================================================================
// Agent Types
// ============================================================================

export interface Agent extends NamedEntity {
  agentId: string
  displayName?: string
  avatar?: string
  modelId?: string
  systemPrompt?: string
  tools?: string[]
  capabilities?: string[]
  metadata?: Record<string, unknown>
  isActive?: boolean
  lastUsed?: string
  version?: string
  tags?: string[]
}

export interface AgentConfig {
  agentId: string
  name: string
  description?: string
  modelId?: string
  systemPrompt?: string
  tools?: ToolConfig[]
  contextStrategy?: ContextStrategy
  metadata?: Record<string, unknown>
}

export interface ToolConfig {
  name: string
  enabled: boolean
  config?: Record<string, unknown>
}

export interface ContextStrategy {
  maxTokens?: number
  strategy?: 'TRUNCATE' | 'SUMMARIZE' | 'SLIDING_WINDOW'
  modelId?: string
}

// ============================================================================
// Session Types
// ============================================================================

export interface Session extends NamedEntity {
  sessionId: string
  agentId: string
  agentName?: string
  agentAvatar?: string
  status: SessionStatus
  parentSessionId?: string
  childSessionIds?: string[]
  messageCount: number
  lastMessage?: string
  lastMessageTime?: string
  metadata?: Record<string, unknown>
  events?: SessionEvent[]
}

export type SessionStatus = 
  | 'ACTIVE' 
  | 'COMPLETED' 
  | 'ERROR' 
  | 'PAUSED' 
  | 'CANCELLED'

export interface SessionEvent {
  eventId: string
  sessionId: string
  eventType: string
  timestamp: string
  data: Record<string, unknown>
}

// ============================================================================
// Message Types
// ============================================================================

export interface Message extends BaseEntity {
  messageId: string
  sessionId: string
  role: MessageRole
  content: string
  metadata?: {
    parentId?: string | null
    childrenIds?: string[]
    streaming?: boolean
    done?: boolean
    agentId?: string
    agentName?: string
    threadId?: string
    [key: string]: unknown
  }
  toolCalls?: ToolCall[]
  reasoning?: ReasoningBlock[]
  interrupts?: Interrupt[]
  files?: any[]
  sources?: any[]
  attachments?: MessageAttachment[]
}

export interface MessageAttachment {
  name: string
  /** Cloud storage source path (e.g. "agent-assets/...") */
  source: string
  type: 'CLOUDSTORAGE' | 'UNKNOWN'
  mimeType: string
  size: number
}

export type MessageRole = 'user' | 'assistant' | 'system' | 'tool'

export interface ToolCall {
  toolCallId: string
  toolName: string
  arguments: Record<string, unknown>
  result?: ToolCallResult
  status: ToolCallStatus
  startTime: string
  endTime?: string
  duration?: number
}

export type ToolCallStatus = 'pending' | 'running' | 'completed' | 'failed'

export interface ToolCallResult {
  success: boolean
  content?: string
  error?: string
  metadata?: Record<string, unknown>
}

export interface ReasoningBlock {
  blockId: string
  thoughts: ReasoningThought[]
  startTime: string
  endTime?: string
}

export interface ReasoningThought {
  thoughtId: string
  content: string
  timestamp: string
}

export interface Interrupt {
  interruptId: string
  prompt: string
  kind: InterruptKind
  options?: string[]
  response?: InterruptResponse
  timeout?: number
  originalToolCallId?: string
}

export type InterruptKind = 'DECISION' | 'TEXT' | 'UNKNOWN'

export interface InterruptResponse {
  accepted: boolean
  answer?: string
  timestamp: string
}

// ============================================================================
// Schema Types
// ============================================================================

export interface FormSchema {
  type: 'object'
  properties: Record<string, FieldSchema>
  required?: string[]
  title?: string
  description?: string
}

export interface FieldSchema {
  type: FieldType
  title?: string
  description?: string
  default?: unknown
  enum?: unknown[]
  format?: string
  pattern?: string
  minLength?: number
  maxLength?: number
  minimum?: number
  maximum?: number
  items?: FieldSchema
  properties?: Record<string, FieldSchema>
  required?: string[]
  uiLookup?: UiLookupConfig
  uiWidget?: string
  uiOptions?: Record<string, unknown>
}

export type FieldType = 
  | 'string' 
  | 'number' 
  | 'integer' 
  | 'boolean' 
  | 'array' 
  | 'object'

export interface UiLookupConfig {
  endpoint: string
  valueField: string
  labelField: string
  searchField?: string
  params?: Record<string, unknown>
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface AssetRequest {
  query?: Query
  keys?: string[]
  options?: Record<string, unknown>
}

export interface SchemaRequest {
  type: string
  mode: SchemaMode
  entityId?: string
}

export type SchemaMode = 'CREATE' | 'EDIT' | 'VIEW'

export interface CreateAgentRequest {
  name: string
  description?: string
  agentId?: string
  modelId?: string
  systemPrompt?: string
  tools?: string[]
  metadata?: Record<string, unknown>
}

export interface UpdateAgentRequest extends Partial<CreateAgentRequest> {
  id: string
}

export interface CreateSessionRequest {
  agentId: string
  name?: string
  parentSessionId?: string
  metadata?: Record<string, unknown>
}

export interface SendMessageRequest {
  content: string
  role?: MessageRole
  metadata?: Record<string, unknown>
}

export interface InterruptRequest {
  interruptId: string
  accepted: boolean
  answer?: string
}

// ============================================================================
// Dashboard Types
// ============================================================================

export interface DashboardStats {
  totalAgents: number
  totalSessions: number
  messagesThisWeek: number
  activeSessionsToday: number
}

export interface RecentSession {
  sessionId: string
  agentId: string
  agentName: string
  agentAvatar?: string
  lastMessage: string
  lastMessageTime: string
  messageCount: number
}

// ============================================================================
// SSE Event Types
// ============================================================================

export interface SSEEvent {
  type: string
  data: unknown
  timestamp: number
}

export interface AGUIEvent extends SSEEvent {
  runId?: string
  threadId?: string
  messageId?: string
  toolCallId?: string
  stepName?: string
}

// ============================================================================
// Error Types
// ============================================================================

export interface ApiErrorResponse {
  error: string
  message: string
  code?: string
  details?: unknown
  timestamp: string
}

export interface ValidationErrorResponse extends ApiErrorResponse {
  fieldErrors?: Record<string, string>
  violations?: Array<{
    field: string
    message: string
    code?: string
  }>
}