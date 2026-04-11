/**
 * Date formatting utilities
 * 
 * Provides consistent date and time formatting across the application.
 * Uses date-fns for robust date handling.
 */

import { formatDistanceToNow, format } from 'date-fns'

/**
 * Format a date as relative time (e.g., "2 hours ago", "just now")
 */
export function formatRelativeTime(date: Date | string | number): string {
  const then = new Date(date)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000)
  
  // Show "just now" for very recent times
  if (diffInSeconds < 10) {
    return 'just now'
  }
  
  // Use date-fns for everything else
  return formatDistanceToNow(then, { addSuffix: true })
}

/**
 * Format a date as time (e.g., "2:30 PM")
 */
export function formatTime(date: Date | string | number): string {
  return format(new Date(date), 'h:mm a')
}

/**
 * Format a date as full date and time (e.g., "Jan 15, 2024 at 2:30 PM")
 */
export function formatDateTime(date: Date | string | number): string {
  return format(new Date(date), 'MMM d, yyyy \'at\' h:mm a')
}

/**
 * Format a date as short date (e.g., "Jan 15, 2024")
 */
export function formatDate(date: Date | string | number): string {
  return format(new Date(date), 'MMM d, yyyy')
}

/**
 * Format duration in milliseconds to human-readable string (e.g., "2m 30s", "1h 1m 5s")
 */
export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000)
  
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
