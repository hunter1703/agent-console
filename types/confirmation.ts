/**
 * Confirmation Request Types
 * Types for human intervention and confirmation requests
 */

export type ConfirmationType = 'DECISION' | 'TEXT' | 'MULTIPLE_CHOICE'

export type ConfirmationStatus = 'pending' | 'confirmed' | 'rejected'

export interface ConfirmationOption {
  id: string
  label: string
  value: string
}

export interface ConfirmationRequest {
  id: string
  sessionId: string
  type: ConfirmationType
  prompt: string
  status: ConfirmationStatus
  options?: ConfirmationOption[] // For MULTIPLE_CHOICE
  answer?: string // User's answer
  confirmedAt?: string // ISO timestamp
  linkedToolCallId?: string // ID of the tool call that triggered this
  createdAt: string // ISO timestamp
}

export interface ConfirmationResponse {
  confirmationId: string
  confirmed: boolean
  answer?: string
}

export interface ConfirmationRequestPayload {
  sessionId: string
  confirmationId: string
  confirmed: boolean
  answer?: string
}
