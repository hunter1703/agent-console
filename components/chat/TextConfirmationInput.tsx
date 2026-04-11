'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

interface TextConfirmationInputProps {
  onSubmit: (answer: string) => void
  disabled?: boolean
  maxLength?: number
  isAnswered?: boolean
  submittedAnswer?: string
}

export function TextConfirmationInput({
  onSubmit,
  disabled = false,
  maxLength = 500,
  isAnswered = false,
  submittedAnswer,
}: TextConfirmationInputProps) {
  const [answer, setAnswer] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  // Answered state - display as plain text
  if (isAnswered && submittedAnswer) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="text-sm text-text-primary whitespace-pre-wrap break-words leading-relaxed"
      >
        {submittedAnswer}
      </motion.div>
    )
  }

  // Pending state - editable
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
