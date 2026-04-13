'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ChevronDown } from 'lucide-react'
import { springPresets, slideDown } from '@/lib/constants/animations'
import type { FieldPreset } from '@/lib/types/schema'

interface FieldPresetSelectorProps {
  presets: FieldPreset[]
  onSelect: (value: any) => void
  currentValue?: any
  disabled?: boolean
}

export function FieldPresetSelector({ 
  presets, 
  onSelect, 
  currentValue,
  disabled 
}: FieldPresetSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (presets.length === 0 || disabled) {
    return null
  }

  const handleSelect = (preset: FieldPreset) => {
    onSelect(preset.value)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      {/* Trigger Button */}
      <motion.button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="
          inline-flex items-center gap-1.5 px-2 py-1 
          text-xs font-medium text-primary hover:text-primary-hover
          bg-primary-light hover:bg-primary-light/80
          rounded-md transition-colors cursor-pointer
        "
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Sparkles className="w-3 h-3" />
        <span>Quick Fill</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Preset Menu */}
            <motion.div
              className="absolute left-0 top-full mt-1 z-20 min-w-[200px] bg-surface border border-border-medium rounded-lg shadow-lg overflow-hidden"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={slideDown}
              transition={springPresets.snappy}
            >
              {presets.map((preset) => (
                <motion.button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelect(preset)}
                  className="
                    w-full px-3 py-2 text-left hover:bg-surface-hover 
                    transition-colors cursor-pointer
                  "
                  whileHover={{ x: 4 }}
                >
                  <div className="font-medium text-sm text-text-primary">
                    {preset.label}
                  </div>
                  {preset.description && (
                    <div className="text-xs text-text-secondary mt-0.5">
                      {preset.description}
                    </div>
                  )}
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
