'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { springPresets } from '@/lib/constants/animations'

interface OfflineBannerProps {
  className?: string
}

export function OfflineBanner({ className = '' }: OfflineBannerProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Set initial online status
    setIsOnline(navigator.onLine)

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true)
      setIsDismissed(false)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setIsDismissed(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const shouldShow = !isOnline && !isDismissed

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={springPresets.gentle}
          className={`fixed top-0 left-0 right-0 z-50 ${className}`}
        >
          <div className="bg-gradient-to-r from-warning to-warning/80 text-white shadow-lg">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                {/* Icon and message */}
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [1, 0.7, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <WifiOff size={20} />
                  </motion.div>
                  <div>
                    <p className="text-sm font-medium">
                      You're currently offline
                    </p>
                    <p className="text-xs opacity-90">
                      Some features may be unavailable until you reconnect
                    </p>
                  </div>
                </div>

                {/* Dismiss button */}
                <motion.button
                  onClick={() => setIsDismissed(true)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1 rounded-full hover:bg-white/20 transition-colors"
                  aria-label="Dismiss offline banner"
                >
                  <X size={16} />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
