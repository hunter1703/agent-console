/**
 * Markdown Utilities
 * 
 * Markdown processing and optimization.
 * Based on Open WebUI's markdown handling patterns.
 */

/**
 * Sanitize response content
 * Remove incomplete tokens and special markers
 */
export function sanitizeResponseContent(content: string): string {
  return content
    .replace(/<\|[a-z]*$/, '') // Remove incomplete special tokens at end
    .replace(/<\|[a-z]+\|$/, '') // Remove incomplete special tokens
    .replace(/<$/, '') // Remove incomplete angle bracket
    .replaceAll('<', '&lt;') // Escape remaining angle brackets
    .replaceAll('>', '&gt;')
    .replaceAll(/<\|[a-z]+\|>/g, ' ') // Replace complete special tokens with space
    .trim();
}

/**
 * Process response content
 * Apply various transformations for better rendering
 */
export function processResponseContent(content: string): string {
  content = sanitizeResponseContent(content);
  return content.trim();
}

/**
 * Replace tokens in content (e.g., {{user}}, {{char}})
 * Only replaces outside of code blocks
 */
export function replaceTokens(
  content: string,
  replacements: Record<string, string>
): string {
  return replaceOutsideCode(content, (segment) => {
    let result = segment;
    for (const [token, replacement] of Object.entries(replacements)) {
      const regex = new RegExp(token, 'gi');
      result = result.replace(regex, replacement);
    }
    return result;
  });
}

/**
 * Replace content outside of code blocks
 * Preserves code blocks as-is
 */
export function replaceOutsideCode(
  content: string,
  replacer: (str: string) => string
): string {
  return content
    .split(/(```[\s\S]*?```|`[\s\S]*?`)/)
    .map((segment) => {
      // Keep code blocks as-is
      if (segment.startsWith('```') || segment.startsWith('`')) {
        return segment;
      }
      return replacer(segment);
    })
    .join('');
}

/**
 * Extract code blocks from markdown
 */
export interface CodeBlock {
  language: string;
  code: string;
  startLine: number;
  endLine: number;
}

export function extractCodeBlocks(content: string): CodeBlock[] {
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  const blocks: CodeBlock[] = [];
  let match;
  let lineNumber = 1;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const language = match[1] || 'text';
    const code = match[2];
    const startLine = content.substring(0, match.index).split('\n').length;
    const endLine = startLine + code.split('\n').length;

    blocks.push({
      language,
      code,
      startLine,
      endLine,
    });
  }

  return blocks;
}

/**
 * Check if content contains code blocks
 */
export function hasCodeBlocks(content: string): boolean {
  return /```[\s\S]*?```/.test(content);
}

/**
 * Get plain text from markdown
 * Removes markdown formatting
 */
export function getPlainText(content: string): string {
  return content
    .replace(/^#+\s+/gm, '') // Remove headers
    .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.+?)\*/g, '$1') // Remove italic
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links
    .replace(/`(.+?)`/g, '$1') // Remove inline code
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/\n\n+/g, '\n') // Remove multiple newlines
    .trim();
}

/**
 * Truncate text to a maximum length
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Count words in content
 */
export function countWords(content: string): number {
  const plainText = getPlainText(content);
  return plainText.split(/\s+/).filter((word) => word.length > 0).length;
}

/**
 * Estimate reading time in minutes
 */
export function estimateReadingTime(content: string, wordsPerMinute: number = 200): number {
  const words = countWords(content);
  return Math.ceil(words / wordsPerMinute);
}

/**
 * Highlight search terms in content
 */
export function highlightSearchTerms(
  content: string,
  searchTerms: string[],
  className: string = 'highlight'
): string {
  if (searchTerms.length === 0) {
    return content;
  }

  const pattern = searchTerms
    .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');

  const regex = new RegExp(`(${pattern})`, 'gi');
  return content.replace(regex, `<mark class="${className}">$1</mark>`);
}
