'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Loader2 } from 'lucide-react'
import ConfettiExplosion from 'react-confetti-explosion'
import { springPresets } from '@/lib/constants/animations'
import type { InterruptOption } from '@/types/interrupt'

interface MultipleChoiceInputProps {
  options: InterruptOption[]
  onSubmit: (answer: string) => void
  disabled?: boolean
  isAnswered?: boolean
  selectedAnswer?: string
}

export function MultipleChoiceInput({
  options,
  onSubmit,
  disabled = false,
  isAnswered = false,
  selectedAnswer,
}: MultipleChoiceInputProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [customAnswer, setCustomAnswer] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  // Fire confetti when entering answered state
  useEffect(() => {
    if (isAnswered) {
      setShowConfetti(true)
      const t = setTimeout(() => setShowConfetti(false), 2500)
      return () => clearTimeout(t)
    }
  }, [isAnswered])

  const handleSubmit = async () => {
    const answer = customAnswer.trim() || selectedOption
    if (!answer) return

    setIsSubmitting(true)
    
    try {
      await onSubmit(answer)
    } finally {
      setIsSubmitting(false)
    }
  }

  const canSubmit = customAnswer.trim() || selectedOption

  // Answered state
  if (isAnswered) {
    const isOptionSelected = options.some(opt => opt.value === selectedAnswer)
    const isCustomAnswerSelected = !isOptionSelected && !!selectedAnswer

    return (
      <div className="relative space-y-0 bg-surface rounded-lg overflow-hidden border border-border shadow-sm">
        {/* Confetti burst on submit */}
        {showConfetti && (
          <div className="absolute left-1/2 top-0 -translate-x-1/2 pointer-events-none z-50">
            <ConfettiExplosion
              force={0.4}
              duration={2200}
              particleCount={30}
              width={400}
              colors={['#3B82F6', '#60A5FA', '#10B981', '#34D399', '#93C5FD']}
            />
          </div>
        )}
        {options.map((option, index) => {
          const isSelected = option.value === selectedAnswer
          return (
            <div key={option.id}>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, ...springPresets.gentle }}
                className="relative overflow-hidden"
              >
                {isSelected && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-blue-500/5"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    style={{ zIndex: 0, transformOrigin: 'left' }}
                  />
                )}
                <div
                  className={`relative flex items-center gap-3 px-4 py-3 transition-all duration-300 ${isSelected ? '' : 'opacity-50'}`}
                  style={{ zIndex: 1 }}
                >
                  <motion.div
                    className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-blue-500' : 'bg-border'}`}
                    initial={false}
                    animate={{ scale: isSelected ? [1, 1.3, 1] : 1, rotate: isSelected ? [0, 180, 360] : 0 }}
                    transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                  >
                    <AnimatePresence mode="wait">
                      {isSelected && (
                        <motion.div
                          key="checkmark"
                          initial={{ scale: 0, rotate: -180, opacity: 0 }}
                          animate={{ scale: 1, rotate: 0, opacity: 1 }}
                          exit={{ scale: 0, rotate: 180, opacity: 0 }}
                          transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                        >
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                  <span className={`relative text-sm font-medium ${isSelected ? 'text-blue-600' : 'text-text-secondary'}`} style={{ zIndex: 1 }}>
                    {option.label}
                  </span>
                </div>
              </motion.div>

              {index < options.length - 1 && (
                <div className="px-4">
                  <div className="h-px w-full bg-border" />
                </div>
              )}
            </div>
          )
        })}

        {/* Separator before Other */}
        <div className="px-4">
          <div className="h-px w-full bg-border" />
        </div>

        {/* Other row */}
        <div className="relative overflow-hidden">
          {isCustomAnswerSelected && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/5"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ zIndex: 0, transformOrigin: 'left' }}
            />
          )}
          <div
            className={`relative flex items-start gap-3 px-4 py-3 transition-all duration-300 ${!isCustomAnswerSelected ? 'opacity-50' : ''}`}
            style={{ zIndex: 1 }}
          >
            <motion.div
              className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                isCustomAnswerSelected ? 'bg-gradient-to-br from-blue-500 to-indigo-500' : 'bg-border'
              }`}
              animate={{ scale: isCustomAnswerSelected ? [1, 1.3, 1] : 1 }}
              transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <AnimatePresence mode="wait">
                {isCustomAnswerSelected && (
                  <motion.div
                    key="checkmark"
                    initial={{ scale: 0, rotate: -180, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    exit={{ scale: 0, rotate: 180, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                  >
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            <div className="flex-1">
              <span className={`text-sm font-medium ${isCustomAnswerSelected ? 'text-blue-600' : 'text-text-secondary'}`}>
                Other
              </span>
              {isCustomAnswerSelected && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="mt-2"
                >
                  <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap break-words">
                    {selectedAnswer}
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Pending state
  const hasCustomAnswer = customAnswer.trim().length > 0

  return (
    <div className="space-y-3">
      <div className="space-y-0 relative bg-surface rounded-lg overflow-hidden border border-border shadow-sm">
        {options.map((option, index) => {
          const isSelected = selectedOption === option.value
          return (
            <div key={option.id} className="relative">
              <motion.button
                type="button"
                onClick={() => {
                  setSelectedOption(option.value)
                  setCustomAnswer('')
                }}
                disabled={disabled || isSubmitting}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className="
                  relative w-full flex items-center gap-3 px-4 py-3
                  text-left transition-all duration-200
                  cursor-pointer
                  disabled:opacity-50 disabled:cursor-not-allowed
                  overflow-hidden
                "
              >
                <motion.div
                  className="absolute inset-0 bg-surface-hover"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  style={{ zIndex: 0 }}
                />
                <div className="relative w-5 h-5 flex-shrink-0" style={{ zIndex: 1 }}>
                  <motion.div
                    className={`
                      w-5 h-5 rounded-full flex items-center justify-center
                      transition-all duration-200
                      ${isSelected ? 'bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/50' : 'bg-surface ring-2 ring-border'}
                    `}
                  >
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 90 }}
                          transition={springPresets.bouncy}
                        >
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
                <span className={`relative text-sm font-medium transition-colors ${isSelected ? 'text-blue-600' : 'text-text-primary'}`} style={{ zIndex: 1 }}>
                  {option.label}
                </span>
              </motion.button>

              {index < options.length - 1 && (
                <div className="px-4">
                  <div className="h-px w-full bg-border" />
                </div>
              )}
            </div>
          )
        })}

        {/* Separator before Other */}
        <div className="px-4">
          <div className="h-px w-full bg-border" />
        </div>

        {/* Other row */}
        <div className="relative overflow-hidden">
          {hasCustomAnswer && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/5"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: 'left', zIndex: 0 }}
            />
          )}
          <div className="relative flex items-start gap-3 px-4 py-3" style={{ zIndex: 1 }}>
            <div className="relative w-5 h-5 flex-shrink-0 mt-0.5">
              <motion.div
                className={`
                  w-5 h-5 rounded-full flex items-center justify-center
                  transition-all duration-200
                  ${hasCustomAnswer ? 'bg-gradient-to-br from-blue-500 to-indigo-500' : 'bg-surface ring-2 ring-border'}
                `}
              >
                <AnimatePresence>
                  {hasCustomAnswer && (
                    <motion.div
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 90 }}
                      transition={springPresets.bouncy}
                    >
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
            <div className="flex-1">
              <span className={`text-sm font-medium transition-colors ${hasCustomAnswer ? 'text-blue-600' : 'text-text-primary'}`}>
                Other
              </span>
              <textarea
                value={customAnswer}
                onChange={(e) => {
                  setCustomAnswer(e.target.value)
                  if (e.target.value.trim()) {
                    setSelectedOption(null)
                  }
                }}
                placeholder="Type a custom answer..."
                disabled={disabled || isSubmitting}
                rows={2}
                className="
                  mt-2 w-full px-3 py-2 rounded-lg
                  bg-surface
                  border border-border
                  text-sm text-text-primary
                  placeholder:text-text-tertiary
                  focus:outline-none focus:border-border
                  disabled:opacity-50 disabled:cursor-not-allowed
                  resize-none transition-all duration-200
                "
              />
            </div>
          </div>
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
