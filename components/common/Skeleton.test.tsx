import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { Skeleton, SkeletonCard, SkeletonList, SkeletonText } from './Skeleton'

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

describe('Skeleton', () => {
  it('renders with default props', () => {
    const { container } = render(<Skeleton />)
    const skeleton = container.querySelector('.bg-surface')
    expect(skeleton).toBeInTheDocument()
    expect(skeleton).toHaveClass('overflow-hidden')
  })

  it('applies custom width and height', () => {
    const { container } = render(<Skeleton width="100px" height="50px" />)
    const skeleton = container.querySelector('.bg-surface')
    expect(skeleton).toHaveStyle({
      width: '100px',
      height: '50px',
    })
  })

  it('applies custom border radius', () => {
    const { container } = render(<Skeleton borderRadius="12px" />)
    const skeleton = container.querySelector('.bg-surface')
    expect(skeleton).toBeInTheDocument()
    // Border radius is applied via inline style
    expect(skeleton?.getAttribute('style')).toContain('border-radius: 12px')
  })

  it('applies custom className', () => {
    const { container } = render(<Skeleton className="custom-class" />)
    const skeleton = container.querySelector('.custom-class')
    expect(skeleton).toBeInTheDocument()
    expect(skeleton).toHaveClass('bg-surface')
  })
})

describe('SkeletonCard', () => {
  it('renders card skeleton structure', () => {
    const { container } = render(<SkeletonCard />)
    
    // Should have the main container
    const mainContainer = container.querySelector('.p-4.space-y-3')
    expect(mainContainer).toBeInTheDocument()
    
    // Should have flex container for avatar and content
    const flexContainer = container.querySelector('.flex.items-center.gap-3')
    expect(flexContainer).toBeInTheDocument()
  })
})

describe('SkeletonList', () => {
  it('renders default number of skeleton cards', () => {
    const { container } = render(<SkeletonList />)
    // Should render 3 skeleton cards by default (each has p-4 class)
    const skeletonCards = container.querySelectorAll('.p-4')
    expect(skeletonCards).toHaveLength(3)
  })

  it('renders custom number of skeleton cards', () => {
    const { container } = render(<SkeletonList count={5} />)
    const skeletonCards = container.querySelectorAll('.p-4')
    expect(skeletonCards).toHaveLength(5)
  })
})

describe('SkeletonText', () => {
  it('renders default number of text lines', () => {
    const { container } = render(<SkeletonText />)
    // Should render 3 lines by default (each has bg-surface class)
    const textLines = container.querySelectorAll('.bg-surface')
    expect(textLines).toHaveLength(3)
  })

  it('renders custom number of text lines', () => {
    const { container } = render(<SkeletonText lines={5} />)
    const textLines = container.querySelectorAll('.bg-surface')
    expect(textLines).toHaveLength(5)
  })
})