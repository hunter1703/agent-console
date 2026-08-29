/**
 * Chat State Store
 * 
 * Zustand store for managing chat-specific state including active sessions,
 * messages, streaming state, and multi-agent session management.
 */

import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import { DEV_CONFIG } from '@/lib/config/env'
import type { Session, Message } from '@/lib/api/types'
import type { MessageAttachment } from '@/lib/api/types'
import type { Plan, Task } from '@/types/planning'
import type { SessionStreamHandle } from '@/lib/sse/managedStream'

// ============================================================================
// Types
// ============================================================================

export type TimelineItemType = 'message' | 'tool_call' | 'plan' | 'interrupt' | 'correction' | 'reasoning'

export interface TimelineItem {
  type: TimelineItemType
  id: string
  /** For interrupts linked to a tool call, the tool call's ID. */
  linkedId?: string
  /** For message items: the sender role. Used to correctly order user messages. */
  role?: 'user' | 'assistant'
  /** The agentId that produced this item — used for correct attribution in multi-agent sessions. */
  agentId?: string
}

export interface ChatSession extends Session {
  messages: Message[]
  isStreaming: boolean
  typingIndicator?: {
    visible: boolean
    agentName?: string
  }
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error'
  lastActivity: string
  // Per-session widget state — scoped here so switching sessions doesn't bleed widgets across tabs
  // Interrupts are NOT tracked here — that's owned entirely by useInterruptStore
  // (lib/stores/interruptStore.ts), which is what lib/sse/handler.ts actually writes to.
  toolCalls: Record<string, ActiveToolCall>
  corrections: Record<string, CorrectionEvent>
  activePlan: Plan | null
  timeline: TimelineItem[]
}

export interface ActiveToolCall {
  toolCallId: string
  toolName: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  arguments?: Record<string, unknown>
  result?: any
  startTime: string
  endTime?: string
  parentMessageId?: string
  agentId?: string
}

export interface CorrectionEvent {
  correctionId: string
  correctionType: string
  code: string
  message: string
  timestamp: number
}

export interface StreamingMessage {
  messageId: string
  role: 'assistant' | 'user' | 'system'
  content: string
  isComplete: boolean
  toolCalls: ActiveToolCall[]
  reasoning?: {
    blockId: string
    thoughts: Array<{
      thoughtId: string
      content: string
      isComplete: boolean
    }>
    isComplete: boolean
  }[]
}

export interface ChatState {
  // Pending attachments: keyed by messageId, holds attachments that arrived before
  // the message was committed (i.e. before TEXT_MESSAGE_END).
  pendingAttachments: Record<string, MessageAttachment[]>

  // Session management
  sessions: Record<string, ChatSession>
  activeSessionId: string | null
  sessionTabs: string[]
  
  // Message state
  streamingMessages: Record<string, StreamingMessage>
  
  // UI state
  messageInput: string
  isInputDisabled: boolean
  scrollToBottom: boolean
  
  // SSE connection
  sseConnection: SessionStreamHandle | null

  // Actions
  setActiveSession: (sessionId: string | null) => void
  addSession: (session: ChatSession) => void
  updateSession: (sessionId: string, updates: Partial<ChatSession>) => void
  removeSession: (sessionId: string) => void
  /** Dedup-append a session id to sessionTabs (e.g. a spawned child session). */
  addSessionTab: (sessionId: string) => void
  
  // Message actions
  addMessage: (sessionId: string, message: Message) => void
  updateMessage: (sessionId: string, messageId: string, updates: Partial<Message>) => void
  startStreamingMessage: (messageId: string, role: 'assistant' | 'user' | 'system') => void
  appendToStreamingMessage: (messageId: string, content: string) => void
  completeStreamingMessage: (messageId: string) => void
  /** Commit any in-progress streaming messages to the session on stream close. */
  commitIncompleteStreamingMessages: (sessionId: string) => void
  addReasoningBlock: (messageId: string, blockId: string) => void
  appendToReasoningBlock: (messageId: string, blockId: string, thoughtId: string, content: string) => void
  completeReasoningBlock: (messageId: string, blockId: string) => void
  
  // Tool call actions
  startToolCall: (sessionId: string, toolCall: Omit<ActiveToolCall, 'startTime'>) => void
  updateToolCall: (sessionId: string, toolCallId: string, updates: Partial<ActiveToolCall>) => void
  completeToolCall: (sessionId: string, toolCallId: string, result: any) => void

  // Correction actions
  addCorrectionEvent: (sessionId: string, correction: Omit<CorrectionEvent, 'timestamp'>) => void
  removeCorrectionEvent: (sessionId: string, correctionId: string) => void

  // Attachment actions
  addAttachmentToMessage: (sessionId: string, messageId: string, attachment: MessageAttachment) => void
  /** Stage an attachment for a message that hasn't been committed yet. */
  stagePendingAttachment: (messageId: string, attachment: MessageAttachment) => void
  /** Drain and return all pending attachments for a messageId, clearing them from the map. */
  drainPendingAttachments: (messageId: string) => MessageAttachment[]

  // Timeline actions
  /**
   * Add an item to the session timeline.
   * - `afterId`: insert immediately after the item with this id (used for linked confirmations).
   * - Otherwise appended in arrival order, which is always chronological order — the backend
   *   guarantees events within a session are totally ordered and that a turn's user-message
   *   event is emitted before that turn's own tool-call events, live or on replay.
   */
  addTimelineItem: (sessionId: string, item: TimelineItem, afterId?: string) => void
  clearTimeline: (sessionId: string) => void

  // Planning actions
  setActivePlan: (sessionId: string, plan: Plan) => void
  updateActivePlan: (sessionId: string, updates: Partial<Plan>) => void
  upsertPlanTask: (sessionId: string, task: Task) => void
  updatePlanTask: (sessionId: string, taskId: string, updates: Partial<Task>) => void
  
  // Input actions
  setMessageInput: (input: string) => void
  setInputDisabled: (disabled: boolean) => void
  
  // SSE actions
  setSSEConnection: (connection: SessionStreamHandle | null) => void

  // Utility actions
  getActiveSession: () => ChatSession | null
  getSessionMessages: (sessionId: string) => Message[]
  clearSession: (sessionId: string) => void
  clearAllSessions: () => void
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useChatStore = create<ChatState>()(
  devtools(
    subscribeWithSelector(
      (set, get) => ({
        // Initial state
        sessions: {},
        activeSessionId: null,
        sessionTabs: [],
        streamingMessages: {},
        pendingAttachments: {},
        messageInput: '',
        isInputDisabled: false,
        scrollToBottom: false,
        sseConnection: null,

        // Session actions
        setActiveSession: (sessionId) => {
          set({ activeSessionId: sessionId })
        },
        
        addSession: (session) => {
          set((state) => ({
            sessions: {
              ...state.sessions,
              [session.sessionId]: {
                ...session,
                toolCalls: session.toolCalls ?? {},
                corrections: session.corrections ?? {},
                activePlan: session.activePlan ?? null,
                timeline: session.timeline ?? [],
              },
            },
            sessionTabs: state.sessionTabs.includes(session.sessionId)
              ? state.sessionTabs
              : [...state.sessionTabs, session.sessionId],
          }))
        },
        
        updateSession: (sessionId, updates) => {
          set((state) => ({
            sessions: {
              ...state.sessions,
              [sessionId]: state.sessions[sessionId]
                ? { ...state.sessions[sessionId], ...updates }
                : state.sessions[sessionId],
            },
          }))
        },
        
        removeSession: (sessionId) => {
          set((state) => {
            const { [sessionId]: removed, ...remainingSessions } = state.sessions
            return {
              sessions: remainingSessions,
              sessionTabs: state.sessionTabs.filter(id => id !== sessionId),
              activeSessionId: state.activeSessionId === sessionId
                ? state.sessionTabs.find(id => id !== sessionId) || null
                : state.activeSessionId,
            }
          })
        },

        addSessionTab: (sessionId) => {
          set((state) =>
            state.sessionTabs.includes(sessionId)
              ? state
              : { sessionTabs: [...state.sessionTabs, sessionId] }
          )
        },
        
        // Message actions
        addMessage: (sessionId, message) => {
          set((state) => {
            const session = state.sessions[sessionId]
            if (!session) {
              console.log('addMessage: Session not found:', sessionId)
              return state
            }
            
            const msgId = message.messageId || message.id
            
            console.log('addMessage: Adding message:', {
              sessionId,
              messageId: msgId,
              role: message.role,
              content: message.content.substring(0, 50),
              currentMessageCount: session.messages.length,
            })
            
            // Idempotency guard: never add the same messageId twice. This defends
            // against SSE event replay resending a message that is already committed
            // to the session, e.g. after a reconnect replays history from scratch.
            if (session.messages.some(m => (m.messageId || m.id) === msgId)) {
              console.log('addMessage: Skipping duplicate messageId:', msgId)
              return state
            }

            // Check if this is a backend user message that should replace a temp message
            // Backend user messages have real IDs, temp messages have temp-user-* IDs
            let updatedMessages = session.messages
            let updatedTimeline = session.timeline ?? []

            if (message.role === 'user' && !msgId.startsWith('temp-user-')) {
              // Match the OLDEST unresolved temp message with matching content — not just the
              // most recent one. Because the backend only ever replays a session's first user
              // message (later turns' real echoes never arrive), several optimistic temp-user-*
              // placeholders can be pending at once; matching only the most recent one means an
              // earlier turn's real message would never find its placeholder (they'd end up as
              // two separate bubbles: the orphaned temp one and a freshly-inserted real one).
              const tempMessageIndex = session.messages.findIndex(
                (msg) =>
                  msg.role === 'user' &&
                  msg.messageId.startsWith('temp-user-') &&
                  msg.content === message.content
              )

              if (tempMessageIndex >= 0) {
                const tempMessage = session.messages[tempMessageIndex]
                console.log('addMessage: Replacing temp user message with backend message:', {
                  tempId: tempMessage.messageId,
                  backendId: msgId,
                })
                // Remove the temp message and update the timeline entry to use the real ID
                updatedMessages = [
                  ...session.messages.slice(0, tempMessageIndex),
                  ...session.messages.slice(tempMessageIndex + 1),
                ]
                updatedTimeline = updatedTimeline.map((t) =>
                  t.type === 'message' && t.id === tempMessage.messageId ? { ...t, id: msgId } : t
                )
              }
            }

            return {
              sessions: {
                ...state.sessions,
                [sessionId]: {
                  ...session,
                  messages: [...updatedMessages, message],
                  timeline: updatedTimeline,
                  lastActivity: new Date().toISOString(),
                },
              },
              scrollToBottom: true,
            }
          })
        },
        
        updateMessage: (sessionId, messageId, updates) => {
          set((state) => {
            const session = state.sessions[sessionId]
            if (!session) return state
            
            return {
              sessions: {
                ...state.sessions,
                [sessionId]: {
                  ...session,
                  messages: session.messages.map(msg =>
                    msg.messageId === messageId ? { ...msg, ...updates } : msg
                  ),
                },
              },
            }
          })
        },
        
        startStreamingMessage: (messageId, role) => {
          set((state) => ({
            streamingMessages: {
              ...state.streamingMessages,
              [messageId]: {
                messageId,
                role,
                content: '',
                isComplete: false,
                toolCalls: [],
              },
            },
          }))
        },
        
        appendToStreamingMessage: (messageId, content) => {
          set((state) => {
            const message = state.streamingMessages[messageId]
            if (!message) return state
            
            return {
              streamingMessages: {
                ...state.streamingMessages,
                [messageId]: {
                  ...message,
                  content: message.content + content,
                },
              },
            }
          })
        },
        
        completeStreamingMessage: (messageId) => {
          set((state) => {
            const message = state.streamingMessages[messageId]
            if (!message) return state

            const { [messageId]: completed, ...remainingMessages } = state.streamingMessages

            return {
              streamingMessages: remainingMessages,
              scrollToBottom: true,
            }
          })
        },

        commitIncompleteStreamingMessages: (sessionId) => {
          set((state) => {
            const session = state.sessions[sessionId]
            if (!session) return state

            // streamingMessages is a single global map shared by every open session/tab (a
            // streaming message carries no sessionId of its own), so this must only pick out
            // entries that actually belong to THIS session's timeline — otherwise a disconnect
            // on one session would wrongly sweep up (and attribute to it) whatever another
            // session/tab happens to be mid-stream on right now, corrupting both.
            const timelineIds = new Set(session.timeline.map((t) => t.id))
            const ownEntries = Object.entries(state.streamingMessages).filter(([id]) =>
              timelineIds.has(id)
            )
            if (ownEntries.length === 0) {
              // Nothing of this session's was mid-stream, but the caller is reporting this
              // session's connection as done for good — still clear its streaming flag so
              // the typing indicator doesn't spin forever.
              return session.isStreaming
                ? { sessions: { ...state.sessions, [sessionId]: { ...session, isStreaming: false } } }
                : state
            }

            const now = new Date().toISOString()
            const additionalMessages: Message[] = ownEntries
              .filter(([, msg]) => msg.content.trim().length > 0)
              .map(([, msg]) => ({
                id: msg.messageId,
                messageId: msg.messageId,
                sessionId,
                role: msg.role as Message['role'],
                content: msg.content,
                createdTime: now,
                updatedTime: now,
              }))

            const remainingStreamingMessages = { ...state.streamingMessages }
            for (const [id] of ownEntries) delete remainingStreamingMessages[id]

            return {
              streamingMessages: remainingStreamingMessages,
              sessions: {
                ...state.sessions,
                [sessionId]: {
                  ...session,
                  messages:
                    additionalMessages.length > 0
                      ? [...session.messages, ...additionalMessages]
                      : session.messages,
                  isStreaming: false,
                },
              },
            }
          })
        },

        addReasoningBlock: (messageId, blockId) => {
          set((state) => {
            // A reasoning block has no preceding TEXT_MESSAGE_START, so it gets its own
            // streamingMessages entry (keyed by the reasoning block's own id) rather than
            // attaching to an existing one.
            const message: StreamingMessage = state.streamingMessages[messageId] ?? {
              messageId,
              role: 'assistant',
              content: '',
              isComplete: false,
              toolCalls: [],
            }
            return {
              streamingMessages: {
                ...state.streamingMessages,
                [messageId]: {
                  ...message,
                  reasoning: [
                    ...(message.reasoning ?? []),
                    { blockId, thoughts: [], isComplete: false },
                  ],
                },
              },
            }
          })
        },

        appendToReasoningBlock: (messageId, blockId, thoughtId, content) => {
          set((state) => {
            const message = state.streamingMessages[messageId]
            if (!message) return state
            const reasoning = message.reasoning ?? []
            const blockIndex = reasoning.findIndex((b) => b.blockId === blockId)
            if (blockIndex === -1) return state
            const block = reasoning[blockIndex]
            const thoughtIndex = block.thoughts.findIndex((t) => t.thoughtId === thoughtId)
            const updatedThoughts =
              thoughtIndex === -1
                ? [...block.thoughts, { thoughtId, content, isComplete: false }]
                : block.thoughts.map((t, i) =>
                    i === thoughtIndex ? { ...t, content: t.content + content } : t
                  )
            const updatedReasoning = reasoning.map((b, i) =>
              i === blockIndex ? { ...b, thoughts: updatedThoughts } : b
            )
            return {
              streamingMessages: {
                ...state.streamingMessages,
                [messageId]: { ...message, reasoning: updatedReasoning },
              },
            }
          })
        },

        completeReasoningBlock: (messageId, blockId) => {
          set((state) => {
            const message = state.streamingMessages[messageId]
            if (!message?.reasoning) return state
            return {
              streamingMessages: {
                ...state.streamingMessages,
                [messageId]: {
                  ...message,
                  reasoning: message.reasoning.map((b) =>
                    b.blockId === blockId ? { ...b, isComplete: true } : b
                  ),
                },
              },
            }
          })
        },

        // Tool call actions
        startToolCall: (sessionId, toolCall) => {
          set((state) => {
            const session = state.sessions[sessionId]
            if (!session) return state
            return {
              sessions: {
                ...state.sessions,
                [sessionId]: {
                  ...session,
                  toolCalls: {
                    ...session.toolCalls,
                    [toolCall.toolCallId]: { ...toolCall, startTime: new Date().toISOString() },
                  },
                },
              },
            }
          })
        },

        updateToolCall: (sessionId, toolCallId, updates) => {
          set((state) => {
            const session = state.sessions[sessionId]
            const toolCall = session?.toolCalls[toolCallId]
            if (!session || !toolCall) return state
            return {
              sessions: {
                ...state.sessions,
                [sessionId]: {
                  ...session,
                  toolCalls: {
                    ...session.toolCalls,
                    [toolCallId]: { ...toolCall, ...updates },
                  },
                },
              },
            }
          })
        },

        completeToolCall: (sessionId, toolCallId, result) => {
          set((state) => {
            const session = state.sessions[sessionId]
            const toolCall = session?.toolCalls[toolCallId]
            if (!session || !toolCall) return state
            return {
              sessions: {
                ...state.sessions,
                [sessionId]: {
                  ...session,
                  toolCalls: {
                    ...session.toolCalls,
                    [toolCallId]: {
                      ...toolCall,
                      result,
                      status: 'completed',
                      endTime: new Date().toISOString(),
                    },
                  },
                },
              },
            }
          })
        },

        // Correction actions
        addCorrectionEvent: (sessionId, correction) => {
          set((state) => {
            const session = state.sessions[sessionId]
            if (!session) return state
            return {
              sessions: {
                ...state.sessions,
                [sessionId]: {
                  ...session,
                  corrections: {
                    ...session.corrections,
                    [correction.correctionId]: { ...correction, timestamp: Date.now() },
                  },
                },
              },
            }
          })
        },

        removeCorrectionEvent: (sessionId, correctionId) => {
          set((state) => {
            const session = state.sessions[sessionId]
            if (!session) return state
            const { [correctionId]: _removed, ...remaining } = session.corrections
            return {
              sessions: {
                ...state.sessions,
                [sessionId]: { ...session, corrections: remaining },
              },
            }
          })
        },

        // Attachment actions
        addAttachmentToMessage: (sessionId, messageId, attachment) => {
          set((state) => {
            const session = state.sessions[sessionId]
            if (!session) return state
            const messages = session.messages.map((msg) => {
              if ((msg.messageId || msg.id) !== messageId) return msg
              const existing = msg.attachments ?? []
              // Deduplicate by source path
              if (existing.some((a) => a.source === attachment.source)) return msg
              return { ...msg, attachments: [...existing, attachment] }
            })
            return {
              sessions: {
                ...state.sessions,
                [sessionId]: { ...session, messages },
              },
            }
          })
        },

        stagePendingAttachment: (messageId, attachment) => {
          set((state) => {
            const existing = state.pendingAttachments[messageId] ?? []
            if (existing.some((a) => a.source === attachment.source)) return state
            return {
              pendingAttachments: {
                ...state.pendingAttachments,
                [messageId]: [...existing, attachment],
              },
            }
          })
        },

        drainPendingAttachments: (messageId) => {
          const attachments = get().pendingAttachments[messageId] ?? []
          if (attachments.length > 0) {
            set((state) => {
              const { [messageId]: _removed, ...rest } = state.pendingAttachments
              return { pendingAttachments: rest }
            })
          }
          return attachments
        },

        // Timeline actions
        addTimelineItem: (sessionId, item, afterId) => {
          set((state) => {
            const session = state.sessions[sessionId]
            if (!session) return state
            const timeline = session.timeline ?? []
            // Dedup: never add the same id+type twice
            if (timeline.some((t) => t.id === item.id && t.type === item.type)) {
              return state
            }

            if (afterId) {
              // Find the anchor item, then advance past any items already linked to the same parent
              // so repeated interrupts for the same tool call stack in arrival order.
              const baseIdx = timeline.findIndex((t) => t.id === afterId)
              let insertAt = baseIdx === -1 ? timeline.length : baseIdx + 1
              while (insertAt < timeline.length && timeline[insertAt].linkedId === afterId) {
                insertAt++
              }
              const updated = [...timeline.slice(0, insertAt), item, ...timeline.slice(insertAt)]
              return { sessions: { ...state.sessions, [sessionId]: { ...session, timeline: updated } } }
            }

            return {
              sessions: { ...state.sessions, [sessionId]: { ...session, timeline: [...timeline, item] } },
            }
          })
        },

        clearTimeline: (sessionId) => {
          set((state) => {
            const session = state.sessions[sessionId]
            if (!session) return state
            return { sessions: { ...state.sessions, [sessionId]: { ...session, timeline: [] } } }
          })
        },

        // Planning actions
        setActivePlan: (sessionId, plan) => {
          set((state) => {
            const session = state.sessions[sessionId]
            if (!session) return state
            return {
              sessions: { ...state.sessions, [sessionId]: { ...session, activePlan: plan } },
            }
          })
        },

        updateActivePlan: (sessionId, updates) => {
          set((state) => {
            const session = state.sessions[sessionId]
            if (!session?.activePlan) return state
            return {
              sessions: {
                ...state.sessions,
                [sessionId]: { ...session, activePlan: { ...session.activePlan, ...updates } },
              },
            }
          })
        },

        upsertPlanTask: (sessionId, task) => {
          set((state) => {
            const session = state.sessions[sessionId]
            if (!session?.activePlan) return state
            const exists = session.activePlan.tasks.some((t) => t.taskId === task.taskId)
            const tasks = exists
              ? session.activePlan.tasks.map((t) => (t.taskId === task.taskId ? task : t))
              : [...session.activePlan.tasks, task]
            return {
              sessions: {
                ...state.sessions,
                [sessionId]: {
                  ...session,
                  activePlan: { ...session.activePlan, tasks },
                },
              },
            }
          })
        },

        updatePlanTask: (sessionId, taskId, updates) => {
          set((state) => {
            const session = state.sessions[sessionId]
            if (!session?.activePlan) return state
            return {
              sessions: {
                ...state.sessions,
                [sessionId]: {
                  ...session,
                  activePlan: {
                    ...session.activePlan,
                    tasks: session.activePlan.tasks.map((t) =>
                      t.taskId === taskId ? { ...t, ...updates } : t
                    ),
                  },
                },
              },
            }
          })
        },

        // Input actions
        setMessageInput: (input) => {
          set({ messageInput: input })
        },
        
        setInputDisabled: (disabled) => {
          set({ isInputDisabled: disabled })
        },
        
        // SSE actions
        setSSEConnection: (connection) => {
          const { sseConnection: existing } = get()
          if (existing) existing.close()
          set({ sseConnection: connection })
        },

        // Utility actions
        getActiveSession: () => {
          const state = get()
          return state.activeSessionId ? state.sessions[state.activeSessionId] || null : null
        },
        
        getSessionMessages: (sessionId) => {
          const state = get()
          return state.sessions[sessionId]?.messages || []
        },
        
        clearSession: (sessionId) => {
          set((state) => {
            const session = state.sessions[sessionId]
            if (!session) return state
            return {
              sessions: {
                ...state.sessions,
                [sessionId]: {
                  ...session,
                  messages: [],
                  isStreaming: false,
                  typingIndicator: undefined,
                  toolCalls: {},
                  corrections: {},
                  activePlan: null,
                  timeline: [],
                },
              },
            }
          })
        },

        clearAllSessions: () => {
          set({
            sessions: {},
            activeSessionId: null,
            sessionTabs: [],
            streamingMessages: {},
            messageInput: '',
            isInputDisabled: false,
          })
        },
      })
    ),
    {
      name: 'chat-store',
      enabled: DEV_CONFIG.debug,
    }
  )
)

// ============================================================================
// Convenience Hooks
// ============================================================================

// Stable empty references to prevent unnecessary re-renders from reference inequality
const EMPTY_MESSAGES: Message[] = []
const EMPTY_TOOL_CALLS: Record<string, ActiveToolCall> = {}
const EMPTY_CORRECTIONS: Record<string, CorrectionEvent> = {}

/**
 * Hook for active session
 */
export function useActiveSession() {
  const activeSessionId = useChatStore(state => state.activeSessionId)
  const sessions = useChatStore(state => state.sessions)
  const setActiveSession = useChatStore(state => state.setActiveSession)
  
  const activeSession = activeSessionId ? sessions[activeSessionId] : null
  
  return {
    activeSession,
    activeSessionId,
    setActiveSession,
  }
}

/**
 * Hook for session messages
 */
export function useSessionMessages(sessionId?: string) {
  const activeSessionId = useChatStore(state => state.activeSessionId)
  const addMessage = useChatStore(state => state.addMessage)
  const updateMessage = useChatStore(state => state.updateMessage)
  
  const targetSessionId = sessionId || activeSessionId
  
  // Subscribe directly to the session's messages array
  // Use EMPTY_MESSAGES constant to prevent new array creation
  const messages = useChatStore(state => {
    if (!targetSessionId || !state.sessions[targetSessionId]) {
      return EMPTY_MESSAGES
    }
    return state.sessions[targetSessionId].messages
  })
  
  return {
    messages,
    addMessage: targetSessionId 
      ? (message: Message) => addMessage(targetSessionId, message)
      : undefined,
    updateMessage: targetSessionId
      ? (messageId: string, updates: Partial<Message>) => 
          updateMessage(targetSessionId, messageId, updates)
      : undefined,
  }
}

/**
 * Hook for streaming state
 */
export function useStreamingState() {
  const streamingMessages = useChatStore(state => state.streamingMessages)
  const startStreamingMessage = useChatStore(state => state.startStreamingMessage)
  const appendToStreamingMessage = useChatStore(state => state.appendToStreamingMessage)
  const completeStreamingMessage = useChatStore(state => state.completeStreamingMessage)
  const activeSessionId = useChatStore(state => state.activeSessionId)
  const sessionIsStreaming = useChatStore(state =>
    activeSessionId ? (state.sessions[activeSessionId]?.isStreaming ?? false) : false
  )

  // True when there are active streaming messages OR the session reports it is
  // streaming (e.g. between tool calls when no text delta has arrived yet).
  const isStreaming = Object.keys(streamingMessages).length > 0 || sessionIsStreaming

  return {
    streamingMessages,
    isStreaming,
    startStreamingMessage,
    appendToStreamingMessage,
    completeStreamingMessage,
  }
}

/**
 * Hook for tool calls — scoped to the given session (or active session).
 */
export function useToolCalls(sessionId?: string) {
  const activeSessionId = useChatStore((state) => state.activeSessionId)
  const targetId = sessionId ?? activeSessionId
  const toolCalls = useChatStore((state) =>
    targetId ? (state.sessions[targetId]?.toolCalls ?? EMPTY_TOOL_CALLS) : EMPTY_TOOL_CALLS
  )
  const startToolCall = useChatStore((state) => state.startToolCall)
  const updateToolCall = useChatStore((state) => state.updateToolCall)
  const completeToolCall = useChatStore((state) => state.completeToolCall)

  return {
    activeToolCalls: toolCalls,
    startToolCall,
    updateToolCall,
    completeToolCall,
  }
}

const EMPTY_TIMELINE: TimelineItem[] = []

/**
 * Hook for the timeline — ordered list of item IDs in SSE arrival order.
 */
export function useTimeline(sessionId?: string) {
  const activeSessionId = useChatStore((state) => state.activeSessionId)
  const targetId = sessionId ?? activeSessionId
  return useChatStore((state) =>
    targetId ? (state.sessions[targetId]?.timeline ?? EMPTY_TIMELINE) : EMPTY_TIMELINE
  )
}

/**
 * Hook for correction events — scoped to the given session (or active session).
 * Returns pre-bound action wrappers so callers don't need to pass sessionId.
 */
export function useCorrectionEvents(sessionId?: string) {
  const activeSessionId = useChatStore((state) => state.activeSessionId)
  const targetId = sessionId ?? activeSessionId
  const correctionEvents = useChatStore((state) =>
    targetId ? (state.sessions[targetId]?.corrections ?? EMPTY_CORRECTIONS) : EMPTY_CORRECTIONS
  )
  const _addCorrectionEvent = useChatStore((state) => state.addCorrectionEvent)
  const _removeCorrectionEvent = useChatStore((state) => state.removeCorrectionEvent)

  return {
    correctionEvents,
    addCorrectionEvent: (correction: Omit<CorrectionEvent, 'correctionId' | 'timestamp'>) => {
      if (!targetId) return undefined
      const correctionId = `correction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      return _addCorrectionEvent(targetId, { ...correction, correctionId })
    },
    removeCorrectionEvent: (correctionId: string) =>
      targetId ? _removeCorrectionEvent(targetId, correctionId) : undefined,
  }
}