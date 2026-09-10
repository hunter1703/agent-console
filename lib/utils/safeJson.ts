/**
 * safeStringify
 *
 * JSON.stringify that can't throw. Used for rendering/comparing tool call parameters and
 * results, which come straight from the backend/tool output with no shape guarantee — a
 * circular reference or a BigInt anywhere in there would otherwise throw out of a render
 * (or, worse, out of a React.memo comparator, which runs outside any render try/catch) and
 * take down the whole chat timeline instead of just the one card.
 */
export function safeStringify(value: unknown, space?: number): string {
  try {
    return JSON.stringify(value, null, space) ?? 'undefined'
  } catch {
    try {
      return String(value)
    } catch {
      return '[unserializable]'
    }
  }
}
