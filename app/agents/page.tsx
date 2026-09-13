'use client'

/**
 * Agents Management Page
 * 
 * List view for managing agents with search, filtering, and CRUD operations.
 * Implements Task 10: Agent Management - List View
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Edit, Trash2, Clock } from 'lucide-react'

import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { Skeleton } from '@/components/common/Skeleton'
import { SearchInput } from '@/components/sidebar/SearchInput'
import { ScrollReveal, ScrollStagger } from '@/components/common/ScrollReveal'
import { PageTransition } from '@/components/common/PageTransition'
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '@/components/markdown/Table'

import { listAgents, deleteAgent, type Agent } from '@/lib/api/services'
import { queryKeys } from '@/lib/query/client'
import { useUIStore, useToasts, useDialogs } from '@/lib/store/ui'
import { springPresets } from '@/lib/constants/animations'
import { formatRelativeTime } from '@/lib/utils/formatDate'

export default function AgentsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { success, error } = useToasts()
  const { danger } = useDialogs()
  const setPageTitle = useUIStore(state => state.setPageTitle)
  
  // Local state
  const [searchQuery, setSearchQuery] = useState('')
  
  // Set page title with immediate document.title update as fallback
  useEffect(() => {
    // Multiple immediate title updates for maximum reliability
    document.title = 'Agents - Agent Console'
    
    // Set through store
    setPageTitle('Agents')
    
    // Additional immediate fallbacks
    const timers = [
      setTimeout(() => {
        document.title = 'Agents - Agent Console'
      }, 0),
      setTimeout(() => {
        document.title = 'Agents - Agent Console'
      }, 50),
      setTimeout(() => {
        document.title = 'Agents - Agent Console'
      }, 200)
    ]
    
    return () => timers.forEach(clearTimeout)
  }, [setPageTitle])

  // Load agents
  const {
    data: agentsData,
    isLoading,
    error: loadError,
    refetch,
  } = useQuery({
    queryKey: queryKeys.agents.list({ search: searchQuery }),
    queryFn: () => listAgents(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })

  // Delete agent mutation
  const deleteAgentMutation = useMutation({
    mutationFn: (agentId: string) => deleteAgent(agentId),
    onSuccess: () => {
      success('Agent deleted successfully')
      queryClient.invalidateQueries({ queryKey: queryKeys.agents.all })
    },
    onError: (err: any) => {
      error('Failed to delete agent', err.message)
    },
  })

  const agents = agentsData?.items || []
  
  // Filter agents by search query
  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Navigation handlers
  const handleCreateAgent = () => {
    router.push('/agents/new')
  }

  const handleEditAgent = (agentId: string) => {
    router.push(`/agents/${agentId}/edit`)
  }

  const handleScheduleAgent = (agentId: string) => {
    router.push(`/agents/${agentId}/schedule`)
  }

  const handleDeleteAgent = (agent: Agent) => {
    danger(
      'Delete Agent',
      `Are you sure you want to delete "${agent.name}"? This action cannot be undone.`,
      () => deleteAgentMutation.mutate(agent.id)
    )
  }

  return (
    <PageTransition pageKey="agents">
      <div className="h-full flex flex-col bg-background">
        <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-6">
          {/* Spacer for consistent layout */}
          <div className="mb-12" />
          
          {/* Header */}
          <ScrollReveal>
            <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-3xl font-bold text-text-primary">Agents</h1>
                <p className="text-text-tertiary mt-2">
                  Create and manage your AI agents
                </p>
              </div>
              
              <Button
                icon={<Plus size={20} />}
                onClick={handleCreateAgent}
                className="w-full sm:w-auto"
              >
                Create New Agent
              </Button>
            </div>
          </ScrollReveal>

          {/* Search and Stats */}
          <ScrollReveal>
            <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div className="flex-1 max-w-md">
                <SearchInput
                  placeholder="Search agents..."
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onSearch={setSearchQuery}
                />
              </div>
              
              <div className="text-sm text-text-tertiary">
                {filteredAgents.length} of {agents.length} agents
                {searchQuery && ` matching "${searchQuery}"`}
              </div>
            </div>
          </ScrollReveal>

          {/* Agents Table - Scrollable Container */}
          <ScrollReveal>
            <div className="flex-1 min-h-0">
              {isLoading ? (
                <div className="h-full overflow-y-auto">
                  <Card className="p-4">
                    <div className="space-y-2">
                      {[...Array(10)].map((_, i) => (
                        <div key={i} className="py-3">
                          <div className="flex items-start gap-3">
                            <Skeleton className="w-10 h-10 rounded-full" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-full" />
                              <Skeleton className="h-3 w-20" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              ) : loadError ? (
                <Card className="p-8 text-center h-full flex items-center justify-center">
                  <div>
                    <p className="text-error mb-4">Failed to load agents</p>
                    <Button onClick={() => refetch()} size="sm">
                      Try Again
                    </Button>
                  </div>
                </Card>
              ) : filteredAgents.length === 0 ? (
                <Card className="p-12 text-center h-full flex items-center justify-center">
                  {searchQuery ? (
                    <div>
                      <Search size={64} className="mx-auto text-text-tertiary mb-6" />
                      <h2 className="text-xl font-semibold text-text-primary mb-2">
                        No agents match your search
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
                      <Plus size={64} className="mx-auto text-text-tertiary mb-6" />
                      <h2 className="text-xl font-semibold text-text-primary mb-2">
                        Build Your First Agent
                      </h2>
                      <p className="text-text-secondary mb-6">
                        Agents are AI assistants you can customize for specific tasks
                      </p>
                      <Button
                        icon={<Plus size={16} />}
                        onClick={handleCreateAgent}
                      >
                        Create Agent
                      </Button>
                    </div>
                  )}
                </Card>
              ) : (
                <div className="h-full overflow-y-auto">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableHeaderCell>Name</TableHeaderCell>
                        <TableHeaderCell>Description</TableHeaderCell>
                        <TableHeaderCell>Created</TableHeaderCell>
                        <TableHeaderCell>Updated</TableHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <AnimatePresence mode="popLayout">
                        {filteredAgents.map((agent) => (
                          <AgentTableRow
                            key={agent.id}
                            agent={agent}
                            onEdit={() => handleEditAgent(agent.id)}
                            onSchedule={() => handleScheduleAgent(agent.id)}
                            onDelete={() => handleDeleteAgent(agent)}
                            isDeleting={deleteAgentMutation.isPending}
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

// Agent Table Row Component
interface AgentTableRowProps {
  agent: Agent
  onEdit: () => void
  onSchedule: () => void
  onDelete: () => void
  isDeleting: boolean
}

function AgentTableRow({
  agent,
  onEdit,
  onSchedule,
  onDelete,
  isDeleting,
}: AgentTableRowProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.tr
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={springPresets.default}
      onClick={onEdit}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group hover:bg-surface-hover transition-colors cursor-pointer"
    >
      <TableCell>
        <div className="font-medium text-text-primary">
          {agent.name}
        </div>
      </TableCell>
      
      <TableCell>
        <div 
          className="text-text-secondary max-w-md truncate"
          title={agent.description || 'No description'}
        >
          {agent.description || 'No description'}
        </div>
      </TableCell>
      
      <TableCell>
        <div className="text-text-tertiary text-sm">
          {formatRelativeTime(agent.createdTime ? new Date(agent.createdTime) : new Date())}
        </div>
      </TableCell>
      
      <TableCell>
        <div className="text-text-tertiary text-sm">
          {formatRelativeTime(agent.updatedTime ? new Date(agent.updatedTime) : new Date())}
        </div>
        <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            className="p-1.5 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
            aria-label="Edit agent"
          >
            <Edit size={14} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              onSchedule()
            }}
            className="p-1.5 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
            aria-label="Schedule agent"
          >
            <Clock size={14} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            disabled={isDeleting}
            className="p-1.5 opacity-60 hover:opacity-100 text-error hover:text-error hover:bg-error/10 transition-opacity cursor-pointer"
            aria-label="Delete agent"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </TableCell>
    </motion.tr>
  )
}