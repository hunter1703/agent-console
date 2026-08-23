/**
 * Regression tests derived from a real multi-turn conversation captured against the
 * story_agent example. Two backend quirks matter here:
 *
 * 1. The invoke stream (POST /v1/agent/{id}/invoke) and the GET session replay stream
 *    (/v1/session/{id}/stream) mint different raw ids for the exact same logical message —
 *    e.g. `msg-8085d177-8547cc9d-1` on invoke vs `msg-8085d177-8547cc9d-2` on replay — because
 *    each endpoint numbers its trailing counter independently. See lib/sse/id.ts.
 * 2. A GET-stream reconnect always replays the full historical event log from the start,
 *    resending TOOL_CALL_START/ARGS/END/RESULT for calls that already completed live.
 *
 * These tests feed the handler the same shapes seen on the wire twice — once as "live", once
 * as a "replay" with the trailing counters shifted the way the backend actually shifts them —
 * and assert the second pass is a safe no-op rather than a duplicate or a state regression.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { AGUIEventHandler } from '../handler'
import { useChatStore } from '../../store/chat'

function send(handler: AGUIEventHandler, sessionId: string, event: Record<string, unknown>) {
  handler.handleEvent(JSON.stringify({ timestamp: Date.now(), ...event }), sessionId)
}

describe('AGUIEventHandler replay safety', () => {
  const sessionId = 'thread-178dea78'

  beforeEach(() => {
    useChatStore.getState().clearAllSessions()
  })

  it('does not duplicate a text message replayed under a different raw id', () => {
    const handler = new AGUIEventHandler()
    const runId = 'e-af120361-cb94-4722-b6c4-ab118085d177'
    const author = { author: 'story_agent' }

    const emitTurn = (messageId: string) => {
      send(handler, sessionId, { type: 'RUN_STARTED', runId, threadId: sessionId, rawEvent: author })
      send(handler, sessionId, { type: 'TEXT_MESSAGE_START', messageId, role: 'assistant', rawEvent: author })
      send(handler, sessionId, { type: 'TEXT_MESSAGE_CHUNK', messageId, delta: 'Hi! How can I help you today?', rawEvent: author })
      send(handler, sessionId, { type: 'TEXT_MESSAGE_END', messageId, rawEvent: author })
      send(handler, sessionId, { type: 'RUN_FINISHED', runId, outcome: {}, rawEvent: author })
    }

    // Live: invoke stream numbers this message "-1".
    emitTurn('msg-8085d177-8547cc9d-1')
    // Reconnect: GET-stream replay renumbers the identical message "-2".
    emitTurn('msg-8085d177-8547cc9d-2')

    const session = useChatStore.getState().sessions[sessionId]
    const assistantMessages = session.messages.filter((m) => m.role === 'assistant')
    expect(assistantMessages).toHaveLength(1)
    expect(assistantMessages[0].content).toBe('Hi! How can I help you today?')
    expect(session.timeline.filter((t) => t.type === 'message' && t.role === 'assistant')).toHaveLength(1)
  })

  it('reinitializes a message that only partially streamed before a drop, instead of appending onto the stale partial text', () => {
    const handler = new AGUIEventHandler()
    const messageId = 'msg-7dde494f-1c5d67b6-1'
    const author = { author: 'story_phase_1_theme' }

    send(handler, sessionId, { type: 'RUN_STARTED', runId: 'e-f114a56d', threadId: sessionId, rawEvent: author })
    send(handler, sessionId, { type: 'TEXT_MESSAGE_START', messageId, role: 'assistant', rawEvent: author })
    send(handler, sessionId, { type: 'TEXT_MESSAGE_CHUNK', messageId, delta: 'CORE THEME: In a kingd', rawEvent: author })
    // Connection drops here — no TEXT_MESSAGE_END, message never committed.

    // Reconnect replay resends the message as a single START + one full-text chunk (not just
    // the missing remainder), under the SAME id since this one never got as far as a
    // stream-specific renumbering.
    send(handler, sessionId, { type: 'TEXT_MESSAGE_START', messageId, role: 'assistant', rawEvent: author })
    send(handler, sessionId, {
      type: 'TEXT_MESSAGE_CHUNK',
      messageId,
      delta: 'CORE THEME: In a kingdom under constant siege from external threats, the valiant King must balance his duty to protect his people with his desire for peace.',
      rawEvent: author,
    })
    send(handler, sessionId, { type: 'TEXT_MESSAGE_END', messageId, rawEvent: author })

    const session = useChatStore.getState().sessions[sessionId]
    expect(session.messages).toHaveLength(1)
    expect(session.messages[0].content).toBe(
      'CORE THEME: In a kingdom under constant siege from external threats, the valiant King must balance his duty to protect his people with his desire for peace.'
    )
  })

  it('does not revert an already-completed tool call to "running" when its ARGS/END/RESULT are replayed', () => {
    const handler = new AGUIEventHandler()
    const toolCallId = 'call_0i1v5b1i'
    const author = { author: 'story_agent' }
    const args = JSON.stringify({
      agent_id: 'story_phase_1_theme',
      goal: 'Write a short story about a valiant king.',
      message: 'Begin the first phase of story generation.',
    })

    const emitToolCall = () => {
      send(handler, sessionId, { type: 'TOOL_CALL_START', toolCallId, toolCallName: 'spawn_agent', rawEvent: author })
      send(handler, sessionId, { type: 'TOOL_CALL_ARGS', toolCallId, delta: args, rawEvent: author })
      send(handler, sessionId, { type: 'TOOL_CALL_END', toolCallId, arguments: args, rawEvent: author })
      send(handler, sessionId, {
        type: 'TOOL_CALL_RESULT',
        toolCallId,
        messageId: 'toolresult-ba21e90d-45b5b93d-1',
        content: JSON.stringify({ child_session_id: 'eaed2e01-ab53-4d01-894c-c90e73a42fd5' }),
        rawEvent: author,
      })
    }

    // Need a session to exist first (RUN_STARTED normally creates it).
    send(handler, sessionId, { type: 'RUN_STARTED', runId: 'e-03568465', threadId: sessionId, rawEvent: author })

    emitToolCall() // live — reaches 'completed'

    // Record every status this tool call passes through while the replay resends its
    // already-finished history — the card should never visibly flicker back to "running".
    const statusesSeenDuringReplay: string[] = []
    const unsubscribe = useChatStore.subscribe((state) => {
      const status = state.sessions[sessionId]?.toolCalls[toolCallId]?.status
      if (status) statusesSeenDuringReplay.push(status)
    })
    emitToolCall() // GET-stream replay resends the same toolCallId's full history
    unsubscribe()

    expect(statusesSeenDuringReplay).not.toContain('running')

    const toolCall = useChatStore.getState().sessions[sessionId].toolCalls[toolCallId]
    expect(toolCall.status).toBe('completed')
    expect(toolCall.arguments).toEqual(JSON.parse(args))
  })

  it('reconciles a replayed user message with its optimistic echo instead of rendering both, even when a later turn is also pending', () => {
    const handler = new AGUIEventHandler()
    const store = useChatStore.getState()
    store.addSession({
      sessionId,
      agentId: 'story_agent',
      messages: [],
      isStreaming: false,
      connectionStatus: 'connected',
      lastActivity: new Date().toISOString(),
      toolCalls: {},
      interrupts: {},
      corrections: {},
      activePlan: null,
      timeline: [],
    } as any)

    // Turn 1: user hits send — app/chat/page.tsx adds an optimistic temp-user-* echo directly.
    store.addMessage(sessionId, {
      id: 'temp-user-1', messageId: 'temp-user-1', sessionId, role: 'user', content: 'hello',
      createdTime: new Date().toISOString(), updatedTime: new Date().toISOString(),
    } as any)
    store.addTimelineItem(sessionId, { type: 'message', id: 'temp-user-1', role: 'user' })

    // Turn 2: a second message is sent before turn 1 ever gets replayed back — this backend
    // never echoes turns after the first, so this temp entry is permanently "pending."
    store.addMessage(sessionId, {
      id: 'temp-user-2', messageId: 'temp-user-2', sessionId, role: 'user', content: 'write me a story',
      createdTime: new Date().toISOString(), updatedTime: new Date().toISOString(),
    } as any)
    store.addTimelineItem(sessionId, { type: 'message', id: 'temp-user-2', role: 'user' })

    // Now a GET-stream (re)connect replays turn 1's user message under its real backend id —
    // arriving well after turn 2's temp echo, so a "most recent temp" match would miss it.
    const author = { author: 'user' }
    send(handler, sessionId, { type: 'TEXT_MESSAGE_START', messageId: 'msg-8085d177-f3ee9cc2-1', role: 'user', rawEvent: author })
    send(handler, sessionId, { type: 'TEXT_MESSAGE_CHUNK', messageId: 'msg-8085d177-f3ee9cc2-1', delta: 'hello', rawEvent: author })
    send(handler, sessionId, { type: 'TEXT_MESSAGE_END', messageId: 'msg-8085d177-f3ee9cc2-1', rawEvent: author })

    const session = useChatStore.getState().sessions[sessionId]
    const helloMessages = session.messages.filter((m) => m.content === 'hello')
    expect(helloMessages).toHaveLength(1)
    expect(helloMessages[0].messageId).toBe('msg-8085d177-f3ee9cc2')
    expect(session.timeline.filter((t) => t.type === 'message')).toHaveLength(2)
    expect(session.timeline.some((t) => t.id === 'temp-user-1')).toBe(false)
    expect(session.timeline.some((t) => t.id === 'msg-8085d177-f3ee9cc2')).toBe(true)
    expect(session.timeline.some((t) => t.id === 'temp-user-2')).toBe(true)
  })

  it('does not splice a new turn\'s user message before an earlier, already-answered tool call', () => {
    const handler = new AGUIEventHandler()
    const author = { author: 'social_media_manager_agent' }

    send(handler, sessionId, { type: 'RUN_STARTED', runId: 'e-turn1', threadId: sessionId, rawEvent: author })

    // Turn 1 (user): "research latest news..." — its END arrives after the tool call, so
    // it goes through the insertBeforeTools path.
    send(handler, sessionId, { type: 'TEXT_MESSAGE_START', messageId: 'msg-research-1', role: 'user', rawEvent: { author: 'user' } })
    send(handler, sessionId, { type: 'TEXT_MESSAGE_CHUNK', messageId: 'msg-research-1', delta: 'research latest news and post', rawEvent: { author: 'user' } })
    send(handler, sessionId, { type: 'TEXT_MESSAGE_END', messageId: 'msg-research-1', rawEvent: { author: 'user' } })

    // Turn 1's tool call runs and completes.
    send(handler, sessionId, { type: 'TOOL_CALL_START', toolCallId: 'call-web-research', toolCallName: 'web_research', rawEvent: author })
    send(handler, sessionId, { type: 'TOOL_CALL_ARGS', toolCallId: 'call-web-research', delta: '{"query":"latest news"}', rawEvent: author })
    send(handler, sessionId, { type: 'TOOL_CALL_END', toolCallId: 'call-web-research', arguments: '{"query":"latest news"}', rawEvent: author })
    send(handler, sessionId, { type: 'TOOL_CALL_RESULT', toolCallId: 'call-web-research', messageId: 'toolresult-1', content: '{}', rawEvent: author })

    // Turn 1's assistant reply closes out the turn (asks a clarifying question).
    send(handler, sessionId, { type: 'TEXT_MESSAGE_START', messageId: 'msg-question-1', role: 'assistant', rawEvent: author })
    send(handler, sessionId, { type: 'TEXT_MESSAGE_CHUNK', messageId: 'msg-question-1', delta: 'Which angle should I post?', rawEvent: author })
    send(handler, sessionId, { type: 'TEXT_MESSAGE_END', messageId: 'msg-question-1', rawEvent: author })
    send(handler, sessionId, { type: 'RUN_FINISHED', runId: 'e-turn1', outcome: {}, rawEvent: author })

    // Turn 2 (user): "You decide and post" — a brand new turn, unrelated to turn 1's tool call.
    send(handler, sessionId, { type: 'RUN_STARTED', runId: 'e-turn2', threadId: sessionId, rawEvent: { author: 'user' } })
    send(handler, sessionId, { type: 'TEXT_MESSAGE_START', messageId: 'msg-decide-1', role: 'user', rawEvent: { author: 'user' } })
    send(handler, sessionId, { type: 'TEXT_MESSAGE_CHUNK', messageId: 'msg-decide-1', delta: 'You decide and post', rawEvent: { author: 'user' } })
    send(handler, sessionId, { type: 'TEXT_MESSAGE_END', messageId: 'msg-decide-1', rawEvent: { author: 'user' } })

    const session = useChatStore.getState().sessions[sessionId]
    const order = session.timeline.map((t) => t.id)
    // "You decide and post" must land after the already-answered tool call and its reply,
    // not spliced in front of them.
    expect(order.indexOf('msg-decide-1')).toBeGreaterThan(order.indexOf('call-web-research'))
    expect(order.indexOf('msg-decide-1')).toBeGreaterThan(order.indexOf('msg-question-1'))
    expect(order[order.length - 1]).toBe('msg-decide-1')
  })

  it('adds a spawned child session to sessionTabs immutably, so subscribers actually see it', () => {
    const handler = new AGUIEventHandler()
    const author = { author: 'story_agent' }
    const toolCallId = 'call_0i1v5b1i'

    send(handler, sessionId, { type: 'RUN_STARTED', runId: 'e-03568465', threadId: sessionId, rawEvent: author })
    send(handler, sessionId, { type: 'TOOL_CALL_START', toolCallId, toolCallName: 'spawn_agent', rawEvent: author })

    const tabsBeforeResult = useChatStore.getState().sessionTabs
    let sawUpdate = false
    const unsubscribe = useChatStore.subscribe((state) => {
      if (state.sessionTabs !== tabsBeforeResult) sawUpdate = true
    })

    send(handler, sessionId, {
      type: 'TOOL_CALL_RESULT',
      toolCallId,
      messageId: 'toolresult-ba21e90d-45b5b93d-1',
      content: JSON.stringify({ child_session_id: 'eaed2e01-ab53-4d01-894c-c90e73a42fd5' }),
      rawEvent: author,
    })
    unsubscribe()

    // A mutate-in-place bug (Array.push instead of an immutable set()) would leave the
    // reference unchanged even though the array's contents did change, so Zustand
    // subscribers relying on reference equality — the default for plain useStore selectors —
    // would never re-render for it.
    expect(sawUpdate).toBe(true)
    expect(useChatStore.getState().sessionTabs).toContain('eaed2e01-ab53-4d01-894c-c90e73a42fd5')
  })
})
