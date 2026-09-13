'use client'

import { motion } from 'framer-motion'
import { WifiOff, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { Button } from './Button'
import { springPresets } from '@/lib/constants/animations'

interface ConnectionErrorProps {
  onRetry?: () => void | Promise<void>
  message?: string
  className?: string
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected'

export function ConnectionError({
  onRetry,
  message = 'Unable to connect to the server. Please check your connection and try again.',
  className = '',
}: ConnectionErrorProps) {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected')

  const handleRetry = async () => {
    setStatus('connecting')
    
    try {
      if (onRetry) {
        await onRetry()
      }
      setStatus('connected')
      
      // Reset to disconnected after a brief success indication
      setTimeout(() => setStatus('disconnected'), 1000)
    } catch (error) {
      setStatus('disconnected')
    }
  }

  const statusConfig = {
    disconnected: {
      color: 'text-error',
      bgColor: 'bg-error/10',
      label: 'Disconnected',
    },
    connecting: {
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      label: 'Connecting...',
    },
    connected: {
      color: 'text-success',
      bgColor: 'bg-success/10',
      label: 'Connected',
    },
  }

  const config = statusConfig[status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={springPresets.gentle}
      className={`flex flex-col items-center justify-center p-6 space-y-4 ${className}`}
    >
      {/* Icon with pulse animation */}
      <motion.div
        animate={
          status === 'disconnected'
            ? {
                scale: [1, 1.1, 1],
                opacity: [1, 0.7, 1],
              }
            : status === 'connecting'
            ? {
                rotate: [0, 360],
              }
            : {}
        }
        transition={
          status === 'disconnected'
            ? {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }
            : status === 'connecting'
            ? {
                duration: 1,
                repeat: Infinity,
                ease: 'linear',
              }
            : {}
        }
        className={`${config.color}`}
      >
        {status === 'connecting' ? (
          <RefreshCw size={48} />
        ) : (
          <WifiOff size={48} />
        )}
      </motion.div>

      {/* Status indicator */}
      <div className="flex items-center gap-2">
        <motion.div
          animate={
            status === 'connecting'
              ? {
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }
              : {}
          }
          transition={
            status === 'connecting'
              ? {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }
              : {}
          }
          className={`w-2 h-2 rounded-full ${config.bgColor} ${config.color}`}
        />
        <span className={`text-sm font-medium ${config.color}`}>
          {config.label}
        </span>
      </div>

      {/* Error message */}
      <div className="text-center space-y-2 max-w-md">
        <h3 className="text-lg font-semibold text-primary">
          Connection Error
        </h3>
        <p className="text-sm text-secondary">{message}</p>
      </div>

      {/* Retry button */}
      {status !== 'connecting' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, ...springPresets.snappy }}
        >
          <Button
            onClick={handleRetry}
            variant="primary"
            size="md"
          >
            <RefreshCw size={16} />
            Try Again
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}
