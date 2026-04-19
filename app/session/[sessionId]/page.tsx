'use client'

/**
 * Session-based Chat Page
 * 
 * Chat interface that loads a specific session by ID.
 * This provides persistent URLs that work on page refresh.
 */

import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function SessionPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string
  
  // Redirect to chat page with session as search param
  // This ensures the ChatPage component can read the sessionId correctly
  useEffect(() => {
    if (sessionId) {
      router.replace(`/chat?session=${sessionId}`)
    }
  }, [sessionId, router])
  
  // Show loading state while redirecting
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-text-secondary">Loading session...</div>
    </div>
  )
}