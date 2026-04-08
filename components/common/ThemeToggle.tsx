'use client'

/**
 * Theme Toggle Component
 * 
 * Liquid theme toggle with ripple transition effect.
 * Signature unseen.co feature for delightful theme switching.
 * 
 * Design Philosophy:
 * - Liquid morph animation between sun and moon
 * - Ripple effect on theme change
 * - Smooth color transitions
 */

import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/lib/hooks/useTheme'
import { springPresets } from '@/lib/constants/animations'
import { useState, useEffect } from 'react'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([])
  const [nextRippleId, setNextRippleId] = useState(0)
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

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Add ripple effect
    const rippleId = nextRippleId
    setRipples((prev) => [...prev, { id: rippleId, x, y }])
    setNextRippleId((prev) => prev + 1)

    // Remove ripple after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== rippleId))
    }, 800)

    // Toggle theme
    toggleTheme()
  }

  return (
    <motion.button
      onClick={handleToggle}
      className="relative w-11 h-11 rounded-full flex items-center justify-center overflow-hidden"
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

      {/* Ripple effects */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            initial={{
              width: 0,
              height: 0,
              opacity: 0.6,
              x: ripple.x,
              y: ripple.y,
            }}
            animate={{
              width: 200,
              height: 200,
              opacity: 0,
              x: ripple.x - 100,
              y: ripple.y - 100,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute rounded-full pointer-events-none"
            style={{
              background:
                theme === 'light'
                  ? 'rgba(24, 24, 27, 0.3)'
                  : 'rgba(254, 252, 232, 0.3)',
            }}
          />
        ))}
      </AnimatePresence>

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
