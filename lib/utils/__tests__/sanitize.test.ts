/**
 * Tests for sanitization utilities
 */

import { describe, it, expect } from 'vitest'
import {
  sanitizeHtml,
  sanitizeMarkdownHtml,
  sanitizeText,
  sanitizeUrl,
  escapeHtml,
  sanitizeEmail,
  sanitizeFilename,
  truncateText,
  removeNullBytes,
  sanitizeInput,
} from '../sanitize'

describe('sanitizeHtml', () => {
  it('should remove script tags', () => {
    const dirty = '<p>Hello</p><script>alert("xss")</script>'
    const clean = sanitizeHtml(dirty)
    expect(clean).not.toContain('<script>')
    expect(clean).not.toContain('alert')
  })

  it('should allow safe tags', () => {
    const dirty = '<p>Hello <strong>world</strong></p>'
    const clean = sanitizeHtml(dirty)
    expect(clean).toContain('<p>')
    expect(clean).toContain('<strong>')
  })

  it('should remove event handlers', () => {
    const dirty = '<p onclick="alert(1)">Click me</p>'
    const clean = sanitizeHtml(dirty)
    expect(clean).not.toContain('onclick')
  })

  it('should allow links when enabled', () => {
    const dirty = '<a href="https://example.com">Link</a>'
    const clean = sanitizeHtml(dirty, { allowLinks: true })
    expect(clean).toContain('<a')
    expect(clean).toContain('href')
  })

  it('should remove links when disabled', () => {
    const dirty = '<a href="https://example.com">Link</a>'
    const clean = sanitizeHtml(dirty, { allowLinks: false })
    expect(clean).not.toContain('<a')
  })
})

describe('sanitizeMarkdownHtml', () => {
  it('should allow markdown HTML elements', () => {
    const dirty = '<h1>Title</h1><p>Text</p><code>code</code>'
    const clean = sanitizeMarkdownHtml(dirty)
    expect(clean).toContain('<h1>')
    expect(clean).toContain('<p>')
    expect(clean).toContain('<code>')
  })

  it('should remove dangerous elements', () => {
    const dirty = '<h1>Title</h1><script>alert(1)</script>'
    const clean = sanitizeMarkdownHtml(dirty)
    expect(clean).toContain('<h1>')
    expect(clean).not.toContain('<script>')
  })
})

describe('sanitizeText', () => {
  it('should remove all HTML tags', () => {
    const input = '<p>Hello <strong>world</strong></p>'
    const clean = sanitizeText(input)
    expect(clean).toBe('Hello world')
  })

  it('should trim whitespace', () => {
    const input = '  Hello world  '
    const clean = sanitizeText(input)
    expect(clean).toBe('Hello world')
  })
})

describe('sanitizeUrl', () => {
  it('should allow https URLs', () => {
    const url = 'https://example.com'
    const clean = sanitizeUrl(url)
    expect(clean).toBe(url)
  })

  it('should allow http URLs', () => {
    const url = 'http://example.com'
    const clean = sanitizeUrl(url)
    expect(clean).toBe(url)
  })

  it('should block javascript: URLs', () => {
    const url = 'javascript:alert(1)'
    const clean = sanitizeUrl(url)
    expect(clean).toBe('')
  })

  it('should block data: URLs', () => {
    const url = 'data:text/html,<script>alert(1)</script>'
    const clean = sanitizeUrl(url)
    expect(clean).toBe('')
  })

  it('should block vbscript: URLs', () => {
    const url = 'vbscript:msgbox(1)'
    const clean = sanitizeUrl(url)
    expect(clean).toBe('')
  })
})

describe('escapeHtml', () => {
  it('should escape special characters', () => {
    const text = '<script>alert("xss")</script>'
    const escaped = escapeHtml(text)
    expect(escaped).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;')
  })

  it('should escape ampersands', () => {
    const text = 'Tom & Jerry'
    const escaped = escapeHtml(text)
    expect(escaped).toBe('Tom &amp; Jerry')
  })
})

describe('sanitizeEmail', () => {
  it('should accept valid emails', () => {
    const email = 'user@example.com'
    const clean = sanitizeEmail(email)
    expect(clean).toBe(email)
  })

  it('should lowercase emails', () => {
    const email = 'User@Example.COM'
    const clean = sanitizeEmail(email)
    expect(clean).toBe('user@example.com')
  })

  it('should reject invalid emails', () => {
    const email = 'not-an-email'
    const clean = sanitizeEmail(email)
    expect(clean).toBe('')
  })

  it('should trim whitespace', () => {
    const email = '  user@example.com  '
    const clean = sanitizeEmail(email)
    expect(clean).toBe('user@example.com')
  })
})

describe('sanitizeFilename', () => {
  it('should allow safe characters', () => {
    const filename = 'my-file_123.txt'
    const clean = sanitizeFilename(filename)
    expect(clean).toBe(filename)
  })

  it('should replace special characters', () => {
    const filename = 'my file!@#$.txt'
    const clean = sanitizeFilename(filename)
    expect(clean).toBe('my_file____.txt')
  })

  it('should prevent path traversal', () => {
    const filename = '../../../etc/passwd'
    const clean = sanitizeFilename(filename)
    expect(clean).not.toContain('..')
    expect(clean).not.toContain('/')
  })

  it('should limit length to 255 characters', () => {
    const filename = 'a'.repeat(300) + '.txt'
    const clean = sanitizeFilename(filename)
    expect(clean.length).toBeLessThanOrEqual(255)
  })
})

describe('truncateText', () => {
  it('should not truncate short text', () => {
    const text = 'Hello'
    const truncated = truncateText(text, 10)
    expect(truncated).toBe(text)
  })

  it('should truncate long text', () => {
    const text = 'Hello world this is a long text'
    const truncated = truncateText(text, 15)
    expect(truncated).toBe('Hello world ...')
    expect(truncated.length).toBe(15)
  })

  it('should use custom suffix', () => {
    const text = 'Hello world'
    const truncated = truncateText(text, 8, '…')
    expect(truncated).toBe('Hello w…')
  })
})

describe('removeNullBytes', () => {
  it('should remove null bytes', () => {
    const input = 'Hello\0World'
    const clean = removeNullBytes(input)
    expect(clean).toBe('HelloWorld')
  })

  it('should handle multiple null bytes', () => {
    const input = '\0Hello\0\0World\0'
    const clean = removeNullBytes(input)
    expect(clean).toBe('HelloWorld')
  })
})

describe('sanitizeInput', () => {
  it('should sanitize text by default', () => {
    const input = '<p>Hello</p>'
    const clean = sanitizeInput(input)
    expect(clean).toBe('Hello')
  })

  it('should allow HTML when enabled', () => {
    const input = '<p>Hello</p>'
    const clean = sanitizeInput(input, { allowHtml: true })
    expect(clean).toContain('<p>')
  })

  it('should truncate to max length', () => {
    const input = 'Hello world this is a long text'
    const clean = sanitizeInput(input, { maxLength: 15 })
    expect(clean.length).toBeLessThanOrEqual(15)
  })

  it('should remove null bytes', () => {
    const input = 'Hello\0World'
    const clean = sanitizeInput(input)
    expect(clean).not.toContain('\0')
  })

  it('should combine all sanitization options', () => {
    const input = '<p>Hello\0World</p>'
    const clean = sanitizeInput(input, {
      allowHtml: true,
      maxLength: 20,
      removeNullBytes: true,
    })
    expect(clean).toContain('<p>')
    expect(clean).not.toContain('\0')
    expect(clean.length).toBeLessThanOrEqual(20)
  })
})
