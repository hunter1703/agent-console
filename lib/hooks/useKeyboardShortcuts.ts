/**
 * useKeyboardShortcuts Hook
 * 
 * Manages keyboard shortcuts with cross-platform modifier key support.
 */

'use client'

import { useEffect, useCallback } from 'react'

export interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
  callback: (event: KeyboardEvent) => void
  preventDefault?: boolean
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[]
  enabled?: boolean
}

export function useKeyboardShortcuts({ shortcuts, enabled = true }: UseKeyboardShortcutsOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return

      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()
        
        // Handle ctrl/meta cross-platform compatibility
        const hasCtrlOrMeta = event.ctrlKey || event.metaKey
        const ctrlMatch = shortcut.ctrl !== undefined 
          ? (shortcut.ctrl ? hasCtrlOrMeta : !hasCtrlOrMeta)
          : true
        
        const shiftMatch = shortcut.shift !== undefined
          ? (shortcut.shift ? event.shiftKey : !event.shiftKey)
          : true
        
        const altMatch = shortcut.alt !== undefined
          ? (shortcut.alt ? event.altKey : !event.altKey)
          : true
        
        const metaMatch = shortcut.meta !== undefined
          ? (shortcut.meta ? event.metaKey : !event.metaKey)
          : true

        if (keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch) {
          if (shortcut.preventDefault !== false) {
            event.preventDefault()
          }
          shortcut.callback(event)
          break
        }
      }
    },
    [shortcuts, enabled]
  )

  useEffect(() => {
    if (!enabled) return

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown, enabled])
}
