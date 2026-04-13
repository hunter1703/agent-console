'use client'

/**
 * Sessions Browser Page
 * 
 * Hierarchical list of all conversations with search, filtering, and management.
 * Implements Task 13: Session Browser Implementation
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Search, Trash2, Filter, ChevronRight } from 'lucide-react'

import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { Skeleton } from '@/components/common/Skeleton'
import { SearchInput } from '@/components/sidebar/SearchInput'
import { ScrollReveal, ScrollStagger } from '@/components/common/ScrollReveal'
import { PageTransition } from '@/components/common/PageTransition'
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '@/components/markdown/Table'
import { Avatar } from '@/components/common/Avatar'

import { listSessions, deleteSession, listAgents, type Session, type Agent, type PaginatedResult } from '@/lib/api/services'
import { apiClient } from '@/lib/api/client'
import { queryKeys } from '@/lib/query/client'
import { useUIStore, useToasts, useDialogs } from '@/lib/store/ui'
import { springPresets } from '@/lib/constants/animations'
import { formatRelativeTime } from '@/lib/utils/formatDate'
import { cn } from '@/lib/utils'

type SortOption = 'newest' | 'oldest' | 'name' | 'agent'

export default function SessionsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { success, error } = useToasts()
  const { danger } = useDialogs()
  const setPageTitle = useUIStore(state => state.setPageTitle)
  
  // Local state
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [page, setPage] = useState(1)
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set())
  
  const ITEMS_PER_PAGE = 20
  
  // Set page title with immediate document.title update as fallback
  useEffect(() => {
    // Multiple immediate title updates for maximum reliability
    document.title = 'Sessions - Agent Console'
    
    // Set through store
    setPageTitle('Sessions')
    
    // Additional immediate fallbacks
    const timers = [
      setTimeout(() => {
        document.title = 'Sessions - Agent Console'
      }, 0),
      setTimeout(() => {
        document.title = 'Sessions - Agent Console'
      }, 50),
      setTimeout(() => {
        document.title = 'Sessions - Agent Console'
      }, 200)
    ]
    
    return () => timers.forEach(clearTimeout)
  }, [setPageTitle])

  // Load sessions with stable sorting
  const {
    data: sessionsData,
    isLoading,
    error: loadError,
    refetch,
  } = useQuery({
    queryKey: queryKeys.sessions.list({ 
      search: searchQuery, 
      sort: sortBy, 
      page 
    }),
    queryFn: () => {
      const sortConfig = {
        newest: { field: 'updatedTime', order: 'DESC' as const },
        oldest: { field: 'updatedTime', order: 'ASC' as const },
        name: { field: 'name', order: 'ASC' as const },
        agent: { field: 'agentId', order: 'ASC' as const },
      }
      
      return listSessions({
        sort: sortConfig[sortBy],
        page: { page: page - 1, limit: ITEMS_PER_PAGE }, // API uses 0-based indexing
      })
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    // Don't keep previous data to avoid animation glitches
    placeholderData: undefined,
  })

  // Delete session mutation
  const deleteSessionMutation = useMutation({
    mutationFn: deleteSession,
    onSuccess: () => {
      success('Session deleted successfully')
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all })
    },
    onError: (err: any) => {
      error('Failed to delete session', err.message)
    },
  })

  const sessions = sessionsData?.items || []
  const totalSessions = sessionsData?.totalElements || 0
  const totalPages = Math.ceil(totalSessions / ITEMS_PER_PAGE)
  
  // Extract unique agent IDs from sessions
  const uniqueAgentIds = Array.from(new Set(sessions.map(session => session.agentId).filter(Boolean)))
  
  // Fetch agent details for all unique agent IDs
  const { data: agentsData, isLoading: agentsLoading } = useQuery({
    queryKey: ['agents', 'byIds', uniqueAgentIds.sort()], // Sort for consistent cache key
    queryFn: async () => {
      if (uniqueAgentIds.length === 0) return {}
      
      try {
        // Use the catalog list API with a filter to fetch only the agents we need
        const result = await apiClient.post<PaginatedResult<Agent>>(
          '/v1/catalog/list',
          { 
            assetType: 'Agent',
            query: {
              filter: {
                field: 'id',
                op: 'IN',
                values: uniqueAgentIds
              }
            }
          }
        )
        
        // Create a map of agentId -> agent for quick lookup
        const agentMap: Record<string, Agent> = {}
        result.items.forEach(agent => {
          agentMap[agent.id] = agent
        })
        
        return agentMap
      } catch (error) {
        console.warn('Failed to fetch agent details:', error)
        return {}
      }
    },
    enabled: uniqueAgentIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
  
  // Helper function to get agent name by ID
  const getAgentName = (agentId?: string) => {
    if (!agentId) return 'Unknown Agent'
    if (agentsLoading) return 'Loading...'
    if (!agentsData) return 'Unknown Agent'
    return agentsData[agentId]?.name || 'Unknown Agent'
  }
  
  // Filter sessions by search query
  const filteredSessions = sessions.filter(session =>
    session.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Generate a consistent color for the agent based on agent name
  const getAgentColor = (agentId?: string) => {
    const agentName = getAgentName(agentId)
    if (!agentName || agentName === 'Unknown Agent' || agentName === 'Loading...') return 'bg-gray-500'
    
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-cyan-500'
    ]
    
    // Simple hash function to get consistent color for same agent name
    let hash = 0
    for (let i = 0; i < agentName.length; i++) {
      hash = ((hash << 5) - hash + agentName.charCodeAt(i)) & 0xffffffff
    }
    return colors[Math.abs(hash) % colors.length]
  }

  // Group sessions by parent-child relationships
  const groupedSessions = filteredSessions.reduce((acc, session) => {
    if (!session.parentSessionId) {
      // This is a parent session
      acc.push({
        parent: session,
        children: filteredSessions.filter(s => s.parentSessionId === session.id)
      })
    }
    return acc
  }, [] as Array<{ parent: Session; children: Session[] }>)

  // Navigation handlers
  const handleSessionClick = (sessionId: string) => {
    router.push(`/chat?session=${sessionId}`)
  }

  const handleDeleteSession = (session: Session) => {
    danger(
      'Delete Session',
      `Are you sure you want to delete this conversation? This action cannot be undone.`,
      () => deleteSessionMutation.mutate(session.id)
    )
  }

  const handleNewChat = () => {
    router.push('/chat')
  }

  const toggleSessionExpansion = (sessionId: string) => {
    setExpandedSessions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId)
      } else {
        newSet.add(sessionId)
      }
      return newSet
    })
  }

  return (
    <PageTransition>
      <div className="h-full flex flex-col bg-background">
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-6">
          {/* Consistent top spacing */}
          <div className="mb-12" />
          
          {/* Header */}
          <ScrollReveal>
            <div className="flex-shrink-0 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-text-primary">Sessions</h1>
                <p className="text-text-tertiary mt-2">
                  Browse and manage your chat sessions
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Search and Controls */}
          <ScrollReveal>
            <div className="flex-shrink-0 flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex-1">
                <SearchInput
                  placeholder="Search sessions..."
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onSearch={setSearchQuery}
                />
              </div>
              
              <div className="flex gap-2">
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="appearance-none px-3 py-2 pr-8 rounded-md border border-border-medium bg-surface text-text-primary text-sm cursor-pointer"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="name">By Name</option>
                    <option value="agent">By Agent</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg className="w-4 h-4 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Stats */}
          <ScrollReveal>
            <div className="flex-shrink-0 flex items-center justify-between mb-6">
              <div className="text-sm text-text-tertiary">
                {totalSessions === 0 ? (
                  'No sessions'
                ) : searchQuery ? (
                  `${filteredSessions.length} of ${totalSessions} sessions matching "${searchQuery}"`
                ) : (
                  `${totalSessions} ${totalSessions === 1 ? 'session' : 'sessions'}`
                )}
              </div>
              
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-text-secondary px-3">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          </ScrollReveal>

          {/* Sessions List - Scrollable Container */}
          <ScrollReveal>
            <div className="flex-1 min-h-0">
              {isLoading ? (
                <div className="h-full overflow-y-auto max-h-[calc(100vh-400px)]">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableHeaderCell>Sessions</TableHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[...Array(8)].map((_, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Skeleton className="w-10 h-10 rounded-full" />
                              <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-full max-w-md" />
                              </div>
                              <Skeleton className="h-6 w-20 rounded-full" />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : loadError ? (
                <Card className="p-8 text-center h-full flex items-center justify-center">
                  <div>
                    <p className="text-error mb-4">Failed to load sessions</p>
                    <Button onClick={() => refetch()} size="sm">
                      Try Again
                    </Button>
                  </div>
                </Card>
              ) : filteredSessions.length === 0 ? (
                <Card className="p-12 text-center h-full flex items-center justify-center">
                  {searchQuery ? (
                    <div>
                      <Search size={64} className="mx-auto text-text-tertiary mb-6" />
                      <h2 className="text-xl font-semibold text-text-primary mb-2">
                        No sessions match your search
                      </h2>
                      <p className="text-text-secondary mb-6">
                        Try adjusting your search terms
                      </p>
                      <Button
                        variant="ghost"
                        onClick={() => setSearchQuery('')}
                      >
                        Clear Search
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <MessageSquare size={64} className="mx-auto text-text-tertiary mb-6" />
                      <h2 className="text-xl font-semibold text-text-primary mb-2">
                        No conversations yet
                      </h2>
                      <p className="text-text-secondary mb-6">
                        Start chatting with an agent to see your conversations here
                      </p>
                    </div>
                  )}
                </Card>
              ) : (
                <div className="h-full overflow-y-auto">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableHeaderCell>Sessions</TableHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <AnimatePresence mode="wait">
                        {groupedSessions.map(({ parent, children }) => (
                          <SessionTableGroup
                            key={parent.id} // Use stable session ID instead of including sortBy
                            parent={parent}
                            children={children}
                            isExpanded={expandedSessions.has(parent.id)}
                            onToggleExpansion={() => toggleSessionExpansion(parent.id)}
                            onSessionClick={handleSessionClick}
                            onSessionDelete={handleDeleteSession}
                            getAgentColor={getAgentColor}
                            getAgentName={getAgentName}
                          />
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </PageTransition>
  )
}

// Session Table Group Component (Parent + Children)
interface SessionTableGroupProps {
  parent: Session
  children: Session[]
  isExpanded: boolean
  onToggleExpansion: () => void
  onSessionClick: (sessionId: string) => void
  onSessionDelete: (session: Session) => void
  getAgentColor: (agentId?: string) => string
  getAgentName: (agentId?: string) => string
}

function SessionTableGroup({
  parent,
  children,
  isExpanded,
  onToggleExpansion,
  onSessionClick,
  onSessionDelete,
  getAgentColor,
  getAgentName,
}: SessionTableGroupProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [childHovered, setChildHovered] = useState<string | null>(null)

  return (
    <>
      {/* Parent Session Row */}
      <motion.tr
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ 
          duration: 0.2,
          ease: "easeOut",
          layout: { duration: 0.3, ease: "easeInOut" }
        }}
        onClick={() => onSessionClick(parent.id)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group hover:bg-surface-hover transition-colors cursor-pointer"
      >
        <TableCell>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {children.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleExpansion()
                  }}
                  className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded text-text-tertiary hover:text-text-primary hover:bg-surface-elevated transition-colors cursor-pointer"
                  aria-label={isExpanded ? 'Collapse' : 'Expand'}
                >
                  <motion.div
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    <ChevronRight size={12} />
                  </motion.div>
                </button>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-text-primary truncate">{parent.name}</span>
                  <span className="text-xs text-text-tertiary whitespace-nowrap">
                    • {formatRelativeTime(parent.updatedTime ? new Date(parent.updatedTime) : new Date())}
                  </span>
                </div>
                {children.length > 0 && (
                  <div className="text-xs text-text-tertiary mt-1">
                    {children.length} child session{children.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-2">
              <span className={cn(
                "px-2 py-1 text-xs font-medium text-white rounded-full whitespace-nowrap inline-block",
                getAgentColor(parent.agentId)
              )}>
                {getAgentName(parent.agentId)}
              </span>
              {isHovered && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    onSessionDelete(parent)
                  }}
                  className="p-1.5 rounded-md text-text-tertiary hover:text-error hover:bg-error/10 transition-colors cursor-pointer"
                  aria-label="Delete session"
                >
                  <Trash2 size={14} />
                </motion.button>
              )}
            </div>
          </div>
        </TableCell>
      </motion.tr>

      {/* Child Sessions */}
      <AnimatePresence>
        {isExpanded && children.map((child) => (
          <motion.tr
            key={child.id}
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={() => onSessionClick(child.id)}
            onMouseEnter={() => setChildHovered(child.id)}
            onMouseLeave={() => setChildHovered(null)}
            className="group hover:bg-surface-hover transition-colors cursor-pointer"
          >
          <TableCell>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0 pl-8">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-text-primary truncate">{child.name}</span>
                    <span className="text-xs text-text-tertiary whitespace-nowrap">
                      • {formatRelativeTime(child.updatedTime ? new Date(child.updatedTime) : new Date())}
                    </span>
                  </div>
                  <div className="text-xs text-text-tertiary mt-1">Child session</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-2">
                <span className={cn(
                  "px-2 py-1 text-xs font-medium text-white rounded-full whitespace-nowrap inline-block",
                  getAgentColor(child.agentId)
                )}>
                  {getAgentName(child.agentId)}
                </span>
                {childHovered === child.id && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      onSessionDelete(child)
                    }}
                    className="p-1.5 rounded-md text-text-tertiary hover:text-error hover:bg-error/10 transition-colors cursor-pointer"
                    aria-label="Delete session"
                  >
                    <Trash2 size={14} />
                  </motion.button>
                )}
              </div>
            </div>
          </TableCell>
        </motion.tr>
      ))}
      </AnimatePresence>
    </>
  )
}