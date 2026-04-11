'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Loader2 } from 'lucide-react'
import ConfettiExplosion from 'react-confetti-explosion'
import { GlassCard, BlueGlassCard } from '@/components/ui/GlassCard'
import { springPresets } from '@/lib/constants/animations'
import type { ConfirmationOption } from '@/types/confirmation'

interface MultipleChoiceInputGlassProps {
  options: ConfirmationOption[]
  onSubmit: (answer: string) => void
  disabled?: boolean
  isAnswered?: boolean
  selectedAnswer?: string
}

export function MultipleChoiceInputGlass({
  options,
  onSubmit,
  disabled = false,
  isAnswered = false,
  selectedAnswer,
}: MultipleChoiceInputGlassProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [customAnswer, setCustomAnswer] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  const handleSubmit = async () => {
    const answer = customAnswer.trim() || selectedOption
    if (!answer) return

    setIsSubmitting(true)
    try {
      await onSubmit(answer)
      setShowConfetti(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const canSubmit = customAnswer.trim() || selectedOption
  const isOptionSelected = isAnswered && options.some(opt => opt.value === selectedAnswer)
  const isCustomAnswerSelected = isAnswered && !isOptionSelected && selectedAnswer

  // Answered state - elegant glass with morphing highlight
  if (isAnswered) {
    return (
      <div className="relative">
        {/* Confetti for submission */}
        {showConfetti && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50">
            <ConfettiExplosion
              force={0.4}
              duration={2200}
              particleCount={30}
              width={400}
              colors={['#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE']}
            />
          </div>
        )}

        <GlassCard variant="light" blur="lg" className="overflow-hidden">
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
                      className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-blue-400/30"
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
                        ${isSelected ? 'bg-blue-400/80 backdrop-blur-sm' : 'bg-white/20'}
                      `}
                      initial={false}
                      animate={{
                        scale: isSelected ? [1, 1.3, 1] : 1,
                        rotate: isSelected ? [0, 180, 360] : 0,
                      }}
                      transition={{ 
                        duration: 0.6,
                        ease: [0.34, 1.56, 0.64, 1]
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
                    
                    <span className={`relative text-sm font-medium ${isSelected ? 'text-white' : 'text-white/60'}`} style={{ zIndex: 1 }}>
                      {option.label}
                    </span>
                  </div>
                </motion.div>
                
                {/* Gradient fade separator */}
                {!isLast && (
                  <div className="px-4 py-1">
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
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
              className="relative px-4 py-3"
            >
              <GlassCard variant="medium" blur="md" className="px-4 py-3">
                <div className="text-sm text-white/90 whitespace-pre-wrap break-words leading-relaxed">
                  {selectedAnswer}
                </div>
              </GlassCard>
            </motion.div>
          )}
        </GlassCard>
      </div>
    )
  }

  // Pending state - interactive glass
  return (
    <div className="space-y-3">
      <GlassCard variant="light" blur="lg" className="overflow-hidden">
        {options.map((option, index) => {
          const isSelected = selectedOption === option.value
          const isLast = index === options.length - 1
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
                {/* Hover effect */}
                <motion.div
                  className="absolute inset-0 bg-white/10"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  style={{ zIndex: 0 }}
                />
                
                {/* Radio circle with ripple effect */}
                <div className="relative w-5 h-5 flex-shrink-0" style={{ zIndex: 1 }}>
                  <motion.div
                    className={`
                      w-5 h-5 rounded-full flex items-center justify-center
                      transition-all duration-200
                      ${isSelected ? 'bg-blue-400/80 backdrop-blur-sm' : 'bg-white/20 ring-1 ring-white/30'}
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
                
                <span className={`relative text-sm font-medium transition-colors ${isSelected ? 'text-white' : 'text-white/80'}`} style={{ zIndex: 1 }}>
                  {option.label}
                </span>
              </motion.button>
              
              {/* Gradient fade separator */}
              {!isLast && (
                <div className="px-4 py-1">
                  <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </div>
              )}
            </div>
          )
        })}
      </GlassCard>

      <GlassCard variant="light" blur="md">
        <textarea
          value={customAnswer}
          onChange={(e) => {
            setCustomAnswer(e.target.value)
            if (e.target.value.trim()) {
              setSelectedOption(null)
            }
          }}
          placeholder="Or type a custom answer..."
          disabled={disabled || isSubmitting}
          rows={2}
          className="
            w-full px-4 py-3 rounded-lg
            bg-transparent
            border-none
            text-sm text-white placeholder:text-white/50
            focus:outline-none focus:ring-2 focus:ring-blue-400/50
            disabled:opacity-50 disabled:cursor-not-allowed
            resize-none transition-all duration-200
          "
        />
      </GlassCard>

      <BlueGlassCard
        as="button"
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit || disabled || isSubmitting}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        blur="lg"
        hoverable
        className="
          w-full px-4 py-2.5
          disabled:opacity-50 disabled:cursor-not-allowed
          cursor-pointer
          flex items-center justify-center gap-2
        "
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span className="text-sm font-medium text-white">Submitting...</span>
          </>
        ) : (
          <span className="text-sm font-medium text-white">Submit</span>
        )}
      </BlueGlassCard>
    </div>
  )
}
