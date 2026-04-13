/**
 * API Error Handling
 * 
 * Provides consistent error handling patterns for API calls.
 * Includes typed error classes and helper functions.
 */

// ============================================================================
// Error Types
// ============================================================================

/**
 * Base API error class
 */
export class ApiError extends Error {
  public readonly statusCode: number
  public readonly code: string
  public readonly details?: unknown
  
  constructor(
    message: string,
    statusCode: number,
    code: string,
    details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.code = code
    this.details = details
  }
}

/**
 * Network error (no response from server)
 */
export class NetworkError extends ApiError {
  constructor(message: string = 'Network error. Please check your connection.') {
    super(message, 0, 'NETWORK_ERROR')
    this.name = 'NetworkError'
  }
}

/**
 * Validation error (400)
 */
export class ValidationError extends ApiError {
  public readonly fields?: Record<string, string[]>
  
  constructor(
    message: string = 'Validation failed',
    fields?: Record<string, string[]>
  ) {
    super(message, 400, 'VALIDATION_ERROR', fields)
    this.name = 'ValidationError'
    this.fields = fields
  }
}

/**
 * Authentication error (401)
 */
export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR')
    this.name = 'AuthenticationError'
  }
}

/**
 * Authorization error (403)
 */
export class AuthorizationError extends ApiError {
  constructor(message: string = 'You do not have permission to perform this action') {
    super(message, 403, 'AUTHORIZATION_ERROR')
    this.name = 'AuthorizationError'
  }
}

/**
 * Not found error (404)
 */
export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND_ERROR')
    this.name = 'NotFoundError'
  }
}

/**
 * Conflict error (409)
 */
export class ConflictError extends ApiError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409, 'CONFLICT_ERROR')
    this.name = 'ConflictError'
  }
}

/**
 * Server error (500+)
 */
export class ServerError extends ApiError {
  constructor(message: string = 'Server error. Please try again later.') {
    super(message, 500, 'SERVER_ERROR')
    this.name = 'ServerError'
  }
}

/**
 * Timeout error
 */
export class TimeoutError extends ApiError {
  constructor(message: string = 'Request timeout. Please try again.') {
    super(message, 408, 'TIMEOUT_ERROR')
    this.name = 'TimeoutError'
  }
}

// ============================================================================
// Error Response Types
// ============================================================================

interface ApiErrorResponse {
  message: string
  code?: string
  statusCode?: number
  details?: unknown
  fields?: Record<string, string[]>
}

// ============================================================================
// Error Parsing
// ============================================================================

/**
 * Parse error response and create appropriate error instance
 */
export function parseApiError(error: unknown): ApiError {
  // Network error (no response)
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new NetworkError()
  }
  
  // Already an ApiError
  if (error instanceof ApiError) {
    return error
  }
  
  // Response error
  if (error && typeof error === 'object' && 'statusCode' in error) {
    const errorResponse = error as ApiErrorResponse
    const statusCode = errorResponse.statusCode || 500
    const message = errorResponse.message || 'An error occurred'
    const code = errorResponse.code || 'UNKNOWN_ERROR'
    
    // Map status codes to error types
    switch (statusCode) {
      case 400:
        return new ValidationError(message, errorResponse.fields)
      case 401:
        return new AuthenticationError(message)
      case 403:
        return new AuthorizationError(message)
      case 404:
        return new NotFoundError(message)
      case 408:
        return new TimeoutError(message)
      case 409:
        return new ConflictError(message)
      case 500:
      case 502:
      case 503:
      case 504:
        return new ServerError(message)
      default:
        return new ApiError(message, statusCode, code, errorResponse.details)
    }
  }
  
  // Unknown error
  const message = error instanceof Error ? error.message : 'An unknown error occurred'
  return new ApiError(message, 500, 'UNKNOWN_ERROR')
}

// ============================================================================
// Error Handling Helpers
// ============================================================================

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: ApiError): string {
  if (error instanceof NetworkError) {
    return 'Unable to connect. Please check your internet connection.'
  }
  
  if (error instanceof AuthenticationError) {
    return 'Please sign in to continue.'
  }
  
  if (error instanceof AuthorizationError) {
    return 'You do not have permission to perform this action.'
  }
  
  if (error instanceof NotFoundError) {
    return 'The requested resource was not found.'
  }
  
  if (error instanceof ValidationError) {
    return error.message || 'Please check your input and try again.'
  }
  
  if (error instanceof TimeoutError) {
    return 'The request took too long. Please try again.'
  }
  
  if (error instanceof ServerError) {
    return 'Something went wrong on our end. Please try again later.'
  }
  
  return error.message || 'An unexpected error occurred.'
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: ApiError): boolean {
  return (
    error instanceof NetworkError ||
    error instanceof TimeoutError ||
    error instanceof ServerError
  )
}

/**
 * Get retry delay based on error type
 */
export function getRetryDelay(error: ApiError, attempt: number): number {
  // Exponential backoff: 1s, 2s, 4s, 8s, 16s
  const baseDelay = 1000
  const maxDelay = 16000
  
  const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay)
  
  // Add jitter to prevent thundering herd
  const jitter = Math.random() * 1000
  
  return delay + jitter
}

// ============================================================================
// Retry Logic
// ============================================================================

interface RetryOptions {
  maxAttempts?: number
  shouldRetry?: (error: ApiError) => boolean
  onRetry?: (error: ApiError, attempt: number) => void
}

/**
 * Retry a function with exponential backoff
 * 
 * @example
 * ```ts
 * const data = await retryWithBackoff(
 *   () => fetchData(),
 *   { maxAttempts: 3 }
 * )
 * ```
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    shouldRetry = isRetryableError,
    onRetry,
  } = options
  
  let lastError: ApiError | undefined
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      const apiError = parseApiError(error)
      lastError = apiError
      
      // Don't retry if not retryable or last attempt
      if (!shouldRetry(apiError) || attempt === maxAttempts - 1) {
        throw apiError
      }
      
      // Call retry callback
      onRetry?.(apiError, attempt + 1)
      
      // Wait before retrying
      const delay = getRetryDelay(apiError, attempt)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError
}

// ============================================================================
// Error Logging
// ============================================================================

/**
 * Log error to console (and monitoring service in production)
 */
export function logError(error: ApiError, context?: Record<string, unknown>): void {
  const errorData = {
    name: error.name,
    message: error.message,
    statusCode: error.statusCode,
    code: error.code,
    details: error.details,
    context,
    timestamp: new Date().toISOString(),
  }
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('[API Error]', errorData)
  }
  
  // In production, send to monitoring service (Sentry, etc.)
  // if (process.env.NODE_ENV === 'production') {
  //   Sentry.captureException(error, { extra: errorData })
  // }
}

// ============================================================================
// Type Guards
// ============================================================================

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError
}

export function isAuthenticationError(error: unknown): error is AuthenticationError {
  return error instanceof AuthenticationError
}

export function isAuthorizationError(error: unknown): error is AuthorizationError {
  return error instanceof AuthorizationError
}

export function isNotFoundError(error: unknown): error is NotFoundError {
  return error instanceof NotFoundError
}

export function isServerError(error: unknown): error is ServerError {
  return error instanceof ServerError
}

export function isTimeoutError(error: unknown): error is TimeoutError {
  return error instanceof TimeoutError
}
