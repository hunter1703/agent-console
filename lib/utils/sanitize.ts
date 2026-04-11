import DOMPurify from 'dompurify'

/**
 * Sanitizes HTML content to prevent XSS attacks
 * Allows safe HTML tags while blocking scripts and dangerous attributes
 */
export function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined') {
    // Server-side: return as-is (will be sanitized on client)
    return html
  }

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      // Text formatting
      'p', 'br', 'span', 'div',
      'strong', 'b', 'em', 'i', 'u', 's', 'del', 'ins',
      'mark', 'small', 'sub', 'sup',
      
      // Headings
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      
      // Lists
      'ul', 'ol', 'li',
      
      // Links
      'a',
      
      // Code
      'code', 'pre',
      
      // Quotes
      'blockquote', 'q', 'cite',
      
      // Tables
      'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
      
      // Media (with restrictions)
      'img',
      
      // Other
      'hr',
    ],
    ALLOWED_ATTR: [
      'href', 'title', 'alt', 'src',
      'class', 'id',
      'target', 'rel',
      'width', 'height',
      'align', 'colspan', 'rowspan',
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    FORBID_TAGS: [
      'script', 'style', 'iframe', 'embed', 'object',
      'form', 'input', 'button', 'textarea', 'select',
    ],
    FORBID_ATTR: [
      'onerror', 'onload', 'onclick', 'onmouseover',
      'onfocus', 'onblur', 'onchange', 'onsubmit',
    ],
  })
}

/**
 * Sanitizes text content by escaping HTML entities
 * Use this for plain text that should not contain any HTML
 */
export function sanitizeText(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (char) => map[char])
}

/**
 * Strips all HTML tags from a string
 * Returns plain text only
 */
export function stripHtml(html: string): string {
  if (typeof window === 'undefined') {
    // Server-side: simple regex strip
    return html.replace(/<[^>]*>/g, '')
  }

  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  })
  
  return clean
}
