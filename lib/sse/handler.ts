/**
 * AGUI Event Handler
 *
 * Processes AGUI events and updates the chat store accordingly.
 * Handles all event types including messages, tool calls, reasoning, and interrupts.
 *
 * Deduplication uses stable entity IDs (runId, messageId, toolCallId) rather than
 * stream-position counters, so it works correctly across both invoke streams (live-only)
 * and GET session streams (replay + live) without needing to coordinate offsets.
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

  /** Clear dedup state for a session. Call when opening a fresh GET stream. */
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
   * Entry point for fetch-based invoke SSE streams. Runs through the same dedup gates as
   * {@link handleSSEMessage} — harmless on an already-unique live stream, and load-bearing
   * when a dropped invoke stream falls back to a GET stream reconnect mid-conversation.
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

  /** Entry point for EventSource-based GET session streams. */
  handleSSEMessage(event: MessageEvent, sessionId: string): void {
    this.handleEvent(event.data, sessionId)
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
      if (this.seenMessage(sessionId, event.messageId)) return
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
      if (event.messageId && this.seenMessage(sessionId, event.messageId)) return
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

    if (!existingSession) {
      chatStore.addSession({
        sessionId,
        agentId: event.agentId,
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
      if (!chatStore.sessionTabs.includes(sessionId)) {
        chatStore.sessionTabs.push(sessionId)
      }
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

    // Update session to indicate error state
    chatStore.updateSession(sessionId, {
      isStreaming: false,
      connectionStatus: 'error',
      lastActivity: now,
    })
  }

  private handleTextMessageStart(event: any, sessionId: string): void {
    if (!isTextMessageStartEvent(event)) return

    const chatStore = this.getChatStore()
    const author = event.rawEvent?.author as string | undefined
    const isUserAuthor = !author || author === 'user'

    chatStore.startStreamingMessage(event.messageId, isUserAuthor ? 'user' : 'assistant')

    if (isUserAuthor) {
      // Only show the first user message — subsequent user-role messages are sub-agent
      // orchestration messages (e.g. spawn_agent message param) and should not render.
      const hasExistingUserMessage = useChatStore.getState().sessions[sessionId]?.messages.some(m => m.role === 'user')
      if (hasExistingUserMessage) return
      chatStore.addTimelineItem(sessionId, { type: 'message', id: event.messageId, role: 'user' }, undefined, true)
    } else {
      chatStore.addTimelineItem(sessionId, { type: 'message', id: event.messageId, role: 'assistant', agentId: author })
    }
  }

  private handleTextMessageChunk(event: any, sessionId: string): void {
    if (!isTextMessageChunkEvent(event)) return

    // delta may be null for image-only user messages replayed from the backend
    if (!event.delta) return

    const chatStore = this.getChatStore()
    if (chatStore.streamingMessages[event.messageId]) {
      chatStore.appendToStreamingMessage(event.messageId, event.delta)
    }
  }

  private handleTextMessageEnd(event: any, sessionId: string): void {
    if (!isTextMessageEndEvent(event)) return

    const chatStore = this.getChatStore()
    const streamingMessage = chatStore.streamingMessages[event.messageId]
    
    if (streamingMessage) {
      chatStore.completeStreamingMessage(event.messageId)

      const finalContent = event.content || streamingMessage.content
      const eventTime = event.timestamp
        ? new Date(event.timestamp).toISOString()
        : new Date().toISOString()

      const agentId = streamingMessage.role === 'assistant'
        ? (event.rawEvent?.author as string | undefined)
        : undefined

      // Drain any attachments that arrived before this message was committed
      const pendingAttachments = chatStore.drainPendingAttachments(event.messageId)

      // If this is a user message that was skipped by the "only first user message" rule
      // but has attachments (image-only message), ensure it has a timeline slot.
      if (pendingAttachments.length > 0 && streamingMessage.role === 'user') {
        const session = chatStore.sessions[sessionId]
        const alreadyInTimeline = session?.timeline.some((t) => t.id === event.messageId)
        if (!alreadyInTimeline) {
          chatStore.addTimelineItem(sessionId, { type: 'message', id: event.messageId, role: 'user' }, undefined, true)
        }
      }

      chatStore.addMessage(sessionId, {
        id: event.messageId,
        messageId: event.messageId,
        sessionId,
        role: streamingMessage.role,
        content: finalContent,
        createdTime: eventTime,
        updatedTime: new Date().toISOString(),
        toolCalls: streamingMessage.toolCalls as any,
        metadata: agentId ? { agentId } : undefined,
        attachments: pendingAttachments.length > 0 ? pendingAttachments : undefined,
      })
    }
  }

  private handleToolCallStart(event: any, sessionId: string): void {
    if (!isToolCallStartEvent(event)) return

    // Backend uses toolCallName, frontend uses toolName
    const toolName = event.toolName || (event as any).toolCallName
    
    if (!toolName) {
      console.error('Tool call start event missing toolName/toolCallName:', event)
      return
    }

    const chatStore = this.getChatStore()
    chatStore.startToolCall(sessionId, {
      toolCallId: event.toolCallId,
      toolName,
      status: 'pending',
      arguments: {},
      parentMessageId: event.parentMessageId,
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
    if (existingToolCall) {
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

    this.openReasoningBlockId.set(sessionId, event.messageId)
    this.getChatStore().addReasoningBlock(event.messageId, event.messageId)
    this.getChatStore().addTimelineItem(sessionId, { type: 'reasoning', id: event.messageId })
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

    this.getChatStore().completeReasoningBlock(event.messageId, event.messageId)
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
        originalToolName: event.value.originalToolName,
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
      const session = chatStore.sessions[sessionId]
      const alreadyCommitted = session?.messages.some(
        (m) => (m.messageId || m.id) === event.value.parentMessageId
      )
      if (alreadyCommitted) {
        chatStore.addAttachmentToMessage(sessionId, event.value.parentMessageId, attachment)
      } else {
        chatStore.stagePendingAttachment(event.value.parentMessageId, attachment)
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
        const childSessionId = result.child_session_id
        if (!chatStore.sessionTabs.includes(childSessionId)) {
          chatStore.sessionTabs.push(childSessionId)
        }
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
