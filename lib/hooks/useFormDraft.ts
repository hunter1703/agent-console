import { useEffect, useCallback, useRef } from 'react'

interface UseFormDraftOptions {
  key: string
  data: Record<string, any>
  enabled?: boolean
  debounceMs?: number
}

export function useFormDraft({ 
  key, 
  data, 
  enabled = true,
  debounceMs = 1000 
}: UseFormDraftOptions) {
  const isInitialMount = useRef(true)
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Save draft to localStorage
  const saveDraft = useCallback((draftData: Record<string, any>) => {
    if (!enabled) return

    try {
      const draft = {
        data: draftData,
        timestamp: Date.now(),
      }
      localStorage.setItem(`form-draft:${key}`, JSON.stringify(draft))
    } catch (err) {
      console.error('Failed to save draft:', err)
    }
  }, [key, enabled])

  // Debounced save function
  const debouncedSave = useCallback((draftData: Record<string, any>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      saveDraft(draftData)
    }, debounceMs)
  }, [saveDraft, debounceMs])

  // Auto-save on data change
  useEffect(() => {
    // Skip initial mount to avoid overwriting loaded draft
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    debouncedSave(data)

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [data, debouncedSave])

  // Load draft from localStorage
  const loadDraft = useCallback((): Record<string, any> | null => {
    if (!enabled) return null

    try {
      const stored = localStorage.getItem(`form-draft:${key}`)
      if (!stored) return null

      const draft = JSON.parse(stored)
      return draft.data
    } catch (err) {
      console.error('Failed to load draft:', err)
      return null
    }
  }, [key, enabled])

  // Clear draft from localStorage
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(`form-draft:${key}`)
    } catch (err) {
      console.error('Failed to clear draft:', err)
    }
  }, [key])

  // Get draft metadata
  const getDraftMetadata = useCallback((): { timestamp: number } | null => {
    if (!enabled) return null

    try {
      const stored = localStorage.getItem(`form-draft:${key}`)
      if (!stored) return null

      const draft = JSON.parse(stored)
      return { timestamp: draft.timestamp }
    } catch (err) {
      console.error('Failed to get draft metadata:', err)
      return null
    }
  }, [key, enabled])

  return {
    loadDraft,
    clearDraft,
    getDraftMetadata,
  }
}
