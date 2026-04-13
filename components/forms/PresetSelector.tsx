'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Sparkles } from 'lucide-react'
import { springPresets, fadeIn, scaleIn } from '@/lib/constants/animations'
import type { Preset } from '@/lib/types/schema'

interface PresetSelectorProps {
  presets: Preset[]
  onSelect: (presetId: string | null) => void
  onSkip: () => void
}

export function PresetSelector({ presets, onSelect, onSkip }: PresetSelectorProps) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(
    presets.find(p => p.isDefault)?.id || null
  )

  const handleSelect = (presetId: string) => {
    setSelectedPreset(presetId)
  }

  const handleContinue = () => {
    onSelect(selectedPreset)
  }

  const handleSkipPresets = () => {
    onSkip()
  }

  if (presets.length === 0) {
    // No presets available, skip directly
    onSkip()
    return null
  }

  return (
    <motion.div
      className="preset-selector p-6 space-y-6"
      initial="initial"
      animate="animate"
      variants={fadeIn}
      transition={springPresets.gentle}
    >
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold text-text-primary">
            Choose a Starting Point
          </h2>
        </div>
        <p className="text-text-secondary">
          Select a preset to quickly configure common settings, or start from scratch.
        </p>
      </div>

      {/* Preset Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {presets.map((preset, index) => {
          const isSelected = selectedPreset === preset.id

          return (
            <motion.button
              key={preset.id}
              onClick={() => handleSelect(preset.id)}
              className={`
                preset-card relative p-4 rounded-lg border-2 text-left
                transition-colors duration-200
                ${
                  isSelected
                    ? 'border-primary bg-primary-light'
                    : 'border-border-subtle bg-surface hover:border-border-medium'
                }
              `}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                ...springPresets.gentle,
                delay: index * 0.05,
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Selection Indicator */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={springPresets.bouncy}
                  >
                    <Check className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Preset Content */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-text-primary">
                    {preset.label}
                  </h3>
                  {preset.isDefault && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary-light text-primary font-medium">
                      Default
                    </span>
                  )}
                </div>
                {preset.description && (
                  <p className="text-sm text-text-secondary">
                    {preset.description}
                  </p>
                )}
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-border-subtle">
        <motion.button
          type="button"
          onClick={handleSkipPresets}
          className="text-text-secondary hover:text-text-primary transition-colors"
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          Start from scratch
        </motion.button>

        <motion.button
          type="button"
          onClick={handleContinue}
          disabled={!selectedPreset}
          className={`
            px-6 py-2 rounded-lg font-medium transition-colors
            ${
              selectedPreset
                ? 'bg-primary text-white hover:bg-primary-hover'
                : 'bg-surface-hover text-text-tertiary cursor-not-allowed'
            }
          `}
          whileHover={selectedPreset ? { scale: 1.02 } : {}}
          whileTap={selectedPreset ? { scale: 0.98 } : {}}
        >
          Continue with {presets.find(p => p.id === selectedPreset)?.label || 'Preset'}
        </motion.button>
      </div>
    </motion.div>
  )
}
