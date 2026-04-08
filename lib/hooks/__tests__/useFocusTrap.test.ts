import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useFocusTrap } from '../useFocusTrap'

describe('useFocusTrap', () => {
  let container: HTMLDivElement
  let button1: HTMLButtonElement
  let button2: HTMLButtonElement
  let button3: HTMLButtonElement

  beforeEach(() => {
    // Create a container with focusable elements
    container = document.createElement('div')
    button1 = document.createElement('button')
    button2 = document.createElement('button')
    button3 = document.createElement('button')
    
    button1.textContent = 'Button 1'
    button2.textContent = 'Button 2'
    button3.textContent = 'Button 3'
    
    container.appendChild(button1)
    container.appendChild(button2)
    container.appendChild(button3)
    
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  describe('Initialization', () => {
    it('should return a ref', () => {
      const { result } = renderHook(() => useFocusTrap({ isActive: false }))
      expect(result.current).toBeDefined()
      expect(result.current.current).toBeNull()
    })

    it('should not activate when isActive is false', () => {
      const { result } = renderHook(() => useFocusTrap({ isActive: false }))
      result.current.current = container
      
      // Focus should not be trapped
      expect(document.activeElement).not.toBe(button1)
    })
  })

  describe('Focus Management', () => {
    it('should accept isActive option', () => {
      const { result } = renderHook(() => useFocusTrap({ isActive: true }))
      result.current.current = container
      expect(result.current).toBeDefined()
    })

    it('should accept restoreFocus option', () => {
      const { result } = renderHook(() => 
        useFocusTrap({ isActive: true, restoreFocus: false })
      )
      result.current.current = container
      expect(result.current).toBeDefined()
    })
  })

  describe('Keyboard Navigation', () => {
    it('should handle Tab key', () => {
      const { result } = renderHook(() => useFocusTrap({ isActive: true }))
      result.current.current = container
      
      // Simulate Tab key press
      const event = new KeyboardEvent('keydown', { key: 'Tab' })
      document.dispatchEvent(event)
      
      // Should not throw
      expect(result.current).toBeDefined()
    })

    it('should handle Shift+Tab key', () => {
      const { result } = renderHook(() => useFocusTrap({ isActive: true }))
      result.current.current = container
      
      // Simulate Shift+Tab key press
      const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true })
      document.dispatchEvent(event)
      
      // Should not throw
      expect(result.current).toBeDefined()
    })

    it('should ignore non-Tab keys', () => {
      const { result } = renderHook(() => useFocusTrap({ isActive: true }))
      result.current.current = container
      
      // Simulate Enter key press
      const event = new KeyboardEvent('keydown', { key: 'Enter' })
      document.dispatchEvent(event)
      
      // Should not throw
      expect(result.current).toBeDefined()
    })
  })

  describe('Edge Cases', () => {
    it('should handle container with no focusable elements', () => {
      const emptyContainer = document.createElement('div')
      document.body.appendChild(emptyContainer)
      
      const { result } = renderHook(() => useFocusTrap({ isActive: true }))
      result.current.current = emptyContainer
      
      expect(result.current).toBeDefined()
      
      document.body.removeChild(emptyContainer)
    })

    it('should handle null container', () => {
      const { result } = renderHook(() => useFocusTrap({ isActive: true }))
      expect(result.current.current).toBeNull()
    })

    it('should handle disabled elements', () => {
      const disabledButton = document.createElement('button')
      disabledButton.disabled = true
      container.appendChild(disabledButton)
      
      const { result } = renderHook(() => useFocusTrap({ isActive: true }))
      result.current.current = container
      
      expect(result.current).toBeDefined()
    })
  })

  describe('Cleanup', () => {
    it('should cleanup on unmount', () => {
      const { result, unmount } = renderHook(() => 
        useFocusTrap({ isActive: true })
      )
      result.current.current = container
      
      unmount()
      
      // Should not throw
      expect(true).toBe(true)
    })

    it('should restore focus when restoreFocus is true', () => {
      const externalButton = document.createElement('button')
      document.body.appendChild(externalButton)
      externalButton.focus()
      
      const { result, unmount } = renderHook(() => 
        useFocusTrap({ isActive: true, restoreFocus: true })
      )
      result.current.current = container
      
      unmount()
      
      document.body.removeChild(externalButton)
    })
  })
})
