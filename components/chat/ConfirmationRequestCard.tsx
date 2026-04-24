'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { useState, memo } from 'react'
import type { ConfirmationRequest } from '@/types/confirmation'
import { BinaryDecisionInput } from './BinaryDecisionInput'
import { MultipleChoiceInput } from './MultipleChoiceInput'
import { TextConfirmationInput } from './TextConfirmationInput'
import { LinkedToolCall } from './LinkedToolCall'
import { useConfirmationStore } from '@/lib/stores/confirmationStore'
import { submitConfirmationResponse } from '@/lib/api/confirmations'
import { cn } from '@/lib/utils'

interface ConfirmationRequestCardProps {
  confirmation: ConfirmationRequest
  linkedToolName?: string
  linkedToolColor?: string
  sessionId?: string // Absent in demo mode
  agentName?: string // Display name of the agent that requested confirmation
}

function ConfirmationRequestCardComponent({
  confirmation,
  linkedToolName,
  linkedToolColor,
  sessionId,
  agentName,
}: ConfirmationRequestCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const updateConfirmation = useConfirmationStore((state) => state.updateConfirmation)

  const isPending = confirmation.status === 'pending'
  const isConfirmed = confirmation.status === 'confirmed'

  const isBinaryDecision =
    confirmation.type === 'DECISION' && (!confirmation.options || confirmation.options.length === 0)

  // ── Approve (binary DECISION) ──────────────────────────────────────────────
  const handleApprove = async () => {
    if (!sessionId) {
      updateConfirmation(confirmation.id, 'confirmed')
      return
    }
    setIsSubmitting(true)
    setError(null)
    try {
      await submitConfirmationResponse(sessionId, confirmation.id, {
        kind: 'DECISION',
        approved: true,
      })
      updateConfirmation(confirmation.id, 'confirmed')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Decline (binary DECISION) ──────────────────────────────────────────────
  const handleDecline = async () => {
    if (!sessionId) {
      updateConfirmation(confirmation.id, 'rejected')
      return
    }
    setIsSubmitting(true)
    setError(null)
    try {
      await submitConfirmationResponse(sessionId, confirmation.id, {
        kind: 'DECISION',
        approved: false,
      })
      updateConfirmation(confirmation.id, 'rejected')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Submit answer (DECISION with options OR TEXT) ──────────────────────────
  const handleSubmitAnswer = async (answer: string) => {
    if (!sessionId) {
      updateConfirmation(confirmation.id, 'confirmed', answer)
      return
    }
    setIsSubmitting(true)
    setError(null)
    try {
      await submitConfirmationResponse(sessionId, confirmation.id, {
        kind: confirmation.type,
        options: confirmation.options?.map((o) => o.value),
        answer,
      })
      updateConfirmation(confirmation.id, 'confirmed', answer)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      layout
      className={cn(
        'relative rounded-xl overflow-hidden max-w-md mx-auto transition-colors duration-500',
        isPending
          ? 'border border-amber-500/30'
          : 'bg-surface border border-border-subtle',
      )}
      style={isPending ? {
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(251, 191, 36, 0.04))',
      } : {}}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Animated amber border glow — fades out when resolved */}
      <AnimatePresence>
        {isPending && (
          <motion.div
            key="border-glow"
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              border: '1.5px solid transparent',
              borderRadius: '0.75rem',
              background: 'linear-gradient(135deg, #F59E0B, #FCD34D) border-box',
              WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
            }}
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 p-3">
        {/* Header — amber when pending, subtle when resolved */}
        <AnimatePresence initial={false} mode="wait">
          {isPending ? (
            <motion.div
              key="header-pending"
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 8 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="flex-shrink-0"
                >
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="text-xs font-semibold text-amber-500">Confirmation Required</h4>
                    {agentName && (
                      <span className="text-xs text-text-tertiary">from <span className="text-text-secondary font-medium">{agentName}</span></span>
                    )}
                    <span className="text-xs text-text-tertiary">
                      {format(new Date(confirmation.createdAt), 'h:mm a')}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="header-resolved"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="mb-2"
            >
              <div className="flex items-center gap-1.5 flex-wrap pl-4">
                {agentName && (
                  <span className="text-xs text-text-tertiary font-medium">{agentName}</span>
                )}
                <span className="text-xs text-text-tertiary">
                  {format(new Date(confirmation.createdAt), 'h:mm a')}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Linked Tool Call badge */}
        <AnimatePresence initial={false}>
          {linkedToolName && isPending && (
            <motion.div
              key="linked-tool"
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 8 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <LinkedToolCall toolName={linkedToolName} toolColor={linkedToolColor} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Prompt */}
        <p className="text-sm text-text-primary mb-2 leading-snug pl-4">{confirmation.prompt}</p>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input area — pending vs resolved */}
        <AnimatePresence mode="wait">
          {isPending ? (
            <motion.div
              key="pending-input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {isBinaryDecision && (
                <BinaryDecisionInput
                  onConfirm={handleApprove}
                  onReject={handleDecline}
                  disabled={isSubmitting}
                  isAnswered={false}
                />
              )}
              {confirmation.type === 'DECISION' && !isBinaryDecision && (
                <MultipleChoiceInput
                  options={confirmation.options!}
                  onSubmit={handleSubmitAnswer}
                  disabled={isSubmitting}
                  isAnswered={false}
                />
              )}
              {confirmation.type === 'TEXT' && (
                <TextConfirmationInput
                  onSubmit={handleSubmitAnswer}
                  disabled={isSubmitting}
                  isAnswered={false}
                />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="resolved-input"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {isBinaryDecision && (
                <BinaryDecisionInput
                  onConfirm={() => {}}
                  onReject={() => {}}
                  disabled={true}
                  isAnswered={true}
                  wasConfirmed={isConfirmed}
                />
              )}
              {confirmation.type === 'DECISION' && !isBinaryDecision && (
                <MultipleChoiceInput
                  options={confirmation.options!}
                  onSubmit={() => {}}
                  disabled={true}
                  isAnswered={true}
                  selectedAnswer={confirmation.answer}
                />
              )}
              {confirmation.type === 'TEXT' && (
                <TextConfirmationInput
                  onSubmit={() => {}}
                  disabled={true}
                  isAnswered={true}
                  submittedAnswer={confirmation.answer}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export const ConfirmationRequestCard = memo(
  ConfirmationRequestCardComponent,
  (prev, next) =>
    prev.confirmation.id === next.confirmation.id &&
    prev.confirmation.status === next.confirmation.status &&
    prev.confirmation.answer === next.confirmation.answer &&
    prev.linkedToolName === next.linkedToolName &&
    prev.linkedToolColor === next.linkedToolColor &&
    prev.sessionId === next.sessionId &&
    prev.agentName === next.agentName,
)
