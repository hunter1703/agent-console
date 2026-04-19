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
import { Card } from '@/components/common/Card'
import { PageTransition } from '@/components/common/PageTransition'
import { ScrollReveal } from '@/components/common/ScrollReveal'

import { useUIStore } from '@/lib/store/ui'

export default function NewAgentPage() {
  const router = useRouter()
  const setPageTitle = useUIStore(state => state.setPageTitle)

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
              <Card className="p-8">
                <div className="text-center py-12">
                  <h2 className="text-xl font-semibold text-text-primary mb-4">
                    Agent Creation Coming Soon
                  </h2>
                  <p className="text-text-secondary mb-6 max-w-md mx-auto">
                    Agent configuration is currently managed through JSON files in the configs directory. 
                    A visual agent builder is coming in a future update.
                  </p>
                  <div className="space-y-4 max-w-md mx-auto text-left">
                    <div className="p-4 bg-surface border border-border-subtle rounded-lg">
                      <h3 className="font-medium text-text-primary mb-2">
                        To create an agent manually:
                      </h3>
                      <ol className="text-sm text-text-secondary space-y-2 list-decimal list-inside">
                        <li>Create a JSON file in <code className="px-1 py-0.5 bg-background rounded text-xs font-mono">configs/agents/</code></li>
                        <li>Define agent properties (name, model, system prompt, tools)</li>
                        <li>Restart the agent engine to load the new configuration</li>
                        <li>The agent will appear in the agents list</li>
                      </ol>
                    </div>
                  </div>
                  <div className="mt-8">
                    <Button onClick={handleBack}>
                      Back to Agents
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </PageTransition>
  )
}
