'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff, RefreshCw } from 'lucide-react'
import { springPresets } from '@/lib/constants/animations'

interface ConnectionStatusBannerProps {
  isVisible: boolean
  onReconnect: () => void | Promise<void>
}

export function ConnectionStatusBanner({ isVisible, onReconnect }: ConnectionStatusBannerProps) {
  const [isReconnecting, setIsReconnecting] = useState(false)

  const handleReconnect = async () => {
    setIsReconnecting(true)
    try {
      await onReconnect()
    } finally {
      setIsReconnecting(false)
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={springPresets.default}
          className="sticky top-0 z-30 mx-auto max-w-3xl mb-4"
        >
          <div
            className="
              flex items-center justify-between gap-4
              px-4 py-3 rounded-xl
              bg-gradient-to-r from-error/20 to-error/10
              border border-error/50
            "
          >
            <div className="flex items-center gap-3 flex-1">
              <WifiOff className="w-5 h-5 text-error flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary">Connection lost</p>
                <p className="text-xs text-text-secondary">
                  Live updates for this conversation stopped. Reconnect to keep watching.
                </p>
              </div>
            </div>

            <motion.button
              onClick={handleReconnect}
              disabled={isReconnecting}
              whileHover={{ scale: isReconnecting ? 1 : 1.05 }}
              whileTap={{ scale: isReconnecting ? 1 : 0.95 }}
              transition={springPresets.snappy}
              className="
                flex items-center gap-1.5 px-4 py-2 rounded-lg
                bg-error hover:bg-error/90 disabled:opacity-60
                text-white text-sm font-medium
                transition-colors duration-200
              "
            >
              <RefreshCw size={14} className={isReconnecting ? 'animate-spin' : ''} />
              {isReconnecting ? 'Reconnecting…' : 'Reconnect'}
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
