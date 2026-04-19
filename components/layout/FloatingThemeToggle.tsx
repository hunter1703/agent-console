'use client'

/**
 * Floating Theme Toggle Component
 * 
 * Fixed position theme toggle button in the bottom-right corner.
 * Features smooth animations and theme transition effects.
 */

import { motion } from 'framer-motion'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { springPresets } from '@/lib/constants/animations'

export function FloatingThemeToggle() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.5, ...springPresets.default }}
      className="fixed bottom-24 right-6 z-50"
    >
      <ThemeToggle />
    </motion.div>
  )
}
