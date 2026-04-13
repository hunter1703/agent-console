'use client'

/**
 * Message Skeleton
 * 
 * Skeleton loader that matches the Message component structure.
 * Shows while message data is loading with varying width lines.
 */

import { motion } from 'framer-motion'
import { Skeleton } from '@/components/common/Skeleton'
import { cn } from '@/lib/utils'

export interface MessageSkeletonProps {
  isUser?: boolean
}

export function MessageSkeleton({ isUser = false }: MessageSkeletonProps) {
  const widths = ['90%', '75%', '85%', '70%']
  
  return (
    <div className={cn(
      'flex gap-3 mb-6',
      isUser ? 'flex-row-reverse justify-start' : 'justify-start'
    )}>
      {/* Avatar skeleton */}
      <Skeleton 
        width="32px" 
        height="32px" 
        borderRadius="50%" 
        className="flex-shrink-0"
      />
      
      <div className="flex-1 max-w-[70%] space-y-1.5">
        {widths.map((width, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Skeleton 
              width={width} 
              height="14px" 
              borderRadius="4px"
            />
          </motion.div>
        ))}
      </div>
    </div>
  )
}