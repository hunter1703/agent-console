/**
 * Text truncation utilities
 */

/**
 * Truncate text to a maximum length with ellipsis
 */
export function truncate(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) {
    return text
  }
  
  // Calculate how many characters we can show before the suffix
  const availableLength = maxLength - suffix.length
  if (availableLength <= 0) {
    return suffix.slice(0, maxLength)
  }
  
  return text.slice(0, availableLength) + suffix
}

/**
 * Truncate text to a maximum number of lines
 */
export function truncateLines(text: string, maxLines: number, suffix: string = '...'): string {
  const lines = text.split('\n')
  if (lines.length <= maxLines) {
    return text
  }
  return lines.slice(0, maxLines).join('\n') + suffix
}

/**
 * Truncate text in the middle (useful for file names, IDs)
 */
export function truncateMiddle(text: string, maxLength: number, separator: string = '...'): string {
  if (text.length <= maxLength) {
    return text
  }
  
  const charsToShow = maxLength - separator.length
  if (charsToShow <= 0) {
    return separator
  }
  
  const frontChars = Math.ceil(charsToShow / 2)
  const backChars = Math.floor(charsToShow / 2)
  
  return text.slice(0, frontChars) + separator + text.slice(-backChars)
}
