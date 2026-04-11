'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Loader2 } from 'lucide-react'
import ConfettiExplosion from 'react-confetti-explosion'
import { GlassCard, BlueGlassCard, PurpleGlassCard } from '@/components/ui/GlassCard'

interface BinaryDecisionInputGlassProps {
  onConfirm: () => void
  onReject: () => void
  disabled?: boolean
  isAnswered?: boolean
  wasConfirmed?: boolean
}

export function BinaryDecisionInputGlass({
  onConfirm,
  onReject,
  disabled = false,
  isAnswered = false,
  wasConfirmed,
}: BinaryDecisionInputGlassProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [clickedButton, setClickedButton] = useState<'confirm' | 'reject' | null>(null)
  const [showApproveConfetti, setShowApproveConfetti] = useState(false)
  const [showDeclineConfetti, setShowDeclineConfetti] = useState(false)

  const handleConfirm = async () => {
    setIsSubmitting(true)
    setClickedButton('confirm')
    try {
      await onConfirm()
    } finally {
      setIsSubmitting(false)
      setClickedButton(null)
    }
  }

  const handleReject = async () => {
    setIsSubmitting(true)
    setClickedButton('reject')
    try {
      await onReject()
    } finally {
      setIsSubmitting(false)
      setClickedButton(null)
    }
  }

  // Answered state - show only selected option with confetti
  if (isAnswered) {
    // Trigger confetti when answered
    if (wasConfirmed && !showApproveConfetti) {
      setShowApproveConfetti(true)
    } else if (!wasConfirmed && !showDeclineConfetti) {
      setShowDeclineConfetti(true)
    }

    return (
      <div className="flex gap-3 relative">
        {/* Confetti for approved */}
        {showApproveConfetti && wasConfirmed && (
          <div className="absolute left-1/4 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50">
            <ConfettiExplosion
              force={0.4}
              duration={2200}
              particleCount={30}
              width={400}
              colors={['#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE']}
            />
          </div>
        )}
        
        {/* Confetti for declined */}
        {showDeclineConfetti && !wasConfirmed && (
          <div className="absolute right-1/4 top-1/2 translate-x-1/2 -translate-y-1/2 pointer-events-none z-50">
            <ConfettiExplosion
              force={0.4}
              duration={2200}
              particleCount={30}
              width={400}
              colors={['#A855F7', '#C084FC', '#D8B4FE', '#F3E8FF']}
            />
          </div>
        )}

        {/* Approved button - glass style */}
        <AnimatePresence>
          {wasConfirmed ? (
            <BlueGlassCard
              key="approved"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              blur="xl"
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3"
            >
              <Check className="w-4 h-4 text-blue-200" strokeWidth={2.5} />
              <span className="text-sm font-medium text-white">Approved</span>
            </BlueGlassCard>
          ) : (
            <BlueGlassCard
              key="approve-fading"
              initial={{ opacity: 1, scale: 1, rotate: 0 }}
              animate={{ 
                opacity: 0, 
                scale: 1.2,
                rotate: [0, -10, 10, -5, 5, 0],
                y: -20
              }}
              exit={{ opacity: 0, scale: 1.2 }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              blur="xl"
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 pointer-events-none"
            >
              <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
              <span className="text-sm font-medium text-white">Approve</span>
            </BlueGlassCard>
          )}
        </AnimatePresence>

        {/* Declined button - glass style */}
        <AnimatePresence>
          {!wasConfirmed ? (
            <PurpleGlassCard
              key="declined"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              blur="xl"
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3"
            >
              <X className="w-4 h-4 text-purple-200" strokeWidth={2.5} />
              <span className="text-sm font-medium text-white">Declined</span>
            </PurpleGlassCard>
          ) : (
            <PurpleGlassCard
              key="decline-fading"
              initial={{ opacity: 1, scale: 1, rotate: 0 }}
              animate={{ 
                opacity: 0, 
                scale: 1.2,
                rotate: [0, -10, 10, -5, 5, 0],
                y: -20
              }}
              exit={{ opacity: 0, scale: 1.2 }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              blur="xl"
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 pointer-events-none"
            >
              <X className="w-4 h-4 text-white" strokeWidth={2.5} />
              <span className="text-sm font-medium text-white">Decline</span>
            </PurpleGlassCard>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // Pending state - both buttons with glass effect
  return (
    <div className="flex gap-3">
      <BlueGlassCard
        as="button"
        type="button"
        onClick={handleConfirm}
        disabled={disabled || isSubmitting}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        blur="lg"
        hoverable
        className="flex-1 flex items-center justify-center gap-2 px-5 py-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting && clickedButton === 'confirm' ? (
          <Loader2 className="w-4 h-4 animate-spin text-white" />
        ) : (
          <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
        )}
        <span className="text-sm font-medium text-white">Approve</span>
      </BlueGlassCard>

      <PurpleGlassCard
        as="button"
        type="button"
        onClick={handleReject}
        disabled={disabled || isSubmitting}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        blur="lg"
        hoverable
        className="flex-1 flex items-center justify-center gap-2 px-5 py-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting && clickedButton === 'reject' ? (
          <Loader2 className="w-4 h-4 animate-spin text-white" />
        ) : (
          <X className="w-4 h-4 text-white" strokeWidth={2.5} />
        )}
        <span className="text-sm font-medium text-white">Decline</span>
      </PurpleGlassCard>
    </div>
  )
}
