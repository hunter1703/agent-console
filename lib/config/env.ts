/**
 * Environment Configuration
 * 
 * Centralized access to environment variables with type safety and defaults.
 * All environment variables should be accessed through this module.
 */

// ============================================================================
// API Configuration
// ============================================================================

export const API_CONFIG = {
  url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000', 10),
} as const

// ============================================================================
// Feature Flags
// ============================================================================

export const FEATURES = {
  experimental: process.env.NEXT_PUBLIC_ENABLE_EXPERIMENTAL === 'true',
  analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  errorTracking: process.env.NEXT_PUBLIC_ENABLE_ERROR_TRACKING === 'true',
  serviceWorker: process.env.NEXT_PUBLIC_ENABLE_SERVICE_WORKER === 'true',
  codeSplitting: process.env.NEXT_PUBLIC_ENABLE_CODE_SPLITTING !== 'false',
  customCursor: process.env.NEXT_PUBLIC_ENABLE_CUSTOM_CURSOR !== 'false',
  sounds: process.env.NEXT_PUBLIC_ENABLE_SOUNDS === 'true',
} as const

// ============================================================================
// Authentication
// ============================================================================

export const AUTH_CONFIG = {
  provider: process.env.NEXT_PUBLIC_AUTH_PROVIDER || 'custom',
  domain: process.env.NEXT_PUBLIC_AUTH_DOMAIN || '',
  clientId: process.env.NEXT_PUBLIC_AUTH_CLIENT_ID || '',
} as const

// ============================================================================
// Monitoring
// ============================================================================

export const MONITORING = {
  sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
  gaId: process.env.NEXT_PUBLIC_GA_ID || '',
  posthogKey: process.env.NEXT_PUBLIC_POSTHOG_KEY || '',
} as const

// ============================================================================
// Development
// ============================================================================

export const DEV_CONFIG = {
  debug: process.env.NEXT_PUBLIC_DEBUG === 'true',
  verboseLogging: process.env.NEXT_PUBLIC_VERBOSE_LOGGING === 'true',
  mockApi: process.env.NEXT_PUBLIC_MOCK_API === 'true',
} as const

// ============================================================================
// Security
// ============================================================================

export const SECURITY = {
  rateLimitRequests: parseInt(
    process.env.NEXT_PUBLIC_RATE_LIMIT_REQUESTS || '100',
    10
  ),
  rateLimitWindow: parseInt(
    process.env.NEXT_PUBLIC_RATE_LIMIT_WINDOW || '60000',
    10
  ),
} as const

// ============================================================================
// UI Configuration
// ============================================================================

export const UI_CONFIG = {
  defaultTheme: (process.env.NEXT_PUBLIC_DEFAULT_THEME || 'light') as
    | 'light'
    | 'dark',
  maxToasts: parseInt(process.env.NEXT_PUBLIC_MAX_TOASTS || '3', 10),
  bundleSizeLimit: parseInt(
    process.env.NEXT_PUBLIC_BUNDLE_SIZE_LIMIT || '200',
    10
  ),
} as const

// ============================================================================
// Environment Detection
// ============================================================================

export const IS_PRODUCTION = process.env.NODE_ENV === 'production'
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development'
export const IS_TEST = process.env.NODE_ENV === 'test'

// ============================================================================
// Validation
// ============================================================================

/**
 * Validate required environment variables
 * Call this at app startup to ensure all required vars are set
 */
export function validateEnv(): void {
  const required: string[] = [
    // Add required env vars here
    // 'NEXT_PUBLIC_API_URL',
  ]

  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    )
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof FEATURES): boolean {
  return FEATURES[feature]
}

/**
 * Get API endpoint URL
 */
export function getApiUrl(path: string): string {
  const baseUrl = API_CONFIG.url.replace(/\/$/, '') // Remove trailing slash
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${cleanPath}`
}

/**
 * Check if running in browser
 */
export const IS_BROWSER = typeof window !== 'undefined'

/**
 * Check if running on server
 */
export const IS_SERVER = !IS_BROWSER
