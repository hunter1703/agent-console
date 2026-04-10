'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Loader2 } from 'lucide-react'
import { springPresets, durations } from '@/lib/constants/animations'
import type { ConfirmationOption } from '@/types/confirmation'

interface MultipleChoiceInputProps {
  options: ConfirmationOption[]
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
  const isOptionSelected = isAnswered && options.some(opt => opt.value === selectedAnswer)
  const isCustomAnswerSelected = isAnswered && !isOptionSelected && selectedAnswer

  // Answered state - elegant with morphing highlight
  if (isAnswered) {
    return (
      <div className="space-y-0 bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
        {options.map((option, index) => {
          const isSelected = option.value === selectedAnswer
          const isLast = index === options.length - 1
          return (
            <div key={option.id}>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  delay: index * 0.05,
                  ...springPresets.gentle 
                }}
                className="relative overflow-hidden"
              >
                {/* Wipe highlight background - right to left */}
                {isSelected && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-50 to-blue-100"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{
                      duration: 0.5,
                      ease: [0.16, 1, 0.3, 1]
                    }}
                    style={{ 
                      zIndex: 0,
                      transformOrigin: 'right'
                    }}
                  />
                )}
                
                <div className={`
                  relative flex items-center gap-3 px-4 py-3
                  transition-all duration-300
                  ${isSelected ? '' : 'opacity-40'}
                `} style={{ zIndex: 1 }}>
                  {/* Radio circle morphs into checkmark */}
                  <motion.div 
                    className={`
                      w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0
                      ${isSelected ? 'bg-blue-500' : 'bg-gray-200'}
                    `}
                    initial={false}
                    animate={{
                      scale: isSelected ? [1, 1.3, 1] : 1,
                      rotate: isSelected ? [0, 180, 360] : 0,
                    }}
                    transition={{ 
                      duration: 0.6,
                      ease: [0.34, 1.56, 0.64, 1] // Bouncy easing
                    }}
                  >
                    <AnimatePresence mode="wait">
                      {isSelected && (
                        <motion.div
                          key="checkmark"
                          initial={{ scale: 0, rotate: -180, opacity: 0 }}
                          animate={{ scale: 1, rotate: 0, opacity: 1 }}
                          exit={{ scale: 0, rotate: 180, opacity: 0 }}
                          transition={{ 
                            duration: 0.4,
                            ease: [0.34, 1.56, 0.64, 1]
                          }}
                        >
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                  
                  <span className={`relative text-sm font-medium ${isSelected ? 'text-blue-700' : 'text-gray-500'}`} style={{ zIndex: 1 }}>
                    {option.label}
                  </span>
                </div>
              </motion.div>
              
              {/* Gradient fade separator - elegant and modern */}
              {!isLast && (
                <div className="px-4 py-1">
                  <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                </div>
              )}
            </div>
          )
        })}

        {isCustomAnswerSelected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={springPresets.gentle}
            className="relative px-4 py-3 rounded-lg bg-gray-50 border-l-2 border-blue-400"
          >
            <div className="text-sm text-gray-800 whitespace-pre-wrap break-words leading-relaxed">
              {selectedAnswer}
            </div>
          </motion.div>
        )}
      </div>
    )
  }

  // Pending state
  const isOtherActive = customAnswer.trim().length > 0

  return (
    <div className="space-y-3">
      <div className="space-y-0 relative bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
        {options.map((option) => {
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
                  className="absolute inset-0 bg-white/50"
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
                      ${isSelected ? 'bg-gradient-to-br from-blue-500 to-indigo-500' : 'bg-white ring-2 ring-gray-300'}
                    `}
                    animate={isSelected ? {
                      boxShadow: [
                        '0 0 0 0 rgba(59, 130, 246, 0.4)',
                        '0 0 0 8px rgba(59, 130, 246, 0)',
                      ],
                    } : {}}
                    transition={{ duration: 0.6, repeat: isSelected ? Infinity : 0 }}
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
                <span className={`relative text-sm font-medium transition-colors ${isSelected ? 'text-blue-700' : 'text-gray-900'}`} style={{ zIndex: 1 }}>
                  {option.label}
                </span>
              </motion.button>

              <div className="px-4">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
              </div>
            </div>
          )
        })}

        {/* Other row — always expanded */}
        <div className="relative overflow-hidden">
          {isOtherActive && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: 'right', zIndex: 0 }}
            />
          )}
          <div className="relative flex items-start gap-3 px-4 py-3" style={{ zIndex: 1 }}>
            <div className="relative w-5 h-5 flex-shrink-0 mt-0.5">
              <motion.div
                className={`
                  w-5 h-5 rounded-full flex items-center justify-center
                  transition-all duration-200
                  ${isOtherActive ? 'bg-gradient-to-br from-blue-500 to-indigo-500' : 'bg-white ring-2 ring-gray-300'}
                `}
              >
                <AnimatePresence>
                  {isOtherActive && (
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
              <span className={`text-sm font-medium transition-colors ${isOtherActive ? 'text-blue-700' : 'text-gray-900'}`}>
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
                  bg-white
                  border border-gray-200
                  text-sm text-gray-900
                  placeholder:text-gray-400
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
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
