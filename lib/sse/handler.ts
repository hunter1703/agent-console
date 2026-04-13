/**
 * AGUI Event Handler
 * 
 * Processes AGUI events and updates the chat store accordingly.
 * Handles all event types including messages, tool calls, reasoning, and confirmations.
 */

import { 
  AGUIEvent,
  parseAGUIEvent,
  isRunStartedEvent,
  isRunFinishedEvent,
  isTextMessageStartEvent,
  isTextMessageChunkEvent,
  isTextMessageEndEvent,
  isToolCallStartEvent,
  isToolCallArgsEvent,
  isToolCallEndEvent,
  isToolCallResultEvent,
  isConfirmationRequestedEvent,
  isReasoningStartEvent,
  isReasoningEndEvent,
  isPlanningToolCall,
  isStandardToolCall
} from './events'

import { useChatStore } from '@/lib/store/chat'
import { useToasts } from '@/lib/store/ui'

export class AGUIEventHandler {
  private chatStore = useChatStore.getState()

  handleSSEMessage(event: MessageEvent): void {
    const aguiEvent = parseAGUIEvent(event.data)
    if (!aguiEvent) return

    try {
      this.processEvent(aguiEvent)
    } catch (error) {
      console.error('Error processing AGUI event:', error, aguiEvent)
      // Note: Cannot use useToasts hook here - this is a class method
      // Error handling should be done at the component level
    }
  }

  private processEvent(event: AGUIEvent): void {
    // Log event for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('AGUI Event:', event.type, event)
    }

    switch (event.type) {
      case 'RUN_STARTED':
        this.handleRunStarted(event as any)
        break
      case 'RUN_FINISHED':
        this.handleRunFinished(event as any)
        break
      case 'TEXT_MESSAGE_START':
        this.handleTextMessageStart(event as any)
        break
      case 'TEXT_MESSAGE_CHUNK':
        this.handleTextMessageChunk(event as any)
        break
      case 'TEXT_MESSAGE_END':
        this.handleTextMessageEnd(event as any)
        break
      case 'ToolCallStart':
        this.handleToolCallStart(event as any)
        break
      case 'ToolCallArgs':
        this.handleToolCallArgs(event as any)
        break
      case 'ToolCallEnd':
        this.handleToolCallEnd(event as any)
        break
      case 'ToolCallResult':
        this.handleToolCallResult(event as any)
        break
      case 'ReasoningStart':
        this.handleReasoningStart(event as any)
        break
      case 'ReasoningEnd':
        this.handleReasoningEnd(event as any)
        break
      case 'Custom':
        this.handleCustomEvent(event as any)
        break
      default:
        console.warn('Unknown AGUI event type:', event.type)
    }
  }

  private handleRunStarted(event: ReturnType<typeof isRunStartedEvent extends (e: any) => e is infer T ? T : never>): void {
    if (!isRunStartedEvent(event)) return

    // Create or update session for this run
    const sessionId = event.threadId
    const existingSession = this.chatStore.sessions[sessionId]

    if (!existingSession) {
      this.chatStore.addSession({
        sessionId,
        agentId: event.agentId,
        messages: [],
        isStreaming: true,
        connectionStatus: 'connected',
        lastActivity: new Date().toISOString(),
      })
    } else {
      this.chatStore.updateSession(sessionId, {
        isStreaming: true,
        connectionStatus: 'connected',
      })
    }

    // Set as active if it's the first session or if no active session
    if (!this.chatStore.activeSessionId) {
      this.chatStore.setActiveSession(sessionId)
    }

    // Handle multi-agent sessions (parent-child relationships)
    if (event.parentRunId) {
      // This is a child session - add to tabs
      if (!this.chatStore.sessionTabs.includes(sessionId)) {
        this.chatStore.sessionTabs.push(sessionId)
      }
    }
  }

  private handleRunFinished(event: ReturnType<typeof isRunFinishedEvent extends (e: any) => e is infer T ? T : never>): void {
    if (!isRunFinishedEvent(event)) return

    const sessionId = this.findSessionByRunId(event.runId)
    if (sessionId) {
      this.chatStore.updateSession(sessionId, {
        isStreaming: false,
        lastActivity: new Date().toISOString(),
      })
    }
  }

  private handleTextMessageStart(event: ReturnType<typeof isTextMessageStartEvent extends (e: any) => e is infer T ? T : never>): void {
    if (!isTextMessageStartEvent(event)) return

    this.chatStore.startStreamingMessage(event.messageId, event.role)
  }

  private handleTextMessageChunk(event: any): void {
    if (!isTextMessageChunkEvent(event)) return

    this.chatStore.appendToStreamingMessage(event.messageId, event.delta)
  }

  private handleTextMessageEnd(event: ReturnType<typeof isTextMessageEndEvent extends (e: any) => e is infer T ? T : never>): void {
    if (!isTextMessageEndEvent(event)) return

    // Convert streaming message to permanent message
    const streamingMessage = this.chatStore.streamingMessages[event.messageId]
    if (streamingMessage) {
      const sessionId = this.findSessionByRunId(event.runId || '')
      if (sessionId) {
        this.chatStore.addMessage(sessionId, {
          messageId: event.messageId,
          sessionId,
          role: streamingMessage.role,
          content: event.content,
          timestamp: new Date().toISOString(),
          toolCalls: streamingMessage.toolCalls,
        })
      }
    }

    this.chatStore.completeStreamingMessage(event.messageId)
  }

  private handleToolCallStart(event: ReturnType<typeof isToolCallStartEvent extends (e: any) => e is infer T ? T : never>): void {
    if (!isToolCallStartEvent(event)) return

    this.chatStore.startToolCall({
      toolCallId: event.toolCallId,
      toolName: event.toolName,
      status: 'pending',
      arguments: {},
      parentMessageId: event.parentMessageId,
    })

    // Handle different tool types with specific UI updates
    if (isPlanningToolCall(event.toolName)) {
      this.handlePlanningToolStart(event)
    } else if (isStandardToolCall(event.toolName)) {
      this.handleStandardToolStart(event)
    }
  }

  private handleToolCallArgs(event: ReturnType<typeof isToolCallArgsEvent extends (e: any) => e is infer T ? T : never>): void {
    if (!isToolCallArgsEvent(event)) return

    // Accumulate arguments (they come as JSON fragments)
    const existingToolCall = this.chatStore.activeToolCalls[event.toolCallId]
    if (existingToolCall) {
      const currentArgsString = existingToolCall.arguments?.raw || ''
      const newArgsString = currentArgsString + event.delta
      
      try {
        // Try to parse the accumulated arguments as JSON
        const parsedArgs = JSON.parse(newArgsString)
        
        this.chatStore.updateToolCall(event.toolCallId, {
          arguments: parsedArgs,
          status: 'running',
        })
      } catch {
        // If not valid JSON yet, keep accumulating
        this.chatStore.updateToolCall(event.toolCallId, {
          arguments: {
            ...existingToolCall.arguments,
            raw: newArgsString,
          },
          status: 'running',
        })
      }
    }
  }

  private handleToolCallEnd(event: ReturnType<typeof isToolCallEndEvent extends (e: any) => e is infer T ? T : never>): void {
    if (!isToolCallEndEvent(event)) return

    try {
      const finalArgs = JSON.parse(event.arguments)
      this.chatStore.updateToolCall(event.toolCallId, {
        arguments: finalArgs,
        status: 'running',
      })
    } catch (error) {
      console.error('Failed to parse final tool arguments:', error)
      // Keep the raw arguments if parsing fails
      this.chatStore.updateToolCall(event.toolCallId, {
        status: 'running',
      })
    }
  }

  private handleToolCallResult(event: ReturnType<typeof isToolCallResultEvent extends (e: any) => e is infer T ? T : never>): void {
    if (!isToolCallResultEvent(event)) return

    const toolCall = this.chatStore.activeToolCalls[event.toolCallId]
    
    this.chatStore.completeToolCall(event.toolCallId, {
      content: event.content,
      success: event.success,
      error: event.error,
      duration: event.duration,
    })

    // Handle specific tool result processing
    if (toolCall) {
      if (isPlanningToolCall(toolCall.toolName)) {
        this.handlePlanningToolResult(event, toolCall)
      } else if (isStandardToolCall(toolCall.toolName)) {
        this.handleStandardToolResult(event, toolCall)
      }
    }
  }

  private handleReasoningStart(event: ReturnType<typeof isReasoningStartEvent extends (e: any) => e is infer T ? T : never>): void {
    if (!isReasoningStartEvent(event)) return

    // Start a reasoning block in the streaming message
    const streamingMessage = this.chatStore.streamingMessages[event.messageId]
    if (streamingMessage) {
      const reasoning = streamingMessage.reasoning || []
      reasoning.push({
        blockId: event.messageId,
        thoughts: [],
        isComplete: false,
      })
      
      // Update streaming message with reasoning block
      // Note: This would require extending the streaming message interface
    }
  }

  private handleReasoningEnd(event: ReturnType<typeof isReasoningEndEvent extends (e: any) => e is infer T ? T : never>): void {
    if (!isReasoningEndEvent(event)) return

    // Mark reasoning block as complete
    const streamingMessage = this.chatStore.streamingMessages[event.messageId]
    if (streamingMessage?.reasoning) {
      const reasoningBlock = streamingMessage.reasoning.find(r => r.blockId === event.messageId)
      if (reasoningBlock) {
        reasoningBlock.isComplete = true
      }
    }
  }

  private handleCustomEvent(event: any): void {
    if (isConfirmationRequestedEvent(event)) {
      this.chatStore.showConfirmation({
        confirmationId: event.confirmationId,
        prompt: event.prompt,
        kind: event.kind,
        options: event.options,
        originalToolCallId: event.originalToolCallId,
        timeout: event.timeout,
      })
    }
  }

  private handlePlanningToolStart(event: any): void {
    // Planning tools will be handled when results come in
    // For now, just ensure the tool call is tracked
    console.log('Planning tool started:', event.toolName, event.toolCallId)
  }

  private handleStandardToolStart(event: any): void {
    // Standard tools (spawn_agent, send_message, etc.) are handled generically
    // Specific UI updates happen in the tool result handler
    console.log('Standard tool started:', event.toolName, event.toolCallId)
  }

  private handlePlanningToolResult(event: any, toolCall: any): void {
    // This integrates with planning card components
    try {
      const result = JSON.parse(event.content)
      
      switch (toolCall.toolName) {
        case 'create_plan':
          console.log('Plan created:', result)
          // The PlanningCard component will render based on the tool call state
          break
        case 'update_plan':
          console.log('Plan updated:', result)
          break
        case 'add_task':
          console.log('Task added:', result)
          break
        case 'update_task_info':
          console.log('Task info updated:', result)
          break
        case 'start_task':
          console.log('Task started:', result)
          break
        case 'complete_task':
          console.log('Task completed:', result)
          break
        case 'update_task_status':
          console.log('Task status updated:', result)
          break
        case 'finish_plan':
          console.log('Plan finished:', result)
          break
        case 'view_plan':
          console.log('Plan viewed:', result)
          break
        default:
          console.log('Unknown planning tool:', toolCall.toolName)
      }
    } catch (error) {
      console.error('Failed to parse planning tool result:', error)
    }
  }

  private handleStandardToolResult(event: any, toolCall: any): void {
    // Handle standard tool results
    try {
      const result = JSON.parse(event.content)
      
      switch (toolCall.toolName) {
        case 'spawn_agent':
          console.log('Agent spawned:', result)
          // Result should contain child_session_id
          if (result.child_session_id) {
            // Add child session to tabs if not already present
            const sessionId = result.child_session_id
            if (!this.chatStore.sessionTabs.includes(sessionId)) {
              this.chatStore.sessionTabs.push(sessionId)
            }
          }
          break
        case 'send_message':
          console.log('Message sent:', result)
          break
        case 'await_agent':
          console.log('Agent awaited:', result)
          break
        case 'web_research':
          console.log('Web research completed:', result)
          break
        default:
          console.log('Unknown standard tool:', toolCall.toolName)
      }
    } catch (error) {
      console.error('Failed to parse standard tool result:', error)
    }
  }

  private findSessionByRunId(runId: string): string | null {
    // This is a simplified implementation
    // In practice, you'd need to track runId -> sessionId mapping
    return this.chatStore.activeSessionId
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