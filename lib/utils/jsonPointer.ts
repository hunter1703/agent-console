/**
 * JSON Pointer utility functions
 * 
 * Implements RFC 6901 JSON Pointer specification
 * See: https://tools.ietf.org/html/rfc6901
 * 
 * JSON Pointers are strings that identify a specific value within a JSON document.
 * Examples:
 * - "" (empty string) → whole document
 * - "/foo" → obj.foo
 * - "/foo/0" → obj.foo[0]
 * - "/foo/bar" → obj.foo.bar
 * - "/contextStrategy/type" → obj.contextStrategy.type
 */

/**
 * Parse a JSON Pointer into an array of tokens
 * 
 * @param pointer - JSON Pointer string (e.g., "/foo/bar")
 * @returns Array of tokens (e.g., ["foo", "bar"])
 * 
 * @example
 * parsePointer("/foo/bar")
 * // Returns: ["foo", "bar"]
 * 
 * @example
 * parsePointer("/contextStrategy/type")
 * // Returns: ["contextStrategy", "type"]
 */
export function parsePointer(pointer: string): string[] {
  if (pointer === '') {
    return []
  }
  
  if (!pointer.startsWith('/')) {
    throw new Error(`Invalid JSON Pointer: must start with "/" (got: "${pointer}")`)
  }
  
  return pointer
    .slice(1) // Remove leading "/"
    .split('/')
    .map(token => 
      token
        .replace(/~1/g, '/') // Unescape "/"
        .replace(/~0/g, '~') // Unescape "~"
    )
}

/**
 * Get a value from an object using a JSON Pointer
 * 
 * @param obj - Object to get value from
 * @param pointer - JSON Pointer string
 * @returns Value at pointer, or undefined if not found
 * 
 * @example
 * getValueByPointer({ foo: { bar: 42 } }, "/foo/bar")
 * // Returns: 42
 * 
 * @example
 * getValueByPointer({ items: [1, 2, 3] }, "/items/1")
 * // Returns: 2
 */
export function getValueByPointer(obj: any, pointer: string): any {
  if (pointer === '') {
    return obj
  }
  
  const tokens = parsePointer(pointer)
  let current = obj
  
  for (const token of tokens) {
    if (current === null || current === undefined) {
      return undefined
    }
    
    current = current[token]
  }
  
  return current
}

/**
 * Set a value in an object using a JSON Pointer
 * 
 * Creates intermediate objects/arrays as needed.
 * Mutates the original object.
 * 
 * @param obj - Object to set value in
 * @param pointer - JSON Pointer string
 * @param value - Value to set
 * 
 * @example
 * const obj = {}
 * setValueByPointer(obj, "/foo/bar", 42)
 * // obj is now: { foo: { bar: 42 } }
 * 
 * @example
 * const obj = {}
 * setValueByPointer(obj, "/items/0", "first")
 * // obj is now: { items: ["first"] }
 */
export function setValueByPointer(obj: any, pointer: string, value: any): void {
  if (pointer === '') {
    throw new Error('Cannot set root value with empty pointer')
  }
  
  const tokens = parsePointer(pointer)
  let current = obj
  
  // Navigate to parent of target
  for (let i = 0; i < tokens.length - 1; i++) {
    const token = tokens[i]
    const nextToken = tokens[i + 1]
    
    // Create intermediate object/array if needed
    if (!(token in current) || current[token] === null || current[token] === undefined) {
      // Next token is numeric → create array, otherwise create object
      current[token] = /^\d+$/.test(nextToken) ? [] : {}
    }
    
    current = current[token]
  }
  
  // Set value at target
  const lastToken = tokens[tokens.length - 1]
  current[lastToken] = value
}

/**
 * Delete a value from an object using a JSON Pointer
 * 
 * @param obj - Object to delete value from
 * @param pointer - JSON Pointer string
 * @returns true if value was deleted, false if not found
 * 
 * @example
 * const obj = { foo: { bar: 42 } }
 * deleteValueByPointer(obj, "/foo/bar")
 * // obj is now: { foo: {} }
 * // Returns: true
 */
export function deleteValueByPointer(obj: any, pointer: string): boolean {
  if (pointer === '') {
    throw new Error('Cannot delete root value with empty pointer')
  }
  
  const tokens = parsePointer(pointer)
  let current = obj
  
  // Navigate to parent of target
  for (let i = 0; i < tokens.length - 1; i++) {
    const token = tokens[i]
    
    if (!(token in current)) {
      return false
    }
    
    current = current[token]
  }
  
  // Delete value at target
  const lastToken = tokens[tokens.length - 1]
  
  if (!(lastToken in current)) {
    return false
  }
  
  if (Array.isArray(current)) {
    current.splice(Number(lastToken), 1)
  } else {
    delete current[lastToken]
  }
  
  return true
}

/**
 * Check if a pointer exists in an object
 * 
 * @param obj - Object to check
 * @param pointer - JSON Pointer string
 * @returns true if pointer exists, false otherwise
 * 
 * @example
 * hasPointer({ foo: { bar: 42 } }, "/foo/bar")
 * // Returns: true
 * 
 * @example
 * hasPointer({ foo: {} }, "/foo/bar")
 * // Returns: false
 */
export function hasPointer(obj: any, pointer: string): boolean {
  if (pointer === '') {
    return true
  }
  
  const tokens = parsePointer(pointer)
  let current = obj
  
  for (const token of tokens) {
    if (current === null || current === undefined || !(token in current)) {
      return false
    }
    
    current = current[token]
  }
  
  return true
}

/**
 * Escape a token for use in a JSON Pointer
 * 
 * @param token - Token to escape
 * @returns Escaped token
 * 
 * @example
 * escapeToken("foo/bar")
 * // Returns: "foo~1bar"
 * 
 * @example
 * escapeToken("foo~bar")
 * // Returns: "foo~0bar"
 */
export function escapeToken(token: string): string {
  return token
    .replace(/~/g, '~0') // Escape "~"
    .replace(/\//g, '~1') // Escape "/"
}

/**
 * Build a JSON Pointer from tokens
 * 
 * @param tokens - Array of tokens
 * @returns JSON Pointer string
 * 
 * @example
 * buildPointer(["foo", "bar"])
 * // Returns: "/foo/bar"
 * 
 * @example
 * buildPointer(["foo/bar", "baz"])
 * // Returns: "/foo~1bar/baz"
 */
export function buildPointer(tokens: string[]): string {
  if (tokens.length === 0) {
    return ''
  }
  
  return '/' + tokens.map(escapeToken).join('/')
}
