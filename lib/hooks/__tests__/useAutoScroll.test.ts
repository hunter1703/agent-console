import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAutoScroll } from '../useAutoScroll'

describe('useAutoScroll', () => {
  let mockContainer: HTMLDivElement

  beforeEach(() => {
    mockContainer = document.createElement('div')
    Object.defineProperty(mockContainer, 'scrollHeight', { value: 1000, writable: true })
    Object.defineProperty(mockContainer, 'scrollTop', { value: 0, writable: true })
    Object.defineProperty(mockContainer, 'clientHeight', { value: 500, writable: true })
    mockContainer.scrollTo = vi.fn()
  })

  describe('Initialization', () => {
    it('should return containerRef', () => {
      const { result } = renderHook(() => useAutoScroll())
      expect(result.current.containerRef).toBeDefined()
      expect(result.current.containerRef.current).toBeNull()
    })

    it('should return scrollToBottom function', () => {
      const { result } = renderHook(() => useAutoScroll())
      expect(typeof result.current.scrollToBottom).toBe('function')
    })

    it('should initialize isAtBottom as true', () => {
      const { result } = renderHook(() => useAutoScroll())
      expect(result.current.isAtBottom).toBe(true)
    })

    it('should initialize userHasScrolled as false', () => {
      const { result } = renderHook(() => useAutoScroll())
      expect(result.current.userHasScrolled).toBe(false)
    })
  })

  describe('scrollToBottom', () => {
    it('should call scrollTo on container', () => {
      const { result } = renderHook(() => useAutoScroll())
      result.current.containerRef.current = mockContainer

      act(() => {
        result.current.scrollToBottom()
      })

      expect(mockContainer.scrollTo).toHaveBeenCalledWith({
        top: 1000,
        behavior: 'smooth',
      })
    })

    it('should use instant behavior when requested', () => {
      const { result } = renderHook(() => useAutoScroll())
      result.current.containerRef.current = mockContainer

      act(() => {
        result.current.scrollToBottom(true)
      })

      expect(mockContainer.scrollTo).toHaveBeenCalledWith({
        top: 1000,
        behavior: 'instant',
      })
    })

    it('should handle null container gracefully', () => {
      const { result } = renderHook(() => useAutoScroll())

      act(() => {
        result.current.scrollToBottom()
      })

      // Should not throw
      expect(result.current.containerRef.current).toBeNull()
    })
  })

  describe('Options', () => {
    it('should accept custom threshold', () => {
      const { result } = renderHook(() => useAutoScroll({ threshold: 50 }))
      expect(result.current).toBeDefined()
    })

    it('should accept custom behavior', () => {
      const { result } = renderHook(() => useAutoScroll({ behavior: 'auto' }))
      result.current.containerRef.current = mockContainer

      act(() => {
        result.current.scrollToBottom()
      })

      expect(mockContainer.scrollTo).toHaveBeenCalledWith({
        top: 1000,
        behavior: 'auto',
      })
    })

    it('should accept dependencies array', () => {
      const { result } = renderHook(() => 
        useAutoScroll({ dependencies: ['message1', 'message2'] })
      )
      expect(result.current).toBeDefined()
    })
  })

  describe('State Management', () => {
    it('should track isAtBottom state', () => {
      const { result } = renderHook(() => useAutoScroll())
      expect(result.current.isAtBottom).toBe(true)
    })

    it('should track userHasScrolled state', () => {
      const { result } = renderHook(() => useAutoScroll())
      expect(result.current.userHasScrolled).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('should handle container without scroll', () => {
      const { result } = renderHook(() => useAutoScroll())
      const smallContainer = document.createElement('div')
      Object.defineProperty(smallContainer, 'scrollHeight', { value: 100 })
      Object.defineProperty(smallContainer, 'scrollTop', { value: 0 })
      Object.defineProperty(smallContainer, 'clientHeight', { value: 100 })
      
      result.current.containerRef.current = smallContainer
      expect(result.current).toBeDefined()
    })

    it('should handle empty dependencies', () => {
      const { result } = renderHook(() => useAutoScroll({ dependencies: [] }))
      expect(result.current).toBeDefined()
    })

    it('should handle zero threshold', () => {
      const { result } = renderHook(() => useAutoScroll({ threshold: 0 }))
      expect(result.current).toBeDefined()
    })
  })
})
