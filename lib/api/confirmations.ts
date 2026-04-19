/**
 * Confirmation API Integration
 * API methods for submitting confirmation responses
 * 
 * Based on design.md specification
 */

import type { ConfirmationRequestPayload, ConfirmationResponse } from '@/types/confirmation'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

/**
 * Submit confirmation response to backend
 * 
 * @param sessionId - The session ID
 * @param confirmationId - The confirmation ID
 * @param payload - Confirmation request payload
 * @returns Confirmation response from server
 * @throws Error if submission fails
 */
export async function submitConfirmation(
  sessionId: string,
  confirmationId: string,
  payload: ConfirmationRequestPayload
): Promise<ConfirmationResponse> {
  const response = await fetch(
    `${API_BASE_URL}/v1/session/${sessionId}/confirm/${confirmationId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        confirmed: payload.confirmed,
        message: payload.answer,
      }),
    }
  )
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Failed to submit confirmation: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ''}`
    )
  }
  
  // Backend returns JSON ack, not SSE stream
  // Events continue on the existing stream connection
  return {
    confirmationId,
    confirmed: payload.confirmed,
    answer: payload.answer,
  }
}

/**
 * Handle confirmation submission with error handling
 * 
 * @param sessionId - The session ID
 * @param confirmationId - The confirmation ID
 * @param confirmed - Whether confirmed or rejected
 * @param answer - Optional answer text
 * @returns Promise that resolves when submission is complete
 */
export async function handleConfirmation(
  sessionId: string,
  confirmationId: string,
  confirmed: boolean,
  answer?: string | null
): Promise<void> {
  try {
    await submitConfirmation(sessionId, confirmationId, {
      sessionId,
      confirmationId,
      confirmed,
      answer: answer || undefined,
    })
  } catch (error) {
    console.error('Failed to submit confirmation:', error)
    throw error
  }
}
