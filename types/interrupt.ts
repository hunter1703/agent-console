/**
 * Interrupt Request Types
 * Types for human intervention and interrupt requests
 */

export type InterruptType = 'DECISION' | 'TEXT' | 'MULTIPLE_CHOICE'

export type InterruptStatus = 'pending' | 'resolved' | 'rejected'

export interface InterruptOption {
  id: string
  label: string
  value: string
}

export interface InterruptRequest {
  id: string
  sessionId: string
  type: InterruptType
  prompt: string
  status: InterruptStatus
  options?: InterruptOption[] // For MULTIPLE_CHOICE
  answer?: string // User's answer
  resolvedAt?: string // ISO timestamp
  linkedToolCallId?: string // ID of the tool call that triggered this — the backend never sends
  // a name alongside it, so look it up via the session's toolCalls map when displaying it.
  requestingAgentId?: string // Agent ID that requested this interrupt
  createdAt: string // ISO timestamp
}

export interface InterruptResponse {
  interruptId: string
  accepted: boolean
  answer?: string
}

export interface InterruptRequestPayload {
  sessionId: string
  interruptId: string
  accepted: boolean
  answer?: string
}
