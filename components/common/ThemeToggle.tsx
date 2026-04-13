'use client'

/**
 * Theme Toggle Component
 * 
 * Clean theme toggle with smooth transitions.
 * 
 * Design Philosophy:
 * - Liquid morph animation between sun and moon
 * - Smooth color transitions
 * - No distracting effects
 */

import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/lib/hooks/useTheme'
import { springPresets } from '@/lib/constants/animations'
import { useState, useEffect } from 'react'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-11 h-11 rounded-full bg-surface-elevated animate-pulse" />
    )
  }

  const handleToggle = () => {
    toggleTheme()
  }

  return (
    <motion.button
      onClick={handleToggle}
      className="relative w-11 h-11 rounded-full flex items-center justify-center overflow-hidden theme-toggle cursor-pointer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={springPresets.snappy}
      aria-label="Toggle theme"
    >
      {/* Morphing background */}
      <motion.div
        animate={{
          background:
            theme === 'light'
              ? 'linear-gradient(135deg, #FEF3C7, #F59E0B)'
              : 'linear-gradient(135deg, #18181B, #27272A)',
        }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 rounded-full"
      />

      {/* Morphing icon */}
      <AnimatePresence mode="wait">
        {theme === 'light' ? (
          <motion.div
            key="sun"
            initial={{ rotate: -90, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0, opacity: 0 }}
            transition={springPresets.bouncy}
            className="relative z-10"
          >
            <Sun size={20} className="text-amber-900" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ rotate: 90, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: -90, scale: 0, opacity: 0 }}
            transition={springPresets.bouncy}
            className="relative z-10"
          >
            <Moon size={20} className="text-zinc-100" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
