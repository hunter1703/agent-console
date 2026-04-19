/**
 * API Client
 * 
 * Centralized HTTP client with retry logic, error handling, and type safety.
 * Based on Open WebUI's consistent error handling pattern.
 */

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export interface FetchOptions extends RequestInit {
  retries?: number;
  backoff?: number;
  timeout?: number;
}

/**
 * Fetch with automatic retry and exponential backoff
 */
export async function fetchWithRetry<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const {
    retries = 3,
    backoff = 1000,
    timeout = 30000,
    ...fetchOptions
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new APIError(
          error.message || `HTTP ${response.status}`,
          response.status,
          error
        );
      }

      return await response.json();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on 4xx errors (client errors)
      if (error instanceof APIError && error.status >= 400 && error.status < 500) {
        throw error;
      }

      // Don't retry on abort (timeout)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new APIError('Request timeout', 408, error);
      }

      // Last attempt, throw error
      if (attempt === retries - 1) {
        throw error;
      }

      // Exponential backoff
      const delay = backoff * Math.pow(2, attempt);
      console.log(`Retry attempt ${attempt + 1}/${retries} after ${delay}ms`);
      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Standard API call wrapper
 */
export async function apiCall<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
  const url = `${baseUrl}${endpoint}`;

  return fetchWithRetry<T>(url, options);
}

/**
 * GET request
 */
export async function get<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  return apiCall<T>(endpoint, {
    ...options,
    method: 'GET',
  });
}

/**
 * POST request
 */
export async function post<T>(
  endpoint: string,
  data?: any,
  options: FetchOptions = {}
): Promise<T> {
  return apiCall<T>(endpoint, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PUT request
 */
export async function put<T>(
  endpoint: string,
  data?: any,
  options: FetchOptions = {}
): Promise<T> {
  return apiCall<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * DELETE request
 */
export async function del<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  return apiCall<T>(endpoint, {
    ...options,
    method: 'DELETE',
  });
}

/**
 * PATCH request
 */
export async function patch<T>(
  endpoint: string,
  data?: any,
  options: FetchOptions = {}
): Promise<T> {
  return apiCall<T>(endpoint, {
    ...options,
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * Legacy compatibility export
 * @deprecated Use individual HTTP methods (get, post, put, del) instead
 */
export const apiClient = {
  get,
  post,
  put,
  delete: del,
  patch,
};

export interface RequestOptions extends FetchOptions {}
