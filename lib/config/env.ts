/**
 * Environment Configuration
 * 
 * Centralized configuration for environment-specific values.
 * Uses Next.js environment variables with fallback defaults.
 */

export const env = {
  /**
   * API base URL for the Agent Engine backend
   * @default 'http://localhost:8080'
   */
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
  
  /**
   * API request timeout in milliseconds
   * @default 30000 (30 seconds)
   */
  apiTimeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000', 10),
  
  /**
   * Enable debug logging
   * @default false
   */
  debug: process.env.NEXT_PUBLIC_DEBUG === 'true',
  
  /**
   * Application environment
   * @default 'development'
   */
  environment: process.env.NODE_ENV || 'development',
} as const

/**
 * Validate environment configuration
 */
export function validateEnv() {
  const errors: string[] = []
  
  if (!env.apiBaseUrl) {
    errors.push('NEXT_PUBLIC_API_BASE_URL is required')
  }
  
  if (env.apiTimeout < 1000) {
    errors.push('NEXT_PUBLIC_API_TIMEOUT must be at least 1000ms')
  }
  
  if (errors.length > 0) {
    throw new Error(`Environment configuration errors:\n${errors.join('\n')}`)
  }
}

// Type exports
export type Environment = typeof env
