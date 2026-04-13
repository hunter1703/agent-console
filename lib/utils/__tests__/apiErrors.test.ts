/**
 * Tests for API error handling utilities
 */

import { describe, it, expect, vi } from 'vitest'
import {
  ApiError,
  NetworkError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  ServerError,
  TimeoutError,
  parseApiError,
  getUserFriendlyMessage,
  isRetryableError,
  getRetryDelay,
  retryWithBackoff,
  logError,
} from '../apiErrors'

describe('Error Classes', () => {
  it('should create ApiError with correct properties', () => {
    const error = new ApiError('Test error', 400, 'TEST_ERROR', { detail: 'test' })
    
    expect(error.message).toBe('Test error')
    expect(error.statusCode).toBe(400)
    expect(error.code).toBe('TEST_ERROR')
    expect(error.details).toEqual({ detail: 'test' })
    expect(error.name).toBe('ApiError')
  })

  it('should create NetworkError', () => {
    const error = new NetworkError()
    
    expect(error.statusCode).toBe(0)
    expect(error.code).toBe('NETWORK_ERROR')
    expect(error.name).toBe('NetworkError')
  })

  it('should create ValidationError with fields', () => {
    const fields = { email: ['Invalid email'], password: ['Too short'] }
    const error = new ValidationError('Validation failed', fields)
    
    expect(error.statusCode).toBe(400)
    expect(error.code).toBe('VALIDATION_ERROR')
    expect(error.fields).toEqual(fields)
  })

  it('should create AuthenticationError', () => {
    const error = new AuthenticationError()
    
    expect(error.statusCode).toBe(401)
    expect(error.code).toBe('AUTHENTICATION_ERROR')
  })

  it('should create AuthorizationError', () => {
    const error = new AuthorizationError()
    
    expect(error.statusCode).toBe(403)
    expect(error.code).toBe('AUTHORIZATION_ERROR')
  })

  it('should create NotFoundError', () => {
    const error = new NotFoundError()
    
    expect(error.statusCode).toBe(404)
    expect(error.code).toBe('NOT_FOUND_ERROR')
  })

  it('should create ConflictError', () => {
    const error = new ConflictError()
    
    expect(error.statusCode).toBe(409)
    expect(error.code).toBe('CONFLICT_ERROR')
  })

  it('should create ServerError', () => {
    const error = new ServerError()
    
    expect(error.statusCode).toBe(500)
    expect(error.code).toBe('SERVER_ERROR')
  })

  it('should create TimeoutError', () => {
    const error = new TimeoutError()
    
    expect(error.statusCode).toBe(408)
    expect(error.code).toBe('TIMEOUT_ERROR')
  })
})

describe('parseApiError', () => {
  it('should parse network error', () => {
    const error = new TypeError('fetch failed')
    const parsed = parseApiError(error)
    
    expect(parsed).toBeInstanceOf(NetworkError)
  })

  it('should return ApiError as-is', () => {
    const error = new ApiError('Test', 400, 'TEST')
    const parsed = parseApiError(error)
    
    expect(parsed).toBe(error)
  })

  it('should parse 400 error as ValidationError', () => {
    const error = { statusCode: 400, message: 'Validation failed', fields: {} }
    const parsed = parseApiError(error)
    
    expect(parsed).toBeInstanceOf(ValidationError)
  })

  it('should parse 401 error as AuthenticationError', () => {
    const error = { statusCode: 401, message: 'Unauthorized' }
    const parsed = parseApiError(error)
    
    expect(parsed).toBeInstanceOf(AuthenticationError)
  })

  it('should parse 403 error as AuthorizationError', () => {
    const error = { statusCode: 403, message: 'Forbidden' }
    const parsed = parseApiError(error)
    
    expect(parsed).toBeInstanceOf(AuthorizationError)
  })

  it('should parse 404 error as NotFoundError', () => {
    const error = { statusCode: 404, message: 'Not found' }
    const parsed = parseApiError(error)
    
    expect(parsed).toBeInstanceOf(NotFoundError)
  })

  it('should parse 408 error as TimeoutError', () => {
    const error = { statusCode: 408, message: 'Timeout' }
    const parsed = parseApiError(error)
    
    expect(parsed).toBeInstanceOf(TimeoutError)
  })

  it('should parse 409 error as ConflictError', () => {
    const error = { statusCode: 409, message: 'Conflict' }
    const parsed = parseApiError(error)
    
    expect(parsed).toBeInstanceOf(ConflictError)
  })

  it('should parse 500 error as ServerError', () => {
    const error = { statusCode: 500, message: 'Server error' }
    const parsed = parseApiError(error)
    
    expect(parsed).toBeInstanceOf(ServerError)
  })

  it('should parse unknown error', () => {
    const error = new Error('Unknown error')
    const parsed = parseApiError(error)
    
    expect(parsed).toBeInstanceOf(ApiError)
    expect(parsed.message).toBe('Unknown error')
  })
})

describe('getUserFriendlyMessage', () => {
  it('should return friendly message for NetworkError', () => {
    const error = new NetworkError()
    const message = getUserFriendlyMessage(error)
    
    expect(message).toContain('internet connection')
  })

  it('should return friendly message for AuthenticationError', () => {
    const error = new AuthenticationError()
    const message = getUserFriendlyMessage(error)
    
    expect(message).toContain('sign in')
  })

  it('should return friendly message for AuthorizationError', () => {
    const error = new AuthorizationError()
    const message = getUserFriendlyMessage(error)
    
    expect(message).toContain('permission')
  })

  it('should return friendly message for NotFoundError', () => {
    const error = new NotFoundError()
    const message = getUserFriendlyMessage(error)
    
    expect(message).toContain('not found')
  })

  it('should return friendly message for ServerError', () => {
    const error = new ServerError()
    const message = getUserFriendlyMessage(error)
    
    expect(message).toContain('try again later')
  })
})

describe('isRetryableError', () => {
  it('should return true for NetworkError', () => {
    const error = new NetworkError()
    expect(isRetryableError(error)).toBe(true)
  })

  it('should return true for TimeoutError', () => {
    const error = new TimeoutError()
    expect(isRetryableError(error)).toBe(true)
  })

  it('should return true for ServerError', () => {
    const error = new ServerError()
    expect(isRetryableError(error)).toBe(true)
  })

  it('should return false for ValidationError', () => {
    const error = new ValidationError()
    expect(isRetryableError(error)).toBe(false)
  })

  it('should return false for AuthenticationError', () => {
    const error = new AuthenticationError()
    expect(isRetryableError(error)).toBe(false)
  })
})

describe('getRetryDelay', () => {
  it('should return exponential backoff delay', () => {
    const error = new NetworkError()
    
    const delay1 = getRetryDelay(error, 0)
    const delay2 = getRetryDelay(error, 1)
    const delay3 = getRetryDelay(error, 2)
    
    expect(delay2).toBeGreaterThan(delay1)
    expect(delay3).toBeGreaterThan(delay2)
  })

  it('should cap at max delay', () => {
    const error = new NetworkError()
    
    const delay = getRetryDelay(error, 10)
    
    expect(delay).toBeLessThanOrEqual(17000) // 16000 + 1000 jitter
  })
})

describe('retryWithBackoff', () => {
  it('should succeed on first attempt', async () => {
    const fn = vi.fn().mockResolvedValue('success')
    
    const result = await retryWithBackoff(fn)
    
    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should retry on retryable error', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new NetworkError())
      .mockResolvedValue('success')
    
    const result = await retryWithBackoff(fn, { maxAttempts: 3 })
    
    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('should not retry on non-retryable error', async () => {
    const fn = vi.fn().mockRejectedValue(new ValidationError())
    
    await expect(retryWithBackoff(fn, { maxAttempts: 3 })).rejects.toThrow(ValidationError)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should throw after max attempts', async () => {
    const fn = vi.fn().mockRejectedValue(new NetworkError())
    
    await expect(retryWithBackoff(fn, { maxAttempts: 3 })).rejects.toThrow(NetworkError)
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('should call onRetry callback', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new NetworkError())
      .mockResolvedValue('success')
    
    const onRetry = vi.fn()
    
    await retryWithBackoff(fn, { maxAttempts: 3, onRetry })
    
    expect(onRetry).toHaveBeenCalledTimes(1)
    expect(onRetry).toHaveBeenCalledWith(expect.any(NetworkError), 1)
  })
})

describe('logError', () => {
  it('should log error in development', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'
    
    const error = new ApiError('Test error', 400, 'TEST')
    logError(error, { context: 'test' })
    
    expect(consoleSpy).toHaveBeenCalled()
    
    process.env.NODE_ENV = originalEnv
    consoleSpy.mockRestore()
  })
})
