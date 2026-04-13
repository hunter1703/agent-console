/**
 * Lazy-loaded MermaidDiagram
 * 
 * This component is code-split to reduce initial bundle size.
 * Mermaid is a heavy library and should only be loaded when needed.
 */

'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/common/Skeleton'

// Lazy load the MermaidDiagram component
export const MermaidDiagram = dynamic(
  () => import('./MermaidDiagram').then(mod => ({ default: mod.MermaidDiagram })),
  {
    loading: () => (
      <div className="rounded-xl overflow-hidden border border-border-subtle bg-surface-elevated p-6">
        <Skeleton className="h-48 w-full" />
        <div className="mt-3 text-center">
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    ),
    ssr: false,
  }
)
