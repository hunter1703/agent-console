import { render } from '@testing-library/react'
import { vi } from 'vitest'
import { MessageSkeleton } from './MessageSkeleton'

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

describe('MessageSkeleton', () => {
  it('renders message skeleton structure', () => {
    const { container } = render(<MessageSkeleton />)
    
    // Should have the main flex container
    const mainContainer = container.querySelector('.flex.gap-3.mb-6')
    expect(mainContainer).toBeInTheDocument()
    
    // Should have content area with proper max width
    const contentArea = container.querySelector('.flex-1')
    expect(contentArea).toBeInTheDocument()
  })

  it('renders user message layout when isUser is true', () => {
    const { container } = render(<MessageSkeleton isUser={true} />)
    
    const mainContainer = container.querySelector('.flex-row-reverse')
    expect(mainContainer).toBeInTheDocument()
  })

  it('renders assistant message layout when isUser is false', () => {
    const { container } = render(<MessageSkeleton isUser={false} />)
    
    const mainContainer = container.querySelector('.justify-start')
    expect(mainContainer).toBeInTheDocument()
    
    // Should not have flex-row-reverse
    const reverseContainer = container.querySelector('.flex-row-reverse')
    expect(reverseContainer).not.toBeInTheDocument()
  })

  it('renders multiple skeleton lines with varying widths', () => {
    const { container } = render(<MessageSkeleton />)
    
    // Should have 4 skeleton lines (based on widths array)
    const skeletonLines = container.querySelectorAll('.bg-surface')
    expect(skeletonLines).toHaveLength(5) // 1 avatar + 4 text lines
  })
})