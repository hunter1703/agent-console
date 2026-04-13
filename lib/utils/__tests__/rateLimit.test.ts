/**
 * Tests for rate limiting utilities
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  createRateLimiter,
  RateLimitError,
  withRateLimit,
} from '../rateLimit'

describe('RateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('should allow requests within limit', () => {
    const limiter = createRateLimiter({
      maxRequests: 3,
      windowMs: 60000,
    })

    const result1 = limiter.check('user-1')
    expect(result1.allowed).toBe(true)
    expect(result1.remaining).toBe(2)

    const result2 = limiter.check('user-1')
    expect(result2.allowed).toBe(true)
    expect(result2.remaining).toBe(1)

    const result3 = limiter.check('user-1')
    expect(result3.allowed).toBe(true)
    expect(result3.remaining).toBe(0)
  })

  it('should block requests over limit', () => {
    const limiter = createRateLimiter({
      maxRequests: 2,
      windowMs: 60000,
    })

    limiter.check('user-1')
    limiter.check('user-1')
    
    const result = limiter.check('user-1')
    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('should track different users separately', () => {
    const limiter = createRateLimiter({
      maxRequests: 2,
      windowMs: 60000,
    })

    limiter.check('user-1')
    limiter.check('user-1')
    
    const result = limiter.check('user-2')
    expect(result.allowed).toBe(true)
  })

  it('should reset after time window', () => {
    const limiter = createRateLimiter({
      maxRequests: 2,
      windowMs: 60000,
    })

    limiter.check('user-1')
    limiter.check('user-1')
    
    // Should be blocked
    let result = limiter.check('user-1')
    expect(result.allowed).toBe(false)

    // Advance time past window
    vi.advanceTimersByTime(61000)

    // Should be allowed again
    result = limiter.check('user-1')
    expect(result.allowed).toBe(true)
  })

  it('should reset specific key', () => {
    const limiter = createRateLimiter({
      maxRequests: 1,
      windowMs: 60000,
    })

    limiter.check('user-1')
    
    // Should be blocked
    let result = limiter.check('user-1')
    expect(result.allowed).toBe(false)

    // Reset
    limiter.reset('user-1')

    // Should be allowed again
    result = limiter.check('user-1')
    expect(result.allowed).toBe(true)
  })

  it('should clear all data', () => {
    const limiter = createRateLimiter({
      maxRequests: 1,
      windowMs: 60000,
    })

    limiter.check('user-1')
    limiter.check('user-2')
    
    limiter.clear()

    // Both should be allowed again
    expect(limiter.check('user-1').allowed).toBe(true)
    expect(limiter.check('user-2').allowed).toBe(true)
  })

  it('should cleanup expired requests', () => {
    const limiter = createRateLimiter({
      maxRequests: 2,
      windowMs: 60000,
    })

    limiter.check('user-1')
    limiter.check('user-1')

    // Advance time past window
    vi.advanceTimersByTime(61000)

    // Cleanup
    limiter.cleanup()

    // Should be allowed (old requests cleaned up)
    const result = limiter.check('user-1')
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(1)
  })
})

describe('RateLimitError', () => {
  it('should create error with correct properties', () => {
    const resetAt = Date.now() + 60000
    const error = new RateLimitError('Rate limited', resetAt, 0)

    expect(error.message).toBe('Rate limited')
    expect(error.name).toBe('RateLimitError')
    expect(error.resetAt).toBe(resetAt)
    expect(error.remaining).toBe(0)
  })
})

describe('withRateLimit', () => {
  it('should allow function execution within limit', () => {
    const limiter = createRateLimiter({
      maxRequests: 2,
      windowMs: 60000,
    })

    const fn = vi.fn(() => 'result')
    const limited = withRateLimit(fn, limiter, 'user-1')

    expect(limited()).toBe('result')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should throw RateLimitError when limit exceeded', () => {
    const limiter = createRateLimiter({
      maxRequests: 1,
      windowMs: 60000,
    })

    const fn = vi.fn(() => 'result')
    const limited = withRateLimit(fn, limiter, 'user-1')

    // First call should succeed
    limited()

    // Second call should throw
    expect(() => limited()).toThrow(RateLimitError)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should pass arguments to wrapped function', () => {
    const limiter = createRateLimiter({
      maxRequests: 2,
      windowMs: 60000,
    })

    const fn = vi.fn((a: number, b: number) => a + b)
    const limited = withRateLimit(fn, limiter, 'user-1')

    expect(limited(2, 3)).toBe(5)
    expect(fn).toHaveBeenCalledWith(2, 3)
  })
})
