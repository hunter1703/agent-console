'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Skeleton } from '@/components/common/Skeleton'
import { AgentCardSkeleton } from '@/components/sidebar/AgentCardSkeleton'
import { SessionItemSkeleton } from '@/components/sidebar/SessionItemSkeleton'
import { MessageSkeleton } from '@/components/chat/MessageSkeleton'
import { PlanningCardSkeleton } from '@/components/chat/PlanningCardSkeleton'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { ConnectionError } from '@/components/common/ConnectionError'
import { OfflineBanner } from '@/components/common/OfflineBanner'
import { EmptyAgentList } from '@/components/sidebar/EmptyAgentList'
import { EmptySessionList } from '@/components/sidebar/EmptySessionList'
import { EmptyChatView } from '@/components/chat/EmptyChatView'
import { Button } from '@/components/common/Button'
import { springPresets } from '@/lib/constants/animations'

// Component that throws an error for testing ErrorBoundary
function ErrorComponent() {
  throw new Error('Test error for ErrorBoundary')
}

export default function LoadingErrorPOCPage() {
  const [showError, setShowError] = useState(false)
  const [showConnectionError, setShowConnectionError] = useState(false)
  const [isOffline, setIsOffline] = useState(false)

  const handleRetry = async () => {
    // Simulate retry delay
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setShowConnectionError(false)
  }

  const toggleOffline = () => {
    setIsOffline(!isOffline)
    // Dispatch offline/online event
    if (!isOffline) {
      window.dispatchEvent(new Event('offline'))
    } else {
      window.dispatchEvent(new Event('online'))
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springPresets.gentle}
          className="space-y-2"
        >
          <h1 className="text-3xl font-bold text-primary">
            Phase 14: Loading & Error States POC
          </h1>
          <p className="text-secondary">
            Test all loading states, error handling, and empty state components
          </p>
        </motion.div>

        {/* Offline Banner */}
        <OfflineBanner />

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, ...springPresets.gentle }}
          className="bg-surface p-6 rounded-lg space-y-4"
        >
          <h2 className="text-xl font-semibold text-primary">Controls</h2>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => setShowError(!showError)}
              variant={showError ? 'danger' : 'secondary'}
            >
              {showError ? 'Hide' : 'Show'} Error Boundary
            </Button>
            <Button
              onClick={() => setShowConnectionError(!showConnectionError)}
              variant={showConnectionError ? 'danger' : 'secondary'}
            >
              {showConnectionError ? 'Hide' : 'Show'} Connection Error
            </Button>
            <Button onClick={toggleOffline} variant="secondary">
              {isOffline ? 'Go Online' : 'Go Offline'}
            </Button>
          </div>
        </motion.div>

        {/* Skeleton Loaders Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, ...springPresets.gentle }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-semibold text-primary">
            Skeleton Loaders
          </h2>

          {/* Base Skeleton */}
          <div className="bg-surface p-6 rounded-lg space-y-4">
            <h3 className="text-lg font-medium text-primary">Base Skeleton</h3>
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>

          {/* Agent Card Skeleton */}
          <div className="bg-surface p-6 rounded-lg space-y-4">
            <h3 className="text-lg font-medium text-primary">
              Agent Card Skeleton
            </h3>
            <div className="space-y-3">
              <AgentCardSkeleton />
              <AgentCardSkeleton />
              <AgentCardSkeleton />
            </div>
          </div>

          {/* Session Item Skeleton */}
          <div className="bg-surface p-6 rounded-lg space-y-4">
            <h3 className="text-lg font-medium text-primary">
              Session Item Skeleton
            </h3>
            <div className="space-y-2">
              <SessionItemSkeleton />
              <SessionItemSkeleton />
              <SessionItemSkeleton />
            </div>
          </div>

          {/* Message Skeleton */}
          <div className="bg-surface p-6 rounded-lg space-y-4">
            <h3 className="text-lg font-medium text-primary">
              Message Skeleton
            </h3>
            <div className="space-y-4">
              <MessageSkeleton role="user" />
              <MessageSkeleton role="assistant" />
              <MessageSkeleton role="user" />
            </div>
          </div>

          {/* Planning Card Skeleton */}
          <div className="bg-surface p-6 rounded-lg space-y-4">
            <h3 className="text-lg font-medium text-primary">
              Planning Card Skeleton
            </h3>
            <PlanningCardSkeleton />
          </div>
        </motion.div>

        {/* Error States Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, ...springPresets.gentle }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-semibold text-primary">Error States</h2>

          {/* Error Boundary */}
          <div className="bg-surface p-6 rounded-lg space-y-4">
            <h3 className="text-lg font-medium text-primary">Error Boundary</h3>
            <ErrorBoundary>
              {showError ? (
                <ErrorComponent />
              ) : (
                <p className="text-secondary">
                  Click "Show Error Boundary" to trigger an error
                </p>
              )}
            </ErrorBoundary>
          </div>

          {/* Connection Error */}
          {showConnectionError && (
            <div className="bg-surface p-6 rounded-lg">
              <h3 className="text-lg font-medium text-primary mb-4">
                Connection Error
              </h3>
              <ConnectionError onRetry={handleRetry} />
            </div>
          )}
        </motion.div>

        {/* Empty States Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, ...springPresets.gentle }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-semibold text-primary">Empty States</h2>

          {/* Empty Agent List */}
          <div className="bg-surface p-6 rounded-lg">
            <h3 className="text-lg font-medium text-primary mb-4">
              Empty Agent List
            </h3>
            <EmptyAgentList
              onCreateAgent={() => alert('Create agent clicked')}
            />
          </div>

          {/* Empty Session List */}
          <div className="bg-surface p-6 rounded-lg">
            <h3 className="text-lg font-medium text-primary mb-4">
              Empty Session List
            </h3>
            <EmptySessionList
              onCreateSession={() => alert('Create session clicked')}
            />
          </div>

          {/* Empty Chat View */}
          <div className="bg-surface p-6 rounded-lg">
            <h3 className="text-lg font-medium text-primary mb-4">
              Empty Chat View
            </h3>
            <EmptyChatView agentName="Demo Agent" />
          </div>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, ...springPresets.gentle }}
          className="flex justify-center pt-8"
        >
          <Button onClick={() => (window.location.href = '/')} variant="ghost">
            ← Back to Demo Page
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
