/**
 * Confirmation API Integration
 *
 * Payload rules (per backend spec):
 *   TEXT kind:
 *     - message = user's text (required, non-blank enforced in UI)
 *     - confirmed = omitted
 *
 *   DECISION kind with options (multiple-choice):
 *     - message = selected option value or custom answer text
 *     - confirmed = omitted
 *
 *   DECISION kind without options (binary yes/no):
 *     - confirmed = true (Approve) | false (Decline)
 *     - message = omitted
 *
 * Resolution rule:
 *   Resolve the widget only when the backend returns 2xx (202 Accepted).
 *   Any other status code = do not resolve, show error.
 */

import type { ConfirmationType } from '@/types/confirmation'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export type ConfirmationKind = ConfirmationType // 'DECISION' | 'TEXT'

export interface ConfirmationPayload {
  kind: ConfirmationKind
  /** Present for DECISION with options, or TEXT. Absent for binary DECISION. */
  options?: string[] // whether options were provided (determines binary vs choice)
  /** The user's answer — text input or selected option value */
  answer?: string
  /** Only for binary DECISION: true = Approve, false = Decline */
  approved?: boolean
}

/**
 * POST /v1/session/{sessionId}/confirm/{confirmationId}
 *
 * Builds the correct payload based on confirmation kind and resolves on 202.
 * Throws on non-2xx.
 */
export async function submitConfirmationResponse(
  sessionId: string,
  confirmationId: string,
  payload: ConfirmationPayload,
): Promise<void> {
  const body: Record<string, unknown> = {}

  if (payload.kind === 'TEXT') {
    // TEXT: send message only
    body.message = payload.answer
  } else if (payload.kind === 'DECISION' && payload.options && payload.options.length > 0) {
    // DECISION with options: send message (selected/custom answer) only
    body.message = payload.answer
  } else {
    // Binary DECISION (no options): send confirmed only
    body.confirmed = payload.approved
  }

  const response = await fetch(
    `${API_BASE_URL}/v1/session/${sessionId}/confirm/${confirmationId}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  )

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(
      `Confirmation failed: HTTP ${response.status}${errorText ? ` — ${errorText}` : ''}`,
    )
  }
  // 2xx → success, widget can be resolved by caller
}
