// Centralized configuration for API endpoints
export const API_CONFIG = {
  // Base URL for API calls - can be overridden by environment variable
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
} as const;