import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useKeyboardShortcuts, KeyboardShortcut } from '../useKeyboardShortcuts'

describe('useKeyboardShortcuts', () => {
  describe('Initialization', () => {
    it('should accept shortcuts array', () => {
      const shortcuts: KeyboardShortcut[] = [
        { key: 's', ctrl: true, callback: vi.fn() },
      ]

      const { result } = renderHook(() => useKeyboardShortcuts({ shortcuts }))
      expect(result).toBeDefined()
    })

    it('should accept enabled option', () => {
      const shortcuts: KeyboardShortcut[] = []
      const { result } = renderHook(() => 
        useKeyboardShortcuts({ shortcuts, enabled: false })
      )
      expect(result).toBeDefined()
    })

    it('should handle empty shortcuts array', () => {
      const { result } = renderHook(() => useKeyboardShortcuts({ shortcuts: [] }))
      expect(result).toBeDefined()
    })
  })

  describe('Keyboard Events', () => {
    it('should call callback on matching shortcut', () => {
      const callback = vi.fn()
      const shortcuts: KeyboardShortcut[] = [
        { key: 's', ctrl: true, callback },
      ]

      renderHook(() => useKeyboardShortcuts({ shortcuts }))

      const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true })
      window.dispatchEvent(event)

      expect(callback).toHaveBeenCalled()
    })

    it('should not call callback when disabled', () => {
      const callback = vi.fn()
      const shortcuts: KeyboardShortcut[] = [
        { key: 's', ctrl: true, callback },
      ]

      renderHook(() => useKeyboardShortcuts({ shortcuts, enabled: false }))

      const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true })
      window.dispatchEvent(event)

      expect(callback).not.toHaveBeenCalled()
    })

    it('should handle shift modifier', () => {
      const callback = vi.fn()
      const shortcuts: KeyboardShortcut[] = [
        { key: 's', ctrl: true, shift: true, callback },
      ]

      renderHook(() => useKeyboardShortcuts({ shortcuts }))

      const event = new KeyboardEvent('keydown', { 
        key: 's', 
        ctrlKey: true, 
        shiftKey: true 
      })
      window.dispatchEvent(event)

      expect(callback).toHaveBeenCalled()
    })

    it('should handle alt modifier', () => {
      const callback = vi.fn()
      const shortcuts: KeyboardShortcut[] = [
        { key: 's', alt: true, callback },
      ]

      renderHook(() => useKeyboardShortcuts({ shortcuts }))

      const event = new KeyboardEvent('keydown', { key: 's', altKey: true })
      window.dispatchEvent(event)

      expect(callback).toHaveBeenCalled()
    })

    it('should handle meta modifier', () => {
      const callback = vi.fn()
      const shortcuts: KeyboardShortcut[] = [
        { key: 's', meta: true, callback },
      ]

      renderHook(() => useKeyboardShortcuts({ shortcuts }))

      const event = new KeyboardEvent('keydown', { key: 's', metaKey: true })
      window.dispatchEvent(event)

      expect(callback).toHaveBeenCalled()
    })

    it('should handle multiple modifiers', () => {
      const callback = vi.fn()
      const shortcuts: KeyboardShortcut[] = [
        { key: 's', ctrl: true, shift: true, alt: true, callback },
      ]

      renderHook(() => useKeyboardShortcuts({ shortcuts }))

      const event = new KeyboardEvent('keydown', { 
        key: 's', 
        ctrlKey: true, 
        shiftKey: true,
        altKey: true
      })
      window.dispatchEvent(event)

      expect(callback).toHaveBeenCalled()
    })
  })

  describe('preventDefault', () => {
    it('should prevent default by default', () => {
      const callback = vi.fn()
      const shortcuts: KeyboardShortcut[] = [
        { key: 's', ctrl: true, callback },
      ]

      renderHook(() => useKeyboardShortcuts({ shortcuts }))

      const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
      window.dispatchEvent(event)

      expect(preventDefaultSpy).toHaveBeenCalled()
    })

    it('should not prevent default when preventDefault is false', () => {
      const callback = vi.fn()
      const shortcuts: KeyboardShortcut[] = [
        { key: 's', ctrl: true, callback, preventDefault: false },
      ]

      renderHook(() => useKeyboardShortcuts({ shortcuts }))

      const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
      window.dispatchEvent(event)

      expect(preventDefaultSpy).not.toHaveBeenCalled()
    })
  })

  describe('Multiple Shortcuts', () => {
    it('should handle multiple shortcuts', () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()
      const shortcuts: KeyboardShortcut[] = [
        { key: 's', ctrl: true, callback: callback1 },
        { key: 'o', ctrl: true, callback: callback2 },
      ]

      renderHook(() => useKeyboardShortcuts({ shortcuts }))

      const event1 = new KeyboardEvent('keydown', { key: 's', ctrlKey: true })
      window.dispatchEvent(event1)
      expect(callback1).toHaveBeenCalled()

      const event2 = new KeyboardEvent('keydown', { key: 'o', ctrlKey: true })
      window.dispatchEvent(event2)
      expect(callback2).toHaveBeenCalled()
    })

    it('should only call first matching shortcut', () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()
      const shortcuts: KeyboardShortcut[] = [
        { key: 's', ctrl: true, callback: callback1 },
        { key: 's', ctrl: true, callback: callback2 },
      ]

      renderHook(() => useKeyboardShortcuts({ shortcuts }))

      const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true })
      window.dispatchEvent(event)

      expect(callback1).toHaveBeenCalled()
      expect(callback2).not.toHaveBeenCalled()
    })
  })

  describe('Case Insensitivity', () => {
    it('should match keys case-insensitively', () => {
      const callback = vi.fn()
      const shortcuts: KeyboardShortcut[] = [
        { key: 'S', ctrl: true, callback },
      ]

      renderHook(() => useKeyboardShortcuts({ shortcuts }))

      const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true })
      window.dispatchEvent(event)

      expect(callback).toHaveBeenCalled()
    })
  })

  describe('Cleanup', () => {
    it('should cleanup event listener on unmount', () => {
      const callback = vi.fn()
      const shortcuts: KeyboardShortcut[] = [
        { key: 's', ctrl: true, callback },
      ]

      const { unmount } = renderHook(() => useKeyboardShortcuts({ shortcuts }))

      unmount()

      const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true })
      window.dispatchEvent(event)

      // Callback should not be called after unmount
      expect(callback).not.toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle shortcuts without modifiers', () => {
      const callback = vi.fn()
      const shortcuts: KeyboardShortcut[] = [
        { key: 'Escape', callback },
      ]

      renderHook(() => useKeyboardShortcuts({ shortcuts }))

      const event = new KeyboardEvent('keydown', { key: 'Escape' })
      window.dispatchEvent(event)

      expect(callback).toHaveBeenCalled()
    })

    it('should not match when wrong modifiers are pressed', () => {
      const callback = vi.fn()
      const shortcuts: KeyboardShortcut[] = [
        { key: 's', ctrl: true, callback },
      ]

      renderHook(() => useKeyboardShortcuts({ shortcuts }))

      // Press 's' with shift instead of ctrl
      const event = new KeyboardEvent('keydown', { key: 's', shiftKey: true })
      window.dispatchEvent(event)

      expect(callback).not.toHaveBeenCalled()
    })

    it('should handle special keys', () => {
      const callback = vi.fn()
      const shortcuts: KeyboardShortcut[] = [
        { key: 'Enter', callback },
        { key: 'Escape', callback },
        { key: 'ArrowUp', callback },
      ]

      renderHook(() => useKeyboardShortcuts({ shortcuts }))

      const event = new KeyboardEvent('keydown', { key: 'Enter' })
      window.dispatchEvent(event)

      expect(callback).toHaveBeenCalled()
    })
  })
})
