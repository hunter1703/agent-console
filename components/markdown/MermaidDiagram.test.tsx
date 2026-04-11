import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MermaidDiagram } from './MermaidDiagram'

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'light' }),
}))

// Mock mermaid
vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn(async () => ({
      svg: '<svg><text>Mocked Diagram</text></svg>',
    })),
  },
}))

describe('MermaidDiagram', () => {
  it('shows loading state initially', () => {
    render(<MermaidDiagram chart="graph TD; A-->B;" />)
    
    expect(screen.getByText('Loading diagram...')).toBeInTheDocument()
  })

  it('renders diagram after loading', async () => {
    const { container } = render(<MermaidDiagram chart="graph TD; A-->B;" />)
    
    // Initially shows loading
    expect(screen.getByText('Loading diagram...')).toBeInTheDocument()
    
    // Component should render without errors
    const wrapper = container.querySelector('.bg-surface')
    expect(wrapper).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <MermaidDiagram chart="graph TD; A-->B;" className="custom-class" />
    )
    
    const wrapper = container.querySelector('.bg-surface')
    expect(wrapper).toHaveClass('custom-class')
  })

  it('has proper styling for container', () => {
    const { container } = render(<MermaidDiagram chart="graph TD; A-->B;" />)
    
    const wrapper = container.querySelector('.bg-surface')
    expect(wrapper).toHaveClass('p-6', 'rounded-xl', 'border')
  })
})
