'use client'

/**
 * Agent Card Skeleton
 * 
 * Skeleton loader that matches the AgentCard component structure.
 * Shows while agent data is loading.
 */

import { Skeleton } from '@/components/common/Skeleton'

export function AgentCardSkeleton() {
  return (
    <div className="p-3 rounded-xl bg-surface border border-border-subtle">
      <div className="flex items-center gap-3">
        {/* Avatar skeleton */}
        <Skeleton 
          width="40px" 
          height="40px" 
          borderRadius="50%" 
        />
        
        <div className="flex-1 space-y-2">
          {/* Name skeleton */}
          <Skeleton 
            width="60%" 
            height="16px" 
            borderRadius="4px"
          />
          
          {/* Description skeleton */}
          <Skeleton 
            width="100%" 
            height="12px" 
            borderRadius="4px"
          />
          <Skeleton 
            width="80%" 
            height="12px" 
            borderRadius="4px"
          />
        </div>
      </div>
    </div>
  )
}