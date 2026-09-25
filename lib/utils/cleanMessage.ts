/**
 * cleanMessage utility
 * 
 * Cleans and unwraps message content from backend agents.
 * If an agent outputs a raw tool JSON string (e.g. {"content": "...", "encoding": "utf-8", "mime_type": "text/plain", "status": "success"}),
 * this extracts the true human-readable text, strips unnecessary metadata,
 * and formats line breaks properly.
 */

function normalizeTextFormatting(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t+$/gm, '') // remove trailing tabs on lines
    .replace(/^\t+$/gm, '') // remove standalone tab-only lines
    .trim()
}

export function cleanMessageContent(raw: string): string {
  if (!raw || typeof raw !== 'string') return raw

  const trimmed = raw.trim()

  // 1. Check if string is a valid JSON object
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed)
      if (typeof parsed === 'object' && parsed !== null) {
        // Extract the actual textual content if wrapped in standard fields
        const candidate =
          parsed.content ??
          parsed.text ??
          parsed.message ??
          parsed.output ??
          parsed.response ??
          parsed.data

        if (typeof candidate === 'string') {
          return normalizeTextFormatting(candidate)
        }
      }
    } catch {
      // Not valid strict JSON, continue to fallback regex
    }
  }

  // 2. Check if string starts with {"content":"... in case of escaped or partial JSON
  const contentMatch = trimmed.match(/^\{"content"\s*:\s*"([\s\S]*)"\s*,\s*"encoding"/)
  if (contentMatch && contentMatch[1]) {
    try {
      return normalizeTextFormatting(JSON.parse(`"${contentMatch[1]}"`))
    } catch {
      return normalizeTextFormatting(
        contentMatch[1]
          .replace(/\\r\\n/g, '\n')
          .replace(/\\n/g, '\n')
          .replace(/\\t/g, '\t')
          .replace(/\\"/g, '"')
      )
    }
  }

  // 3. Normal text: normalize line endings and tabs
  if (raw.includes('\r') || raw.includes('\t\n')) {
    return normalizeTextFormatting(raw)
  }

  return raw
}
