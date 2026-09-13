'use client'

/**
 * Dashboard Page
 * 
 * Landing page showing agent management with primary actions.
 * Implements Task 2: Dashboard Landing Page Implementation
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Plus, Bot } from 'lucide-react'

import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { Skeleton } from '@/components/common/Skeleton'
import { AgentsTable } from '@/components/dashboard/AgentsTable'
import { ScrollReveal } from '@/components/common/ScrollReveal'
import { PageTransition } from '@/components/common/PageTransition'

import { listAgents } from '@/lib/api/services'
import { queryKeys } from '@/lib/query/client'
import { useUIStore } from '@/lib/store/ui'
import { springPresets } from '@/lib/constants/animations'

export default function DashboardPage() {
  const router = useRouter()
  const setPageTitle = useUIStore(state => state.setPageTitle)
  
  // Set page title
  useEffect(() => {
    document.title = 'Dashboard - Agent Console'
    setPageTitle('Dashboard')
  }, [setPageTitle])

  // Load agents
  const {
    data: agentsData,
    isLoading: isLoadingAgents,
    error: agentsError,
    refetch: refetchAgents,
  } = useQuery({
    queryKey: queryKeys.agents.list(),
    queryFn: () => listAgents(),
    staleTime: 5 * 60 * 1000,
  })

  const agents = agentsData?.items || []

  // Navigation handlers
  const handleCreateAgent = () => {
    router.push('/agents/new')
  }

  const handleCreateModel = () => {
    router.push('/models/new')
  }

  const handleViewSessions = () => {
    router.push('/sessions')
  }

  const handleAgentClick = (agentId: string) => {
    // Clear any existing sessions to ensure we start a fresh chat
    const { useChatStore } = require('@/lib/store/chat')
    const chatStore = useChatStore.getState()
    chatStore.clearAllSessions()
    
    // Navigate to new chat with the selected agent
    router.push(`/chat?agent=${agentId}`)
  }

  return (
    <PageTransition pageKey="dashboard">
      <div className="h-full flex flex-col bg-background">
        <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-6">
          {/* Hero Section */}
          <ScrollReveal>
            <section className="mb-12">
            </section>
          </ScrollReveal>

          {/* Agents Table */}
          <ScrollReveal>
            <section className="flex-1 min-h-0">
              <div className="flex-shrink-0 flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-text-primary">Your Agents</h2>
                  <p className="text-text-tertiary mt-1">
                    {agents.length} {agents.length === 1 ? 'agent' : 'agents'} available
                  </p>
                </div>
              </div>

              <div className="flex-1 min-h-0">
                {isLoadingAgents ? (
                  <div className="h-full overflow-y-auto">
                    <Card className="p-4">
                      <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="flex items-center gap-3 py-3">
                            <Skeleton className="w-10 h-10 rounded-full" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-full max-w-md" />
                            </div>
                            <Skeleton className="h-8 w-32" />
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                ) : agentsError ? (
                  <Card className="p-8 text-center h-full flex items-center justify-center">
                    <div>
                      <p className="text-error mb-4">Failed to load agents</p>
                      <Button onClick={() => refetchAgents()} size="sm">
                        Try Again
                      </Button>
                    </div>
                  </Card>
                ) : agents.length === 0 ? (
                  <Card className="p-12 text-center h-full flex items-center justify-center" data-testid="empty-agents">
                    <div>
                      <Bot size={64} className="mx-auto text-text-tertiary mb-6" />
                      <h2 className="text-xl font-semibold text-text-primary mb-2">
                        Create Your First Agent
                      </h2>
                      <p className="text-text-secondary mb-6">
                        Agents are AI assistants you can customize for specific tasks
                      </p>
                      <Button onClick={handleCreateAgent} icon={<Plus size={16} />}>
                        Create Agent
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <div className="h-full overflow-y-auto">
                    <AgentsTable 
                      agents={agents}
                      onChatClick={handleAgentClick}
                      pageSize={10}
                    />
                  </div>
                )}
              </div>
            </section>
          </ScrollReveal>
        </div>
      </div>
    </PageTransition>
  )
}