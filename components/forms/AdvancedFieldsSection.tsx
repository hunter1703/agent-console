'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Settings } from 'lucide-react'
import { springPresets, slideDown } from '@/lib/constants/animations'

interface AdvancedFieldsSectionProps {
  children: React.ReactNode
  defaultExpanded?: boolean
}

export function AdvancedFieldsSection({ 
  children, 
  defaultExpanded = false 
}: AdvancedFieldsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className="advanced-fields-section space-y-3">
      {/* Toggle Button */}
      <motion.button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 bg-surface-hover hover:bg-surface border border-border-subtle rounded-lg transition-colors cursor-pointer"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-text-secondary" />
          <span className="text-sm font-medium text-text-primary">
            Advanced Settings
          </span>
        </div>

        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={springPresets.snappy}
        >
          <ChevronDown className="w-4 h-4 text-text-secondary" />
        </motion.div>
      </motion.button>

      {/* Collapsible Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={slideDown}
            transition={springPresets.gentle}
            className="space-y-4 pl-4 border-l-2 border-border-subtle"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
