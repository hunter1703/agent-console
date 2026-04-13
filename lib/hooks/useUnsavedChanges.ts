import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface UseUnsavedChangesOptions {
  hasUnsavedChanges: boolean
  message?: string
}

export function useUnsavedChanges({ 
  hasUnsavedChanges, 
  message = 'You have unsaved changes. Are you sure you want to leave?' 
}: UseUnsavedChangesOptions) {
  // Warn on browser navigation/refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = message
        return message
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasUnsavedChanges, message])

  // Warn on Next.js navigation
  const router = useRouter()

  const confirmNavigation = useCallback(() => {
    if (hasUnsavedChanges) {
      return window.confirm(message)
    }
    return true
  }, [hasUnsavedChanges, message])

  return {
    confirmNavigation,
  }
}
