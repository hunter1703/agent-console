/**
 * Lazy-loaded MarkdownRenderer
 * 
 * This component is code-split to reduce initial bundle size.
 * Use this instead of importing MarkdownRenderer directly.
 */

'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/common/Skeleton'

// Lazy load the MarkdownRenderer component
export const MarkdownRenderer = dynamic(
  () => import('./MarkdownRenderer').then(mod => ({ default: mod.MarkdownRenderer })),
  {
    loading: () => (
      <div className="space-y-3">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    ),
    ssr: false, // Disable SSR for markdown rendering
  }
)
