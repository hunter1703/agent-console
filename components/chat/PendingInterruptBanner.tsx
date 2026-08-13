'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, X } from 'lucide-react'
import { springPresets } from '@/lib/constants/animations'

interface PendingInterruptBannerProps {
  count: number
  onScrollToFirst: () => void
  onDismiss: () => void
  isVisible: boolean
}

export function PendingInterruptBanner({
  count,
  onScrollToFirst,
  onDismiss,
  isVisible,
}: PendingInterruptBannerProps) {
  if (count === 0) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={springPresets.default}
          className="
            sticky top-0 z-30
            mx-auto max-w-3xl
            mb-4
          "
        >
          <div
            className="
              relative overflow-hidden
              flex items-center justify-between gap-4
              px-4 py-3 rounded-xl
              bg-gradient-to-r from-amber-500/20 to-amber-600/20
              border border-amber-500/50
            "
          >
            {/* Content */}
            <div className="relative z-10 flex items-center gap-3 flex-1">
              <AlertCircle className="w-5 h-5 text-amber-500" />

              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary">
                  {count} {count === 1 ? 'interrupt' : 'interrupts'} pending
                </p>
                <p className="text-xs text-text-secondary">
                  Your response is required to continue
                </p>
              </div>

              <motion.button
                onClick={onScrollToFirst}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={springPresets.snappy}
                className="
                  px-4 py-2 rounded-lg
                  bg-amber-500 hover:bg-amber-600
                  text-white text-sm font-medium
                  transition-colors duration-200
                "
              >
                Review
              </motion.button>
            </div>

            {/* Dismiss Button */}
            <motion.button
              onClick={onDismiss}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={springPresets.snappy}
              className="
                relative z-10
                p-1 rounded-lg
                hover:bg-black/10 dark:hover:bg-white/10
                text-text-secondary hover:text-text-primary
                transition-colors duration-200
              "
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
