'use client'

/**
 * Floating Dashboard Button Component
 * 
 * Fixed position dashboard button in the bottom-right corner,
 * positioned below the theme toggle. Only visible on chat/session pages.
 */

import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Home } from 'lucide-react'
import { springPresets } from '@/lib/constants/animations'
import { cn } from '@/lib/utils/cn'

export function FloatingDashboardButton() {
  const pathname = usePathname()
  const router = useRouter()

  // Only show on chat and session pages
  const shouldShow = pathname.startsWith('/chat') || pathname.startsWith('/session')

  if (!shouldShow) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.6, ...springPresets.default }}
      className="fixed bottom-6 right-6 z-50"
    >
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => router.push('/dashboard')}
        className={cn(
          'flex items-center justify-center',
          'w-12 h-12 rounded-full',
          'bg-surface border border-border-subtle',
          'shadow-lg hover:shadow-xl',
          'text-text-secondary hover:text-primary',
          'transition-all duration-200',
          'backdrop-blur-sm'
        )}
        aria-label="Go to Dashboard"
      >
        <Home size={20} />
      </motion.button>
    </motion.div>
  )
}
