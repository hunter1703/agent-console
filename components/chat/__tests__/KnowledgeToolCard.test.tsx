import '@testing-library/jest-dom/vitest'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { KnowledgeToolCard, isKnowledgeTool } from '../KnowledgeToolCard'

describe('isKnowledgeTool', () => {
  it('identifies read_knowledge_source and other knowledge tool names', () => {
    expect(isKnowledgeTool('read_knowledge_source')).toBe(true)
    expect(isKnowledgeTool('query_knowledge_source')).toBe(true)
    expect(isKnowledgeTool('search_knowledge')).toBe(true)
    expect(isKnowledgeTool('read_doc')).toBe(true)
    expect(isKnowledgeTool('fetch_doc')).toBe(true)
  })

  it('identifies tools with knowledge source in parameters', () => {
    expect(
      isKnowledgeTool('unknown_tool', {
        source: 'agentengine-1/6079c0333fc24a3186400358123ecf5d',
      })
    ).toBe(true)

    expect(
      isKnowledgeTool('unknown_tool', {
        source: 'dataset/cars.csv',
      })
    ).toBe(true)
  })

  it('identifies tools with knowledge metadata in result', () => {
    expect(
      isKnowledgeTool(
        'custom_reader',
        {},
        {
          mime_type: 'text/plain',
          encoding: 'utf-8',
          content: 'Some document content',
        }
      )
    ).toBe(true)
  })

  it('returns false for unrelated tools', () => {
    expect(isKnowledgeTool('spawn_agent', { agent_id: 'foo' })).toBe(false)
    expect(isKnowledgeTool('web_search', { query: 'test' })).toBe(false)
    expect(isKnowledgeTool('send_message', { message: 'hello' })).toBe(false)
  })
})

describe('KnowledgeToolCard component', () => {
  const mockScreenshotProps = {
    toolCallId: 'call-knowledge-001',
    toolName: 'read_knowledge_source',
    agentName: 'Story Agent',
    parameters: {
      source: 'agentengine-1/6079c0333fc24a3186400358123ecf5d',
    },
    result: {
      content:
        'Cars\r\nA dataset of Cars is provided in a file (cars_input1.txt). The models included are Sedan, SUV, Coupe, Hatchback, and Convertible.',
      encoding: 'utf-8',
      mime_type: 'text/plain',
      status: 'success',
    },
    status: 'completed' as const,
    timestamp: new Date('2026-09-25T12:00:00Z'),
    duration: 0.003,
  }

  it('renders knowledge tool header with displayName, agentName and duration', () => {
    render(<KnowledgeToolCard {...mockScreenshotProps} />)

    expect(screen.getByText('Read Knowledge Source')).toBeInTheDocument()
    expect(screen.getByText('Story Agent')).toBeInTheDocument()
    expect(screen.getByText('0.003s')).toBeInTheDocument()
  })

  it('extracts filename, source ID, and metadata badges cleanly', () => {
    render(<KnowledgeToolCard {...mockScreenshotProps} />)

    // Extracted filename from content (cars_input1.txt)
    expect(screen.getByText('cars_input1.txt')).toBeInTheDocument()
    // Source ID
    expect(
      screen.getByText('agentengine-1/6079c0333fc24a3186400358123ecf5d')
    ).toBeInTheDocument()
    // MIME type badge
    expect(screen.getByText('text/plain')).toBeInTheDocument()
    // Encoding badge
    expect(screen.getByText('utf-8')).toBeInTheDocument()
    // Status badge
    expect(screen.getByText('success')).toBeInTheDocument()
  })

  it('renders cleaned document content without raw CRLF characters', () => {
    render(<KnowledgeToolCard {...mockScreenshotProps} />)

    expect(screen.getByText('Document Content')).toBeInTheDocument()
    expect(
      screen.getByText(/A dataset of Cars is provided in a file/)
    ).toBeInTheDocument()
  })

  it('allows toggling between Visual and Raw JSON mode', async () => {
    const user = userEvent.setup()
    render(<KnowledgeToolCard {...mockScreenshotProps} />)

    // Switch to Raw JSON
    const jsonBtn = screen.getByTitle('Raw JSON Payload')
    await user.click(jsonBtn)

    expect(screen.getByText('Parameters')).toBeInTheDocument()
    expect(screen.getByText('Result')).toBeInTheDocument()

    // Switch back to Visual
    const visualBtn = screen.getByTitle('Visual Document Reader')
    await user.click(visualBtn)

    expect(screen.getByText('Document Content')).toBeInTheDocument()
  })
})
