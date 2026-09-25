import { describe, it, expect } from 'vitest'
import { cleanMessageContent } from '../cleanMessage'

describe('cleanMessageContent', () => {
  it('unwraps JSON tool response strings with content and unnecessary metadata fields', () => {
    const rawPayload = JSON.stringify({
      content:
        'Cars\r\nA dataset of Cars is provided in a file (cars_input1.txt). The file has the three fields for each car: Name, Origin, Horsepower. \r\nFor example, in the dataset below:\r\n\t\r\nChevrolet Chevelle Malibu,130.0,US\r\nBuick Skylark 320,165.0,US',
      encoding: 'utf-8',
      mime_type: 'text/plain',
      status: 'success',
    })

    const cleaned = cleanMessageContent(rawPayload)

    // Unnecessary metadata is completely stripped
    expect(cleaned).not.toContain('"encoding"')
    expect(cleaned).not.toContain('"mime_type"')
    expect(cleaned).not.toContain('"status"')
    expect(cleaned).not.toContain('{"content"')

    // Line breaks are normalized from \r\n to standard \n
    expect(cleaned).not.toContain('\r\n')
    expect(cleaned).toContain('Cars\nA dataset of Cars is provided in a file (cars_input1.txt).')
    expect(cleaned).toContain('Chevrolet Chevelle Malibu,130.0,US\nBuick Skylark 320,165.0,US')
  })

  it('unwraps alternative fields like text, message, or output', () => {
    expect(
      cleanMessageContent(
        JSON.stringify({ text: 'Hello world\r\nLine 2', status: 'ok' })
      )
    ).toBe('Hello world\nLine 2')

    expect(
      cleanMessageContent(
        JSON.stringify({ message: 'Response from agent', code: 200 })
      )
    ).toBe('Response from agent')
  })

  it('leaves standard markdown and normal text intact while normalizing CRLF', () => {
    const normalText = '## Heading\n\nThis is a normal paragraph with **bold** text.'
    expect(cleanMessageContent(normalText)).toBe(normalText)

    const crlfText = 'Line 1\r\nLine 2\r\nLine 3'
    expect(cleanMessageContent(crlfText)).toBe('Line 1\nLine 2\nLine 3')
  })

  it('handles empty or non-string inputs safely', () => {
    expect(cleanMessageContent('')).toBe('')
    expect(cleanMessageContent(null as any)).toBe(null)
    expect(cleanMessageContent(undefined as any)).toBe(undefined)
  })
})
