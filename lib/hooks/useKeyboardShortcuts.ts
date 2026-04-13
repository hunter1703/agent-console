'use client'

/**
 * useKeyboardShortcuts Hook
 * 
 * Manages global keyboard shortcuts for the application.
 * Handles platform-specific modifiers (Cmd on Mac, Ctrl on Windows/Linux).
 * 
 * Usage:
 * useKeyboardShortcuts([
 *   { key: 'k', modifiers: ['meta'], action: () => openSearch() },
 *   { key: 'n', modifiers: ['meta'], action: () => newChat() },
 * ])
 */

import { useEffect, useCallback } from 'react'

export interface KeyboardShortcut {
  key: string
  modifiers?: ('meta' | 'ctrl' | 'shift' | 'alt')[]
  action: () => void
  description?: string
  enabled?: boolean
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        // Skip if disabled
        if (shortcut.enabled === false) continue

        // Check if key matches
        if (event.key.toLowerCase() !== shortcut.key.toLowerCase()) continue

        // Check modifiers
        const modifiers = shortcut.modifiers || []
        const metaPressed = event.metaKey || event.ctrlKey // Cmd on Mac, Ctrl on Windows
        const shiftPressed = event.shiftKey
        const altPressed = event.altKey

        const requiresMeta = modifiers.includes('meta') || modifiers.includes('ctrl')
        const requiresShift = modifiers.includes('shift')
        const requiresAlt = modifiers.includes('alt')

        // Check if all required modifiers are pressed
        if (requiresMeta && !metaPressed) continue
        if (requiresShift && !shiftPressed) continue
        if (requiresAlt && !altPressed) continue

        // Check if no extra modifiers are pressed
        if (!requiresMeta && metaPressed) continue
        if (!requiresShift && shiftPressed) continue
        if (!requiresAlt && altPressed) continue

        // Prevent default and execute action
        event.preventDefault()
        shortcut.action()
        break
      }
    },
    [shortcuts]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

/**
 * Get platform-specific modifier key name
 */
export function getModifierKey(): string {
  if (typeof window === 'undefined') return 'Ctrl'
  return navigator.platform.toLowerCase().includes('mac') ? '⌘' : 'Ctrl'
}

/**
 * Format shortcut for display
 */
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const modifierKey = getModifierKey()
  const parts: string[] = []

  if (shortcut.modifiers?.includes('meta') || shortcut.modifiers?.includes('ctrl')) {
    parts.push(modifierKey)
  }
  if (shortcut.modifiers?.includes('shift')) {
    parts.push('Shift')
  }
  if (shortcut.modifiers?.includes('alt')) {
    parts.push('Alt')
  }

  parts.push(shortcut.key.toUpperCase())

  return parts.join('+')
}
