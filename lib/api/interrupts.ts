/**
 * Interrupt API Integration
 *
 * All interrupt responses are sent as a single AG-UI Resume payload to:
 *   POST /v1/session/{sessionId}/resume
 *
 * Resume shape:
 *   {
 *     interruptId: string,        // the interrupt ID
 *     status: "RESOLVED" | "CANCELLED",
 *     payload: {                  // present when status = "RESOLVED"
 *       accepted?: boolean,       // binary DECISION: true = Approve, false = Decline
 *       answer?: string,          // TEXT or multi-choice DECISION: the user's answer
 *     }
 *   }
 *
 * Kind-specific rules:
 *   TEXT kind:
 *     - status = "RESOLVED", payload.answer = user's text
 *
 *   DECISION kind with options (multiple-choice):
 *     - status = "RESOLVED", payload.answer = selected option value or custom text
 *
 *   DECISION kind without options (binary yes/no):
 *     - status = "RESOLVED", payload.accepted = true | false
 *
 * Resolution rule:
 *   Resolve the widget only when the backend returns 2xx (202 Accepted).
 *   Any other status code = do not resolve, show error.
 */

import type { InterruptType } from '@/types/interrupt'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export type InterruptKind = InterruptType // 'DECISION' | 'TEXT'

export interface InterruptPayload {
  kind: InterruptKind
  /** Present for DECISION with options, or TEXT. Absent for binary DECISION. */
  options?: string[]
  /** The user's answer — text input or selected option value */
  answer?: string
  /** Only for binary DECISION: true = Approve, false = Decline */
  approved?: boolean
}

/**
 * POST /v1/session/{sessionId}/resume
 *
 * Builds a Resume payload based on interrupt kind and resolves on 202.
 * Throws on non-2xx.
 */
export async function submitInterruptResponse(
  sessionId: string,
  interruptId: string,
  payload: InterruptPayload,
): Promise<void> {
  const resumePayload: Record<string, unknown> = {}

  if (payload.kind === 'TEXT') {
    resumePayload.answer = payload.answer
  } else if (payload.kind === 'DECISION' && payload.options && payload.options.length > 0) {
    resumePayload.answer = payload.answer
  } else {
    // Binary DECISION (no options)
    resumePayload.accepted = payload.approved
  }

  const body = {
    interruptId: interruptId,
    status: 'RESOLVED',
    payload: resumePayload,
  }

  const response = await fetch(
    `${API_BASE_URL}/v1/session/${sessionId}/resume`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  )

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(
      `Interrupt response failed: HTTP ${response.status}${errorText ? ` — ${errorText}` : ''}`,
    )
  }
  // 2xx → success, widget can be resolved by caller
}
