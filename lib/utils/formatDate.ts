/**
 * Date formatting utilities
 * 
 * Provides consistent date and time formatting across the application.
 */

/**
 * Format a date as relative time (e.g., "2 hours ago", "just now")
 */
export function formatRelativeTime(date: Date | string | number): string {
  const now = new Date()
  const then = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000)
  
  if (diffInSeconds < 10) {
    return 'just now'
  }
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours}h ago`
  }
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays}d ago`
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w ago`
  }
  
  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths}mo ago`
  }
  
  const diffInYears = Math.floor(diffInDays / 365)
  return `${diffInYears}y ago`
}

/**
 * Format a date as time (e.g., "2:30 PM")
 */
export function formatTime(date: Date | string | number): string {
  const d = new Date(date)
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Format a date as full date and time (e.g., "Jan 15, 2024 at 2:30 PM")
 */
export function formatDateTime(date: Date | string | number): string {
  const d = new Date(date)
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Format a date as short date (e.g., "Jan 15, 2024")
 */
export function formatDate(date: Date | string | number): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Format duration in seconds to human-readable string (e.g., "2m 30s", "1h 1m 5s")
 */
export function formatDuration(seconds: number): string {
  if (seconds === 0) return '0s'
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  const parts: string[] = []
  
  if (hours > 0) {
    parts.push(`${hours}h`)
  }
  
  if (minutes > 0) {
    parts.push(`${minutes}m`)
  }
  
  if (secs > 0 || parts.length === 0) {
    parts.push(`${secs}s`)
  }
  
  return parts.join(' ')
}
