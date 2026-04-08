import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useInView } from '../useInView'

describe('useInView', () => {
  it('should return false initially', () => {
    const { result } = renderHook(() => useInView())
    expect(result.current.isInView).toBe(false)
    expect(result.current.ref.current).toBeNull()
  })

  it('should return ref object', () => {
    const { result } = renderHook(() => useInView())
    
    expect(result.current.ref).toBeDefined()
    expect(typeof result.current.ref).toBe('object')
    expect('current' in result.current.ref).toBe(true)
  })

  it('should accept threshold option', () => {
    const { result } = renderHook(() => useInView({ threshold: 0.5 }))
    expect(result.current.isInView).toBe(false)
  })

  it('should accept rootMargin option', () => {
    const { result } = renderHook(() => useInView({ rootMargin: '10px' }))
    expect(result.current.isInView).toBe(false)
  })

  it('should accept once option', () => {
    const { result } = renderHook(() => useInView({ once: true }))
    expect(result.current.isInView).toBe(false)
  })

  it('should accept once=false option', () => {
    const { result } = renderHook(() => useInView({ once: false }))
    expect(result.current.isInView).toBe(false)
  })

  it('should accept root option', () => {
    const { result } = renderHook(() => useInView({ root: null }))
    expect(result.current.isInView).toBe(false)
  })
})
