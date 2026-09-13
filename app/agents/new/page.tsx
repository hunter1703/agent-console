'use client'

/**
 * New Agent Page
 * 
 * Form for creating a new agent.
 * Implements Task 10: Agent Management - Create View
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/common/Button'
import { PageTransition } from '@/components/common/PageTransition'
import { ScrollReveal } from '@/components/common/ScrollReveal'
import { DynamicForm } from '@/components/forms/DynamicForm'

import { createAgent } from '@/lib/api/services'
import { useUIStore, useToasts } from '@/lib/store/ui'

export default function NewAgentPage() {
  const router = useRouter()
  const setPageTitle = useUIStore(state => state.setPageTitle)
  const { success, error } = useToasts()

  // Set page title
  useEffect(() => {
    document.title = 'New Agent - Agent Console'
    setPageTitle('New Agent')
    
    const timers = [
      setTimeout(() => {
        document.title = 'New Agent - Agent Console'
      }, 0),
      setTimeout(() => {
        document.title = 'New Agent - Agent Console'
      }, 50),
      setTimeout(() => {
        document.title = 'New Agent - Agent Console'
      }, 200)
    ]
    
    return () => timers.forEach(clearTimeout)
  }, [setPageTitle])

  // Handle navigation
  const handleBack = () => {
    router.push('/agents')
  }

  return (
    <PageTransition pageKey="new-agent">
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
                Create New Agent
              </h1>
              <p className="text-text-tertiary mt-2">
                Configure a new AI agent for your tasks
              </p>
            </div>
          </ScrollReveal>

          {/* Content */}
          <ScrollReveal>
            <div className="flex-1 min-h-0 overflow-y-auto pb-8">
              <DynamicForm
                assetType="Agent"
                mode="CREATE"
                onSubmit={async (data) => {
                  try {
                    await createAgent(data as any)
                    success('Agent created successfully')
                    router.push('/agents')
                  } catch (err: any) {
                    error(err.message || 'Failed to create agent')
                    throw err // Re-throw to prevent proceeding
                  }
                }}
                onCancel={handleBack}
              />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </PageTransition>
  )
}
