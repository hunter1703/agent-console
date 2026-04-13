/**
 * Rate Limiting Utility
 * 
 * Provides client-side rate limiting to prevent API abuse.
 * Uses a sliding window algorithm with in-memory storage.
 * 
 * For production, consider using a server-side solution with Redis.
 */

interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the time window
   */
  maxRequests: number
  
  /**
   * Time window in milliseconds
   */
  windowMs: number
  
  /**
   * Unique identifier for this rate limiter
   */
  id?: string
}

interface RequestRecord {
  timestamp: number
  count: number
}

class RateLimiter {
  private requests: Map<string, RequestRecord[]> = new Map()
  private config: RateLimitConfig
  
  constructor(config: RateLimitConfig) {
    this.config = config
  }
  
  /**
   * Check if a request is allowed
   * 
   * @param key - Unique identifier for the requester (e.g., user ID, IP)
   * @returns Object with allowed status and retry information
   */
  check(key: string): {
    allowed: boolean
    remaining: number
    resetAt: number
  } {
    const now = Date.now()
    const windowStart = now - this.config.windowMs
    
    // Get existing requests for this key
    let keyRequests = this.requests.get(key) || []
    
    // Remove expired requests
    keyRequests = keyRequests.filter(req => req.timestamp > windowStart)
    
    // Count total requests in window
    const totalRequests = keyRequests.reduce((sum, req) => sum + req.count, 0)
    
    // Check if limit exceeded
    const allowed = totalRequests < this.config.maxRequests
    const remaining = Math.max(0, this.config.maxRequests - totalRequests)
    
    // Calculate reset time (end of current window)
    const oldestRequest = keyRequests[0]?.timestamp || now
    const resetAt = oldestRequest + this.config.windowMs
    
    if (allowed) {
      // Add new request
      keyRequests.push({ timestamp: now, count: 1 })
      this.requests.set(key, keyRequests)
    }
    
    return {
      allowed,
      remaining,
      resetAt,
    }
  }
  
  /**
   * Reset rate limit for a specific key
   */
  reset(key: string): void {
    this.requests.delete(key)
  }
  
  /**
   * Clear all rate limit data
   */
  clear(): void {
    this.requests.clear()
  }
  
  /**
   * Clean up expired requests (call periodically)
   */
  cleanup(): void {
    const now = Date.now()
    const windowStart = now - this.config.windowMs
    
    for (const [key, requests] of this.requests.entries()) {
      const validRequests = requests.filter(req => req.timestamp > windowStart)
      
      if (validRequests.length === 0) {
        this.requests.delete(key)
      } else {
        this.requests.set(key, validRequests)
      }
    }
  }
}

// ============================================================================
// Pre-configured Rate Limiters
// ============================================================================

/**
 * API rate limiter - 100 requests per minute
 */
export const apiRateLimiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 60 * 1000, // 1 minute
  id: 'api',
})

/**
 * Search rate limiter - 20 requests per minute
 */
export const searchRateLimiter = new RateLimiter({
  maxRequests: 20,
  windowMs: 60 * 1000, // 1 minute
  id: 'search',
})

/**
 * Auth rate limiter - 5 requests per minute
 */
export const authRateLimiter = new RateLimiter({
  maxRequests: 5,
  windowMs: 60 * 1000, // 1 minute
  id: 'auth',
})

/**
 * Message rate limiter - 30 messages per minute
 */
export const messageRateLimiter = new RateLimiter({
  maxRequests: 30,
  windowMs: 60 * 1000, // 1 minute
  id: 'message',
})

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a custom rate limiter
 */
export function createRateLimiter(config: RateLimitConfig): RateLimiter {
  return new RateLimiter(config)
}

/**
 * Rate limit error class
 */
export class RateLimitError extends Error {
  public readonly resetAt: number
  public readonly remaining: number
  
  constructor(message: string, resetAt: number, remaining: number) {
    super(message)
    this.name = 'RateLimitError'
    this.resetAt = resetAt
    this.remaining = remaining
  }
}

/**
 * Wrap a function with rate limiting
 * 
 * @example
 * ```ts
 * const limitedFetch = withRateLimit(
 *   async (url: string) => fetch(url),
 *   apiRateLimiter,
 *   'user-123'
 * )
 * 
 * try {
 *   await limitedFetch('/api/data')
 * } catch (error) {
 *   if (error instanceof RateLimitError) {
 *     console.log('Rate limited, retry at:', new Date(error.resetAt))
 *   }
 * }
 * ```
 */
export function withRateLimit<T extends (...args: any[]) => any>(
  fn: T,
  limiter: RateLimiter,
  key: string
): T {
  return ((...args: Parameters<T>) => {
    const result = limiter.check(key)
    
    if (!result.allowed) {
      throw new RateLimitError(
        'Rate limit exceeded. Please try again later.',
        result.resetAt,
        result.remaining
      )
    }
    
    return fn(...args)
  }) as T
}

/**
 * React hook for rate limiting
 * 
 * @example
 * ```tsx
 * function SearchComponent() {
 *   const checkRateLimit = useRateLimit(searchRateLimiter, 'user-123')
 *   
 *   const handleSearch = async () => {
 *     try {
 *       checkRateLimit()
 *       await performSearch()
 *     } catch (error) {
 *       if (error instanceof RateLimitError) {
 *         toast.error('Too many searches. Please wait.')
 *       }
 *     }
 *   }
 * }
 * ```
 */
export function useRateLimit(limiter: RateLimiter, key: string) {
  return () => {
    const result = limiter.check(key)
    
    if (!result.allowed) {
      throw new RateLimitError(
        'Rate limit exceeded. Please try again later.',
        result.resetAt,
        result.remaining
      )
    }
    
    return result
  }
}

// ============================================================================
// Cleanup
// ============================================================================

// Run cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    apiRateLimiter.cleanup()
    searchRateLimiter.cleanup()
    authRateLimiter.cleanup()
    messageRateLimiter.cleanup()
  }, 5 * 60 * 1000)
}
