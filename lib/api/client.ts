/**
 * API Client
 * 
 * Base fetch wrapper for Agent Engine API with error handling, retries, and type safety.
 * Integrates with existing environment configuration and follows established patterns.
 */

import { API_CONFIG, getApiUrl, DEV_CONFIG } from '@/lib/config/env'

// ============================================================================
// Types
// ============================================================================

export interface ApiResponse<T = unknown> {
  data: T
  success: boolean
  message?: string
  error?: string
}

export interface ApiError {
  message: string
  code?: string
  status?: number
  details?: unknown
}

export interface RequestConfig extends RequestInit {
  timeout?: number
  retries?: number
  retryDelay?: number
}

export interface RequestOptions extends RequestConfig {
  sanitize?: boolean
}

// ============================================================================
// Error Classes
// ============================================================================

export class ApiClientError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ApiClientError'
  }
}

export class NetworkError extends ApiClientError {
  constructor(message: string = 'Network request failed') {
    super(message, 0, 'NETWORK_ERROR')
    this.name = 'NetworkError'
  }
}

export class TimeoutError extends ApiClientError {
  constructor(message: string = 'Request timeout') {
    super(message, 0, 'TIMEOUT_ERROR')
    this.name = 'TimeoutError'
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create timeout promise for fetch requests
 */
function createTimeoutPromise(timeout: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new TimeoutError()), timeout)
  })
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Parse error response from API
 */
async function parseErrorResponse(response: Response): Promise<ApiError> {
  try {
    const errorData = await response.json()
    return {
      message: errorData.message || errorData.error || `HTTP ${response.status}`,
      code: errorData.code,
      status: response.status,
      details: errorData
    }
  } catch {
    return {
      message: `HTTP ${response.status}: ${response.statusText}`,
      status: response.status
    }
  }
}

// ============================================================================
// Main API Client
// ============================================================================

/**
 * Base API client with retry logic and error handling
 */
export class ApiClient {
  private baseUrl: string
  private defaultTimeout: number

  constructor(baseUrl?: string, timeout?: number) {
    this.baseUrl = baseUrl || API_CONFIG.url
    this.defaultTimeout = timeout || API_CONFIG.timeout
  }

  /**
   * Make HTTP request with retry logic
   */
  async request<T = unknown>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const {
      timeout = this.defaultTimeout,
      retries = 3,
      retryDelay = 1000,
      ...fetchConfig
    } = config

    const url = getApiUrl(endpoint)
    
    // Default headers
    const headers = {
      'Content-Type': 'application/json',
      ...fetchConfig.headers
    }

    let lastError: Error

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        if (DEV_CONFIG.debug && attempt > 0) {
          console.log(`API retry attempt ${attempt} for ${endpoint}`)
        }

        // Create fetch promise with timeout
        const fetchPromise = fetch(url, {
          ...fetchConfig,
          headers
        })

        const timeoutPromise = createTimeoutPromise(timeout)
        const response = await Promise.race([fetchPromise, timeoutPromise])

        // Handle HTTP errors
        if (!response.ok) {
          const error = await parseErrorResponse(response)
          throw new ApiClientError(error.message, error.status, error.code, error.details)
        }

        // Parse response
        const contentType = response.headers.get('content-type')
        if (contentType?.includes('application/json')) {
          return await response.json()
        } else {
          return response.text() as T
        }

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))

        // Don't retry on client errors (4xx) or timeout errors
        if (
          error instanceof ApiClientError && 
          error.status && 
          error.status >= 400 && 
          error.status < 500
        ) {
          throw error
        }

        if (error instanceof TimeoutError) {
          throw error
        }

        // Don't retry on last attempt
        if (attempt === retries) {
          break
        }

        // Wait before retry with exponential backoff
        await sleep(retryDelay * Math.pow(2, attempt))
      }
    }

    // If we get here, all retries failed
    throw lastError instanceof ApiClientError 
      ? lastError 
      : new NetworkError(lastError.message)
  }

  /**
   * GET request
   */
  async get<T = unknown>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' })
  }

  /**
   * POST request
   */
  async post<T = unknown>(
    endpoint: string, 
    data?: unknown, 
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  /**
   * PUT request
   */
  async put<T = unknown>(
    endpoint: string, 
    data?: unknown, 
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  /**
   * DELETE request
   */
  async delete<T = unknown>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' })
  }

  /**
   * PATCH request
   */
  async patch<T = unknown>(
    endpoint: string, 
    data?: unknown, 
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined
    })
  }
}

// ============================================================================
// Default Instance
// ============================================================================

/**
 * Default API client instance
 */
export const apiClient = new ApiClient()

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Quick GET request
 */
export const get = <T = unknown>(endpoint: string, config?: RequestConfig): Promise<T> =>
  apiClient.get<T>(endpoint, config)

/**
 * Quick POST request
 */
export const post = <T = unknown>(
  endpoint: string, 
  data?: unknown, 
  config?: RequestConfig
): Promise<T> => apiClient.post<T>(endpoint, data, config)

/**
 * Quick PUT request
 */
export const put = <T = unknown>(
  endpoint: string, 
  data?: unknown, 
  config?: RequestConfig
): Promise<T> => apiClient.put<T>(endpoint, data, config)

/**
 * Quick DELETE request
 */
export const del = <T = unknown>(endpoint: string, config?: RequestConfig): Promise<T> =>
  apiClient.delete<T>(endpoint, config)

/**
 * Quick PATCH request
 */
export const patch = <T = unknown>(
  endpoint: string, 
  data?: unknown, 
  config?: RequestConfig
): Promise<T> => apiClient.patch<T>(endpoint, data, config)