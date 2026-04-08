import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useThrottle } from '../useThrottle'

describe('useThrottle', () => {
  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useThrottle('initial', { interval: 500 }))
    expect(result.current).toBe('initial')
  })

  it('should handle leading edge option', () => {
    const { result } = renderHook(() => useThrottle('initial', { interval: 500, leading: true }))
    expect(result.current).toBe('initial')
  })

  it('should handle trailing edge option', () => {
    const { result } = renderHook(() => useThrottle('initial', { interval: 500, trailing: true }))
    expect(result.current).toBe('initial')
  })

  it('should accept different data types', () => {
    const { result: stringResult } = renderHook(() => useThrottle('test', { interval: 500 }))
    expect(stringResult.current).toBe('test')

    const { result: numberResult } = renderHook(() => useThrottle(42, { interval: 500 }))
    expect(numberResult.current).toBe(42)

    const { result: boolResult } = renderHook(() => useThrottle(true, { interval: 500 }))
    expect(boolResult.current).toBe(true)

    const { result: objectResult } = renderHook(() => useThrottle({ foo: 'bar' }, { interval: 500 }))
    expect(objectResult.current).toEqual({ foo: 'bar' })
  })

  it('should use default interval when not specified', () => {
    const { result } = renderHook(() => useThrottle('test'))
    expect(result.current).toBe('test')
  })
})
