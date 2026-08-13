'use client'

/**
 * Chat Page
 * 
 * Full-featured chat interface with SSE streaming, tool execution,
 * planning cards, confirmation requests, and multi-agent sessions.
 * Implements Tasks 3-9: Complete Chat Interface Implementation
 */

import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'

import { ChatInterface } from '@/components/chat/ChatInterface'
import { ChatTabs } from '@/components/chat/ChatTabs'
import { MessageInput } from '@/components/chat/MessageInput'
import { TypingIndicator } from '@/components/chat/TypingIndicator'
import { EmptyState } from '@/components/chat/EmptyState'
import { ToolExecutionCard } from '@/components/chat/ToolExecutionCard'
import { PlanWidget } from '@/components/chat/PlanWidget'
import { ConfirmationRequestCard } from '@/components/chat/ConfirmationRequestCard'
import { PendingConfirmationBanner } from '@/components/chat/PendingConfirmationBanner'
import { CorrectionCard } from '@/components/chat/CorrectionCard'
import { PageTransition } from '@/components/common/PageTransition'
import { Skeleton } from '@/components/common/Skeleton'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Avatar } from '@/components/common/Avatar'
import { Sidebar, SidebarToggle, SessionList, AgentList } from '@/components/sidebar'

import { getAgent, getSession, listSessions, listAgents } from '@/lib/api/services'
import { queryKeys } from '@/lib/query/client'
import { useUIStore, useToasts } from '@/lib/store/ui'
import { useAgentInfo, getAgentDisplayName } from '@/lib/hooks/useAgentInfo'
import { useAgentNameResolver } from '@/lib/hooks/useAgentNameResolver'
import {
  useChatStore,
  useActiveSession,
  useSessionMessages,
  useStreamingState,
  useToolCalls,
  useCorrectionEvents,
  useTimeline,
  ChatSession
} from '@/lib/store/chat'
import { Message } from '@/components/chat/Message'
import { OpenFileToolCard } from '@/components/chat/OpenFileToolCard'
import { useConfirmationStore } from '@/lib/stores/confirmationStore'
import { isPlanningToolCall } from '@/lib/sse/events'


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
  const queryClient = useQueryClient()
  const { error } = useToasts()
  const setPageTitle = useUIStore(state => state.setPageTitle)
  
  // URL parameters
  const agentId = searchParams.get('agent')
  const sessionId = searchParams.get('session')
  
  // Chat state
  const { activeSession, setActiveSession } = useActiveSession()
  const sessionTabs = useChatStore(state => state.sessionTabs)
  const addSession = useChatStore(state => state.addSession)
  const { messages, addMessage } = useSessionMessages(sessionId || activeSession?.sessionId)
  const { streamingMessages, isStreaming } = useStreamingState()
  const currentSessionId = sessionId || activeSession?.sessionId
  const { activeToolCalls } = useToolCalls(currentSessionId)
  const confirmationsMap = useConfirmationStore((state) => state.confirmations)
  const pendingCount = useConfirmationStore((state) => state.pendingCount)
  const pendingConfirmations = useMemo(
    () => Array.from(confirmationsMap.values()).filter((c) => c.status === 'pending'),
    [confirmationsMap]
  )
  const hasActiveConfirmations = pendingCount > 0
  const { correctionEvents, removeCorrectionEvent } = useCorrectionEvents(currentSessionId)
  const timeline = useTimeline(currentSessionId)
  const isInputDisabled = useChatStore(state => state.isInputDisabled)
  
  // Message input state
  const [inputValue, setInputValue] = useState('')
  const [isSending, setIsSending] = useState(false)
  const sendingRef = useRef(false)

  // Set to true while handleSendMessage is creating a new session and has not
  // yet had the URL updated by Next.js. Prevents the "No sessionId in URL"
  // effect from incorrectly tearing down the active session during the
  // transitional renders that occur between setActiveSession() and the URL
  // param update propagating through useSearchParams().
  const isNavigatingToSessionRef = useRef(false)
  
  // Sidebar state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [sidebarView, setSidebarView] = useState<'agents' | 'chats'>('chats')
  
  // Load sessions for sidebar
  const {
    data: sessionsData,
    isLoading: isLoadingSessions,
  } = useQuery({
    queryKey: queryKeys.sessions.list(),
    queryFn: () => listSessions(),
    staleTime: 30 * 1000, // 30 seconds
  })
  
  // Load agents for sidebar
  const {
    data: agentsData,
    isLoading: isLoadingAgents,
  } = useQuery({
    queryKey: queryKeys.agents.list(),
    queryFn: () => listAgents(),
    staleTime: 60 * 1000, // 1 minute
  })
  
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

  // Load session if specified - DO NOT include events, only metadata
  const {
    data: session,
    isLoading: isLoadingSession,
    error: sessionError,
  } = useQuery({
    queryKey: queryKeys.sessions.detail(sessionId!),
    queryFn: () => getSession(sessionId!, false), // includeEvents=false - events come from SSE
    enabled: !!sessionId,
  })
  
  // Fetch agent info from session's agentId (with caching)
  // This is used to display the correct agent name in messages
  const sessionAgentId = session?.agentId || activeSession?.agentId
  const { agentInfo } = useAgentInfo(sessionAgentId, !!sessionAgentId)
  
  // Determine which agent info to use (URL param agent takes precedence, then session agent)
  const displayAgent = agent || agentInfo

  // Resolve agent IDs → display names; fetches unknown IDs on demand.
  // Must be called unconditionally before any early returns.
  const resolveAgentName = useAgentNameResolver(agentsData as any, displayAgent as any)

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
          connectionStatus: existingInStore?.connectionStatus ?? 'disconnected' as const,
          lastActivity: typeof session.updatedTime === 'string' ? session.updatedTime : new Date().toISOString(),
          lastProcessedEventIndex: existingInStore?.lastProcessedEventIndex ?? -1,
          messageCount: (session as any).messageCount || 0,
          status: (session.status as any) || 'ACTIVE',
          createdTime: typeof session.createdTime === 'string' ? session.createdTime : new Date().toISOString(),
          updatedTime: typeof session.updatedTime === 'string' ? session.updatedTime : new Date().toISOString(),
          toolCalls: existingInStore?.toolCalls ?? {},
          confirmations: existingInStore?.confirmations ?? {},
          corrections: existingInStore?.corrections ?? {},
          activePlan: existingInStore?.activePlan ?? null,
          timeline: existingInStore?.timeline ?? [],
        }
        
        addSession(chatSession)
        setActiveSession(session.id)
        
        // Always open SSE stream to get session events (both historic and new)
        // The backend will send all events through the stream
        const openStreamForSession = async () => {
          try {
            const { getAGUIEventHandler } = await import('@/lib/sse/handler')
            const { openSessionStream } = await import('@/lib/api/services')
            const { useConfirmationStore } = await import('@/lib/stores/confirmationStore')
            const eventHandler = getAGUIEventHandler()

            // Clear confirmations and timeline so the replayed event stream is the sole source of truth
            useConfirmationStore.getState().clearConfirmations()
            useChatStore.getState().clearTimeline(session.id)
            
            // Always reset the handler's per-connection counter when opening a new
            // SSE stream. The backend replays from event index 0 on every connection,
            // so the handler counter must also start from 0. The store's
            // lastProcessedEventIndex independently controls which replayed events
            // get skipped, so resetting the handler counter here is always safe.
            const skipUpTo = chatStore.sessions[session.id]?.lastProcessedEventIndex ?? -1
            console.log('Opening SSE stream for session:', session.id, '— handler counter reset, skipping events 0..', skipUpTo)
            eventHandler.resetSessionIndex(session.id)
            
            console.log('Opening SSE stream for session:', session.id, 'status:', session.status)
            const eventSource = openSessionStream(
              session.id,
              (event) => {
                eventHandler.handleSSEMessage(event, session.id)
              },
              (_error) => {
                useChatStore.getState().commitIncompleteStreamingMessages(session.id)
              }
            )
            
            // Store the event source
            chatStore.setSSEConnection(eventSource)
          } catch (error) {
            console.error('Failed to open SSE stream for session:', error)
          }
        }
        
        openStreamForSession()
      }
    }
  }, [session, sessionId, activeSession])

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
  const handleSendMessage = async (message: string, attachments?: Array<{ type: 'file'; fileDetails: import('@/lib/api/services').FileDetails }>) => {
    if ((!message.trim() && (!attachments || attachments.length === 0)) || isSending || sendingRef.current) return
    
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
          const newSession: ChatSession = {
            sessionId: newSessionId,
            agentId: targetAgentId || '',
            name: `Chat with ${agent?.name || 'Agent'}`,
            messages: [],
            isStreaming: false,
            connectionStatus: 'disconnected' as const,
            lastActivity: new Date().toISOString(),
            lastProcessedEventIndex: -1, // Initialize event index tracking
            id: newSessionId,
            status: 'ACTIVE' as const,
            messageCount: 0,
            createdTime: new Date().toISOString(),
            updatedTime: new Date().toISOString(),
            // Session-scoped widget state
            toolCalls: {},
            confirmations: {},
            corrections: {},
            activePlan: null,
            timeline: [],
          }
          
          addSession(newSession)
          setActiveSession(newSessionId)
          currentSessionId = newSessionId
        }

        // Track whether this is a brand-new session — if so we must open a fresh
        // SSE stream after getting the real backend session ID. For existing sessions
        // the stream is already open from the session-load effect.
        const wasNewSession = currentSessionId.startsWith('session-')

        if (wasNewSession) {
          console.log('Created new temp session:', currentSessionId, 'and set as active')
        }
        
        // Add user message immediately to UI with a temporary ID
        const tempMessageId = `temp-user-${Date.now()}`
        
        const userMessage = {
          messageId: tempMessageId,
          sessionId: currentSessionId,
          role: 'user' as const,
          content: message.trim(),
          timestamp: new Date().toISOString(),
          id: tempMessageId,
          createdTime: new Date().toISOString(),
          updatedTime: new Date().toISOString(),
          attachments: attachments && attachments.length > 0
            ? attachments.map(a => ({
                name: a.fileDetails.name,
                source: a.fileDetails.source,
                type: a.fileDetails.type as 'CLOUDSTORAGE' | 'UNKNOWN',
                mimeType: a.fileDetails.mimeType,
                size: a.fileDetails.size,
              }))
            : undefined,
        }
        
        // Add to store WITHOUT marking as processed
        // The backend will send this message back with a real ID via SSE
        // and we'll replace the temp message then
        chatStore.addMessage(currentSessionId, userMessage)
        chatStore.addTimelineItem(currentSessionId, { type: 'message', id: tempMessageId, role: 'user' })
        setInputValue('')
        
        if (!targetAgentId) {
          throw new Error('No agent ID available')
        }

        const { getAGUIEventHandler } = await import('@/lib/sse/handler')
        const { invokeAgentStream } = await import('@/lib/api/services')
        const eventHandler = getAGUIEventHandler()

        // Close any existing GET EventSource — the invoke stream replaces it for this turn.
        if (chatStore.sseConnection) {
          chatStore.sseConnection.close()
          chatStore.setSSEConnection(null)
        }

        try {
          await invokeAgentStream(
            targetAgentId,
            {
              threadId: currentSessionId.startsWith('session-') ? undefined : currentSessionId,
              text: message.trim() || undefined,
              files: attachments?.map(a => a.fileDetails),
            },
            {
              onSessionId: (backendSessionId) => {
                if (backendSessionId === currentSessionId) return

                // Migrate temp session → real backend session ID
                const freshStore = useChatStore.getState()
                const prevId = currentSessionId!
                const tempSession = freshStore.sessions[prevId]

                if (tempSession) {
                  freshStore.addSession({
                    ...tempSession,
                    sessionId: backendSessionId,
                    id: backendSessionId,
                    messages: tempSession.messages.map((m: any) => ({ ...m, sessionId: backendSessionId })),
                  })
                  freshStore.removeSession(prevId)
                }

                currentSessionId = backendSessionId
                isNavigatingToSessionRef.current = true
                setActiveSession(backendSessionId)
                router.replace(`/chat?session=${backendSessionId}`, { scroll: false })
              },
              onEvent: (rawData, sid) => {
                eventHandler.handleEvent(rawData, sid)
              },
              onError: (err) => {
                const now = new Date().toISOString()
                const id = `error-${Date.now()}`
                const sid = currentSessionId!
                useChatStore.getState().addMessage(sid, {
                  id, messageId: id, sessionId: sid,
                  role: 'assistant', content: `❌ **Error**: ${err.message}`,
                  createdTime: now, updatedTime: now,
                })
              },
            }
          )
        } catch (apiError: any) {
          const now = new Date().toISOString()
          const id = `error-${Date.now()}`
          const sid = currentSessionId!
          chatStore.addMessage(sid, {
            id, messageId: id, sessionId: sid,
            role: 'assistant',
            content: apiError.message?.includes('timeout')
              ? 'Request timed out. Please try again.'
              : 'An error occurred while processing your message. Please try again.',
            createdTime: now, updatedTime: now,
          })
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
      
      // Reset state immediately
      resetState()
    }
  }

  // Handle suggested prompt clicks
  const handlePromptClick = (prompt: string) => {
    setInputValue(prompt)
  }

  // Handle scroll to first pending confirmation
  const handleScrollToFirstConfirmation = () => {
    const firstConfirmation = document.querySelector('[data-confirmation-status="pending"]')
    firstConfirmation?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  // Check if we're loading session data (not just the initial query state)
  const isLoadingSessionData = isLoadingSession && sessionId

  // Error state
  if (agentError || sessionError) {
    return (
      <PageTransition pageKey="error">
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
  console.log('💬 Messages Debug:', {
    sessionId,
    activeSessionId: activeSession?.sessionId,
    messagesCount: allMessages.length,
    hasValidContext: !!(sessionId || agentId),
    streamingCount: Object.keys(streamingMessages).length
  })
  // Only show messages if we have a valid session or agent in the URL
  // Don't check activeSession from store to avoid showing stale data during transitions
  const hasValidContext = !!(sessionId || agentId)
  const hasMessages = hasValidContext && (allMessages.length > 0 || Object.keys(streamingMessages).length > 0)
  const activePlan = useChatStore((state) =>
    currentSessionId ? state.sessions[currentSessionId]?.activePlan ?? null : null
  )
  
  // Show loading state when we have a session but no messages yet (waiting for SSE)
  const isWaitingForMessages = hasValidContext && !hasMessages && isLoadingSessionData

  const messageById = useMemo(() => {
    const map = new Map<string, typeof allMessages[0]>()
    for (const msg of allMessages) map.set(msg.messageId || msg.id, msg)
    return map
  }, [allMessages])

  const toMessageProps = (msg: typeof allMessages[0]) => ({
    id: msg.messageId || msg.id,
    content: msg.content,
    sender: (msg.role === 'user' ? 'user' : 'agent') as 'user' | 'agent',
    senderName: msg.role === 'user' ? 'You' : resolveAgentName(msg.metadata?.agentId as string | undefined),
    senderAvatar: msg.role === 'user' ? undefined : (displayAgent as any)?.avatar,
    timestamp: new Date(msg.createdTime || msg.updatedTime || Date.now()),
    attachments: msg.attachments,
  })

  return (
    <PageTransition pageKey={sessionId || agentId || 'new-chat'}>
      <div className="h-screen bg-background flex overflow-hidden relative">
        {/* Sidebar */}
        <Sidebar
          isOpen={true}
          isCollapsed={isSidebarCollapsed}
          onClose={() => {}}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          header={
            <div className="space-y-4">
              {/* Logo/Title */}
              <h1 className="text-xl font-bold text-text-primary">
                Agent Console
              </h1>

              {/* View Toggle */}
              <SidebarToggle
                activeView={sidebarView}
                onViewChange={(view) => setSidebarView(view)}
              />

              {/* New Chat/Agent Button */}
              <Button
                variant="primary"
                icon={<Plus size={16} />}
                onClick={() => {
                  if (sidebarView === 'chats') {
                    // Get agent ID for new chat from current context
                    const targetAgentId = agentId || session?.agentId || sessionAgentId || displayAgent?.id
                    
                    if (!targetAgentId) {
                      console.error('No agent ID available for new chat')
                      return
                    }
                    
                    // Close any active SSE connections
                    const chatStore = useChatStore.getState()
                    if (chatStore.sseConnection) {
                      chatStore.sseConnection.close()
                      chatStore.setSSEConnection(null)
                    }
                    
                    // Clear only the active session, keep sessions for sidebar
                    chatStore.setActiveSession(null)
                    setInputValue('')
                    
                    // Navigate to new chat with agent
                    router.replace(`/chat?agent=${targetAgentId}`, { scroll: false })
                  } else {
                    // Navigate to create agent page
                    router.push('/agents/new')
                  }
                }}
                className="w-full"
              >
                {sidebarView === 'chats' ? 'New Chat' : 'New Agent'}
              </Button>
            </div>
          }
        >
          {/* Content based on view */}
          {sidebarView === 'chats' ? (
            <SessionList
              sessions={(sessionsData?.items || []).map(s => {
                // Try to get agent name from the agents list we already fetched
                const sessionAgent = (agentsData?.items || []).find(a => a.id === s.agentId)
                return {
                  id: s.id,
                  sessionTitle: s.name || 'Untitled Session',
                  agentName: sessionAgent?.name || (s as any).agentName || 'Agent',
                  agentId: s.agentId,
                  lastMessage: (s as any).lastMessage || s.name || 'Untitled Session',
                  lastActivity: new Date(s.updatedTime || s.createdTime || Date.now()),
                }
              })}
              activeSessionId={sessionId || activeSession?.sessionId}
              isLoading={isLoadingSessions}
              onSessionClick={(clickedSessionId) => {
                // Update URL without full page reload
                router.replace(`/chat?session=${clickedSessionId}`, { scroll: false })
              }}
              onSessionDelete={async (sessionId) => {
                // TODO: Implement session deletion
                console.log('Delete session:', sessionId)
              }}
              onCreateSession={() => {
                // Get agent ID for new chat
                const targetAgentId = agentId || session?.agentId || sessionAgentId || displayAgent?.id
                
                if (!targetAgentId) {
                  console.error('No agent ID available for new chat')
                  return
                }
                
                // Close any active SSE connections
                const chatStore = useChatStore.getState()
                if (chatStore.sseConnection) {
                  chatStore.sseConnection.close()
                  chatStore.setSSEConnection(null)
                }
                
                // Clear only the active session, keep sessions for sidebar
                chatStore.setActiveSession(null)
                setInputValue('')
                
                // Navigate to new chat with agent
                router.replace(`/chat?agent=${targetAgentId}`, { scroll: false })
              }}
            />
          ) : (
            <AgentList
              agents={(agentsData?.items || []).map(a => ({
                id: a.id,
                name: a.name,
                description: a.description,
                avatarUrl: (a as any).avatar,
              }))}
              activeAgentId={agentId || sessionAgentId}
              isLoading={isLoadingAgents}
              onAgentClick={(agentId: string) => {
                // Clear current session and start chat with selected agent
                const chatStore = useChatStore.getState()
                chatStore.clearAllSessions()
                router.push(`/chat?agent=${agentId}`)
              }}
            />
          )}
        </Sidebar>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative z-10">
          {/* Header */}
          <header className="flex-shrink-0 border-b border-border-subtle bg-surface">
            <div className="max-w-4xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h1 className="text-xl font-semibold text-text-primary">
                    {displayAgent ? `Chat with ${getAgentDisplayName(displayAgent)}` : session ? session.name : 'Chat'}
                  </h1>
                  {displayAgent?.description && (
                    <p className="text-sm text-text-tertiary mt-1">
                      {displayAgent.description}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-3">
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
            <div className="flex-shrink-0">
              <PendingConfirmationBanner
                count={pendingConfirmations.length}
                onScrollToFirst={handleScrollToFirstConfirmation}
                onDismiss={() => useConfirmationStore.getState().clearConfirmations()}
                isVisible={true}
              />
            </div>
          )}

          {/* Chat Interface - Takes remaining space and handles its own scrolling */}
          <div className="flex-1 min-h-0">
            <ChatInterface
              tabs={undefined}
              scrollDependencies={[messages.length, Object.keys(streamingMessages).length]}
              messages={
                isWaitingForMessages ? (
                  // Show loading skeletons while waiting for SSE events
                  <div className="space-y-6 px-6 py-8" data-testid="message-loading">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className={`flex gap-4 ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                        {i % 2 === 0 && (
                          <div className="flex-shrink-0">
                            <Skeleton className="h-8 w-8 rounded-full" />
                          </div>
                        )}
                        <div className={`flex-1 max-w-2xl ${i % 2 === 1 ? 'flex justify-end' : ''}`}>
                          <Card className={`p-4 ${i % 2 === 1 ? 'max-w-md' : 'w-full'}`}>
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-4 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-5/6" />
                          </Card>
                        </div>
                        {i % 2 === 1 && (
                          <div className="flex-shrink-0">
                            <Skeleton className="h-8 w-8 rounded-full" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : hasMessages ? (
                  <div className="space-y-0" data-testid="message-list">
                    {timeline.map((item, idx) => {
                      const prevItem = idx > 0 ? timeline[idx - 1] : null

                      if (item.type === 'message') {
                        const streaming = streamingMessages[item.id]
                        const committed = messageById.get(item.id)

                        if (streaming) {
                          const isUserMsg = item.role === 'user'
                          const displayName = isUserMsg ? 'You' : resolveAgentName(item.agentId)
                          return (
                            <div
                              key={item.id}
                              className="flex gap-4 group relative mt-10"
                              data-role={isUserMsg ? 'user' : 'assistant'}
                            >
                              <div className="flex-shrink-0">
                                <Avatar
                                  src={isUserMsg ? undefined : (displayAgent as any)?.avatar}
                                  name={displayName}
                                  size="sm"
                                  variant={isUserMsg ? 'user' : 'agent'}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-2 mb-2">
                                  <span className="text-sm font-semibold text-text-primary">
                                    {displayName}
                                  </span>
                                  <span className="text-xs text-text-tertiary">
                                    {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                  </span>
                                </div>
                                <div className="text-[15px] text-text-primary whitespace-pre-wrap break-words leading-[1.75] font-normal tracking-[-0.01em] select-text cursor-text">
                                  {streaming.content}
                                  {!streaming.isComplete && (
                                    <span className="inline-block ml-1 w-2 h-4 bg-text-primary animate-pulse" />
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        }

                        if (committed) {
                          const props = toMessageProps(committed)
                          const prevCommitted = prevItem?.type === 'message'
                            ? (messageById.get(prevItem.id) ?? streamingMessages[prevItem.id])
                            : null
                          const prevSender = prevCommitted
                            ? ((prevCommitted as any).role === 'user' ? 'user' : 'agent')
                            : null
                          const prevAgentId = prevItem?.agentId
                          const timeDiff = prevCommitted
                            ? props.timestamp.getTime() - new Date(
                                (prevCommitted as any).createdTime ||
                                (prevCommitted as any).updatedTime ||
                                Date.now()
                              ).getTime()
                            : Infinity
                          // Only cluster if same sender AND same agent (different agents must always show their name)
                          const isClusteredWithPrevious =
                            prevSender === props.sender &&
                            prevAgentId === item.agentId &&
                            timeDiff < 2 * 60 * 1000

                          return (
                            <Message
                              key={item.id}
                              {...props}
                              isClusteredWithPrevious={isClusteredWithPrevious}
                            />
                          )
                        }

                        return null
                      }

                      if (item.type === 'tool_call') {
                        const toolCall = activeToolCalls[item.id]
                        if (!toolCall) return null

                        if (toolCall.toolName === 'open_file') {
                          return (
                            <div key={item.id} className="mt-6">
                              <OpenFileToolCard
                                toolCallId={toolCall.toolCallId}
                                parameters={toolCall.arguments || {}}
                                result={toolCall.result}
                                status={toolCall.status}
                                timestamp={new Date(toolCall.startTime)}
                                duration={toolCall.endTime
                                  ? (new Date(toolCall.endTime).getTime() - new Date(toolCall.startTime).getTime()) / 1000
                                  : undefined}
                              />
                            </div>
                          )
                        }

                        return (
                          <div key={item.id} className="mt-6">
                            <ToolExecutionCard
                              toolCallId={toolCall.toolCallId}
                              toolName={toolCall.toolName}
                              status={toolCall.status}
                              parameters={toolCall.arguments || {}}
                              result={toolCall.result}
                              timestamp={new Date(toolCall.startTime)}
                              duration={toolCall.endTime
                                ? (new Date(toolCall.endTime).getTime() - new Date(toolCall.startTime).getTime()) / 1000
                                : undefined}
                            />
                          </div>
                        )
                      }

                      if (item.type === 'plan') {
                        if (!activePlan) return null
                        return (
                          <div key={item.id} className="mt-6">
                            <PlanWidget plan={activePlan} />
                          </div>
                        )
                      }

                      if (item.type === 'confirmation') {
                        const confirmation = confirmationsMap.get(item.id)
                        if (!confirmation) return null
                        const agentName = confirmation.requestingAgentId
                          ? resolveAgentName(confirmation.requestingAgentId)
                          : undefined
                        return (
                          <div key={item.id} className="mt-6" data-confirmation-status={confirmation.status}>
                            <ConfirmationRequestCard
                              confirmation={confirmation}
                              linkedToolName={confirmation.linkedToolCallId ? `Tool ${confirmation.linkedToolCallId}` : undefined}
                              sessionId={activeSession?.sessionId}
                              agentName={agentName}
                            />
                          </div>
                        )
                      }

                      if (item.type === 'correction') {
                        const correction = correctionEvents[item.id]
                        if (!correction) return null
                        return (
                          <div key={item.id} className="mt-6">
                            <CorrectionCard
                              correction={correction}
                              onDismiss={() => removeCorrectionEvent(correction.correctionId)}
                            />
                          </div>
                        )
                      }

                      return null
                    })}

                    {/* Typing Indicator — shown when streaming but no text delta has arrived yet */}
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
      </div>
    </PageTransition>
  )
}