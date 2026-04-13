'use client'

/**
 * Session Item Skeleton
 * 
 * Skeleton loader that matches the SessionItem component structure.
 * Shows while session data is loading.
 */

import { Skeleton } from '@/components/common/Skeleton'

export function SessionItemSkeleton() {
  return (
    <div className="p-3 rounded-lg bg-surface-elevated border border-border-subtle">
      <div className="flex items-center gap-3">
        {/* Status indicator skeleton */}
        <Skeleton 
          width="8px" 
          height="8px" 
          borderRadius="50%" 
        />
        
        <div className="flex-1 space-y-2">
          {/* Session title skeleton */}
          <Skeleton 
            width="75%" 
            height="14px" 
            borderRadius="4px"
          />
          
          {/* Timestamp skeleton */}
          <Skeleton 
            width="40%" 
            height="12px" 
            borderRadius="4px"
          />
        </div>
        
        {/* Menu button skeleton */}
        <Skeleton 
          width="20px" 
          height="20px" 
          borderRadius="4px"
        />
      </div>
    </div>
  )
}