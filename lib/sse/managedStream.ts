/**
 * Reconnecting wrapper around the GET /v1/session/{sessionId}/stream EventSource.
 *
 * Native EventSource gives no way to tell "server closed the response after finishing"
 * apart from "the connection genuinely dropped" — both just fire onerror. Reconnecting
 * unconditionally is still safe: the backend's terminal-session path (subscribeToSession)
 * responds to an already-finished session with its full history and completes almost
 * immediately, so a reconnect against a session that's truly done is cheap and self-limits.
 * `shouldReconnect` is the caller's signal for whether it's worth retrying at all — pass a
 * check like "is this session still marked isStreaming" so a session with nothing left to
 * say doesn't get retried forever.
 */

import { openSessionStream } from '@/lib/api/services'

export interface SessionStreamHandle {
  readonly url: string
  readonly readyState: number
  close(): void
}

export type ManagedStreamStatus = 'connected' | 'disconnected' | 'error'

interface ManagedSessionStreamOptions {
  onEvent: (event: MessageEvent) => void
  onStatusChange: (status: ManagedStreamStatus) => void
  /** Called before each reconnect attempt; return false to stop retrying. */
  shouldReconnect: () => boolean
  maxAttempts?: number
}

const BASE_DELAY_MS = 1000
const MAX_DELAY_MS = 16000

export function openManagedSessionStream(
  sessionId: string,
  options: ManagedSessionStreamOptions
): SessionStreamHandle {
  const maxAttempts = options.maxAttempts ?? 5
  let current: EventSource | null = null
  let closed = false
  let attempt = 0
  let retryTimer: ReturnType<typeof setTimeout> | null = null

  const connect = () => {
    current = openSessionStream(
      sessionId,
      options.onEvent,
      () => {
        if (closed) return
        options.onStatusChange('disconnected')

        if (!options.shouldReconnect() || attempt >= maxAttempts) {
          options.onStatusChange('error')
          return
        }
        attempt += 1
        const delay = Math.min(BASE_DELAY_MS * 2 ** (attempt - 1), MAX_DELAY_MS)
        retryTimer = setTimeout(connect, delay)
      },
      false,
      () => {
        attempt = 0
        options.onStatusChange('connected')
      }
    )
  }

  connect()

  return {
    get url() {
      return current?.url ?? ''
    },
    get readyState() {
      return current?.readyState ?? EventSource.CLOSED
    },
    close() {
      closed = true
      if (retryTimer) clearTimeout(retryTimer)
      current?.close()
    },
  }
}
