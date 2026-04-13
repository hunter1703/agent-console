/**
 * Input Sanitization Utilities
 * 
 * Provides functions to sanitize user input and prevent XSS attacks.
 * Uses DOMPurify for production-grade HTML sanitization.
 * 
 * IMPORTANT: Always sanitize user-generated content before rendering.
 */

import DOMPurify from 'dompurify'

/**
 * Sanitize HTML content to prevent XSS attacks
 * 
 * Uses DOMPurify for comprehensive sanitization.
 * 
 * @param dirty - Untrusted HTML string
 * @param options - Sanitization options
 * @returns Sanitized HTML string safe for rendering
 */
export function sanitizeHtml(
  dirty: string,
  options: {
    allowedTags?: string[]
    allowedAttributes?: Record<string, string[]>
    allowLinks?: boolean
  } = {}
): string {
  const {
    allowedTags = ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'code', 'pre'],
    allowedAttributes = { a: ['href', 'title', 'target'] },
    allowLinks = true,
  } = options

  // Configure DOMPurify
  const config: DOMPurify.Config = {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: Object.keys(allowedAttributes).reduce((acc, tag) => {
      return [...acc, ...allowedAttributes[tag]]
    }, [] as string[]),
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
  }

  // Disable links if requested
  if (!allowLinks) {
    config.ALLOWED_TAGS = allowedTags.filter(tag => tag !== 'a')
  }

  return DOMPurify.sanitize(dirty, config)
}

/**
 * Sanitize HTML for markdown content
 * Allows common markdown HTML elements
 */
export function sanitizeMarkdownHtml(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr',
      'strong', 'em', 'b', 'i', 'u', 's', 'del',
      'a', 'img',
      'ul', 'ol', 'li',
      'blockquote',
      'code', 'pre',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ],
    allowedAttributes: {
      a: ['href', 'title', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height'],
      code: ['class'],
      pre: ['class'],
    },
    allowLinks: true,
  })
}

/**
 * Sanitize plain text input
 * Removes any HTML tags and special characters
 * 
 * @param input - User input string
 * @returns Plain text without HTML
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .trim()
}

/**
 * Sanitize URL to prevent javascript: and data: URIs
 * 
 * @param url - URL string to sanitize
 * @returns Safe URL or empty string if invalid
 */
export function sanitizeUrl(url: string): string {
  const trimmed = url.trim().toLowerCase()
  
  // Block dangerous protocols
  if (
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('vbscript:')
  ) {
    return ''
  }
  
  return url.trim()
}

/**
 * Escape HTML special characters
 * Useful for displaying user input as text
 * 
 * @param text - Text to escape
 * @returns Escaped text safe for HTML
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  }
  
  return text.replace(/[&<>"'/]/g, (char) => map[char])
}

/**
 * Validate and sanitize email address
 * 
 * @param email - Email address to validate
 * @returns Sanitized email or empty string if invalid
 */
export function sanitizeEmail(email: string): string {
  const trimmed = email.trim().toLowerCase()
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!emailRegex.test(trimmed)) {
    return ''
  }
  
  return trimmed
}

/**
 * Sanitize filename to prevent path traversal
 * 
 * @param filename - Filename to sanitize
 * @returns Safe filename
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars
    .replace(/\.{2,}/g, '.') // Remove multiple dots
    .replace(/^\.+/, '') // Remove leading dots
    .substring(0, 255) // Limit length
}

/**
 * Truncate text to maximum length
 * 
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @param suffix - Suffix to add (default: '...')
 * @returns Truncated text
 */
export function truncateText(
  text: string,
  maxLength: number,
  suffix: string = '...'
): string {
  if (text.length <= maxLength) {
    return text
  }
  
  return text.substring(0, maxLength - suffix.length) + suffix
}

/**
 * Remove null bytes from string
 * Prevents null byte injection attacks
 * 
 * @param input - Input string
 * @returns String without null bytes
 */
export function removeNullBytes(input: string): string {
  return input.replace(/\0/g, '')
}

/**
 * Comprehensive input sanitization
 * Combines multiple sanitization methods
 * 
 * @param input - User input
 * @param options - Sanitization options
 * @returns Sanitized input
 */
export function sanitizeInput(
  input: string,
  options: {
    allowHtml?: boolean
    allowLinks?: boolean
    maxLength?: number
    removeNullBytes?: boolean
  } = {}
): string {
  const {
    allowHtml = false,
    allowLinks = false,
    maxLength,
    removeNullBytes: shouldRemoveNullBytes = true,
  } = options
  
  let sanitized = input
  
  // Remove null bytes
  if (shouldRemoveNullBytes) {
    sanitized = removeNullBytes(sanitized)
  }
  
  // Sanitize HTML or remove it
  if (allowHtml) {
    sanitized = sanitizeHtml(sanitized, { allowLinks })
  } else {
    sanitized = sanitizeText(sanitized)
  }
  
  // Truncate if needed
  if (maxLength && sanitized.length > maxLength) {
    sanitized = truncateText(sanitized, maxLength)
  }
  
  return sanitized
}
