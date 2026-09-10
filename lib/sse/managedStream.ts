/**
 * Reconnecting wrapper around GET /v1/session/{sessionId}/stream.
 *
 * Built on fetch + ReadableStream (via createAGUIStream) rather than native EventSource so a
 * failed stream-open carries its real HTTP status. EventSource has no such visibility — every
 * failure, from a genuine network drop to a 401/403/404 that will never succeed, fires the same
 * generic `onerror` — so a terminal auth/not-found error used to burn through the full
 * exponential backoff (~31s across 5 attempts) before ever surfacing to the user. Terminal
 * statuses now fail fast instead.
 *
 * Once the response is open, "the server closed the response after finishing" is still
 * indistinguishable from "the connection genuinely dropped" — both just end the stream.
 * Reconnecting unconditionally is still safe: the backend's terminal-session path
 * (subscribeToSession) responds to an already-finished session with its full history and
 * completes almost immediately, so a reconnect against a session that's truly done is cheap
 * and self-limits. `shouldReconnect` is the caller's signal for whether it's worth retrying at
 * all — pass a check like "is this session still marked isStreaming" so a session with nothing
 * left to say doesn't get retried forever.
 */

export interface SessionStreamHandle {
  readonly url: string
  readonly readyState: number
  close(): void
}

export type ManagedStreamStatus = 'connected' | 'disconnected' | 'error'

interface ManagedSessionStreamOptions {
  /** Raw SSE data payload for one event — feed straight into AGUIEventHandler.handleEvent. */
  onEvent: (rawData: string) => void
  onStatusChange: (status: ManagedStreamStatus) => void
  /** Called before each reconnect attempt; return false to stop retrying. */
  shouldReconnect: () => boolean
  maxAttempts?: number
}

const BASE_DELAY_MS = 1000
const MAX_DELAY_MS = 16000

// Statuses that will never succeed on retry — the same request against the same URL will
// fail the same way every time, so retrying just delays surfacing the real problem.
const TERMINAL_HTTP_STATUSES = new Set([401, 403, 404])

// Mirrors the EventSource readyState contract that callers (useSessionStream.ts) already
// check against — no DOM EventSource instance exists here, these are just its numeric values.
const READY_STATE = { CONNECTING: 0, OPEN: 1, CLOSED: 2 } as const

export function openManagedSessionStream(
  sessionId: string,
  options: ManagedSessionStreamOptions
): SessionStreamHandle {
  const maxAttempts = options.maxAttempts ?? 5
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
  const url = `${baseUrl}/v1/session/${sessionId}/stream`

  let closed = false
  let attempt = 0
  let retryTimer: ReturnType<typeof setTimeout> | null = null
  let abortController: AbortController | null = null
  let readyState: number = READY_STATE.CONNECTING

  const scheduleRetryOrFail = () => {
    readyState = READY_STATE.CLOSED
    options.onStatusChange('disconnected')
    if (!options.shouldReconnect() || attempt >= maxAttempts) {
      options.onStatusChange('error')
      return
    }
    attempt += 1
    const delay = Math.min(BASE_DELAY_MS * 2 ** (attempt - 1), MAX_DELAY_MS)
    retryTimer = setTimeout(connect, delay)
  }

  const connect = () => {
    if (closed) return
    readyState = READY_STATE.CONNECTING
    const controller = new AbortController()
    abortController = controller

    void (async () => {
      try {
        const response = await fetch(url, { signal: controller.signal })
        if (closed) return

        if (!response.ok || !response.body) {
          if (TERMINAL_HTTP_STATUSES.has(response.status)) {
            readyState = READY_STATE.CLOSED
            options.onStatusChange('disconnected')
            options.onStatusChange('error')
            return
          }
          scheduleRetryOrFail()
          return
        }

        readyState = READY_STATE.OPEN
        attempt = 0
        options.onStatusChange('connected')

        const { createAGUIStream } = await import('./streaming')
        const stream = await createAGUIStream(response.body)
        for await (const update of stream) {
          if (closed) return
          if (update.done) break
          if (update.rawData) options.onEvent(update.rawData)
        }

        if (closed) return
        scheduleRetryOrFail()
      } catch (err) {
        if (closed || controller.signal.aborted) return
        scheduleRetryOrFail()
      }
    })()
  }

  connect()

  return {
    get url() {
      return url
    },
    get readyState() {
      return readyState
    },
    close() {
      closed = true
      readyState = READY_STATE.CLOSED
      if (retryTimer) clearTimeout(retryTimer)
      abortController?.abort()
    },
  }
}
