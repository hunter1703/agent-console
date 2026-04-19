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

import { getAgent } from '@/lib/api/services'
import { queryKeys } from '@/lib/query/client'
import { useUIStore, useToasts } from '@/lib/store/ui'

export default function EditAgentPage() {
  const params = useParams()
  const router = useRouter()
  const { error } = useToasts()
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
    <PageTransition>
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
                <Card className="p-8">
                  <div className="space-y-6">
                    {/* Agent ID (read-only) */}
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Agent ID
                      </label>
                      <div className="px-4 py-2 bg-surface border border-border-subtle rounded-lg text-text-tertiary font-mono text-sm">
                        {agent.id}
                      </div>
                    </div>

                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        value={agent.name}
                        readOnly
                        className="w-full px-4 py-2 bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Description
                      </label>
                      <textarea
                        value={agent.description || ''}
                        readOnly
                        rows={3}
                        className="w-full px-4 py-2 bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      />
                    </div>

                    {/* Model ID */}
                    {agent.modelId && (
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                          Model ID
                        </label>
                        <input
                          type="text"
                          value={agent.modelId}
                          readOnly
                          className="w-full px-4 py-2 bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                        />
                      </div>
                    )}

                    {/* System Prompt */}
                    {agent.systemPrompt && (
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                          System Prompt
                        </label>
                        <textarea
                          value={agent.systemPrompt}
                          readOnly
                          rows={6}
                          className="w-full px-4 py-2 bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary resize-none font-mono text-sm"
                        />
                      </div>
                    )}

                    {/* Temperature */}
                    {agent.temperature !== undefined && (
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                          Temperature: {agent.temperature}
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="2"
                          step="0.1"
                          value={agent.temperature}
                          readOnly
                          className="w-full"
                        />
                      </div>
                    )}

                    {/* Max Tokens */}
                    {agent.maxTokens !== undefined && (
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                          Max Tokens
                        </label>
                        <input
                          type="number"
                          value={agent.maxTokens}
                          readOnly
                          className="w-full px-4 py-2 bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    )}

                    {/* Tools */}
                    {agent.tools && agent.tools.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                          Tools ({agent.tools.length})
                        </label>
                        <div className="space-y-2">
                          {agent.tools.map((tool, index) => {
                            // Handle both string and object tool formats
                            const toolName = typeof tool === 'string' ? tool : (tool as any).toolName || JSON.stringify(tool)
                            return (
                              <div
                                key={index}
                                className="px-4 py-2 bg-surface border border-border-subtle rounded-lg text-text-primary font-mono text-sm"
                              >
                                {toolName}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Timestamps */}
                    <div className="pt-6 border-t border-border-subtle">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {agent.createdTime && (
                          <div>
                            <span className="text-text-tertiary">Created:</span>
                            <span className="ml-2 text-text-secondary">
                              {new Date(agent.createdTime).toLocaleString()}
                            </span>
                          </div>
                        )}
                        {agent.updatedTime && (
                          <div>
                            <span className="text-text-tertiary">Updated:</span>
                            <span className="ml-2 text-text-secondary">
                              {new Date(agent.updatedTime).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Note about read-only */}
                    <div className="pt-4 border-t border-border-subtle">
                      <p className="text-sm text-text-tertiary italic">
                        Note: This is a read-only view. Agent configuration is managed through JSON files in the configs directory.
                      </p>
                    </div>
                  </div>
                </Card>
              ) : null}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </PageTransition>
  )
}
