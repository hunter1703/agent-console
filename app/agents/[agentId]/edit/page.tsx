'use client'

/**
 * Agent Edit Page
 * 
 * Form for editing an existing agent's configuration.
 * Implements Task 10: Agent Management - Edit View
 */

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { Skeleton } from '@/components/common/Skeleton'
import { PageTransition } from '@/components/common/PageTransition'
import { ScrollReveal } from '@/components/common/ScrollReveal'
import { DynamicForm } from '@/components/forms/DynamicForm'

import { getAgent } from '@/lib/api/services'
import { updateAgent } from '@/lib/api/services'
import { queryKeys, queryClient } from '@/lib/query/client'
import { useUIStore, useToasts } from '@/lib/store/ui'

export default function EditAgentPage() {
  const params = useParams()
  const router = useRouter()
  const { success, error } = useToasts()
  const setPageTitle = useUIStore(state => state.setPageTitle)
  
  const agentId = params.agentId as string

  // Set page title
  useEffect(() => {
    document.title = 'Edit Agent - Agent Console'
    setPageTitle('Edit Agent')
    
    const timers = [
      setTimeout(() => {
        document.title = 'Edit Agent - Agent Console'
      }, 0),
      setTimeout(() => {
        document.title = 'Edit Agent - Agent Console'
      }, 50),
      setTimeout(() => {
        document.title = 'Edit Agent - Agent Console'
      }, 200)
    ]
    
    return () => timers.forEach(clearTimeout)
  }, [setPageTitle])

  // Load agent data
  const {
    data: agent,
    isLoading,
    error: loadError,
  } = useQuery({
    queryKey: queryKeys.agents.detail(agentId),
    queryFn: () => getAgent(agentId),
    enabled: !!agentId,
  })

  // Handle navigation
  const handleBack = () => {
    router.push('/agents')
  }

  return (
    <PageTransition pageKey={agentId}>
      <div className="h-full flex flex-col bg-background">
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-6">
          {/* Spacer for consistent layout */}
          <div className="mb-12" />
          
          {/* Header */}
          <ScrollReveal>
            <div className="flex-shrink-0 mb-8">
              <Button
                variant="ghost"
                icon={<ArrowLeft size={20} />}
                onClick={handleBack}
                className="mb-4"
              >
                Back to Agents
              </Button>
              
              <h1 className="text-3xl font-bold text-text-primary">
                {isLoading ? 'Loading...' : `Edit ${agent?.name || 'Agent'}`}
              </h1>
              <p className="text-text-tertiary mt-2">
                Update agent configuration and settings
              </p>
            </div>
          </ScrollReveal>

          {/* Content */}
          <ScrollReveal>
            <div className="flex-1 min-h-0 overflow-y-auto pb-8">
              {isLoading ? (
                <Card className="p-8">
                  <div className="space-y-6">
                    <div>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div>
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-24 w-full" />
                    </div>
                    <div>
                      <Skeleton className="h-4 w-28 mb-2" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                </Card>
              ) : loadError ? (
                <Card className="p-8 text-center">
                  <p className="text-error mb-4">Failed to load agent</p>
                  <p className="text-text-secondary mb-6">
                    {loadError instanceof Error ? loadError.message : 'Unknown error'}
                  </p>
                  <Button onClick={handleBack}>
                    Back to Agents
                  </Button>
                </Card>
              ) : agent ? (
                <DynamicForm
                  assetType="Agent"
                  mode="EDIT"
                  initialData={agent}
                  onSubmit={async (data) => {
                    try {
                      await updateAgent(agentId, data)
                      queryClient.invalidateQueries({ queryKey: queryKeys.agents.detail(agentId) })
                      queryClient.invalidateQueries({ queryKey: queryKeys.agents.all })
                      success('Agent updated successfully')
                      router.push('/agents')
                    } catch (err: any) {
                      error(err.message || 'Failed to update agent')
                      throw err // Re-throw to prevent proceeding
                    }
                  }}
                  onCancel={handleBack}
                />
              ) : null}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </PageTransition>
  )
}
