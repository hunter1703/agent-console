/**
 * Lazy-loaded CodeBlock
 * 
 * This component is code-split to reduce initial bundle size.
 * Use this instead of importing CodeBlock directly when not in MarkdownRenderer.
 */

'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/common/Skeleton'

// Lazy load the CodeBlock component
export const CodeBlock = dynamic(
  () => import('./CodeBlock').then(mod => ({ default: mod.CodeBlock })),
  {
    loading: () => (
      <div className="rounded-xl overflow-hidden border border-border-subtle">
        <Skeleton className="h-10 w-full rounded-none" />
        <Skeleton className="h-32 w-full rounded-none" />
      </div>
    ),
    ssr: false,
  }
)
