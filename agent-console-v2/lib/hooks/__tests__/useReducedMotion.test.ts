import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useReducedMotion } from '../useReducedMotion'

describe('useReducedMotion', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  it('should return shouldAnimate true when reduced motion is not preferred', () => {
    const { result } = renderHook(() => useReducedMotion())
    expect(result.current.shouldAnimate).toBe(true)
  })

  it('should return shouldAnimate false when reduced motion is preferred', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    const { result } = renderHook(() => useReducedMotion())
    expect(result.current.shouldAnimate).toBe(false)
  })

  it('should return instant transition when reduced motion is preferred', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    const { result } = renderHook(() => useReducedMotion())
    expect(result.current.transition).toEqual({ duration: 0 })
  })

  it('should return spring transition when animations are enabled', () => {
    const { result } = renderHook(() => useReducedMotion())
    expect(result.current.transition).toHaveProperty('type', 'spring')
    expect(result.current.transition).toHaveProperty('stiffness')
    expect(result.current.transition).toHaveProperty('damping')
  })
})
