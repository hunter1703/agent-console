import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WebSearchToolCard, isWebSearchTool } from '../WebSearchToolCard'

describe('isWebSearchTool', () => {
  it('identifies brave_web_search and other search tool names', () => {
    expect(isWebSearchTool('brave_web_search')).toBe(true)
    expect(isWebSearchTool('brave_search')).toBe(true)
    expect(isWebSearchTool('web_search')).toBe(true)
    expect(isWebSearchTool('google_search')).toBe(true)
    expect(isWebSearchTool('web_research')).toBe(true)
    expect(isWebSearchTool('tavily')).toBe(true)
  })

  it('identifies tools with grounding result structures even if toolName is generic', () => {
    const groundingResult = {
      result: {
        grounding: {
          generic: [{ snippets: ['some snippet'] }],
        },
      },
    }
    expect(isWebSearchTool('unknown_tool', {}, groundingResult)).toBe(true)
  })

  it('returns false for unrelated tools', () => {
    expect(isWebSearchTool('open_file', { path: '/foo' })).toBe(false)
    expect(isWebSearchTool('spawn_agent')).toBe(false)
  })

  it('returns false for knowledge tools even if their name contains search', () => {
    expect(isWebSearchTool('search_knowledge')).toBe(false)
    expect(isWebSearchTool('knowledge_search')).toBe(false)
    expect(isWebSearchTool('query_knowledge_source')).toBe(false)
    expect(isWebSearchTool('read_knowledge_source')).toBe(false)
  })
})

describe('WebSearchToolCard component', () => {
  const mockProps = {
    toolCallId: 'call-123',
    toolName: 'brave_web_search',
    agentName: 'Social Media Manager Agent',
    parameters: {
      query: 'Baithak Coworks LLP',
    },
    result: {
      result: {
        grounding: {
          generic: [
            {
              snippets: [
                'BAITHAK COWORKS is a less than 1 year old company with registered office in Ahmedabad',
                '# BAITHAK COWORKS LLP\nLLPIN: ACV-7774 As on: 2026-07-13',
                '## Company Information\n**BAITHAK COWORKS LLP** (LLPIN: ACV-7774) is a Limited Liability Partnership.',
              ],
            },
          ],
        },
      },
    },
    status: 'completed' as const,
    timestamp: new Date('2026-09-22T10:00:00Z'),
    duration: 0.006,
  }

  it('renders the search query and agent attribution cleanly', () => {
    render(<WebSearchToolCard {...mockProps} />)

    expect(screen.getByText('Brave Web Search')).toBeInTheDocument()
    expect(screen.getByText('Social Media Manager Agent')).toBeInTheDocument()
    expect(screen.getAllByText(/Baithak Coworks LLP/).length).toBeGreaterThan(0)
    expect(screen.getByText(/web grounding sources/i)).toBeInTheDocument()
  })

  it('extracts titles, badges, and formats snippet text', () => {
    render(<WebSearchToolCard {...mockProps} />)

    // Heading extracted from "# BAITHAK COWORKS LLP"
    expect(screen.getAllByText('BAITHAK COWORKS LLP').length).toBeGreaterThan(0)
    // Heading extracted from "## Company Information"
    expect(screen.getByText('Company Information')).toBeInTheDocument()
    // Badge extracted for LLPIN
    expect(screen.getAllByText('LLPIN: ACV-7774').length).toBeGreaterThan(0)
  })

  it('allows toggling between Visual and JSON tabs', async () => {
    const user = userEvent.setup()
    render(<WebSearchToolCard {...mockProps} />)

    // Click JSON tab
    const jsonTabBtn = screen.getByRole('button', { name: /json/i })
    await user.click(jsonTabBtn)

    expect(screen.getByText('Parameters')).toBeInTheDocument()
    expect(screen.getByText('Result Payload')).toBeInTheDocument()

    // Click Visual tab
    const visualTabBtn = screen.getByRole('button', { name: /visual/i })
    await user.click(visualTabBtn)

    expect(screen.getByText(/web grounding sources/i)).toBeInTheDocument()
  })

  it('renders technical documentation queries with web.results and external links cleanly', () => {
    const techSearchProps = {
      toolCallId: 'call-tech-456',
      toolName: 'web_search',
      agentName: 'Frontend Engineer Agent',
      parameters: {
        search_query: 'Next.js 16 Turbopack features',
      },
      result: {
        web: {
          results: [
            {
              title: 'Next.js 16 Release Notes and Upgrades',
              url: 'https://nextjs.org/blog/next-16',
              description: 'Next.js 16 introduces official stable Turbopack with 95% faster HMR.',
              age: '2 days ago',
            },
            {
              title: 'Turbopack Architecture Deep Dive',
              url: 'https://turbo.build/pack/docs',
              description: 'Turbopack is an incremental bundler optimized for JavaScript and TypeScript.',
              age: '1 week ago',
            },
          ],
        },
      },
      status: 'completed' as const,
      timestamp: new Date(),
    }

    render(<WebSearchToolCard {...techSearchProps} />)

    expect(screen.getAllByText(/Next.js 16 Turbopack features/).length).toBeGreaterThan(0)
    expect(screen.getByText('Next.js 16 Release Notes and Upgrades')).toBeInTheDocument()
    expect(screen.getByText('Turbopack Architecture Deep Dive')).toBeInTheDocument()
    expect(screen.getByText('• nextjs.org')).toBeInTheDocument()
    expect(screen.getByText('• turbo.build')).toBeInTheDocument()
    expect(screen.getByText('2 days ago')).toBeInTheDocument()
  })

  it('renders science and news queries with direct array results cleanly', () => {
    const newsSearchProps = {
      toolCallId: 'call-news-789',
      toolName: 'google_search',
      parameters: {
        q: 'James Webb telescope discovers oldest galaxy',
      },
      result: [
        {
          title: 'NASA Webb Reaches Deeper into Early Universe',
          url: 'https://nasa.gov/news/webb-deep-field',
          snippet: 'Astronomers confirmed the galaxy formed just 300 million years after the Big Bang.\nUpdated: 2026-05-12',
          source: 'NASA',
        },
      ],
      status: 'completed' as const,
      timestamp: new Date(),
    }

    render(<WebSearchToolCard {...newsSearchProps} />)

    expect(screen.getAllByText(/James Webb telescope discovers oldest galaxy/).length).toBeGreaterThan(0)
    expect(screen.getByText('NASA Webb Reaches Deeper into Early Universe')).toBeInTheDocument()
    expect(screen.getByText('• nasa.gov')).toBeInTheDocument()
    expect(screen.getByText(/Astronomers confirmed the galaxy/)).toBeInTheDocument()
  })
})
