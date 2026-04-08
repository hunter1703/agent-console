import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  formatRelativeTime,
  formatTime,
  formatDateTime,
  formatDate,
  formatDuration,
} from '../formatDate'

describe('formatDate utilities', () => {
  beforeEach(() => {
    // Mock current time to 2024-01-15 12:00:00
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'))
  })

  describe('formatRelativeTime', () => {
    it('should format "just now" for recent times', () => {
      const now = new Date()
      expect(formatRelativeTime(now)).toBe('just now')
    })

    it('should format seconds ago', () => {
      const date = new Date(Date.now() - 30 * 1000)
      expect(formatRelativeTime(date)).toBe('30s ago')
    })

    it('should format minutes ago', () => {
      const date = new Date(Date.now() - 5 * 60 * 1000)
      expect(formatRelativeTime(date)).toBe('5m ago')
    })

    it('should format hours ago', () => {
      const date = new Date(Date.now() - 3 * 60 * 60 * 1000)
      expect(formatRelativeTime(date)).toBe('3h ago')
    })

    it('should format days ago', () => {
      const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      expect(formatRelativeTime(date)).toBe('2d ago')
    })

    it('should format weeks ago', () => {
      const date = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      expect(formatRelativeTime(date)).toBe('2w ago')
    })

    it('should format months ago', () => {
      const date = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
      expect(formatRelativeTime(date)).toBe('2mo ago')
    })

    it('should format years ago', () => {
      const date = new Date(Date.now() - 400 * 24 * 60 * 60 * 1000)
      expect(formatRelativeTime(date)).toBe('1y ago')
    })

    it('should handle string dates', () => {
      const dateStr = new Date(Date.now() - 60 * 1000).toISOString()
      expect(formatRelativeTime(dateStr)).toBe('1m ago')
    })
  })

  describe('formatTime', () => {
    it('should format time in 12-hour format', () => {
      const date = new Date('2024-01-15T14:30:00')
      expect(formatTime(date)).toMatch(/2:30 PM/)
    })

    it('should handle midnight', () => {
      const date = new Date('2024-01-15T00:00:00')
      expect(formatTime(date)).toMatch(/12:00 AM/)
    })

    it('should handle noon', () => {
      const date = new Date('2024-01-15T12:00:00')
      expect(formatTime(date)).toMatch(/12:00 PM/)
    })
  })

  describe('formatDateTime', () => {
    it('should format full date and time', () => {
      const date = new Date('2024-01-15T14:30:00')
      const result = formatDateTime(date)
      expect(result).toContain('Jan')
      expect(result).toContain('15')
      expect(result).toContain('2024')
    })
  })

  describe('formatDate', () => {
    it('should format date without time', () => {
      const date = new Date('2024-01-15T14:30:00')
      const result = formatDate(date)
      expect(result).toContain('Jan')
      expect(result).toContain('15')
      expect(result).toContain('2024')
    })
  })

  describe('formatDuration', () => {
    it('should format seconds', () => {
      expect(formatDuration(45)).toBe('45s')
    })

    it('should format minutes and seconds', () => {
      expect(formatDuration(125)).toBe('2m 5s')
    })

    it('should format hours, minutes, and seconds', () => {
      expect(formatDuration(3665)).toBe('1h 1m 5s')
    })

    it('should handle zero', () => {
      expect(formatDuration(0)).toBe('0s')
    })

    it('should handle large durations', () => {
      expect(formatDuration(7325)).toBe('2h 2m 5s')
    })
  })
})
