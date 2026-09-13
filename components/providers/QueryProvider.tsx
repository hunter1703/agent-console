'use client'

/**
 * Query Provider
 * 
 * Provides React Query client to the application with proper error handling
 * and development tools integration.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'
import { createQueryClient, setupErrorHandling } from '@/lib/query/client'
import { DEV_CONFIG } from '@/lib/config/env'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Create query client instance (only once per app lifecycle)
  const [queryClient] = useState(() => {
    const client = createQueryClient()
    
    // Set up global error handling
    setupErrorHandling()
    
    return client
  })

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      
      {/* Development tools */}
      {DEV_CONFIG.debug && (
        <ReactQueryDevtools
          initialIsOpen={false}
        />
      )}
    </QueryClientProvider>
  )
}