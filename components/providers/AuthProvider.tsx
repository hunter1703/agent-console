'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth'
import { Skeleton } from '@/components/common/Skeleton'

const PUBLIC_ROUTES = ['/login']

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const checkAuth = useAuthStore(state => state.checkAuth)
  const isChecking = useAuthStore(state => state.isChecking)
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)
  
  const router = useRouter()
  const pathname = usePathname()
  
  // Skip auth check entirely for the root page since it handles its own redirect logic
  const isRoot = pathname === '/'
  
  useEffect(() => {
    if (!isRoot) {
      checkAuth()
    }
  }, [checkAuth, isRoot])
  
  useEffect(() => {
    if (isRoot) return
    
    if (!isChecking) {
      if (!isAuthenticated && !PUBLIC_ROUTES.includes(pathname)) {
        router.replace('/login')
      } else if (isAuthenticated && pathname === '/login') {
        router.replace('/dashboard')
      }
    }
  }, [isChecking, isAuthenticated, pathname, router, isRoot])
  
  if (!isRoot && isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Skeleton className="h-8 w-48" />
      </div>
    )
  }
  
  return <>{children}</>
}
