import { describe, it, expect, beforeEach } from 'vitest'
import { sanitizeHtml, sanitizeText, stripHtml } from './sanitize'

describe('sanitizeHtml', () => {
  beforeEach(() => {
    // Ensure we're in a browser-like environment
    if (typeof window === 'undefined') {
      global.window = {} as any
    }
  })

  it('allows safe HTML tags', () => {
    const html = '<p>Hello <strong>world</strong></p>'
    const result = sanitizeHtml(html)
    expect(result).toContain('<p>')
    expect(result).toContain('<strong>')
  })

  it('removes script tags', () => {
    const html = '<p>Safe</p><script>alert("XSS")</script>'
    const result = sanitizeHtml(html)
    expect(result).not.toContain('<script>')
    expect(result).not.toContain('alert')
  })

  it('removes event handlers', () => {
    const html = '<div onclick="alert(\'XSS\')">Click me</div>'
    const result = sanitizeHtml(html)
    expect(result).not.toContain('onclick')
  })

  it('removes iframe tags', () => {
    const html = '<p>Safe</p><iframe src="evil.com"></iframe>'
    const result = sanitizeHtml(html)
    expect(result).not.toContain('<iframe>')
  })

  it('allows safe links', () => {
    const html = '<a href="https://example.com">Link</a>'
    const result = sanitizeHtml(html)
    expect(result).toContain('<a')
    expect(result).toContain('href')
  })

  it('allows images with safe attributes', () => {
    const html = '<img src="image.jpg" alt="Description" />'
    const result = sanitizeHtml(html)
    expect(result).toContain('<img')
    expect(result).toContain('src')
    expect(result).toContain('alt')
  })

  it('removes javascript: URLs', () => {
    const html = '<a href="javascript:alert(\'XSS\')">Click</a>'
    const result = sanitizeHtml(html)
    expect(result).not.toContain('javascript:')
  })

  it('allows code blocks', () => {
    const html = '<pre><code>const x = 1;</code></pre>'
    const result = sanitizeHtml(html)
    expect(result).toContain('<pre>')
    expect(result).toContain('<code>')
  })

  it('allows tables', () => {
    const html = '<table><tr><td>Cell</td></tr></table>'
    const result = sanitizeHtml(html)
    expect(result).toContain('<table>')
    expect(result).toContain('<tr>')
    expect(result).toContain('<td>')
  })
})

describe('sanitizeText', () => {
  it('escapes HTML entities', () => {
    const text = '<script>alert("XSS")</script>'
    const result = sanitizeText(text)
    expect(result).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;')
  })

  it('escapes ampersands', () => {
    const text = 'Tom & Jerry'
    const result = sanitizeText(text)
    expect(result).toBe('Tom &amp; Jerry')
  })

  it('escapes quotes', () => {
    const text = 'He said "Hello"'
    const result = sanitizeText(text)
    expect(result).toContain('&quot;')
  })

  it('handles plain text without changes', () => {
    const text = 'Plain text without special characters'
    const result = sanitizeText(text)
    expect(result).toBe(text)
  })
})

describe('stripHtml', () => {
  beforeEach(() => {
    // Ensure we're in a browser-like environment
    if (typeof window === 'undefined') {
      global.window = {} as any
    }
  })

  it('removes all HTML tags', () => {
    const html = '<p>Hello <strong>world</strong></p>'
    const result = stripHtml(html)
    expect(result).not.toContain('<')
    expect(result).not.toContain('>')
  })

  it('preserves text content', () => {
    const html = '<p>Hello <strong>world</strong></p>'
    const result = stripHtml(html)
    expect(result).toContain('Hello')
    expect(result).toContain('world')
  })

  it('handles nested tags', () => {
    const html = '<div><p><span>Nested</span></p></div>'
    const result = stripHtml(html)
    expect(result).toBe('Nested')
  })

  it('handles empty tags', () => {
    const html = '<p></p><div></div>Text'
    const result = stripHtml(html)
    expect(result).toBe('Text')
  })
})
