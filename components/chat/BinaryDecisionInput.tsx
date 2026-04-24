'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Loader2 } from 'lucide-react'
import ConfettiExplosion from 'react-confetti-explosion'
import { poofOut } from '@/lib/constants/animations'

interface BinaryDecisionInputProps {
  onConfirm: () => void
  onReject: () => void
  disabled?: boolean
  isAnswered?: boolean
  wasConfirmed?: boolean
}

export function BinaryDecisionInput({
  onConfirm,
  onReject,
  disabled = false,
  isAnswered = false,
  wasConfirmed,
}: BinaryDecisionInputProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [clickedButton, setClickedButton] = useState<'confirm' | 'reject' | null>(null)
  // Confetti fires once when the component first enters answered state
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (isAnswered) {
      setShowConfetti(true)
      // Auto-clear after animation completes so it doesn't re-fire on re-renders
      const t = setTimeout(() => setShowConfetti(false), 2500)
      return () => clearTimeout(t)
    }
  }, [isAnswered])

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

  // Answered state — show only the chosen option, other poof-fades out
  if (isAnswered) {
    return (
      <div className="flex gap-3 relative">
        {/* Confetti burst centered on the winning button */}
        {showConfetti && wasConfirmed && (
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
        {showConfetti && !wasConfirmed && (
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

        {/* Approved button */}
        <AnimatePresence>
          {wasConfirmed ? (
            <motion.div
              key="approved"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-blue-50 text-blue-600 text-sm font-medium"
            >
              <Check className="w-4 h-4" strokeWidth={2.5} />
              <span>Approved</span>
            </motion.div>
          ) : (
            <motion.div
              key="approve-fading"
              variants={poofOut}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-blue-500 text-white text-sm font-medium pointer-events-none"
            >
              <Check className="w-4 h-4" strokeWidth={2.5} />
              <span>Approve</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Declined button */}
        <AnimatePresence>
          {!wasConfirmed ? (
            <motion.div
              key="declined"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-purple-50 text-purple-600 text-sm font-medium"
            >
              <X className="w-4 h-4" strokeWidth={2.5} />
              <span>Declined</span>
            </motion.div>
          ) : (
            <motion.div
              key="decline-fading"
              variants={poofOut}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-purple-500 text-white text-sm font-medium pointer-events-none"
            >
              <X className="w-4 h-4" strokeWidth={2.5} />
              <span>Decline</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // Pending state — both buttons active
  return (
    <div className="flex gap-3">
      <motion.button
        type="button"
        onClick={handleConfirm}
        disabled={disabled || isSubmitting}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="
          flex-1 flex items-center justify-center gap-2
          px-5 py-3 rounded-lg
          bg-blue-500 hover:bg-blue-600
          text-white text-sm font-medium
          cursor-pointer
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200
          shadow-sm
        "
      >
        {isSubmitting && clickedButton === 'confirm' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Check className="w-4 h-4" strokeWidth={2.5} />
        )}
        <span>Approve</span>
      </motion.button>

      <motion.button
        type="button"
        onClick={handleReject}
        disabled={disabled || isSubmitting}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="
          flex-1 flex items-center justify-center gap-2
          px-5 py-3 rounded-lg
          bg-purple-500 hover:bg-purple-600
          text-white text-sm font-medium
          cursor-pointer
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200
          shadow-sm
        "
      >
        {isSubmitting && clickedButton === 'reject' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <X className="w-4 h-4" strokeWidth={2.5} />
        )}
        <span>Decline</span>
      </motion.button>
    </div>
  )
}
