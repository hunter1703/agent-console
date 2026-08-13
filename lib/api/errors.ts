/**
 * API Error Handling Utilities
 * 
 * Centralized error handling for API responses with user-friendly messages
 * and proper error classification for different UI states.
 */

// Re-export error classes from client
export { APIError } from './client'

// Import for local use
import { APIError } from './client'

// ============================================================================
// Error Types
// ============================================================================

export interface UserFriendlyError {
  title: string
  message: string
  action?: string
  retryable: boolean
  severity: 'error' | 'warning' | 'info'
}

export interface ValidationError {
  field: string
  message: string
  code?: string
}

export interface FormErrors {
  general?: string
  fields: Record<string, string>
}

// ============================================================================
// Error Classification
// ============================================================================

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof Error && error.name === 'TypeError') return true // Network error
  
  if (error instanceof APIError) {
    if (error.status === 408) return true // Timeout
    // Server errors (5xx) are retryable
    return error.status ? error.status >= 500 : false
  }
  
  return false
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: unknown): boolean {
  return error instanceof APIError && error.status === 400
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  return error instanceof APIError && 
    (error.status === 401 || error.status === 403)
}

/**
 * Check if error is a not found error
 */
export function isNotFoundError(error: unknown): boolean {
  return error instanceof APIError && error.status === 404
}

/**
 * Check if error is a server error
 */
export function isServerError(error: unknown): boolean {
  return error instanceof APIError && 
    error.status ? error.status >= 500 : false
}

// ============================================================================
// Error Message Mapping
// ============================================================================

/**
 * Convert API error to user-friendly message
 */
export function getErrorMessage(error: unknown): UserFriendlyError {
  // Network errors
  if (error instanceof Error && error.name === 'TypeError') {
    return {
      title: 'Connection Error',
      message: 'Unable to connect to the server. Please check your internet connection.',
      action: 'Retry',
      retryable: true,
      severity: 'error'
    }
  }

  // API client errors
  if (error instanceof APIError) {
    if (error.status === 408) {
      return {
        title: 'Request Timeout',
        message: 'The request took too long to complete. Please try again.',
        action: 'Retry',
        retryable: true,
        severity: 'warning'
      }
    }

    switch (error.status) {
      case 400:
        return {
          title: 'Invalid Request',
          message: error.message || 'The request contains invalid data.',
          retryable: false,
          severity: 'error'
        }

      case 401:
        return {
          title: 'Authentication Required',
          message: 'Please sign in to continue.',
          action: 'Sign In',
          retryable: false,
          severity: 'warning'
        }

      case 403:
        return {
          title: 'Access Denied',
          message: 'You don\'t have permission to perform this action.',
          retryable: false,
          severity: 'error'
        }

      case 404:
        return {
          title: 'Not Found',
          message: 'The requested resource could not be found.',
          retryable: false,
          severity: 'error'
        }

      case 409:
        return {
          title: 'Conflict',
          message: error.message || 'This action conflicts with existing data.',
          retryable: false,
          severity: 'warning'
        }

      case 422:
        return {
          title: 'Validation Error',
          message: error.message || 'Please check your input and try again.',
          retryable: false,
          severity: 'error'
        }

      case 429:
        return {
          title: 'Too Many Requests',
          message: 'Please wait a moment before trying again.',
          action: 'Retry Later',
          retryable: true,
          severity: 'warning'
        }

      case 500:
        return {
          title: 'Server Error',
          message: 'Something went wrong on our end. Please try again.',
          action: 'Retry',
          retryable: true,
          severity: 'error'
        }

      case 502:
      case 503:
      case 504:
        return {
          title: 'Service Unavailable',
          message: 'The service is temporarily unavailable. Please try again later.',
          action: 'Retry',
          retryable: true,
          severity: 'error'
        }

      default:
        return {
          title: 'Request Failed',
          message: error.message || 'An unexpected error occurred.',
          action: 'Retry',
          retryable: isRetryableError(error),
          severity: 'error'
        }
    }
  }

  // Generic errors
  return {
    title: 'Unexpected Error',
    message: error instanceof Error ? error.message : 'An unexpected error occurred.',
    action: 'Retry',
    retryable: false,
    severity: 'error'
  }
}

// ============================================================================
// Form Error Handling
// ============================================================================

/**
 * Parse validation errors from API response
 */
export function parseValidationErrors(error: unknown): FormErrors {
  if (!(error instanceof APIError) || !error.details) {
    return {
      general: getErrorMessage(error).message,
      fields: {}
    }
  }

  const details = error.details as any
  const formErrors: FormErrors = { fields: {} }

  // Handle different validation error formats
  if (details.errors && Array.isArray(details.errors)) {
    // Format: { errors: [{ field: 'name', message: 'Required' }] }
    details.errors.forEach((err: ValidationError) => {
      if (err.field && err.message) {
        formErrors.fields[err.field] = err.message
      }
    })
  } else if (details.fieldErrors) {
    // Format: { fieldErrors: { name: 'Required', email: 'Invalid' } }
    formErrors.fields = details.fieldErrors
  } else if (details.violations && Array.isArray(details.violations)) {
    // Format: { violations: [{ propertyPath: 'name', message: 'Required' }] }
    details.violations.forEach((violation: any) => {
      if (violation.propertyPath && violation.message) {
        formErrors.fields[violation.propertyPath] = violation.message
      }
    })
  } else {
    // Fallback to general error
    formErrors.general = error.message || 'Validation failed'
  }

  return formErrors
}

/**
 * Get field error message
 */
export function getFieldError(errors: FormErrors, field: string): string | undefined {
  return errors.fields[field]
}

/**
 * Check if form has any errors
 */
export function hasFormErrors(errors: FormErrors): boolean {
  return Boolean(errors.general || Object.keys(errors.fields).length > 0)
}

// ============================================================================
// Error Logging
// ============================================================================

/**
 * Log error for debugging/monitoring
 */
export function logError(error: unknown, context?: string): void {
  const errorInfo = {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    context,
    timestamp: new Date().toISOString(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', errorInfo)
  }

  // TODO: Send to monitoring service in production
  // if (process.env.NODE_ENV === 'production') {
  //   sendToMonitoring(errorInfo)
  // }
}

// ============================================================================
// Error Recovery
// ============================================================================

/**
 * Create retry function for failed requests
 */
export function createRetryFunction<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): () => Promise<T> {
  return async () => {
    let lastError: unknown

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error

        // Don't retry non-retryable errors
        if (!isRetryableError(error)) {
          throw error
        }

        // Don't wait after last attempt
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)))
        }
      }
    }

    throw lastError
  }
}

/**
 * Wrap async function with error handling
 */
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  onError?: (error: unknown) => void
): (...args: T) => Promise<R | undefined> {
  return async (...args: T) => {
    try {
      return await fn(...args)
    } catch (error) {
      logError(error, fn.name)
      onError?.(error)
      return undefined
    }
  }
}