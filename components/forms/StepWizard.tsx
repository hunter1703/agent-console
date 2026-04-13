'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/common'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { springPresets, slideLeft, slideRight } from '@/lib/constants/animations'

interface Step {
  id: string
  name: string
  isComplete: boolean
}

interface StepWizardProps {
  steps: Step[]
  currentStep: number
  onStepChange: (step: number) => void
  onPrevious: () => void
  onNext: () => void
  onSubmit: () => void
  canGoNext: boolean
  canGoPrevious: boolean
  isLastStep: boolean
  isSubmitting: boolean
  children: React.ReactNode
}

export function StepWizard({
  steps,
  currentStep,
  onStepChange,
  onPrevious,
  onNext,
  onSubmit,
  canGoNext,
  canGoPrevious,
  isLastStep,
  isSubmitting,
  children,
}: StepWizardProps) {
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Enter to submit
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && isLastStep && canGoNext) {
        e.preventDefault()
        onSubmit()
        return
      }

      // Arrow keys for navigation (only when not in input)
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      if (e.key === 'ArrowRight' && canGoNext && !isLastStep) {
        e.preventDefault()
        setDirection('forward')
        onNext()
      } else if (e.key === 'ArrowLeft' && canGoPrevious) {
        e.preventDefault()
        setDirection('backward')
        onPrevious()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [canGoNext, canGoPrevious, isLastStep, onNext, onPrevious, onSubmit])

  const handleNext = () => {
    setDirection('forward')
    onNext()
  }

  const handlePrevious = () => {
    setDirection('backward')
    onPrevious()
  }

  const handleStepClick = (index: number) => {
    setDirection(index > currentStep ? 'forward' : 'backward')
    onStepChange(index)
  }

  return (
    <div className="space-y-8">
      {/* Step Indicator */}
      <div className="relative px-8">
        {/* Progress Bar Background */}
        <div className="absolute top-5 left-8 right-8 h-0.5 bg-border-subtle" />
        
        {/* Animated Progress Bar */}
        <motion.div
          className="absolute top-5 left-8 h-0.5 bg-primary"
          initial={{ width: 0 }}
          animate={{ 
            width: `calc((100% - 4rem) * ${currentStep / (steps.length - 1)})`,
          }}
          transition={springPresets.gentle}
        />

        {/* Steps */}
        <div className="relative h-20 w-full px-8">
          {steps.map((step, index) => {
            const isActive = index === currentStep
            const isComplete = step.isComplete || index < currentStep
            const isClickable = index < currentStep || (index === currentStep + 1 && canGoNext)
            
            // Calculate position for equal spacing with first and last at edges
            // Account for padding by using the inner width
            const position = steps.length === 1 
              ? 50 
              : (index / (steps.length - 1)) * 100

            return (
              <button
                key={step.id}
                onClick={() => isClickable && handleStepClick(index)}
                disabled={!isClickable}
                className="flex flex-col items-center group absolute"
                style={{
                  left: `${position}%`,
                  transform: 'translateX(-50%)',
                }}
              >
                {/* Step Circle */}
                <motion.div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center border-2 
                    transition-colors relative
                    ${
                      isActive
                        ? 'bg-primary border-primary'
                        : isComplete
                        ? 'bg-success border-success'
                        : 'bg-background border-border-medium'
                    } 
                    ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}
                  `}
                  whileHover={isClickable ? { scale: 1.1 } : {}}
                  whileTap={isClickable ? { scale: 0.95 } : {}}
                  transition={springPresets.snappy}
                >
                  {/* Glow effect on active - positioned outside the circle */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-primary"
                      style={{ zIndex: -1 }}
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatType: "loop",
                        ease: 'easeOut',
                      }}
                    />
                  )}
                  
                  {/* Icon/Number */}
                  <AnimatePresence mode="wait">
                    {isComplete && !isActive ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={springPresets.bouncy}
                        className="text-white"
                      >
                        <Check className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      <motion.span
                        key="number"
                        className={`text-sm font-semibold ${
                          isActive || isComplete ? 'text-white' : 'text-text-tertiary'
                        }`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={springPresets.bouncy}
                      >
                        {index + 1}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Step Label */}
                <motion.span
                  className={`
                    mt-2 text-sm font-medium transition-colors
                    ${isActive ? 'text-text-primary' : 'text-text-secondary'}
                  `}
                  animate={{ 
                    scale: isActive ? 1.05 : 1,
                  }}
                  transition={springPresets.gentle}
                >
                  {step.name}
                </motion.span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Step Content with Directional Animation */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentStep}
          custom={direction}
          initial={{ 
            opacity: 0, 
            x: direction === 'forward' ? 20 : -20,
          }}
          animate={{ 
            opacity: 1, 
            x: 0,
          }}
          exit={{ 
            opacity: 0, 
            x: direction === 'forward' ? -20 : 20,
          }}
          transition={springPresets.gentle}
        >
          {children}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-border-subtle">
        <Button
          type="button"
          variant="secondary"
          onClick={handlePrevious}
          disabled={!canGoPrevious || isSubmitting}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <div className="flex items-center gap-3">
          {/* Keyboard hint */}
          <span className="text-xs text-text-tertiary hidden md:block">
            {isLastStep 
              ? 'Press Cmd+Enter to submit' 
              : 'Use arrow keys to navigate'}
          </span>

          {isLastStep ? (
            <Button
              type="button"
              variant="primary"
              onClick={onSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              onClick={handleNext}
              disabled={!canGoNext || isSubmitting}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
