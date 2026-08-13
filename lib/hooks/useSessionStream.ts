'use client'

import { useEffect, useRef } from 'react'
import { useChatStore, useActiveSession, type ChatSession } from '@/lib/store/chat'
import type { Session } from '@/lib/api/types'

interface UseSessionStreamResult {
  /**
   * Call when a caller (e.g. a just-invoked new chat) is about to navigate to a session
   * URL itself, so the "no sessionId in URL" cleanup effect doesn't tear down the session
   * during the render(s) between setting it active and the URL param actually updating.
   */
  markNavigatingToSession: () => void
}

/**
 * Owns the GET /v1/session/{id}/stream lifecycle for the chat page: opens a reconnecting
 * stream whenever the URL resolves to a session that isn't already the active one, and
 * tears the connection down when navigating away from any session entirely.
 *
 * Split out of app/chat/page.tsx because this effect's self-triggering re-run (it calls
 * setActiveSession, which is itself one of its own dependencies) is exactly the kind of
 * interaction that's easy to regress with an unrelated change elsewhere in a large
 * component — isolating it keeps future diffs to this logic small and reviewable on
 * their own.
 */
export function useSessionStream(
  session: Session | undefined,
  sessionId: string | null
): UseSessionStreamResult {
  const { activeSession, setActiveSession } = useActiveSession()

  // Set while a caller is establishing a session URL itself (see markNavigatingToSession).
  const isNavigatingToSessionRef = useRef(false)

  // Tracks which session the most recent stream-open attempt targeted, so a stale attempt
  // can detect it's been superseded by a newer one. This effect's own setActiveSession()
  // call is a dependency of the effect, so it legitimately re-runs right after opening a
  // stream — comparing against this ref (rather than a plain per-run cancelled flag) means
  // that self-triggered re-run doesn't cancel the very stream-open it just kicked off,
  // while a genuine switch to a different session still correctly supersedes it.
  const latestStreamRequestSessionIdRef = useRef<string | null>(null)

  // True only across the hook's actual mount lifetime, not per-effect-run — guards the
  // rare case of the component unmounting while a stream-open's dynamic imports are still
  // in flight.
  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  // Handle session creation/loading
  useEffect(() => {
    // Only process session if we have both session data AND sessionId in URL
    // This prevents processing stale session data after navigation
    if (session && sessionId && session.id === sessionId) {
      // Check if this is a different session than the current active one
      const isDifferentSession = !activeSession || activeSession.sessionId !== session.id

      if (isDifferentSession) {
        // Navigation to a real session URL has landed — clear the flag that
        // was suppressing the "no sessionId" cleanup effect during the transition.
        isNavigatingToSessionRef.current = false

        const chatStore = useChatStore.getState()

        // If there is already a live connection to this exact session (opened by
        // handleSendMessage moments before the URL update triggered this effect),
        // do not close and reopen it — that would kill the active stream mid-flight.
        const existingConn = chatStore.sseConnection
        const alreadyConnectedToThisSession =
          existingConn !== null &&
          existingConn.readyState !== EventSource.CLOSED &&
          existingConn.url?.includes(session.id)

        if (alreadyConnectedToThisSession) {
          // SSE stream already open for this session (opened by handleSendMessage
          // before the URL update triggered this effect). Just ensure the active
          // session pointer is correct and leave the stream alone.
          setActiveSession(session.id)
          return
        }

        // Close any existing connection to a *different* session
        if (existingConn) {
          console.log('Closing previous SSE connection')
          existingConn.close()
          chatStore.setSSEConnection(null)
        }

        // Preserve any state already in the store for this session (e.g. user messages
        // added optimistically before the backend sessionId was known, and the event
        // index used for SSE deduplication). Without this, the effect overwrites the
        // migrated session on every router.replace, wiping the user message and
        // resetting the deduplication counter to -1, which causes the first run's
        // events to be re-processed on the second message send.
        const existingInStore = chatStore.sessions[session.id]

        // Add session to store and set as active
        const chatSession: ChatSession = {
          ...session,
          sessionId: session.id,
          messages: existingInStore?.messages ?? [],
          isStreaming: existingInStore?.isStreaming ?? false,
          connectionStatus: existingInStore?.connectionStatus ?? ('disconnected' as const),
          lastActivity: typeof session.updatedTime === 'string' ? session.updatedTime : new Date().toISOString(),
          messageCount: (session as any).messageCount || 0,
          status: (session.status as any) || 'ACTIVE',
          createdTime: typeof session.createdTime === 'string' ? session.createdTime : new Date().toISOString(),
          updatedTime: typeof session.updatedTime === 'string' ? session.updatedTime : new Date().toISOString(),
          toolCalls: existingInStore?.toolCalls ?? {},
          interrupts: existingInStore?.interrupts ?? {},
          corrections: existingInStore?.corrections ?? {},
          activePlan: existingInStore?.activePlan ?? null,
          timeline: existingInStore?.timeline ?? [],
        }

        chatStore.addSession(chatSession)
        setActiveSession(session.id)

        // Always open SSE stream to get session events (both historic and new).
        // Reconnects on drop as long as the session still looks like it has more to say
        // (isStreaming) — see lib/sse/managedStream.ts for why that's a safe condition.
        const targetSessionId = session.id
        latestStreamRequestSessionIdRef.current = targetSessionId
        const isSuperseded = () =>
          !mountedRef.current || latestStreamRequestSessionIdRef.current !== targetSessionId

        const openStreamForSession = async () => {
          try {
            const { getAGUIEventHandler } = await import('@/lib/sse/handler')
            const { openManagedSessionStream } = await import('@/lib/sse/managedStream')
            const { useInterruptStore } = await import('@/lib/stores/interruptStore')
            if (isSuperseded()) return
            const eventHandler = getAGUIEventHandler()

            // Clear interrupts and timeline so the replayed event stream is the sole source of truth
            useInterruptStore.getState().clearInterrupts()
            useChatStore.getState().clearTimeline(session.id)

            // The backend replays from event index 0 on every connection, so the handler's
            // dedup sets must also start fresh.
            eventHandler.resetSessionIndex(session.id)

            console.log('Opening SSE stream for session:', session.id, 'status:', session.status)
            const stream = openManagedSessionStream(session.id, {
              onEvent: (event) => eventHandler.handleSSEMessage(event, session.id),
              onStatusChange: (status) => {
                useChatStore.getState().updateSession(session.id, { connectionStatus: status })
                if (status === 'disconnected') {
                  useChatStore.getState().commitIncompleteStreamingMessages(session.id)
                }
              },
              shouldReconnect: () => useChatStore.getState().sessions[session.id]?.isStreaming === true,
            })

            if (isSuperseded()) {
              stream.close()
              return
            }
            useChatStore.getState().setSSEConnection(stream)
          } catch (error) {
            console.error('Failed to open SSE stream for session:', error)
          }
        }

        openStreamForSession()
      }
    }
  }, [session, sessionId, activeSession, setActiveSession])

  // Clear session state when navigating away from session URL
  useEffect(() => {
    // If we don't have a sessionId in URL but have an active session, clear it
    if (!sessionId && activeSession) {
      // Skip during new-session creation. handleSendMessage sets activeSession
      // to the real backend ID before router.replace() has a chance to update
      // useSearchParams(). The flag prevents these transitional renders from
      // tearing down the session that was just established.
      if (isNavigatingToSessionRef.current) return

      console.log('No sessionId in URL, clearing active session')
      const chatStore = useChatStore.getState()

      if (chatStore.sseConnection) {
        chatStore.sseConnection.close()
        chatStore.setSSEConnection(null)
      }

      chatStore.setActiveSession(null)
    }
  }, [sessionId, activeSession])

  return {
    markNavigatingToSession: () => {
      isNavigatingToSessionRef.current = true
    },
  }
}
