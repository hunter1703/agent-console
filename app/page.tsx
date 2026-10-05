'use client'

/**
 * Root Page - Redirect to Dashboard
 * 
 * The main landing page redirects to the dashboard or login based on auth state.
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PageTransition } from '@/components/common/PageTransition'
import { Skeleton } from '@/components/common/Skeleton'
import { authApi } from '@/lib/api/auth'
import { useAuthStore } from '@/lib/store/auth'

export default function HomePage() {
  const router = useRouter()
  const setAuthenticated = useAuthStore(state => state.setAuthenticated)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await authApi.me()
        setAuthenticated(true)
        router.replace('/dashboard')
      } catch (error: any) {
        if (error?.status === 401 || error?.status === 403) {
          if (typeof window !== 'undefined') localStorage.removeItem('sessionExpiry')
        }
        setAuthenticated(false)
        router.replace('/login')
      }
    }
    
    checkAuth()
  }, [router, setAuthenticated])

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
