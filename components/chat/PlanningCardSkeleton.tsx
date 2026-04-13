'use client'

/**
 * Planning Card Skeleton
 * 
 * Skeleton loader that matches the PlanningCard component structure.
 * Shows while planning data is loading with complex layout.
 */

import { Skeleton } from '@/components/common/Skeleton'

export function PlanningCardSkeleton() {
  return (
    <div className="p-6 rounded-2xl bg-surface border border-border-subtle">
      {/* Title skeleton */}
      <Skeleton 
        width="60%" 
        height="20px" 
        borderRadius="4px"
      />
      
      {/* Goal description skeleton */}
      <div className="mt-2 space-y-1">
        <Skeleton 
          width="100%" 
          height="14px" 
          borderRadius="4px"
        />
        <Skeleton 
          width="80%" 
          height="14px" 
          borderRadius="4px"
        />
      </div>
      
      {/* Progress bar skeleton */}
      <div className="mt-5">
        <Skeleton 
          width="100%" 
          height="32px" 
          borderRadius="16px"
        />
      </div>
      
      {/* Tasks list skeleton */}
      <div className="mt-5 space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3">
            {/* Checkbox skeleton */}
            <Skeleton 
              width="20px" 
              height="20px" 
              borderRadius="50%"
            />
            
            {/* Task text skeleton */}
            <div className="flex-1">
              <Skeleton 
                width="70%" 
                height="14px" 
                borderRadius="4px"
              />
            </div>
          </div>
        ))}
      </div>
      
      {/* Action buttons skeleton */}
      <div className="mt-6 flex gap-3">
        <Skeleton 
          width="80px" 
          height="36px" 
          borderRadius="8px"
        />
        <Skeleton 
          width="100px" 
          height="36px" 
          borderRadius="8px"
        />
      </div>
    </div>
  )
}