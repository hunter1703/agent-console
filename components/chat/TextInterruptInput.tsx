'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import ConfettiExplosion from 'react-confetti-explosion'
import { springPresets } from '@/lib/constants/animations'

interface TextInterruptInputProps {
  onSubmit: (answer: string) => void
  disabled?: boolean
  maxLength?: number
  isAnswered?: boolean
  submittedAnswer?: string
}

export function TextInterruptInput({
  onSubmit,
  disabled = false,
  maxLength = 500,
  isAnswered = false,
  submittedAnswer,
}: TextInterruptInputProps) {
  const [answer, setAnswer] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (isAnswered) {
      setShowConfetti(true)
      const t = setTimeout(() => setShowConfetti(false), 2500)
      return () => clearTimeout(t)
    }
  }, [isAnswered])

  const handleSubmit = async () => {
    if (!answer.trim()) return
    setIsSubmitting(true)
    try {
      await onSubmit(answer.trim())
    } finally {
      setIsSubmitting(false)
    }
  }

  const canSubmit = answer.trim().length > 0
  const remainingChars = maxLength - answer.length

  // ── Answered state ──────────────────────────────────────────────────────────
  if (isAnswered && submittedAnswer) {
    return (
      <div className="relative">
        {/* Confetti burst */}
        {showConfetti && (
          <div className="absolute left-1/2 top-0 -translate-x-1/2 pointer-events-none z-50">
            <ConfettiExplosion
              force={0.35}
              duration={2200}
              particleCount={28}
              width={360}
              colors={['#3B82F6', '#60A5FA', '#10B981', '#34D399', '#F59E0B', '#A78BFA']}
            />
          </div>
        )}

        {/* Answered bubble — slides up and fades in, inline width */}
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={springPresets.bouncy}
          className="relative overflow-hidden block rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/5 border border-blue-500/20 px-4 py-3"
        >
          {/* Animated shimmer sweep on entry */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
          />

          <div className="relative">
            {/* Answer text — fades in smoothly */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap break-words font-medium"
            >
              {submittedAnswer}
            </motion.p>
          </div>
        </motion.div>
      </div>
    )
  }

  // ── Pending state ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      <div className="relative">
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer here..."
          disabled={disabled || isSubmitting}
          autoFocus
          maxLength={maxLength}
          rows={3}
          className="
            w-full px-4 py-3 rounded-lg
            bg-surface
            border border-border
            text-sm text-text-primary
            placeholder:text-text-tertiary
            focus:outline-none focus:border-border
            disabled:opacity-50 disabled:cursor-not-allowed
            resize-none transition-all duration-200
          "
        />
        <div className="absolute bottom-3 right-3 text-xs text-text-tertiary">
          {remainingChars}
        </div>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit || disabled || isSubmitting}
        className="
          w-full px-4 py-2.5 rounded-lg
          bg-blue-500 hover:bg-blue-600
          text-white text-sm font-medium
          disabled:opacity-50 disabled:cursor-not-allowed
          cursor-pointer
          transition-all duration-200
          flex items-center justify-center gap-2
        "
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Submitting...</span>
          </>
        ) : (
          <span>Submit</span>
        )}
      </button>
    </div>
  )
}
