'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { useState, memo } from 'react'
import type { InterruptRequest } from '@/types/interrupt'
import { BinaryDecisionInput } from './BinaryDecisionInput'
import { MultipleChoiceInput } from './MultipleChoiceInput'
import { TextInterruptInput } from './TextInterruptInput'
import { LinkedToolCall } from './LinkedToolCall'
import { useInterruptStore } from '@/lib/stores/interruptStore'
import { submitInterruptResponse } from '@/lib/api/interrupts'
import { cn } from '@/lib/utils'

interface InterruptRequestCardProps {
  interrupt: InterruptRequest
  linkedToolName?: string
  linkedToolColor?: string
  sessionId?: string // Absent in demo mode
  agentName?: string // Display name of the agent that requested interrupt
}

function InterruptRequestCardComponent({
  interrupt,
  linkedToolName,
  linkedToolColor,
  sessionId,
  agentName,
}: InterruptRequestCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const updateInterrupt = useInterruptStore((state) => state.updateInterrupt)

  const isPending = interrupt.status === 'pending'
  const isResolved = interrupt.status === 'resolved'

  const isBinaryDecision =
    interrupt.type === 'DECISION' && (!interrupt.options || interrupt.options.length === 0)

  // ── Approve (binary DECISION) ──────────────────────────────────────────────
  const handleApprove = async () => {
    if (!sessionId) {
      updateInterrupt(interrupt.id, 'resolved')
      return
    }
    setIsSubmitting(true)
    setError(null)
    try {
      await submitInterruptResponse(sessionId, interrupt.id, {
        kind: 'DECISION',
        approved: true,
      })
      updateInterrupt(interrupt.id, 'resolved')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Decline (binary DECISION) ──────────────────────────────────────────────
  const handleDecline = async () => {
    if (!sessionId) {
      updateInterrupt(interrupt.id, 'rejected')
      return
    }
    setIsSubmitting(true)
    setError(null)
    try {
      await submitInterruptResponse(sessionId, interrupt.id, {
        kind: 'DECISION',
        approved: false,
      })
      updateInterrupt(interrupt.id, 'rejected')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Submit answer (DECISION with options OR TEXT) ──────────────────────────
  const handleSubmitAnswer = async (answer: string) => {
    if (!sessionId) {
      updateInterrupt(interrupt.id, 'resolved', answer)
      return
    }
    setIsSubmitting(true)
    setError(null)
    try {
      await submitInterruptResponse(sessionId, interrupt.id, {
        kind: interrupt.type,
        options: interrupt.options?.map((o) => o.value),
        answer,
      })
      updateInterrupt(interrupt.id, 'resolved', answer)
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
            // Opacity-only: this card renders inside VirtualTimelineList's rows, and a
            // replay burst can mount several pending interrupts at once. Animating height
            // (previously here) fights the virtualizer's measurement of this row's final
            // size — the same bug already fixed in ToolExecutionCard's Result block.
            <motion.div
              key="header-pending"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="mb-2"
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
                    <h4 className="text-xs font-semibold text-amber-500">Input Required</h4>
                    {agentName && (
                      <span className="text-xs text-text-tertiary">from <span className="text-text-secondary font-medium">{agentName}</span></span>
                    )}
                    <span className="text-xs text-text-tertiary">
                      {format(new Date(interrupt.createdAt), 'h:mm a')}
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
                  {format(new Date(interrupt.createdAt), 'h:mm a')}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Linked Tool Call badge */}
        <AnimatePresence initial={false}>
          {linkedToolName && isPending && (
            // Opacity-only — see the header block above for why.
            <motion.div
              key="linked-tool"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="mb-2"
            >
              <LinkedToolCall toolName={linkedToolName} toolColor={linkedToolColor} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Prompt */}
        <p className="text-sm text-text-primary mb-2 leading-snug pl-4">{interrupt.prompt}</p>

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
              {interrupt.type === 'DECISION' && !isBinaryDecision && (
                <MultipleChoiceInput
                  options={interrupt.options!}
                  onSubmit={handleSubmitAnswer}
                  disabled={isSubmitting}
                  isAnswered={false}
                />
              )}
              {interrupt.type === 'TEXT' && (
                <TextInterruptInput
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
                  wasConfirmed={isResolved}
                />
              )}
              {interrupt.type === 'DECISION' && !isBinaryDecision && (
                <MultipleChoiceInput
                  options={interrupt.options!}
                  onSubmit={() => {}}
                  disabled={true}
                  isAnswered={true}
                  selectedAnswer={interrupt.answer}
                />
              )}
              {interrupt.type === 'TEXT' && (
                <TextInterruptInput
                  onSubmit={() => {}}
                  disabled={true}
                  isAnswered={true}
                  submittedAnswer={interrupt.answer}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export const InterruptRequestCard = memo(
  InterruptRequestCardComponent,
  (prev, next) =>
    prev.interrupt.id === next.interrupt.id &&
    prev.interrupt.status === next.interrupt.status &&
    prev.interrupt.answer === next.interrupt.answer &&
    // prompt/options/createdAt can't actually change today (addInterrupt is a one-shot
    // idempotent add and updateInterrupt only ever touches status/answer), but comparing
    // them defensively means this doesn't silently start showing stale content the moment
    // either of those gains the ability to correct an already-created interrupt.
    prev.interrupt.prompt === next.interrupt.prompt &&
    prev.interrupt.createdAt === next.interrupt.createdAt &&
    (prev.interrupt.options ?? []).map((o) => o.value).join(',') ===
      (next.interrupt.options ?? []).map((o) => o.value).join(',') &&
    prev.linkedToolName === next.linkedToolName &&
    prev.linkedToolColor === next.linkedToolColor &&
    prev.sessionId === next.sessionId &&
    prev.agentName === next.agentName,
)
