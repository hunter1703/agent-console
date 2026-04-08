import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useDebounce } from '../useDebounce'

describe('useDebounce', () => {
  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', { delay: 100 }))
    expect(result.current).toBe('initial')
  })

  it('should handle leading edge option', () => {
    const { result } = renderHook(() => useDebounce('initial', { delay: 100, leading: true }))
    expect(result.current).toBe('initial')
  })

  it('should accept different data types', () => {
    const { result: stringResult } = renderHook(() => useDebounce('test', { delay: 100 }))
    expect(stringResult.current).toBe('test')

    const { result: numberResult } = renderHook(() => useDebounce(42, { delay: 100 }))
    expect(numberResult.current).toBe(42)

    const { result: boolResult } = renderHook(() => useDebounce(true, { delay: 100 }))
    expect(boolResult.current).toBe(true)

    const { result: objectResult } = renderHook(() => useDebounce({ foo: 'bar' }, { delay: 100 }))
    expect(objectResult.current).toEqual({ foo: 'bar' })
  })

  it('should use default delay when not specified', () => {
    const { result } = renderHook(() => useDebounce('test'))
    expect(result.current).toBe('test')
  })
})
