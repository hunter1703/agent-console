'use client'

/**
 * Root Page - Redirect to Dashboard
 * 
 * The main landing page redirects to the dashboard for a better user experience.
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PageTransition } from '@/components/common/PageTransition'
import { Skeleton } from '@/components/common/Skeleton'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to dashboard
    router.replace('/dashboard')
  }, [router])

  // Show loading state while redirecting
  return (
    <PageTransition pageKey="home">
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    </PageTransition>
  )
}
