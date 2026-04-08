/**
 * API Error Classes
 * 
 * Custom error classes for API error handling.
 */

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export class NetworkError extends APIError {
  constructor(message = 'Network request failed') {
    super(message, 0, 'NETWORK_ERROR')
    this.name = 'NetworkError'
  }
}

export class TimeoutError extends APIError {
  constructor(message = 'Request timed out') {
    super(message, 0, 'TIMEOUT_ERROR')
    this.name = 'TimeoutError'
  }
}

export class ValidationError extends APIError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details)
    this.name = 'ValidationError'
  }
}

export class UnauthorizedError extends APIError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED')
    this.name = 'UnauthorizedError'
  }
}

export class NotFoundError extends APIError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

export class ServerError extends APIError {
  constructor(message = 'Internal server error') {
    super(message, 500, 'SERVER_ERROR')
    this.name = 'ServerError'
  }
}

/**
 * Parse error response from API
 */
export function parseAPIError(error: any): APIError {
  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new NetworkError()
  }
  
  // Timeout errors
  if (error.name === 'AbortError') {
    return new TimeoutError()
  }
  
  // Already an APIError
  if (error instanceof APIError) {
    return error
  }
  
  // HTTP errors
  if (error.statusCode) {
    const message = error.message || 'An error occurred'
    
    switch (error.statusCode) {
      case 400:
        return new ValidationError(message, error.details)
      case 401:
        return new UnauthorizedError(message)
      case 404:
        return new NotFoundError(message)
      case 500:
      case 502:
      case 503:
        return new ServerError(message)
      default:
        return new APIError(message, error.statusCode, error.code, error.details)
    }
  }
  
  // Generic error
  return new APIError(error.message || 'An unknown error occurred')
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: APIError): string {
  switch (error.name) {
    case 'NetworkError':
      return 'Unable to connect to the server. Please check your internet connection.'
    case 'TimeoutError':
      return 'The request took too long. Please try again.'
    case 'UnauthorizedError':
      return 'You are not authorized to perform this action.'
    case 'NotFoundError':
      return 'The requested resource was not found.'
    case 'ValidationError':
      return error.message || 'Invalid request data.'
    case 'ServerError':
      return 'A server error occurred. Please try again later.'
    default:
      return error.message || 'An unexpected error occurred.'
  }
}
