import { render } from '@testing-library/react'
import { vi } from 'vitest'
import { AgentCardSkeleton } from './AgentCardSkeleton'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, animate, transition, ...props }: any) => (
      <div {...props}>
        {children}
      </div>
    ),
  },
}))

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

describe('AgentCardSkeleton', () => {
  it('renders agent card skeleton structure', () => {
    const { container } = render(<AgentCardSkeleton />)
    
    // Should have the main container
    const mainContainer = container.querySelector('.p-3.rounded-xl.bg-surface')
    expect(mainContainer).toBeInTheDocument()
    
    // Should have flex container for avatar and content
    const flexContainer = container.querySelector('.flex.items-center.gap-3')
    expect(flexContainer).toBeInTheDocument()
    
    // Should have content area with proper spacing
    const contentArea = container.querySelector('.flex-1.space-y-2')
    expect(contentArea).toBeInTheDocument()
  })

  it('has proper styling classes', () => {
    const { container } = render(<AgentCardSkeleton />)
    
    const mainContainer = container.firstChild
    expect(mainContainer).toHaveClass('p-3', 'rounded-xl', 'bg-surface', 'border', 'border-border-subtle')
  })
})