import { describe, it, expect } from 'vitest'
import {
  APIError,
  NetworkError,
  TimeoutError,
  ValidationError,
  UnauthorizedError,
  NotFoundError,
  ServerError,
  parseAPIError,
  getUserFriendlyErrorMessage,
} from '../errors'

describe('API Errors', () => {
  describe('APIError', () => {
    it('should create basic error', () => {
      const error = new APIError('Test error')
      expect(error.message).toBe('Test error')
      expect(error.name).toBe('APIError')
      expect(error.statusCode).toBeUndefined()
      expect(error.code).toBeUndefined()
    })

    it('should create error with status code', () => {
      const error = new APIError('Test error', 500)
      expect(error.statusCode).toBe(500)
    })

    it('should create error with code', () => {
      const error = new APIError('Test error', 500, 'TEST_ERROR')
      expect(error.code).toBe('TEST_ERROR')
    })

    it('should create error with details', () => {
      const details = { field: 'email', issue: 'invalid' }
      const error = new APIError('Test error', 400, 'VALIDATION', details)
      expect(error.details).toEqual(details)
    })

    it('should be instance of Error', () => {
      const error = new APIError('Test error')
      expect(error).toBeInstanceOf(Error)
    })
  })

  describe('NetworkError', () => {
    it('should create network error with default message', () => {
      const error = new NetworkError()
      expect(error.message).toBe('Network request failed')
      expect(error.name).toBe('NetworkError')
      expect(error.statusCode).toBe(0)
      expect(error.code).toBe('NETWORK_ERROR')
    })

    it('should create network error with custom message', () => {
      const error = new NetworkError('Connection lost')
      expect(error.message).toBe('Connection lost')
    })

    it('should be instance of APIError', () => {
      const error = new NetworkError()
      expect(error).toBeInstanceOf(APIError)
    })
  })

  describe('TimeoutError', () => {
    it('should create timeout error with default message', () => {
      const error = new TimeoutError()
      expect(error.message).toBe('Request timed out')
      expect(error.name).toBe('TimeoutError')
      expect(error.statusCode).toBe(0)
      expect(error.code).toBe('TIMEOUT_ERROR')
    })

    it('should create timeout error with custom message', () => {
      const error = new TimeoutError('Too slow')
      expect(error.message).toBe('Too slow')
    })
  })

  describe('ValidationError', () => {
    it('should create validation error', () => {
      const error = new ValidationError('Invalid input')
      expect(error.message).toBe('Invalid input')
      expect(error.name).toBe('ValidationError')
      expect(error.statusCode).toBe(400)
      expect(error.code).toBe('VALIDATION_ERROR')
    })

    it('should create validation error with details', () => {
      const details = { field: 'email' }
      const error = new ValidationError('Invalid email', details)
      expect(error.details).toEqual(details)
    })
  })

  describe('UnauthorizedError', () => {
    it('should create unauthorized error with default message', () => {
      const error = new UnauthorizedError()
      expect(error.message).toBe('Unauthorized')
      expect(error.name).toBe('UnauthorizedError')
      expect(error.statusCode).toBe(401)
      expect(error.code).toBe('UNAUTHORIZED')
    })

    it('should create unauthorized error with custom message', () => {
      const error = new UnauthorizedError('Invalid token')
      expect(error.message).toBe('Invalid token')
    })
  })

  describe('NotFoundError', () => {
    it('should create not found error with default message', () => {
      const error = new NotFoundError()
      expect(error.message).toBe('Resource not found')
      expect(error.name).toBe('NotFoundError')
      expect(error.statusCode).toBe(404)
      expect(error.code).toBe('NOT_FOUND')
    })

    it('should create not found error with custom message', () => {
      const error = new NotFoundError('Agent not found')
      expect(error.message).toBe('Agent not found')
    })
  })

  describe('ServerError', () => {
    it('should create server error with default message', () => {
      const error = new ServerError()
      expect(error.message).toBe('Internal server error')
      expect(error.name).toBe('ServerError')
      expect(error.statusCode).toBe(500)
      expect(error.code).toBe('SERVER_ERROR')
    })

    it('should create server error with custom message', () => {
      const error = new ServerError('Database error')
      expect(error.message).toBe('Database error')
    })
  })

  describe('parseAPIError', () => {
    it('should parse network error', () => {
      const error = new TypeError('fetch failed')
      const parsed = parseAPIError(error)
      expect(parsed).toBeInstanceOf(NetworkError)
    })

    it('should parse timeout error', () => {
      const error = new Error('Timeout')
      error.name = 'AbortError'
      const parsed = parseAPIError(error)
      expect(parsed).toBeInstanceOf(TimeoutError)
    })

    it('should return APIError as-is', () => {
      const error = new APIError('Test')
      const parsed = parseAPIError(error)
      expect(parsed).toBe(error)
    })

    it('should parse 400 error', () => {
      const error = { statusCode: 400, message: 'Bad request' }
      const parsed = parseAPIError(error)
      expect(parsed).toBeInstanceOf(ValidationError)
      expect(parsed.message).toBe('Bad request')
    })

    it('should parse 401 error', () => {
      const error = { statusCode: 401, message: 'Unauthorized' }
      const parsed = parseAPIError(error)
      expect(parsed).toBeInstanceOf(UnauthorizedError)
    })

    it('should parse 404 error', () => {
      const error = { statusCode: 404, message: 'Not found' }
      const parsed = parseAPIError(error)
      expect(parsed).toBeInstanceOf(NotFoundError)
    })

    it('should parse 500 error', () => {
      const error = { statusCode: 500, message: 'Server error' }
      const parsed = parseAPIError(error)
      expect(parsed).toBeInstanceOf(ServerError)
    })

    it('should parse 502 error', () => {
      const error = { statusCode: 502, message: 'Bad gateway' }
      const parsed = parseAPIError(error)
      expect(parsed).toBeInstanceOf(ServerError)
    })

    it('should parse 503 error', () => {
      const error = { statusCode: 503, message: 'Service unavailable' }
      const parsed = parseAPIError(error)
      expect(parsed).toBeInstanceOf(ServerError)
    })

    it('should parse generic HTTP error', () => {
      const error = { statusCode: 418, message: "I'm a teapot" }
      const parsed = parseAPIError(error)
      expect(parsed).toBeInstanceOf(APIError)
      expect(parsed.statusCode).toBe(418)
    })

    it('should parse error with details', () => {
      const details = { field: 'email' }
      const error = { statusCode: 400, message: 'Invalid', details }
      const parsed = parseAPIError(error)
      expect(parsed.details).toEqual(details)
    })

    it('should parse generic error', () => {
      const error = new Error('Something went wrong')
      const parsed = parseAPIError(error)
      expect(parsed).toBeInstanceOf(APIError)
      expect(parsed.message).toBe('Something went wrong')
    })

    it('should handle error without message', () => {
      const error = {}
      const parsed = parseAPIError(error)
      expect(parsed.message).toBe('An unknown error occurred')
    })
  })

  describe('getUserFriendlyErrorMessage', () => {
    it('should return friendly message for NetworkError', () => {
      const error = new NetworkError()
      const message = getUserFriendlyErrorMessage(error)
      expect(message).toContain('internet connection')
    })

    it('should return friendly message for TimeoutError', () => {
      const error = new TimeoutError()
      const message = getUserFriendlyErrorMessage(error)
      expect(message).toContain('took too long')
    })

    it('should return friendly message for UnauthorizedError', () => {
      const error = new UnauthorizedError()
      const message = getUserFriendlyErrorMessage(error)
      expect(message).toContain('not authorized')
    })

    it('should return friendly message for NotFoundError', () => {
      const error = new NotFoundError()
      const message = getUserFriendlyErrorMessage(error)
      expect(message).toContain('not found')
    })

    it('should return friendly message for ValidationError', () => {
      const error = new ValidationError('Invalid email')
      const message = getUserFriendlyErrorMessage(error)
      expect(message).toBe('Invalid email')
    })

    it('should return friendly message for ServerError', () => {
      const error = new ServerError()
      const message = getUserFriendlyErrorMessage(error)
      expect(message).toContain('server error')
    })

    it('should return error message for generic APIError', () => {
      const error = new APIError('Custom error')
      const message = getUserFriendlyErrorMessage(error)
      expect(message).toBe('Custom error')
    })

    it('should return default message for error without message', () => {
      const error = new APIError('')
      const message = getUserFriendlyErrorMessage(error)
      expect(message).toBe('An unexpected error occurred.')
    })
  })

  describe('Error Inheritance', () => {
    it('should maintain inheritance chain', () => {
      const error = new ValidationError('Test')
      expect(error).toBeInstanceOf(ValidationError)
      expect(error).toBeInstanceOf(APIError)
      expect(error).toBeInstanceOf(Error)
    })

    it('should allow instanceof checks', () => {
      const errors = [
        new NetworkError(),
        new TimeoutError(),
        new ValidationError('test'),
        new UnauthorizedError(),
        new NotFoundError(),
        new ServerError(),
      ]

      errors.forEach(error => {
        expect(error).toBeInstanceOf(APIError)
        expect(error).toBeInstanceOf(Error)
      })
    })
  })
})
