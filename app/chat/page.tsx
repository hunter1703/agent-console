'use client'

/**
 * Chat Page
 * 
 * Full-featured chat interface with SSE streaming, tool execution,
 * planning cards, confirmation requests, and multi-agent sessions.
 * Implements Tasks 3-9: Complete Chat Interface Implementation
 */

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'

import { ChatInterface } from '@/components/chat/ChatInterface'
import { ChatTabs } from '@/components/chat/ChatTabs'
import { MessageList } from '@/components/chat/MessageList'
import { MessageInput } from '@/components/chat/MessageInput'
import { TypingIndicator } from '@/components/chat/TypingIndicator'
import { EmptyState } from '@/components/chat/EmptyState'
import { ToolExecutionCard } from '@/components/chat/ToolExecutionCard'
import { PlanningCard } from '@/components/chat/PlanningCard'
import { ConfirmationRequestCard } from '@/components/chat/ConfirmationRequestCard'
import { PendingConfirmationBanner } from '@/components/chat/PendingConfirmationBanner'
import { PageTransition } from '@/components/common/PageTransition'
import { Skeleton } from '@/components/common/Skeleton'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { MessageProps } from '@/components/chat/Message'

import { getAgent, getSession, invokeAgent, submitConfirmation } from '@/lib/api/services'
import { queryKeys } from '@/lib/query/client'
import { useUIStore, useToasts } from '@/lib/store/ui'
import { 
  useChatStore, 
  useActiveSession, 
  useSessionMessages, 
  useStreamingState,
  useToolCalls,
  useConfirmations
} from '@/lib/store/chat'

import { ErrorBoundary } from '@/components/common/ErrorBoundary'

export default function ChatPage() {
  return (
    <ErrorBoundary>
      <ChatPageContent />
    </ErrorBoundary>
  )
}

function ChatPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { error, success } = useToasts()
  const setPageTitle = useUIStore(state => state.setPageTitle)
  
  // URL parameters
  const agentId = searchParams.get('agent')
  const sessionId = searchParams.get('session')
  
  // Chat state
  const { activeSession, setActiveSession } = useActiveSession()
  const sessionTabs = useChatStore(state => state.sessionTabs)
  const addSession = useChatStore(state => state.addSession)
  const { messages, addMessage } = useSessionMessages()
  const { streamingMessages, isStreaming } = useStreamingState()
  const { activeToolCalls } = useToolCalls()
  const { activeConfirmations, hideConfirmation, hasActiveConfirmations } = useConfirmations()
  const isInputDisabled = useChatStore(state => state.isInputDisabled)
  
  // Message input state
  const [inputValue, setInputValue] = useState('')
  const [isSending, setIsSending] = useState(false)
  const sendingRef = useRef(false)
  
  // Load agent if specified
  const {
    data: agent,
    isLoading: isLoadingAgent,
    error: agentError,
  } = useQuery({
    queryKey: queryKeys.agents.detail(agentId!),
    queryFn: () => getAgent(agentId!),
    enabled: !!agentId,
  })

  // Load session if specified - include events to get complete history
  const {
    data: session,
    isLoading: isLoadingSession,
    error: sessionError,
  } = useQuery({
    queryKey: queryKeys.sessions.detail(sessionId!),
    queryFn: () => getSession(sessionId!, true), // includeEvents=true to get complete history
    enabled: !!sessionId,
  })

  // Set page title with immediate document.title update as fallback
  useEffect(() => {
    let title = 'Chat'
    if (agent) {
      title = `Chat with ${agent.name}`
    } else if (session) {
      title = `Session ${session.name}`
    }
    
    // Multiple immediate title updates for maximum reliability
    document.title = `${title} - Agent Console`
    
    // Set through store
    setPageTitle(title)
    
    // Additional immediate fallbacks
    const timers = [
      setTimeout(() => {
        document.title = `${title} - Agent Console`
      }, 0),
      setTimeout(() => {
        document.title = `${title} - Agent Console`
      }, 50),
      setTimeout(() => {
        document.title = `${title} - Agent Console`
      }, 200)
    ]
    
    return () => timers.forEach(clearTimeout)
  }, [agent, session, setPageTitle])

  // Handle session creation/loading
  useEffect(() => {
    if (session && !activeSession) {
      // Add session to store and set as active
      const chatSession = {
        ...session,
        sessionId: session.id,
        messages: [], // Messages will be loaded from session events
        isStreaming: false,
        connectionStatus: 'disconnected' as const,
        lastActivity: session.updatedTime || new Date().toISOString(),
      }
      
      addSession(chatSession)
      setActiveSession(session.id)
      
      // Load historic messages from session events if available
      // Note: The backend should return events when includeEvents=true is used
      // For now, we'll handle this when the backend supports it properly
      if ((session as any).events && Array.isArray((session as any).events)) {
        const chatStore = useChatStore.getState()
        ;(session as any).events.forEach((event: any) => {
          if (event.type === 'MESSAGE' && event.content) {
            const message = {
              id: event.id || `msg-${Date.now()}-${Math.random()}`,
              messageId: event.id || `msg-${Date.now()}-${Math.random()}`,
              sessionId: session.id,
              role: event.role || 'assistant',
              content: event.content,
              timestamp: event.timestamp || event.createdTime || new Date().toISOString(),
              createdTime: event.createdTime || event.timestamp || new Date().toISOString(),
              updatedTime: event.updatedTime || event.timestamp || new Date().toISOString(),
            }
            chatStore.addMessage(session.id, message)
          }
        })
      }
    }
  }, [session, activeSession, addSession, setActiveSession])

  // Ensure input is enabled when page loads and no confirmations are active
  useEffect(() => {
    const chatStore = useChatStore.getState()
    if (!hasActiveConfirmations && chatStore.isInputDisabled) {
      chatStore.setInputDisabled(false)
    }
  }, [hasActiveConfirmations])

  // Handle errors (removed to prevent infinite loops)
  // useEffect(() => {
  //   if (agentError) {
  //     error('Failed to load agent', agentError.message)
  //   }
  // }, [agentError, error])

  // useEffect(() => {
  //   if (sessionError) {
  //     error('Failed to load session', sessionError.message)
  //   }
  // }, [sessionError, error])

  // Handle message sending with streaming support
  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isSending || sendingRef.current) return
    
    sendingRef.current = true
    
    try {
      setIsSending(true)
      
      // Immediately update store to disable input
      const chatStore = useChatStore.getState()
      chatStore.setInputDisabled(true)
      
      if (agentId || (session && session.agentId)) {
        // Use agentId from URL parameter or from session data
        const targetAgentId = agentId || (session && session.agentId)
        
        // Create a session if we don't have one
        let currentSessionId = activeSession?.sessionId
        
        if (!currentSessionId) {
          // Create a temporary session for new chats
          const newSessionId = `session-${Date.now()}`
          const newSession = {
            sessionId: newSessionId,
            agentId: targetAgentId,
            name: `Chat with ${agent?.name || 'Agent'}`,
            messages: [],
            isStreaming: false,
            connectionStatus: 'disconnected' as const,
            lastActivity: new Date().toISOString(),
            id: newSessionId,
            status: 'ACTIVE' as const,
            messageCount: 0,
            createdTime: new Date().toISOString(),
            updatedTime: new Date().toISOString(),
          }
          
          addSession(newSession)
          setActiveSession(newSessionId)
          currentSessionId = newSessionId
        }
        
        // Add user message immediately to UI
        const userMessage = {
          messageId: `user-${Date.now()}`,
          sessionId: currentSessionId,
          role: 'user' as const,
          content: message.trim(),
          timestamp: new Date().toISOString(),
          id: `user-${Date.now()}`,
          createdTime: new Date().toISOString(),
          updatedTime: new Date().toISOString(),
        }
        
        // Use the store's addMessage function with sessionId
        chatStore.addMessage(currentSessionId, userMessage)
        setInputValue('')
        
        // Import the AGUI event handler
        const { getAGUIEventHandler } = await import('@/lib/sse/handler')
        const eventHandler = getAGUIEventHandler()
        
        // Send message to agent with streaming support
        try {
          const response = await Promise.race([
            invokeAgent(targetAgentId, {
              message: message.trim(),
              sessionId: currentSessionId,
            }, (event) => {
              // Handle streaming events in real-time
              try {
                // Create a MessageEvent-like object for the handler
                const messageEvent = new MessageEvent('message', {
                  data: JSON.stringify(event)
                })
                eventHandler.handleSSEMessage(messageEvent)
              } catch (error) {
                console.error('Error handling stream event:', error)
              }
            }),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Request timeout')), 30000)
            )
          ]) as any
          
          // The streaming events will have already updated the UI
          // The response contains the final message for fallback
          if (response && response.content) {
            // Ensure the final message is in the store (in case streaming failed)
            const existingMessages = chatStore.getSessionMessages(currentSessionId)
            const hasAssistantResponse = existingMessages.some(msg => 
              msg.role === 'assistant' && msg.id === response.id
            )
            
            if (!hasAssistantResponse) {
              const assistantResponse = {
                ...response,
                id: response.id || `assistant-${Date.now()}`,
                messageId: response.messageId || `assistant-${Date.now()}`,
                sessionId: currentSessionId,
                role: 'assistant' as const,
                timestamp: response.timestamp || new Date().toISOString(),
                createdTime: response.createdTime || new Date().toISOString(),
                updatedTime: response.updatedTime || new Date().toISOString(),
              }
              chatStore.addMessage(currentSessionId, assistantResponse)
            }
          }
        } catch (apiError: any) {
          console.error('API Error:', apiError)
          // Add error message as assistant response
          const errorResponse = {
            id: `assistant-error-${Date.now()}`,
            messageId: `assistant-error-${Date.now()}`,
            sessionId: currentSessionId,
            role: 'assistant' as const,
            content: apiError.message === 'Request timeout' 
              ? 'Request timed out. Please try again.'
              : 'I apologize, but I encountered an error while processing your message. Please try again.',
            timestamp: new Date().toISOString(),
            createdTime: new Date().toISOString(),
            updatedTime: new Date().toISOString(),
          }
          chatStore.addMessage(currentSessionId, errorResponse)
        }
      }
    } catch (err: any) {
      console.error('Failed to send message', err.message)
      error('Failed to send message', err.message)
    } finally {
      // Robust state reset with multiple fallbacks
      const resetState = () => {
        setIsSending(false)
        sendingRef.current = false
        
        // Update chat store to ensure input is enabled
        const chatStore = useChatStore.getState()
        chatStore.setInputDisabled(false)
      }
      
      // Immediate reset
      resetState()
      
      // Delayed reset as fallback
      setTimeout(resetState, 100)
      
      // Final fallback reset
      setTimeout(resetState, 500)
    }
  }

  // Handle suggested prompt clicks
  const handlePromptClick = (prompt: string) => {
    setInputValue(prompt)
  }

  // Handle confirmation submission
  const handleConfirmationSubmit = async (confirmationId: string, confirmed: boolean, answer?: string) => {
    if (!activeSession) return
    
    try {
      await submitConfirmation(activeSession.sessionId, {
        confirmationId,
        confirmed,
        answer,
      })
      
      hideConfirmation(confirmationId)
      success('Confirmation submitted', 'Your response has been sent to the agent')
    } catch (err: any) {
      error('Failed to submit confirmation', err.message)
    }
  }

  // Handle scroll to first pending confirmation
  const handleScrollToFirstConfirmation = () => {
    const firstConfirmation = document.querySelector('[data-confirmation-status="pending"]')
    firstConfirmation?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  // Loading state
  if (isLoadingAgent || isLoadingSession) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex flex-col">
          {/* Header skeleton */}
          <div className="border-b border-border-subtle bg-surface/50 backdrop-blur-sm">
            <div className="max-w-4xl mx-auto px-6 py-4">
              <Skeleton className="h-6 w-48" />
            </div>
          </div>
          
          {/* Chat skeleton */}
          <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-6 py-8">
            <div className="flex-1 space-y-4 mb-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                  <Card className="max-w-md p-4">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </Card>
                </div>
              ))}
            </div>
            
            {/* Input skeleton */}
            <Card className="p-4">
              <Skeleton className="h-12 w-full" />
            </Card>
          </div>
        </div>
      </PageTransition>
    )
  }

  // Error state
  if (agentError || sessionError) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Card className="p-8 text-center max-w-md">
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              {agentError ? 'Agent Not Found' : 'Session Not Found'}
            </h2>
            <p className="text-text-secondary mb-6">
              {agentError ? 
                'The requested agent could not be found.' :
                'The requested session could not be found.'
              }
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard')}
              >
                Go to Dashboard
              </Button>
              <Button
                onClick={() => router.push('/agents')}
              >
                Browse Agents
              </Button>
            </div>
          </Card>
        </div>
      </PageTransition>
    )
  }

  // Prepare messages and components for display
  const allMessages = messages || []
  const hasMessages = allMessages.length > 0 || Object.keys(streamingMessages).length > 0
  const pendingConfirmations = Object.values(activeConfirmations)
  const activePlanningCards = Object.values(activeToolCalls).filter(tc => 
    ['create_plan', 'update_plan', 'add_task', 'update_task_info', 'start_task', 'complete_task', 'update_task_status', 'finish_plan', 'view_plan'].includes(tc.toolName)
  )

  // Transform API messages to component props
  const transformedMessages = allMessages.map((msg): Omit<MessageProps, 'isClusteredWithPrevious'> => ({
    id: msg.messageId || msg.id,
    content: msg.content,
    sender: msg.role === 'user' ? 'user' : 'agent',
    senderName: msg.role === 'user' ? 'You' : agent?.name || 'Assistant',
    senderAvatar: msg.role === 'user' ? undefined : agent?.avatar,
    timestamp: new Date(msg.createdTime || msg.timestamp || Date.now()),
  }))

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="border-b border-border-subtle bg-surface">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h1 className="text-xl font-semibold text-text-primary">
                  {agent ? `Chat with ${agent.name}` : session ? session.name : 'Chat'}
                </h1>
                {agent?.description && (
                  <p className="text-sm text-text-tertiary mt-1">
                    {agent.description}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                {/* New Chat Button */}
                {(hasMessages || activeSession) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Clear current session and start fresh
                      const chatStore = useChatStore.getState()
                      chatStore.clearAllSessions()
                      setInputValue('')
                      // Navigate to new chat with same agent
                      if (agentId) {
                        router.push(`/chat?agent=${agentId}`)
                      } else {
                        router.push('/chat')
                      }
                    }}
                    className="text-xs"
                  >
                    New Chat
                  </Button>
                )}
                
                {/* Back to Dashboard Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/dashboard')}
                  className="text-xs text-text-tertiary hover:text-text-primary"
                >
                  ← Dashboard
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Pending Confirmations Banner */}
        {hasActiveConfirmations && (
          <PendingConfirmationBanner
            count={pendingConfirmations.length}
            onScrollToFirst={handleScrollToFirstConfirmation}
            isVisible={true}
          />
        )}

        {/* Multi-Agent Tabs */}
        {sessionTabs.length > 1 && (
          <div className="border-b border-border-subtle bg-surface/30">
            <div className="max-w-4xl mx-auto px-6">
              <ChatTabs />
            </div>
          </div>
        )}

        {/* Chat Interface */}
        <div className="flex-1 overflow-hidden">
          <ChatInterface
            tabs={sessionTabs.length > 1 ? <ChatTabs /> : undefined}
            messages={
              hasMessages ? (
                <div className="space-y-6" data-testid="message-list">
                  {/* Regular Messages */}
                  <MessageList messages={transformedMessages} />
                  
                  {/* Streaming Messages */}
                  {Object.values(streamingMessages).map(streamingMessage => (
                    <div key={streamingMessage.messageId} className="flex justify-start">
                      <div className="max-w-3xl" data-role="assistant">
                        <div className="bg-surface border border-border-subtle rounded-lg p-4">
                          <div className="text-text-primary whitespace-pre-wrap">
                            {streamingMessage.content}
                          </div>
                          {!streamingMessage.isComplete && (
                            <div className="mt-2">
                              <TypingIndicator />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Active Tool Calls */}
                  {Object.values(activeToolCalls).map(toolCall => (
                    <div key={toolCall.toolCallId}>
                      <ToolExecutionCard
                        toolCallId={toolCall.toolCallId}
                        toolName={toolCall.toolName}
                        status={toolCall.status}
                        arguments={toolCall.arguments}
                        result={toolCall.result}
                        startTime={toolCall.startTime}
                        endTime={toolCall.endTime}
                      />
                    </div>
                  ))}
                  
                  {/* Planning Cards */}
                  {activePlanningCards.map(planningTool => (
                    <div key={planningTool.toolCallId}>
                      <PlanningCard
                        plan={{
                          planId: planningTool.toolCallId,
                          title: planningTool.arguments?.title || 'Planning in progress...',
                          goal: planningTool.arguments?.goal || '',
                          status: planningTool.status === 'completed' ? 'COMPLETED' : 'IN_PROGRESS',
                          tasks: planningTool.arguments?.tasks || [],
                        }}
                      />
                    </div>
                  ))}
                  
                  {/* Active Confirmations */}
                  {pendingConfirmations.map(confirmation => (
                    <div 
                      key={confirmation.confirmationId}
                      data-confirmation-status="pending"
                    >
                      <ConfirmationRequestCard
                        confirmation={{
                          id: confirmation.confirmationId,
                          sessionId: activeSession?.sessionId || '',
                          type: confirmation.kind,
                          prompt: confirmation.prompt,
                          status: 'pending',
                          options: confirmation.options?.map((opt, idx) => ({
                            id: idx.toString(),
                            label: opt,
                            value: opt,
                          })),
                          createdAt: new Date().toISOString(),
                        }}
                        linkedToolName={confirmation.originalToolCallId ? `Tool ${confirmation.originalToolCallId}` : undefined}
                        onSubmit={(confirmed, answer) => 
                          handleConfirmationSubmit(confirmation.confirmationId, confirmed, answer)
                        }
                      />
                    </div>
                  ))}
                  
                  {/* Typing Indicator */}
                  {isStreaming && Object.keys(streamingMessages).length === 0 && (
                    <div className="mt-6" data-testid="typing-indicator">
                      <TypingIndicator />
                    </div>
                  )}
                </div>
              ) : undefined
            }
            emptyState={
              !hasMessages ? (
                <EmptyState onPromptClick={handlePromptClick} />
              ) : undefined
            }
            input={
              <MessageInput
                value={inputValue}
                onChange={setInputValue}
                onSend={handleSendMessage}
                isStreaming={isSending}
                disabled={isInputDisabled || isSending}
                placeholder="Type your message..."
              />
            }
          />
        </div>
      </div>
    </PageTransition>
  )
}