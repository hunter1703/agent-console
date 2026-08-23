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
import { InterruptRequestCard } from '@/components/chat/InterruptRequestCard'
import { PendingInterruptBanner } from '@/components/chat/PendingInterruptBanner'
import { CorrectionCard } from '@/components/chat/CorrectionCard'
import { ReasoningBlock } from '@/components/chat/ReasoningBlock'
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
import { useSessionStream } from '@/lib/hooks/useSessionStream'
import type { Session } from '@/lib/api/types'
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
import { useInterruptStore } from '@/lib/stores/interruptStore'
import { isPlanningToolCall } from '@/lib/sse/events'


import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { ConnectionStatusBanner } from '@/components/chat/ConnectionStatusBanner'

// Backend session status is passed through as an untyped string (see the `status: (session.status
// as any)` cast in the session-loading effect below), so this checks the real wire values rather
// than trusting lib/api/types.ts's SessionStatus union, which doesn't match what the API sends.
const TERMINAL_SESSION_STATUSES = new Set(['COMPLETED', 'FAILED', 'ERROR', 'CANCELLED'])
function isTerminalSessionStatus(status: string | undefined): boolean {
  return !!status && TERMINAL_SESSION_STATUSES.has(status)
}

/**
 * (Re)opens a GET session stream for a session that already has state in the store —
 * used both to recover from a dropped invoke stream and for the manual "Reconnect"
 * banner action.
 *
 * Deliberately leaves existing timeline/message/dedup state alone rather than committing
 * partial text or resetting anything up front: the replay resends each message's full
 * accumulated text as one chunk under the same canonical id (see lib/sse/id.ts), and
 * handleTextMessageStart already reinitializes a message's streaming buffer from scratch
 * on every START — so replayed content merges in cleanly without needing a pre-emptive
 * wipe, and without risking freezing truncated text in place (see useSessionStream.ts).
 */
async function reconnectToSession(sessionId: string): Promise<void> {
  const { openManagedSessionStream } = await import('@/lib/sse/managedStream')
  const { getAGUIEventHandler } = await import('@/lib/sse/handler')
  const eventHandler = getAGUIEventHandler()
  const store = useChatStore.getState()

  const stream = openManagedSessionStream(sessionId, {
    onEvent: (event) => eventHandler.handleSSEMessage(event, sessionId),
    onStatusChange: (status) => {
      useChatStore.getState().updateSession(sessionId, { connectionStatus: status })
      // Only commit partial text once reconnection is truly exhausted — see the matching
      // comment in useSessionStream.ts for why 'disconnected' (a transient, about-to-retry
      // state) is the wrong trigger for this.
      if (status === 'error') {
        useChatStore.getState().commitIncompleteStreamingMessages(sessionId)
      }
    },
    shouldReconnect: () => useChatStore.getState().sessions[sessionId]?.isStreaming === true,
  })
  store.setSSEConnection(stream)
}

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
  const interruptsMap = useInterruptStore((state) => state.interrupts)
  const pendingCount = useInterruptStore((state) => state.pendingCount)
  const pendingInterrupts = useMemo(
    () => Array.from(interruptsMap.values()).filter((c) => c.status === 'pending'),
    [interruptsMap]
  )
  const hasActiveInterrupts = pendingCount > 0
  const { correctionEvents, removeCorrectionEvent } = useCorrectionEvents(currentSessionId)
  const timeline = useTimeline(currentSessionId)
  const isInputDisabled = useChatStore(state => state.isInputDisabled)
  
  // Message input state
  const [inputValue, setInputValue] = useState('')
  const [isSending, setIsSending] = useState(false)
  const sendingRef = useRef(false)

  // Sidebar state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [sidebarView, setSidebarView] = useState<'agents' | 'chats'>('chats')
  
  // Load sessions for sidebar
  const {
    data: sessionsData,
    isLoading: isLoadingSessions,
  } = useQuery({
    queryKey: queryKeys.sessions.list({ sort: { field: 'updatedTime', order: 'DESC' } }),
    queryFn: () => listSessions({ sort: { field: 'updatedTime', order: 'DESC' } }),
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

  // Owns the GET session-stream lifecycle: opens it when the URL resolves to a session
  // that isn't yet active, tears it down on navigating away. See lib/hooks/useSessionStream.ts.
  const { markNavigatingToSession } = useSessionStream(session as Session | undefined, sessionId)

  // Ensure input is enabled when page loads and no interrupts are active
  useEffect(() => {
    const chatStore = useChatStore.getState()
    if (!hasActiveInterrupts && chatStore.isInputDisabled) {
      chatStore.setInputDisabled(false)
    }
  }, [hasActiveInterrupts])

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
            id: newSessionId,
            status: 'ACTIVE' as const,
            messageCount: 0,
            createdTime: new Date().toISOString(),
            updatedTime: new Date().toISOString(),
            // Session-scoped widget state
            toolCalls: {},
            interrupts: {},
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
                markNavigatingToSession()
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
          // Once RUN_STARTED has resolved a real backend session id, the run itself keeps
          // going server-side regardless of this connection — only the client's visibility
          // into it was lost. Fall back to the GET stream instead of leaving the user
          // stranded with no further updates.
          const isRealSession = !sid.startsWith('session-')

          chatStore.addMessage(sid, {
            id, messageId: id, sessionId: sid,
            role: 'assistant',
            content: apiError.message?.includes('timeout')
              ? 'Request timed out. Please try again.'
              : isRealSession
                ? 'Lost connection while the agent was responding. Reconnecting…'
                : 'An error occurred while processing your message. Please try again.',
            createdTime: now, updatedTime: now,
          })

          if (isRealSession) {
            await reconnectToSession(sid)
          }
        }
      } else {
        error('No agent selected', 'Choose an agent from "My Agents" before starting a conversation.')
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

  // Shared by the header "New Chat" button and the session list's empty-state affordance.
  // Both need an agent to start a chat against; if none is resolvable from the current
  // URL/session context, send the user to pick one instead of failing silently.
  const handleNewChat = () => {
    const targetAgentId = agentId || session?.agentId || sessionAgentId || displayAgent?.id

    if (!targetAgentId) {
      error('No agent selected', 'Choose an agent to start a new chat with.')
      setSidebarView('agents')
      return
    }

    const chatStore = useChatStore.getState()
    if (chatStore.sseConnection) {
      chatStore.sseConnection.close()
      chatStore.setSSEConnection(null)
    }

    chatStore.setActiveSession(null)
    setInputValue('')
    router.replace(`/chat?agent=${targetAgentId}`, { scroll: false })
  }

  // Handle scroll to first pending interrupt
  const handleScrollToFirstInterrupt = () => {
    const firstInterrupt = document.querySelector('[data-interrupt-status="pending"]')
    firstInterrupt?.scrollIntoView({ behavior: 'smooth', block: 'center' })
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
                    handleNewChat()
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
              onCreateSession={handleNewChat}
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

        {/* Main Chat Area — scoped to just this pane so switching sessions doesn't
            fade/re-mount the sidebar along with it. */}
        <PageTransition pageKey={sessionId || agentId || 'new-chat'} className="flex-1 flex flex-col overflow-hidden relative z-10">
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

          {/* Connection Status Banner — a terminal session's stream ends the same way a
              dropped one does (see managedStream.ts), so a "reconnect" affordance would be
              misleading here: there's nothing left to reconnect to. */}
          {activeSession?.connectionStatus === 'error' && !isTerminalSessionStatus(activeSession.status) && (
            <div className="flex-shrink-0">
              <ConnectionStatusBanner
                isVisible={true}
                onReconnect={() => reconnectToSession(activeSession.sessionId)}
              />
            </div>
          )}

          {/* Pending Interrupts Banner */}
          {hasActiveInterrupts && (
            <div className="flex-shrink-0">
              <PendingInterruptBanner
                count={pendingInterrupts.length}
                onScrollToFirst={handleScrollToFirstInterrupt}
                onDismiss={() => useInterruptStore.getState().clearInterrupts()}
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

                      if (item.type === 'interrupt') {
                        const interrupt = interruptsMap.get(item.id)
                        if (!interrupt) return null
                        const agentName = interrupt.requestingAgentId
                          ? resolveAgentName(interrupt.requestingAgentId)
                          : undefined
                        // The backend's interrupt_requested event never sends a tool name,
                        // only originalToolCallId — look the name up from that call's own
                        // TOOL_CALL_START instead.
                        const linkedToolName = interrupt.linkedToolCallId
                          ? activeToolCalls[interrupt.linkedToolCallId]?.toolName
                          : undefined
                        return (
                          <div key={item.id} className="mt-6" data-interrupt-status={interrupt.status}>
                            <InterruptRequestCard
                              interrupt={interrupt}
                              linkedToolName={linkedToolName}
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

                      if (item.type === 'reasoning') {
                        const block = streamingMessages[item.id]?.reasoning?.[0]
                        if (!block) return null
                        return <ReasoningBlock key={item.id} block={block} />
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
        </PageTransition>
      </div>
  )
}