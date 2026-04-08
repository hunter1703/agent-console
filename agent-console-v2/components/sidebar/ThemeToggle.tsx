'use client'

/**
 * Theme Toggle Component
 *
 * Compact toggle for switching light / dark themes.
 * Shows current mode with animated icon swap and a subtle glow effect.
 *
 * Design Philosophy:
 * - Pill-style button matching the sidebar aesthetic
 * - Soft gradient background communicates current theme
 * - Icon swaps with a spring-bouncy scale animation
 * - Press feedback via squash & stretch
 */

import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { springPresets } from '@/lib/constants/animations'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'

export interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const { shouldAnimate } = useReducedMotion()
  const [mounted, setMounted] = useState(false)
  const isDark = theme === 'dark'

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return a placeholder with same dimensions to avoid layout shift
    return (
      <div className={cn('w-full h-11 rounded-xl bg-surface-elevated', className)} />
    )
  }

  return (
    <motion.button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      whileHover={shouldAnimate ? { y: -1 } : undefined}
      whileTap={shouldAnimate ? { scaleY: 0.94, scaleX: 1.03 } : undefined}
      transition={springPresets.snappy}
      className={cn(
        'relative w-full h-11 rounded-xl overflow-hidden',
        'flex items-center justify-between px-4 gap-3',
        'text-sm font-medium cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        isDark
          ? 'text-slate-200'
          : 'text-amber-800',
        className,
      )}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(30,27,75,0.7) 0%, rgba(76,29,149,0.4) 100%)'
            : 'linear-gradient(135deg, rgba(255,251,235,1) 0%, rgba(254,243,199,1) 100%)',
        }}
        transition={{ duration: 0.4 }}
      />

      {/* Subtle inner glow blob */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: isDark
            ? 'radial-gradient(ellipse at 20% 60%, rgba(139,92,246,0.25) 0%, transparent 60%)'
            : 'radial-gradient(ellipse at 80% 40%, rgba(251,191,36,0.4) 0%, transparent 60%)',
        }}
        transition={{ duration: 0.5 }}
      />

      {/* Icon — swaps with spring animation */}
      <span className="relative z-10 w-5 h-5 flex items-center justify-center">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isDark ? 'moon' : 'sun'}
            initial={shouldAnimate ? { rotate: -60, scale: 0, opacity: 0 } : false}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={shouldAnimate ? { rotate: 60, scale: 0, opacity: 0 } : undefined}
            transition={shouldAnimate ? { ...springPresets.bouncy, duration: 0.3 } : { duration: 0 }}
            className="absolute"
          >
            {isDark
              ? <Moon size={16} strokeWidth={2} />
              : <Sun size={16} strokeWidth={2} />
            }
          </motion.span>
        </AnimatePresence>
      </span>

      {/* Label — cross-fades */}
      <span className="relative z-10 flex-1 text-left text-xs font-semibold tracking-wide">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isDark ? 'dark-label' : 'light-label'}
            initial={shouldAnimate ? { opacity: 0, y: 4 } : false}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldAnimate ? { opacity: 0, y: -4 } : undefined}
            transition={{ duration: 0.18 }}
            className="block"
          >
            {isDark ? 'Dark Mode' : 'Light Mode'}
          </motion.span>
        </AnimatePresence>
      </span>

      {/* Mode indicator dot */}
      <motion.span
        className="relative z-10 w-2 h-2 rounded-full"
        animate={{
          backgroundColor: isDark ? '#a78bfa' : '#f59e0b',
          boxShadow: isDark
            ? '0 0 6px rgba(167,139,250,0.8)'
            : '0 0 6px rgba(245,158,11,0.8)',
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  )
}
