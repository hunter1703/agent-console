'use client'

import { useEffect, useState, useMemo } from 'react'
import { ConfirmationRequestCard } from '@/components/chat/ConfirmationRequestCard'
import { PendingConfirmationBanner } from '@/components/chat/PendingConfirmationBanner'
import { useConfirmationStore } from '@/lib/stores/confirmationStore'
import type { ConfirmationRequest } from '@/types/confirmation'

export default function ConfirmationDemoPage() {
  const confirmationsMap = useConfirmationStore((state) => state.confirmations)
  const pendingCount = useConfirmationStore((state) => state.pendingCount)
  const addConfirmation = useConfirmationStore((state) => state.addConfirmation)
  const [initialized, setInitialized] = useState(false)

  // Memoize confirmations array - only recompute when Map reference changes
  const confirmations = useMemo(
    () => Array.from(confirmationsMap.values()),
    [confirmationsMap]
  )

  // Initialize demo data once
  useEffect(() => {
    if (initialized) return
    setInitialized(true)
    const demoConfirmations: ConfirmationRequest[] = [
      // Type 1: Binary Decision (pending)
      {
        id: '1',
        sessionId: 'session-1',
        type: 'DECISION',
        prompt: 'Do you want to proceed with deleting all user data? This action cannot be undone.',
        status: 'pending',
        linkedToolCallId: 'tool-1',
        createdAt: new Date().toISOString(),
      },
      // Type 2: Decision with Options (pending)
      {
        id: '2',
        sessionId: 'session-1',
        type: 'DECISION',
        prompt: 'Which environment should we deploy to?',
        status: 'pending',
        options: [
          { id: '1', label: 'Development', value: 'dev' },
          { id: '2', label: 'Staging', value: 'staging' },
          { id: '3', label: 'Production', value: 'prod' },
        ],
        linkedToolCallId: 'tool-2',
        createdAt: new Date().toISOString(),
      },
      // Type 3: Text Input (pending)
      {
        id: '3',
        sessionId: 'session-1',
        type: 'TEXT',
        prompt: 'Please provide a reason for this action for audit purposes.',
        status: 'pending',
        linkedToolCallId: 'tool-3',
        createdAt: new Date().toISOString(),
      },
      // Type 1: Binary Decision (confirmed)
      {
        id: '4',
        sessionId: 'session-1',
        type: 'DECISION',
        prompt: 'Should we send notification emails to all affected users?',
        status: 'confirmed',
        answer: 'yes',
        confirmedAt: new Date().toISOString(),
        createdAt: new Date(Date.now() - 60000).toISOString(),
      },
      // Type 1: Binary Decision (rejected)
      {
        id: '5',
        sessionId: 'session-1',
        type: 'DECISION',
        prompt: 'Do you approve the budget increase of $50,000?',
        status: 'rejected',
        answer: 'no',
        confirmedAt: new Date().toISOString(),
        createdAt: new Date(Date.now() - 90000).toISOString(),
      },
      // Type 2: Decision with Options - Option selected (confirmed)
      {
        id: '6',
        sessionId: 'session-1',
        type: 'DECISION',
        prompt: 'Which database should we use for the new service?',
        status: 'confirmed',
        options: [
          { id: '1', label: 'PostgreSQL', value: 'postgres' },
          { id: '2', label: 'MongoDB', value: 'mongodb' },
          { id: '3', label: 'MySQL', value: 'mysql' },
        ],
        answer: 'postgres',
        confirmedAt: new Date().toISOString(),
        createdAt: new Date(Date.now() - 120000).toISOString(),
      },
      // Type 2: Decision with Options - Custom answer (confirmed)
      {
        id: '7',
        sessionId: 'session-1',
        type: 'DECISION',
        prompt: 'What color scheme should we use for the dashboard?',
        status: 'confirmed',
        options: [
          { id: '1', label: 'Blue', value: 'blue' },
          { id: '2', label: 'Green', value: 'green' },
          { id: '3', label: 'Purple', value: 'purple' },
        ],
        answer: 'I think we should use a warm orange/amber scheme to match our brand',
        confirmedAt: new Date().toISOString(),
        createdAt: new Date(Date.now() - 150000).toISOString(),
      },
      // Type 3: Text Input (confirmed)
      {
        id: '8',
        sessionId: 'session-1',
        type: 'TEXT',
        prompt: 'What is the expected completion date for this task?',
        status: 'confirmed',
        answer: 'The task should be completed by end of next week, approximately April 18th.',
        confirmedAt: new Date().toISOString(),
        createdAt: new Date(Date.now() - 180000).toISOString(),
      },
    ]

    demoConfirmations.forEach(addConfirmation)
  }, [initialized, addConfirmation])

  const scrollToFirst = () => {
    const firstPending = document.querySelector('[data-status="pending"]')
    firstPending?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const [bannerVisible, setBannerVisible] = useState(true)

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-text-primary">
            Phase 9: Human Intervention (Confirmation Requests)
          </h1>
          <p className="text-text-secondary">
            Demonstration of all confirmation request components with library-first approach
          </p>
        </div>

        {/* Banner */}
        <PendingConfirmationBanner
          count={pendingCount}
          onScrollToFirst={scrollToFirst}
          onDismiss={() => setBannerVisible(false)}
          isVisible={bannerVisible && pendingCount > 0}
        />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="text-2xl font-bold text-amber-500">{pendingCount}</div>
            <div className="text-sm text-text-secondary">Pending</div>
          </div>
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
            <div className="text-2xl font-bold text-green-500">
              {confirmations.filter((c) => c.status === 'confirmed').length}
            </div>
            <div className="text-sm text-text-secondary">Confirmed</div>
          </div>
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <div className="text-2xl font-bold text-red-500">
              {confirmations.filter((c) => c.status === 'rejected').length}
            </div>
            <div className="text-sm text-text-secondary">Rejected</div>
          </div>
        </div>

        {/* Confirmations */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-text-primary">Confirmation Requests</h2>

          {confirmations.map((confirmation) => (
            <div key={confirmation.id} data-status={confirmation.status}>
              <ConfirmationRequestCard
                confirmation={confirmation}
                linkedToolName={
                  confirmation.linkedToolCallId
                    ? `Tool ${confirmation.linkedToolCallId.split('-')[1]}`
                    : undefined
                }
                linkedToolColor={
                  confirmation.linkedToolCallId === 'tool-1'
                    ? '#8B5CF6'
                    : confirmation.linkedToolCallId === 'tool-2'
                      ? '#3B82F6'
                      : '#10B981'
                }
                // No sessionId = demo mode (no API calls)
              />
            </div>
          ))}
        </div>

        {/* Features List */}
        <div className="p-6 rounded-xl bg-surface border border-border-subtle space-y-4">
          <h3 className="text-lg font-semibold text-text-primary">✅ Phase 9 Features Implemented</h3>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li>✅ Base Confirmation Request Card with animated border glow</li>
            <li>✅ Linked Tool Call Display</li>
            <li>✅ Binary Decision Input (Yes/No)</li>
            <li>✅ Multiple Choice Input with custom answer option</li>
            <li>✅ Text Confirmation Input with character count</li>
            <li>✅ Confirmed Answer Display</li>
            <li>✅ Pending Confirmation Banner with pulsing animation</li>
            <li>✅ Library-first approach: date-fns for date formatting</li>
            <li>✅ Framer Motion for smooth animations</li>
            <li>✅ Spring physics for natural feel</li>
            <li>✅ Respects prefers-reduced-motion</li>
            <li>✅ Follows CODING_STANDARDS.md (no hardcoded values)</li>
            <li>✅ Follows ANIMATION_TECHNIQUES.md (Disney principles)</li>
            <li>✅ Follows UNSEEN_DESIGN_ANALYSIS.md (restrained elegance)</li>
            <li>✅ Zustand store for state management (design.md spec)</li>
            <li>✅ API integration for confirmation submission (design.md spec)</li>
          </ul>
        </div>

        {/* Library Usage */}
        <div className="p-6 rounded-xl bg-surface border border-border-subtle space-y-4">
          <h3 className="text-lg font-semibold text-text-primary">📚 Libraries Used</h3>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li>
              <span className="font-medium text-text-primary">date-fns</span> - Date formatting
              (replacing custom formatters)
            </li>
            <li>
              <span className="font-medium text-text-primary">framer-motion</span> - Smooth
              animations with spring physics
            </li>
            <li>
              <span className="font-medium text-text-primary">lucide-react</span> - Icon system
            </li>
            <li>
              <span className="font-medium text-text-primary">tailwindcss</span> - Utility-first
              styling (no hardcoded values)
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
