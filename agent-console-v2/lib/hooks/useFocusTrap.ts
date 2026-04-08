/**
 * useFocusTrap Hook
 * 
 * Traps focus within a container for modal accessibility.
 */

'use client'

import { useEffect, useRef } from 'react'

const FOCUSABLE_ELEMENTS = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
]

interface UseFocusTrapOptions {
  /**
   * Whether the focus trap is active
   */
  isActive: boolean
  
  /**
   * Element to restore focus to when trap is deactivated
   */
  restoreFocus?: boolean
}

export function useFocusTrap({ isActive, restoreFocus = true }: UseFocusTrapOptions) {
  const containerRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isActive || !containerRef.current) return

    // Store the currently focused element
    previousActiveElement.current = document.activeElement as HTMLElement

    // Get all focusable elements within the container
    const getFocusableElements = (): HTMLElement[] => {
      if (!containerRef.current) return []
      
      const elements = containerRef.current.querySelectorAll<HTMLElement>(
        FOCUSABLE_ELEMENTS.join(',')
      )
      return Array.from(elements)
    }

    // Focus the first focusable element
    const focusableElements = getFocusableElements()
    if (focusableElements.length > 0) {
      focusableElements[0].focus()
    }

    // Handle Tab key navigation
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return

      const focusableElements = getFocusableElements()
      if (focusableElements.length === 0) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (event.shiftKey) {
        // Shift + Tab: move focus backwards
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement.focus()
        }
      } else {
        // Tab: move focus forwards
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)

      // Restore focus to the previously focused element
      if (restoreFocus && previousActiveElement.current) {
        previousActiveElement.current.focus()
      }
    }
  }, [isActive, restoreFocus])

  return containerRef
}
