import { describe, it, expect, beforeEach } from 'vitest'
import { useChatStore } from '../chatStore'
import type { Message, ToolCall } from '@/types/message'

describe('chatStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useChatStore.setState({
      messagesBySession: {},
      streamingMessageId: null,
      isThinking: false,
      thinkingMessage: null,
      activeToolCalls: [],
    })
  })

  describe('Initialization', () => {
    it('should initialize with empty state', () => {
      const state = useChatStore.getState()
      expect(state.messagesBySession).toEqual({})
      expect(state.streamingMessageId).toBeNull()
      expect(state.isThinking).toBe(false)
      expect(state.thinkingMessage).toBeNull()
      expect(state.activeToolCalls).toEqual([])
    })
  })

  describe('Message Management', () => {
    const sessionId = 'session-1'
    const message: Message = {
      id: 'msg-1',
      role: 'user',
      content: 'Hello',
      timestamp: new Date(),
    }

    it('should add message to session', () => {
      useChatStore.getState().addMessage(sessionId, message)
      const messages = useChatStore.getState().getMessages(sessionId)
      expect(messages).toHaveLength(1)
      expect(messages[0]).toEqual(message)
    })

    it('should add multiple messages', () => {
      const message2: Message = {
        id: 'msg-2',
        role: 'assistant',
        content: 'Hi there',
        timestamp: new Date(),
      }

      useChatStore.getState().addMessage(sessionId, message)
      useChatStore.getState().addMessage(sessionId, message2)

      const messages = useChatStore.getState().getMessages(sessionId)
      expect(messages).toHaveLength(2)
    })

    it('should set messages for session', () => {
      const messages: Message[] = [
        { id: 'msg-1', role: 'user', content: 'Hello', timestamp: new Date() },
        { id: 'msg-2', role: 'assistant', content: 'Hi', timestamp: new Date() },
      ]

      useChatStore.getState().setMessages(sessionId, messages)
      expect(useChatStore.getState().getMessages(sessionId)).toEqual(messages)
    })

    it('should update message', () => {
      useChatStore.getState().addMessage(sessionId, message)
      useChatStore.getState().updateMessage(sessionId, 'msg-1', { content: 'Updated' })

      const updated = useChatStore.getState().getMessageById(sessionId, 'msg-1')
      expect(updated?.content).toBe('Updated')
    })

    it('should append to message content', () => {
      useChatStore.getState().addMessage(sessionId, message)
      useChatStore.getState().appendToMessage(sessionId, 'msg-1', ' World')

      const updated = useChatStore.getState().getMessageById(sessionId, 'msg-1')
      expect(updated?.content).toBe('Hello World')
    })

    it('should delete message', () => {
      useChatStore.getState().addMessage(sessionId, message)
      useChatStore.getState().deleteMessage(sessionId, 'msg-1')

      const messages = useChatStore.getState().getMessages(sessionId)
      expect(messages).toHaveLength(0)
    })

    it('should clear all messages for session', () => {
      useChatStore.getState().addMessage(sessionId, message)
      useChatStore.getState().addMessage(sessionId, { ...message, id: 'msg-2' })
      useChatStore.getState().clearMessages(sessionId)

      const messages = useChatStore.getState().getMessages(sessionId)
      expect(messages).toHaveLength(0)
    })
  })

  describe('Message Selectors', () => {
    const sessionId = 'session-1'

    it('should get messages for session', () => {
      const messages: Message[] = [
        { id: 'msg-1', role: 'user', content: 'Hello', timestamp: new Date() },
      ]

      useChatStore.getState().setMessages(sessionId, messages)
      expect(useChatStore.getState().getMessages(sessionId)).toEqual(messages)
    })

    it('should return empty array for non-existent session', () => {
      const messages = useChatStore.getState().getMessages('non-existent')
      expect(messages).toEqual([])
    })

    it('should get message by id', () => {
      const message: Message = {
        id: 'msg-1',
        role: 'user',
        content: 'Hello',
        timestamp: new Date(),
      }

      useChatStore.getState().addMessage(sessionId, message)
      const found = useChatStore.getState().getMessageById(sessionId, 'msg-1')
      expect(found).toEqual(message)
    })

    it('should return undefined for non-existent message', () => {
      const found = useChatStore.getState().getMessageById(sessionId, 'non-existent')
      expect(found).toBeUndefined()
    })

    it('should get last message', () => {
      const messages: Message[] = [
        { id: 'msg-1', role: 'user', content: 'First', timestamp: new Date() },
        { id: 'msg-2', role: 'assistant', content: 'Second', timestamp: new Date() },
        { id: 'msg-3', role: 'user', content: 'Third', timestamp: new Date() },
      ]

      useChatStore.getState().setMessages(sessionId, messages)
      const last = useChatStore.getState().getLastMessage(sessionId)
      expect(last?.id).toBe('msg-3')
    })

    it('should return undefined for empty session', () => {
      const last = useChatStore.getState().getLastMessage(sessionId)
      expect(last).toBeUndefined()
    })
  })

  describe('Streaming State', () => {
    const sessionId = 'session-1'
    const messageId = 'msg-1'

    it('should start streaming', () => {
      useChatStore.getState().startStreaming(sessionId, messageId)
      expect(useChatStore.getState().streamingMessageId).toBe(messageId)
      expect(useChatStore.getState().isStreaming()).toBe(true)
    })

    it('should stop streaming', () => {
      useChatStore.getState().startStreaming(sessionId, messageId)
      useChatStore.getState().stopStreaming()

      expect(useChatStore.getState().streamingMessageId).toBeNull()
      expect(useChatStore.getState().isStreaming()).toBe(false)
    })

    it('should clear thinking state on stop streaming', () => {
      useChatStore.getState().setThinking(true, 'Thinking...')
      useChatStore.getState().stopStreaming()

      expect(useChatStore.getState().isThinking).toBe(false)
      expect(useChatStore.getState().thinkingMessage).toBeNull()
    })

    it('should set thinking state', () => {
      useChatStore.getState().setThinking(true, 'Processing...')

      expect(useChatStore.getState().isThinking).toBe(true)
      expect(useChatStore.getState().thinkingMessage).toBe('Processing...')
    })

    it('should clear thinking message when not provided', () => {
      useChatStore.getState().setThinking(true, 'Thinking...')
      useChatStore.getState().setThinking(false)

      expect(useChatStore.getState().isThinking).toBe(false)
      expect(useChatStore.getState().thinkingMessage).toBeNull()
    })
  })

  describe('Tool Calls', () => {
    const toolCall: ToolCall = {
      id: 'tool-1',
      name: 'search',
      arguments: { query: 'test' },
      status: 'pending',
    }

    it('should add tool call', () => {
      useChatStore.getState().addToolCall(toolCall)
      expect(useChatStore.getState().activeToolCalls).toHaveLength(1)
      expect(useChatStore.getState().activeToolCalls[0]).toEqual(toolCall)
    })

    it('should add multiple tool calls', () => {
      const toolCall2: ToolCall = {
        id: 'tool-2',
        name: 'calculate',
        arguments: { expression: '2+2' },
        status: 'pending',
      }

      useChatStore.getState().addToolCall(toolCall)
      useChatStore.getState().addToolCall(toolCall2)

      expect(useChatStore.getState().activeToolCalls).toHaveLength(2)
    })

    it('should update tool call', () => {
      useChatStore.getState().addToolCall(toolCall)
      useChatStore.getState().updateToolCall('tool-1', { 
        status: 'completed',
        result: 'Success' 
      })

      const updated = useChatStore.getState().activeToolCalls[0]
      expect(updated.status).toBe('completed')
      expect(updated.result).toBe('Success')
    })

    it('should clear all tool calls', () => {
      useChatStore.getState().addToolCall(toolCall)
      useChatStore.getState().addToolCall({ ...toolCall, id: 'tool-2' })
      useChatStore.getState().clearToolCalls()

      expect(useChatStore.getState().activeToolCalls).toHaveLength(0)
    })
  })

  describe('Multiple Sessions', () => {
    it('should manage messages for multiple sessions independently', () => {
      const session1 = 'session-1'
      const session2 = 'session-2'

      useChatStore.getState().addMessage(session1, {
        id: 'msg-1',
        role: 'user',
        content: 'Session 1',
        timestamp: new Date(),
      })

      useChatStore.getState().addMessage(session2, {
        id: 'msg-2',
        role: 'user',
        content: 'Session 2',
        timestamp: new Date(),
      })

      expect(useChatStore.getState().getMessages(session1)).toHaveLength(1)
      expect(useChatStore.getState().getMessages(session2)).toHaveLength(1)
      expect(useChatStore.getState().getMessages(session1)[0].content).toBe('Session 1')
      expect(useChatStore.getState().getMessages(session2)[0].content).toBe('Session 2')
    })

    it('should clear messages for one session without affecting others', () => {
      const session1 = 'session-1'
      const session2 = 'session-2'

      useChatStore.getState().addMessage(session1, {
        id: 'msg-1',
        role: 'user',
        content: 'Session 1',
        timestamp: new Date(),
      })

      useChatStore.getState().addMessage(session2, {
        id: 'msg-2',
        role: 'user',
        content: 'Session 2',
        timestamp: new Date(),
      })

      useChatStore.getState().clearMessages(session1)

      expect(useChatStore.getState().getMessages(session1)).toHaveLength(0)
      expect(useChatStore.getState().getMessages(session2)).toHaveLength(1)
    })
  })

  describe('Edge Cases', () => {
    it('should handle updating non-existent message', () => {
      const sessionId = 'session-1'
      useChatStore.getState().updateMessage(sessionId, 'non-existent', { content: 'Updated' })

      // Should not throw, just do nothing
      expect(useChatStore.getState().getMessages(sessionId)).toHaveLength(0)
    })

    it('should handle appending to non-existent message', () => {
      const sessionId = 'session-1'
      useChatStore.getState().appendToMessage(sessionId, 'non-existent', ' more')

      // Should not throw, just do nothing
      expect(useChatStore.getState().getMessages(sessionId)).toHaveLength(0)
    })

    it('should handle deleting non-existent message', () => {
      const sessionId = 'session-1'
      useChatStore.getState().deleteMessage(sessionId, 'non-existent')

      // Should not throw
      expect(useChatStore.getState().getMessages(sessionId)).toHaveLength(0)
    })

    it('should handle updating non-existent tool call', () => {
      useChatStore.getState().updateToolCall('non-existent', { status: 'completed' })

      // Should not throw
      expect(useChatStore.getState().activeToolCalls).toHaveLength(0)
    })

    it('should handle empty content append', () => {
      const sessionId = 'session-1'
      const message: Message = {
        id: 'msg-1',
        role: 'user',
        content: 'Hello',
        timestamp: new Date(),
      }

      useChatStore.getState().addMessage(sessionId, message)
      useChatStore.getState().appendToMessage(sessionId, 'msg-1', '')

      const updated = useChatStore.getState().getMessageById(sessionId, 'msg-1')
      expect(updated?.content).toBe('Hello')
    })
  })
})
