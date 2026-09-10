/**
 * AGUI Event Handler
 *
 * Processes AGUI events and updates the chat store accordingly.
 * Handles all event types including messages, tool calls, reasoning, and interrupts.
 *
 * Deduplication uses canonical entity IDs (runId, toolCallId, and messageId normalized via
 * canonicalStreamId — see ./id.ts) rather than stream-position counters, so it works
 * correctly across both invoke streams (live-only) and GET session streams (replay + live)
 * without needing to coordinate offsets, and survives the backend minting a different raw
 * messageId/stepName for the same logical event depending on which endpoint served it.
 *
 * Dedup state is intentionally NOT reset around a reconnect: every GET session-stream
 * connection replays the full committed history from scratch (there is no server-side
 * "you already saw this" state carried between connections), so treating "replay just
 * started" as "wipe everything and trust only the replay" would just re-run every mutation
 * a second time for no reason. Instead, every mutation here is written to be idempotent
 * under re-delivery, so replayed events safely merge into whatever's already known rather
 * than requiring a clean slate.
 */

import {
  AGUIEvent,
  parseAGUIEvent,
  isRunStartedEvent,
  isRunFinishedEvent,
  isRunErrorEvent,
  isStepStartedEvent,
  isStepFinishedEvent,
  isTextMessageStartEvent,
  isTextMessageChunkEvent,
  isTextMessageEndEvent,
  isToolCallStartEvent,
  isToolCallArgsEvent,
  isToolCallEndEvent,
  isToolCallResultEvent,
  isInterruptRequestedEvent,
  isResumedEvent,
  isAttachmentEvent,
  isReasoningStartEvent,
  isReasoningMessageStartEvent,
  isReasoningMessageContentEvent,
  isReasoningMessageEndEvent,
  isReasoningEndEvent,
  isPlanningToolCall,
  isStandardToolCall
} from './events'

import { useChatStore } from '../store/chat'
import { useInterruptStore } from '../stores/interruptStore'
import { canonicalStreamId } from './id'

export class AGUIEventHandler {
  // Per-session sets of already-processed entity IDs (runId / messageId / toolCallId).
  // Start events are gated by these sets; downstream chunk/end events are naturally
  // skipped because their corresponding store entries don't exist.
  private processedRunIds: Map<string, Set<string>> = new Map()
  private processedMessageIds: Map<string, Set<string>> = new Map()
  private processedToolCallIds: Map<string, Set<string>> = new Map()
  // Maps runId → agentId so every event in a run can be attributed to the right agent.
  private runAgentIds: Map<string, string> = new Map()
  // The currently-open outer reasoning block id per session. REASONING_MESSAGE_START carries
  // no link to its parent block on the wire — the protocol relies on stream order instead
  // (a REASONING_START always immediately precedes its child REASONING_MESSAGE_START events).
  private openReasoningBlockId: Map<string, string> = new Map()

  private getChatStore() {
    return useChatStore.getState()
  }

  /**
   * Clear dedup state for a session. NOT part of the reconnect flow (see class doc) — call
   * this only when a session's client-side state is itself being discarded (e.g. removed
   * from the store), so the Maps don't grow unbounded across many sessions in one tab.
   */
  resetSessionIndex(sessionId: string): void {
    this.processedRunIds.delete(sessionId)
    this.processedMessageIds.delete(sessionId)
    this.processedToolCallIds.delete(sessionId)
    this.openReasoningBlockId.delete(sessionId)
    // Clear run→agent mappings for this session's runs
    // (we can't easily scope by session, so we clear all — safe since streams are per-session)
    this.runAgentIds.clear()
  }

  private seenRun(sessionId: string, runId: string): boolean {
    if (!this.processedRunIds.has(sessionId)) this.processedRunIds.set(sessionId, new Set())
    const set = this.processedRunIds.get(sessionId)!
    if (set.has(runId)) return true
    set.add(runId)
    return false
  }

  private seenMessage(sessionId: string, messageId: string): boolean {
    if (!this.processedMessageIds.has(sessionId)) this.processedMessageIds.set(sessionId, new Set())
    const set = this.processedMessageIds.get(sessionId)!
    if (set.has(messageId)) return true
    set.add(messageId)
    return false
  }

  private seenToolCall(sessionId: string, toolCallId: string): boolean {
    if (!this.processedToolCallIds.has(sessionId)) this.processedToolCallIds.set(sessionId, new Set())
    const set = this.processedToolCallIds.get(sessionId)!
    if (set.has(toolCallId)) return true
    set.add(toolCallId)
    return false
  }

  /**
   * Entry point for every SSE transport (fetch-based invoke stream, fetch-based GET session
   * stream — see lib/sse/managedStream.ts). Runs through the same dedup gates regardless of
   * source: harmless on an already-unique live stream, and load-bearing when a dropped invoke
   * stream falls back to a GET stream reconnect mid-conversation.
   */
  handleEvent(rawData: string, sessionId: string): void {
    const aguiEvent = parseAGUIEvent(rawData)
    if (!aguiEvent) return
    try {
      this.processEvent(aguiEvent, sessionId)
    } catch (error) {
      console.error('Error processing AGUI event:', error, aguiEvent)
    }
  }

  private processEvent(event: AGUIEvent, sessionId: string): void {
    if (process.env.NODE_ENV === 'development') {
      console.log('AGUI Event:', event.type, event)
    }

    if (isRunStartedEvent(event)) {
      if (this.seenRun(sessionId, event.runId)) return
      this.handleRunStarted(event, sessionId)
    } else if (isRunFinishedEvent(event)) {
      this.handleRunFinished(event, sessionId)
    } else if (isRunErrorEvent(event)) {
      this.handleRunError(event, sessionId)
    } else if (isStepStartedEvent(event) || isStepFinishedEvent(event)) {
      // informational only
    } else if (isTextMessageStartEvent(event)) {
      // Not gated by seenMessage: a START always (re)initializes the streaming buffer for
      // its canonical id. This is required for replay correctness — see handleTextMessageStart.
      this.handleTextMessageStart(event, sessionId)
    } else if (isTextMessageChunkEvent(event)) {
      this.handleTextMessageChunk(event, sessionId)
    } else if (isTextMessageEndEvent(event)) {
      this.handleTextMessageEnd(event, sessionId)
    } else if (isToolCallStartEvent(event)) {
      if (this.seenToolCall(sessionId, event.toolCallId)) return
      this.handleToolCallStart(event, sessionId)
    } else if (isToolCallArgsEvent(event)) {
      this.handleToolCallArgs(event, sessionId)
    } else if (isToolCallEndEvent(event)) {
      this.handleToolCallEnd(event, sessionId)
    } else if (isToolCallResultEvent(event)) {
      this.handleToolCallResult(event, sessionId)
    } else if (isReasoningStartEvent(event)) {
      // Not gated by seenMessage, same reasoning as TEXT_MESSAGE_START above: this is what
      // (re-)arms openReasoningBlockId, which every downstream REASONING_MESSAGE_* event
      // needs to find its parent block. Gating this on "already seen" meant a reconnect
      // mid-block would skip re-arming it, silently freezing that block (and any later
      // reasoning in the same session) for good — addReasoningBlock is idempotent so
      // re-delivery here is safe.
      this.handleReasoningStart(event, sessionId)
    } else if (isReasoningMessageStartEvent(event)) {
      this.handleReasoningMessageStart(event, sessionId)
    } else if (isReasoningMessageContentEvent(event)) {
      this.handleReasoningMessageContent(event, sessionId)
    } else if (isReasoningMessageEndEvent(event)) {
      this.handleReasoningMessageEnd(event, sessionId)
    } else if (isReasoningEndEvent(event)) {
      this.handleReasoningEnd(event, sessionId)
    } else if (event.type === 'CUSTOM') {
      this.handleCustomEvent(event as any, sessionId)
    } else {
      console.warn('Unknown AGUI event type:', (event as any).type)
    }
  }

  private handleRunStarted(event: any, sessionId: string): void {
    if (!isRunStartedEvent(event)) return

    // Use the provided sessionId instead of event.threadId
    const chatStore = this.getChatStore()
    const existingSession = chatStore.sessions[sessionId]

    // The wire event carries the agent id as rawEvent.author, not the typed `agentId`
    // field (which real payloads never populate) — track it per-run so interrupt/message
    // attribution for nested/sub-agent runs can look it up later.
    const runAgentId = event.agentId || (event.rawEvent?.author as string | undefined)
    if (event.runId && runAgentId) {
      this.runAgentIds.set(event.runId, runAgentId)
    }

    if (!existingSession) {
      chatStore.addSession({
        sessionId,
        agentId: runAgentId,
        messages: [],
        isStreaming: true,
        connectionStatus: 'connected',
        lastActivity: new Date().toISOString(),
        toolCalls: {},
        interrupts: {},
        corrections: {},
        activePlan: null,
        timeline: [],
      } as any)
    } else {
      chatStore.updateSession(sessionId, {
        isStreaming: true,
        connectionStatus: 'connected',
      })
    }

    // Set as active if it's the first session or if no active session
    if (!chatStore.activeSessionId) {
      chatStore.setActiveSession(sessionId)
    }

    // Handle multi-agent sessions (parent-child relationships)
    if (event.parentRunId) {
      // This is a child session - add to tabs
      chatStore.addSessionTab(sessionId)
    }
  }

  private handleRunFinished(event: any, sessionId: string): void {
    if (!isRunFinishedEvent(event)) return

    const chatStore = this.getChatStore()
    chatStore.updateSession(sessionId, {
      isStreaming: false,
      lastActivity: new Date().toISOString(),
    })
  }

  private handleRunError(event: any, sessionId: string): void {
    if (!isRunErrorEvent(event)) return

    const chatStore = this.getChatStore()
    const errorMessage = event.message || 'An error occurred'

    // Add error message as a special assistant message
    const now = new Date().toISOString()
    const errorMessageId = `error-${Date.now()}`

    chatStore.addMessage(sessionId, {
      id: errorMessageId,
      messageId: errorMessageId,
      sessionId,
      role: 'assistant',
      content: `❌ **Error**: ${errorMessage}`,
      createdTime: now,
      updatedTime: now,
    } as any)

    // RUN_ERROR is a business-level failure reported by the agent (e.g. "tool not found") —
    // the SSE transport itself is fine and the stream typically ends normally right after.
    // connectionStatus is reserved for actual transport health (see managedStream.ts's
    // onStatusChange), so it's deliberately left untouched here — otherwise every agent-level
    // error would trigger the "Connection lost, reconnect to keep watching" banner even though
    // nothing is wrong with the connection.
    chatStore.updateSession(sessionId, {
      isStreaming: false,
      lastActivity: now,
    })
  }

  private handleTextMessageStart(event: any, sessionId: string): void {
    if (!isTextMessageStartEvent(event)) return

    const chatStore = this.getChatStore()
    const messageId = canonicalStreamId(event.messageId)
    const author = event.rawEvent?.author as string | undefined
    const role = event.role || 'assistant'

    // A session-stream replay resends every historical message's START, even ones already
    // fully committed here (from a live invoke stream, or an earlier pass of this same
    // replay). If we already have the final content, re-opening a streaming buffer for it
    // would transiently shadow the committed message with an empty one (streamingMessages
    // is checked before committed messages when rendering) — so this is a no-op instead.
    const session = chatStore.sessions[sessionId]
    const alreadyCommitted = session?.messages.some((m) => (m.messageId || m.id) === messageId)
    if (alreadyCommitted) return

    // Always (re)initialize the buffer, even if a stale partial one exists for this id —
    // a START event means "here comes this message's content from the top," and the
    // replay resends the full accumulated text as one shot rather than the missing
    // remainder, so appending onto old partial content would duplicate/garble it.
    chatStore.startStreamingMessage(messageId, role)

    // Assistant/system text streams live, token by token, and needs a timeline slot right
    // away so the reader watches it appear. A user message, by contrast, is always an echo
    // of something the sender already said — the sender has their own optimistic local echo
    // (added directly in app/chat/page.tsx when they hit send, with a temp-user-* id).
    // Placing a SECOND timeline slot here, under the real id, before that echo has had a
    // chance to reconcile against it in handleTextMessageEnd/addMessage, is exactly how the
    // same message ends up rendered twice. So this is deferred to handleTextMessageEnd,
    // once the final content is known and can be matched against the pending echo.
    if (role !== 'user') {
      chatStore.addTimelineItem(sessionId, { type: 'message', id: messageId, role: 'assistant', agentId: author })
    }
  }

  private handleTextMessageChunk(event: any, sessionId: string): void {
    if (!isTextMessageChunkEvent(event)) return

    // delta may be null for image-only user messages replayed from the backend
    if (!event.delta) return

    const chatStore = this.getChatStore()
    const messageId = canonicalStreamId(event.messageId)
    if (chatStore.streamingMessages[messageId]) {
      chatStore.appendToStreamingMessage(messageId, event.delta)
    }
  }

  private handleTextMessageEnd(event: any, sessionId: string): void {
    if (!isTextMessageEndEvent(event)) return

    const chatStore = this.getChatStore()
    const messageId = canonicalStreamId(event.messageId)
    const streamingMessage = chatStore.streamingMessages[messageId]

    if (streamingMessage) {
      chatStore.completeStreamingMessage(messageId)

      const finalContent = event.content || streamingMessage.content
      const eventTime = event.timestamp
        ? new Date(event.timestamp).toISOString()
        : new Date().toISOString()

      const agentId = streamingMessage.role === 'assistant'
        ? (event.rawEvent?.author as string | undefined)
        : undefined

      // Drain any attachments that arrived before this message was committed
      const pendingAttachments = chatStore.drainPendingAttachments(messageId)

      chatStore.addMessage(sessionId, {
        id: messageId,
        messageId: messageId,
        sessionId,
        role: streamingMessage.role,
        content: finalContent,
        createdTime: eventTime,
        updatedTime: new Date().toISOString(),
        toolCalls: streamingMessage.toolCalls as any,
        metadata: agentId ? { agentId } : undefined,
        attachments: pendingAttachments.length > 0 ? pendingAttachments : undefined,
      })

      // handleTextMessageStart deliberately skipped placing a user message in the timeline
      // (see there for why) — addMessage above just had its one chance to reconcile this
      // against a pending optimistic echo (matching by content and renaming the echo's temp
      // id to this real one, in place). If that happened, the timeline already has a slot for
      // this id. Otherwise — no local echo existed to match (e.g. viewing another session, or
      // the echo already got swept up by a different match) — give it one now.
      if (streamingMessage.role === 'user') {
        const session = chatStore.sessions[sessionId]
        const alreadyInTimeline = session?.timeline.some((t) => t.id === messageId)
        if (!alreadyInTimeline) {
          chatStore.addTimelineItem(sessionId, { type: 'message', id: messageId, role: 'user' })
        }
      }
    }
  }

  private handleToolCallStart(event: any, sessionId: string): void {
    if (!isToolCallStartEvent(event)) return

    const toolName = event.toolCallName
    if (!toolName) {
      console.error('Tool call start event missing toolCallName:', event)
      return
    }

    const chatStore = this.getChatStore()
    const author = event.rawEvent?.author as string | undefined
    chatStore.startToolCall(sessionId, {
      toolCallId: event.toolCallId,
      toolName,
      status: 'pending',
      arguments: {},
      parentMessageId: event.parentMessageId,
      agentId: author,
    })

    // Handle different tool types with specific UI updates
    if (isPlanningToolCall(toolName)) {
      if (toolName === 'create_plan') {
        // The plan widget is anchored at the create_plan event position.
        console.log('📍 Adding plan to timeline:', { sessionId, toolCallId: event.toolCallId })
        chatStore.addTimelineItem(sessionId, { type: 'plan', id: event.toolCallId })
      }
      this.handlePlanningToolStart({ ...event, toolName }, sessionId)
    } else {
      // All non-planning tools get a tool_call timeline item so they are visible in the chat.
      chatStore.addTimelineItem(sessionId, { type: 'tool_call', id: event.toolCallId })
      if (isStandardToolCall(toolName)) {
        this.handleStandardToolStart({ ...event, toolName })
      }
    }
  }

  private handleToolCallArgs(event: any, sessionId: string): void {
    if (!isToolCallArgsEvent(event)) return

    const chatStore = this.getChatStore()
    const session = chatStore.sessions[sessionId]
    const existingToolCall = session?.toolCalls[event.toolCallId]
    // TOOL_CALL_START is gated (toolCallId is a stable id, unlike messageId — see ./id.ts),
    // but ARGS/END/RESULT are not, since they're only ever expected once each per call. A
    // session-stream replay resends them anyway for every historical tool call, so a call
    // that's already 'completed' here means this delta is a stale re-delivery — reprocessing
    // it would revert the call to 'running' and re-accumulate onto already-final arguments.
    if (existingToolCall && existingToolCall.status !== 'completed') {
      const currentArgsString = existingToolCall.arguments?.raw || ''
      const newArgsString = currentArgsString + event.delta

      try {
        const parsedArgs = JSON.parse(newArgsString)
        chatStore.updateToolCall(sessionId, event.toolCallId, {
          arguments: parsedArgs,
          status: 'running',
        })
      } catch {
        chatStore.updateToolCall(sessionId, event.toolCallId, {
          arguments: {
            ...existingToolCall.arguments,
            raw: newArgsString,
          },
          status: 'running',
        })
      }
    }
  }

  private handleToolCallEnd(event: any, sessionId: string): void {
    if (!isToolCallEndEvent(event)) return

    const chatStore = this.getChatStore()
    const existingToolCall = chatStore.sessions[sessionId]?.toolCalls[event.toolCallId]
    // See handleToolCallArgs — a replayed END for an already-completed call is a stale
    // re-delivery, not a genuine second completion.
    if (existingToolCall?.status === 'completed') return

    if (!event.arguments || event.arguments === 'undefined') {
      chatStore.updateToolCall(sessionId, event.toolCallId, { status: 'running' })
      return
    }

    try {
      const finalArgs = JSON.parse(event.arguments)
      chatStore.updateToolCall(sessionId, event.toolCallId, { arguments: finalArgs, status: 'running' })
    } catch (error) {
      console.error('Failed to parse final tool arguments:', error)
      chatStore.updateToolCall(sessionId, event.toolCallId, { status: 'running' })
    }
  }

  private handleToolCallResult(event: any, sessionId: string): void {
    if (!isToolCallResultEvent(event)) return

    const chatStore = this.getChatStore()
    const toolCall = chatStore.sessions[sessionId]?.toolCalls[event.toolCallId]
    // See handleToolCallArgs — skip a replayed RESULT for a call that already has one;
    // rerunning its planning/standard-tool side effects on every reconnect is unnecessary
    // even where those side effects happen to be idempotent.
    if (toolCall?.status === 'completed') return

    chatStore.completeToolCall(sessionId, event.toolCallId, {
      content: event.content,
    })

    if (toolCall) {
      if (isPlanningToolCall(toolCall.toolName)) {
        this.handlePlanningToolResult(event, toolCall, sessionId)
      } else if (isStandardToolCall(toolCall.toolName)) {
        this.handleStandardToolResult(event, toolCall, sessionId)
      }
    }
  }

  private handleReasoningStart(event: any, sessionId: string): void {
    if (!isReasoningStartEvent(event)) return

    const blockId = canonicalStreamId(event.messageId)
    this.openReasoningBlockId.set(sessionId, blockId)
    this.getChatStore().addReasoningBlock(blockId, blockId)
    this.getChatStore().addTimelineItem(sessionId, { type: 'reasoning', id: blockId })
  }

  private handleReasoningMessageStart(event: any, sessionId: string): void {
    if (!isReasoningMessageStartEvent(event)) return

    const blockId = this.openReasoningBlockId.get(sessionId)
    if (!blockId) return
    // A new inner thought begins — seed an empty thought entry via appendToReasoningBlock
    this.getChatStore().appendToReasoningBlock(blockId, blockId, event.messageId, '')
  }

  private handleReasoningMessageContent(event: any, sessionId: string): void {
    if (!isReasoningMessageContentEvent(event)) return
    if (!event.delta) return

    const blockId = this.openReasoningBlockId.get(sessionId)
    if (!blockId) return
    this.getChatStore().appendToReasoningBlock(blockId, blockId, event.messageId, event.delta)
  }

  private handleReasoningMessageEnd(event: any, sessionId: string): void {
    if (!isReasoningMessageEndEvent(event)) return
    // Thought is complete — no additional action needed; block completion arrives with REASONING_END
  }

  private handleReasoningEnd(event: any, sessionId: string): void {
    if (!isReasoningEndEvent(event)) return

    const blockId = canonicalStreamId(event.messageId)
    this.getChatStore().completeReasoningBlock(blockId, blockId)
    this.openReasoningBlockId.delete(sessionId)
  }

  private handleCustomEvent(event: any, sessionId: string): void {
    const chatStore = this.getChatStore()
    const interruptStore = useInterruptStore.getState()

    if (isInterruptRequestedEvent(event)) {
      interruptStore.addInterrupt({
        id: event.value.interruptId,
        sessionId,
        type: event.value.kind,
        prompt: event.value.prompt,
        status: 'pending',
        options: event.value.options?.map((opt: string, idx: number) => ({
          id: idx.toString(),
          label: opt,
          value: opt,
        })),
        linkedToolCallId: event.value.originalToolCallId,
        requestingAgentId: (event.rawEvent as any)?.agentId || (event.rawEvent as any)?.author || (event.runId ? this.runAgentIds.get(event.runId) : chatStore.sessions[sessionId]?.agentId),
        createdAt: new Date().toISOString(),
      })
      // Insert confirmation after its linked tool call if one exists; otherwise append in arrival order.
      chatStore.addTimelineItem(
        sessionId,
        { type: 'interrupt', id: event.value.interruptId, linkedId: event.value.originalToolCallId },
        event.value.originalToolCallId
      )
    } else if (isResumedEvent(event)) {
      // Update regardless — if already resolved this is a no-op since updateInterrupt
      // only decrements pendingCount when transitioning from pending.
      interruptStore.updateInterrupt(
        event.value.interruptId,
        event.value.accepted ? 'resolved' : 'rejected',
        event.value.answer
      )
    } else if (isAttachmentEvent(event)) {
      // The attachment event may arrive before TEXT_MESSAGE_END commits the message.
      // Try to attach directly; if the message isn't committed yet, stage it as pending
      // so handleTextMessageEnd can pick it up when the message is committed.
      const attachment = {
        name: event.value.fileDetails.name,
        source: event.value.fileDetails.source,
        type: event.value.fileDetails.type,
        mimeType: event.value.fileDetails.mimeType,
        size: event.value.fileDetails.size,
      }
      const parentMessageId = canonicalStreamId(event.value.parentMessageId)
      const session = chatStore.sessions[sessionId]
      const alreadyCommitted = session?.messages.some(
        (m) => (m.messageId || m.id) === parentMessageId
      )
      if (alreadyCommitted) {
        chatStore.addAttachmentToMessage(sessionId, parentMessageId, attachment)
      } else {
        chatStore.stagePendingAttachment(parentMessageId, attachment)
      }
    } else if (event.name === 'correction') {
      const correctionId = `correction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const val = (event as any).value || {}
      chatStore.addCorrectionEvent(sessionId, {
        correctionId,
        correctionType: val.correctionType || 'violation',
        code: val.code || 'unknown',
        message: val.message || 'Correction event received',
      })
      chatStore.addTimelineItem(sessionId, { type: 'correction', id: correctionId })
    }
  }

  private handlePlanningToolStart(event: any, sessionId: string): void {
    // When create_plan starts, seed an empty plan immediately so the card appears
    if (event.toolName === 'create_plan') {
      const args = event.arguments ?? {}
      this.getChatStore().setActivePlan(sessionId, {
        planId: event.toolCallId,
        title: args.title ?? 'Planning…',
        goal: args.goal ?? '',
        status: 'IN_PROGRESS' as any,
        tasks: args.tasks ?? [],
      })
    }
  }

  private handleStandardToolStart(event: any): void {
    console.log('Standard tool started:', event.toolName, event.toolCallId)
  }

  private handlePlanningToolResult(event: any, toolCall: any, sessionId: string): void {
    const chatStore = this.getChatStore()
    const args = toolCall.arguments ?? {}

    switch (toolCall.toolName) {
      case 'create_plan': {
        // Use the result's createdPlan which has real planId and taskId values.
        // The call args tasks have no taskId, causing undefined === undefined
        // false-positives in the hasChildren check.
        try {
          const { createdPlan } = JSON.parse(event.content)
          if (createdPlan) {
            chatStore.setActivePlan(sessionId, {
              planId: createdPlan.planId,
              title: createdPlan.title ?? args.title ?? 'Plan',
              goal: createdPlan.goal ?? args.goal ?? '',
              status: 'IN_PROGRESS' as any,
              tasks: createdPlan.tasks ?? [],
            })
            break
          }
        } catch { /* fall through to arg-based fallback */ }
        chatStore.setActivePlan(sessionId, {
          planId: toolCall.toolCallId,
          title: args.title ?? 'Plan',
          goal: args.goal ?? '',
          status: 'IN_PROGRESS' as any,
          tasks: args.tasks ?? [],
        })
        break
      }
      case 'add_task': {
        // Backend uses snake_case (task_id, parent_id)
        const taskId = args.task_id ?? args.taskId
        const parentId = args.parent_id ?? args.parentId
        if (taskId) {
          chatStore.upsertPlanTask(sessionId, {
            taskId,
            name: args.name ?? args.title ?? '',
            goal: args.goal ?? '',
            description: args.description,
            status: 'TODO',
            parentId,
          })
        }
        break
      }
      case 'update_task_info': {
        const taskId = args.task_id ?? args.taskId
        if (taskId) {
          chatStore.updatePlanTask(sessionId, taskId, {
            name: args.name,
            goal: args.goal,
            description: args.description,
          })
        }
        break
      }
      case 'start_task': {
        const taskId = args.task_id ?? args.taskId
        if (taskId) chatStore.updatePlanTask(sessionId, taskId, { status: 'IN_PROGRESS' })
        break
      }
      case 'complete_task': {
        const taskId = args.task_id ?? args.taskId
        if (taskId) {
          chatStore.updatePlanTask(sessionId, taskId, {
            status: 'COMPLETED',
            result: args.result,
          })
        }
        break
      }
      case 'update_plan':
        chatStore.updateActivePlan(sessionId, {
          title: args.title,
          goal: args.goal,
        })
        break
      case 'finish_plan':
        chatStore.updateActivePlan(sessionId, {
          status: 'COMPLETED' as any,
          result: args.result,
        })
        break
      default:
        break
    }
  }

  private handleStandardToolResult(event: any, toolCall: any, sessionId: string): void {
    try {
      const result = JSON.parse(event.content)
      const chatStore = this.getChatStore()

      if (toolCall.toolName === 'spawn_agent' && result.child_session_id) {
        chatStore.addSessionTab(result.child_session_id)
      }
    } catch (error) {
      console.error('Failed to parse standard tool result:', error)
    }
  }
}

// Export singleton instance with lazy initialization
let _aguiEventHandler: AGUIEventHandler | null = null

export function getAGUIEventHandler(): AGUIEventHandler {
  if (!_aguiEventHandler) {
    _aguiEventHandler = new AGUIEventHandler()
  }
  return _aguiEventHandler
}
