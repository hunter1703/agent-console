import { describe, it, expect } from 'vitest'
import { truncate, truncateLines, truncateMiddle } from '../truncate'

describe('truncate utilities', () => {
  describe('truncate', () => {
    it('should not truncate short text', () => {
      expect(truncate('Hello', 10)).toBe('Hello')
    })

    it('should truncate long text', () => {
      expect(truncate('Hello World', 8)).toBe('Hello...')
    })

    it('should use custom suffix', () => {
      expect(truncate('Hello World', 8, '…')).toBe('Hello W…')
    })

    it('should handle exact length', () => {
      expect(truncate('Hello', 5)).toBe('Hello')
    })

    it('should handle empty string', () => {
      expect(truncate('', 10)).toBe('')
    })

    it('should handle very short maxLength', () => {
      expect(truncate('Hello', 3)).toBe('...')
    })
  })

  describe('truncateLines', () => {
    it('should not truncate single line', () => {
      expect(truncateLines('Hello', 2)).toBe('Hello')
    })

    it('should truncate multiple lines', () => {
      const text = 'Line 1\nLine 2\nLine 3\nLine 4'
      expect(truncateLines(text, 2)).toBe('Line 1\nLine 2...')
    })

    it('should handle exact line count', () => {
      const text = 'Line 1\nLine 2'
      expect(truncateLines(text, 2)).toBe('Line 1\nLine 2')
    })

    it('should use custom suffix', () => {
      const text = 'Line 1\nLine 2\nLine 3'
      expect(truncateLines(text, 2, ' [more]')).toBe('Line 1\nLine 2 [more]')
    })

    it('should handle empty string', () => {
      expect(truncateLines('', 2)).toBe('')
    })
  })

  describe('truncateMiddle', () => {
    it('should not truncate short text', () => {
      expect(truncateMiddle('Hello', 10)).toBe('Hello')
    })

    it('should truncate middle of long text', () => {
      expect(truncateMiddle('HelloWorld', 8)).toBe('Hel...ld')
    })

    it('should use custom separator', () => {
      expect(truncateMiddle('HelloWorld', 8, '…')).toBe('Hell…rld')
    })

    it('should handle file names', () => {
      expect(truncateMiddle('very-long-file-name.txt', 15)).toBe('very-l...me.txt')
    })

    it('should handle IDs', () => {
      expect(truncateMiddle('abc123def456ghi789', 12)).toBe('abc12...i789')
    })

    it('should handle exact length', () => {
      expect(truncateMiddle('Hello', 5)).toBe('Hello')
    })

    it('should handle empty string', () => {
      expect(truncateMiddle('', 10)).toBe('')
    })
  })
})
