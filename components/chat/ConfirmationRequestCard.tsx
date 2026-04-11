'use client'

import { motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { useState, memo } from 'react'
import type { ConfirmationRequest } from '@/types/confirmation'
import { BinaryDecisionInput } from './BinaryDecisionInput'
import { MultipleChoiceInput } from './MultipleChoiceInput'
import { TextConfirmationInput } from './TextConfirmationInput'
import { LinkedToolCall } from './LinkedToolCall'
import { useConfirmationStore } from '@/lib/stores/confirmationStore'
import { handleConfirmation } from '@/lib/api/confirmations'
import { cn } from '@/lib/utils'

interface ConfirmationRequestCardProps {
  confirmation: ConfirmationRequest
  linkedToolName?: string
  linkedToolColor?: string
  sessionId?: string // Optional for demo mode
}

function ConfirmationRequestCardComponent({
  confirmation,
  linkedToolName,
  linkedToolColor,
  sessionId,
}: ConfirmationRequestCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const updateConfirmation = useConfirmationStore((state) => state.updateConfirmation)
  
  const isPending = confirmation.status === 'pending'
  const isConfirmed = confirmation.status === 'confirmed'

  const handleConfirm = async (answer?: string) => {
    if (!sessionId) {
      // Demo mode - just update local state
      updateConfirmation(confirmation.id, 'confirmed', answer)
      return
    }

    setIsSubmitting(true)
    setError(null)
    
    try {
      await handleConfirmation(sessionId, confirmation.id, true, answer)
      updateConfirmation(confirmation.id, 'confirmed', answer)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit confirmation')
      console.error('Confirmation error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (!sessionId) {
      // Demo mode - just update local state
      updateConfirmation(confirmation.id, 'rejected')
      return
    }

    setIsSubmitting(true)
    setError(null)
    
    try {
      await handleConfirmation(sessionId, confirmation.id, false)
      updateConfirmation(confirmation.id, 'rejected')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit confirmation')
      console.error('Confirmation error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className={cn(
        'relative rounded-xl overflow-hidden max-w-md',
        'transition-all duration-300',
        isPending && 'shadow-md hover:shadow-lg',
      )}
      style={{
        background: isPending 
          ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(251, 191, 36, 0.04))'
          : 'var(--color-surface)',
      }}
    >
      {/* Static border glow for pending */}
      {isPending && (
        <div 
          className="absolute inset-0 pointer-events-none"
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

      <div className="relative z-10 p-3">
        {/* Compact Header - Only show for pending */}
        {isPending && (
          <div className="flex items-center gap-2 mb-2">
            {/* Icon - smaller and more subtle */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="flex-shrink-0"
            >
              <AlertCircle className="w-4 h-4 text-amber-500" />
            </motion.div>

            {/* Title and timestamp - more compact */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-semibold text-amber-500">
                  Confirmation Required
                </h4>
                <span className="text-xs text-text-tertiary">
                  {format(new Date(confirmation.createdAt), 'h:mm a')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Linked Tool Call - More compact */}
        {linkedToolName && (
          <div className="mb-2">
            <LinkedToolCall toolName={linkedToolName} toolColor={linkedToolColor} />
          </div>
        )}

        {/* Prompt - More compact */}
        <p className="text-sm text-text-primary mb-2 leading-snug">
          {confirmation.prompt}
        </p>

        {/* Input or Answer Display */}
        <div>
          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs"
            >
              {error}
            </motion.div>
          )}
          
          {isPending && (
            <>
              {confirmation.type === 'DECISION' && !confirmation.options && (
                <BinaryDecisionInput 
                  onConfirm={() => handleConfirm('yes')} 
                  onReject={handleReject}
                  disabled={isSubmitting}
                  isAnswered={false}
                />
              )}
              {confirmation.type === 'DECISION' && confirmation.options && (
                <MultipleChoiceInput 
                  options={confirmation.options} 
                  onSubmit={handleConfirm}
                  disabled={isSubmitting}
                  isAnswered={false}
                />
              )}
              {confirmation.type === 'TEXT' && (
                <TextConfirmationInput 
                  onSubmit={handleConfirm}
                  disabled={isSubmitting}
                  isAnswered={false}
                />
              )}
            </>
          )}

          {!isPending && (
            <>
              {confirmation.type === 'DECISION' && !confirmation.options && (
                <BinaryDecisionInput 
                  onConfirm={() => {}} 
                  onReject={() => {}}
                  disabled={true}
                  isAnswered={true}
                  wasConfirmed={isConfirmed}
                />
              )}
              {confirmation.type === 'DECISION' && confirmation.options && (
                <MultipleChoiceInput 
                  options={confirmation.options} 
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
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// Memoize to prevent unnecessary re-renders
// Return true when props are equal (skip re-render), false when different (re-render)
export const ConfirmationRequestCard = memo(ConfirmationRequestCardComponent, (prevProps, nextProps) => {
  // Props are equal if id, status, and answer haven't changed
  return (
    prevProps.confirmation.id === nextProps.confirmation.id &&
    prevProps.confirmation.status === nextProps.confirmation.status &&
    prevProps.confirmation.answer === nextProps.confirmation.answer &&
    prevProps.linkedToolName === nextProps.linkedToolName &&
    prevProps.linkedToolColor === nextProps.linkedToolColor &&
    prevProps.sessionId === nextProps.sessionId
  )
})
