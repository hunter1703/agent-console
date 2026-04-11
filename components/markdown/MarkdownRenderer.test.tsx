import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MarkdownRenderer } from './MarkdownRenderer'

describe('MarkdownRenderer', () => {
  it('renders plain text', () => {
    render(<MarkdownRenderer content="Hello world" />)
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('renders headings with correct hierarchy', () => {
    const content = `
# Heading 1
## Heading 2
### Heading 3
    `
    render(<MarkdownRenderer content={content} />)
    
    const h1 = screen.getByRole('heading', { level: 1 })
    const h2 = screen.getByRole('heading', { level: 2 })
    const h3 = screen.getByRole('heading', { level: 3 })
    
    expect(h1).toHaveTextContent('Heading 1')
    expect(h2).toHaveTextContent('Heading 2')
    expect(h3).toHaveTextContent('Heading 3')
  })

  it('renders paragraphs', () => {
    const content = 'This is a paragraph.\n\nThis is another paragraph.'
    render(<MarkdownRenderer content={content} />)
    
    const paragraphs = screen.getAllByText(/This is/)
    expect(paragraphs).toHaveLength(2)
  })

  it('renders unordered lists', () => {
    const content = `
- Item 1
- Item 2
- Item 3
    `
    render(<MarkdownRenderer content={content} />)
    
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
    expect(screen.getByText('Item 3')).toBeInTheDocument()
  })

  it('renders ordered lists', () => {
    const content = `
1. First
2. Second
3. Third
    `
    render(<MarkdownRenderer content={content} />)
    
    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
    expect(screen.getByText('Third')).toBeInTheDocument()
  })

  it('renders horizontal rules', () => {
    const content = 'Before\n\n---\n\nAfter'
    const { container } = render(<MarkdownRenderer content={content} />)
    
    const hr = container.querySelector('hr')
    expect(hr).toBeInTheDocument()
  })

  it('supports GitHub Flavored Markdown tables', () => {
    const content = `
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
    `
    render(<MarkdownRenderer content={content} />)
    
    expect(screen.getByText('Header 1')).toBeInTheDocument()
    expect(screen.getByText('Cell 1')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <MarkdownRenderer content="Test" className="custom-class" />
    )
    
    const wrapper = container.querySelector('.markdown-content')
    expect(wrapper).toHaveClass('custom-class')
  })
})
