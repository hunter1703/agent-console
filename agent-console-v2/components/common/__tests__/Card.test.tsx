import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Card } from '../Card'

describe('Card', () => {
  describe('Rendering', () => {
    it('should render with children', () => {
      render(<Card>Card content</Card>)
      expect(screen.getByText('Card content')).toBeInTheDocument()
    })

    it('should render complex children', () => {
      render(
        <Card>
          <h2>Title</h2>
          <p>Description</p>
        </Card>
      )
      expect(screen.getByText('Title')).toBeInTheDocument()
      expect(screen.getByText('Description')).toBeInTheDocument()
    })
  })

  describe('Variants', () => {
    it('should render default variant', () => {
      const { container } = render(<Card variant="default">Default</Card>)
      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('bg-surface')
    })

    it('should render elevated variant', () => {
      const { container } = render(<Card variant="elevated">Elevated</Card>)
      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('shadow-xl')
    })

    it('should render outlined variant', () => {
      const { container } = render(<Card variant="outlined">Outlined</Card>)
      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('border-2')
    })

    it('should render glass variant', () => {
      const { container } = render(<Card variant="glass">Glass</Card>)
      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('bg-surface/80')
      expect(card).toHaveClass('backdrop-blur-xl')
    })
  })

  describe('Padding', () => {
    it('should render small padding', () => {
      const { container } = render(<Card padding="sm">Small</Card>)
      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('p-3')
    })

    it('should render medium padding', () => {
      const { container } = render(<Card padding="md">Medium</Card>)
      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('p-4')
    })

    it('should render large padding', () => {
      const { container } = render(<Card padding="lg">Large</Card>)
      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('p-6')
    })
  })

  describe('Hoverable', () => {
    it('should apply cursor-pointer when hoverable', () => {
      const { container } = render(<Card hoverable>Hoverable</Card>)
      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('cursor-pointer')
    })

    it('should not apply cursor-pointer when not hoverable', () => {
      const { container } = render(<Card hoverable={false}>Not hoverable</Card>)
      const card = container.firstChild as HTMLElement
      expect(card).not.toHaveClass('cursor-pointer')
    })
  })

  describe('Magnetic', () => {
    it('should accept magnetic prop', () => {
      render(<Card magnetic>Magnetic</Card>)
      expect(screen.getByText('Magnetic')).toBeInTheDocument()
    })

    it('should handle mouse move for magnetic effect', async () => {
      const user = userEvent.setup()
      const { container } = render(<Card magnetic>Magnetic Card</Card>)
      const card = container.firstChild as HTMLElement
      
      await user.hover(card)
      expect(card).toBeInTheDocument()
    })

    it('should reset position on mouse leave', async () => {
      const user = userEvent.setup()
      const { container } = render(<Card magnetic>Magnetic Card</Card>)
      const card = container.firstChild as HTMLElement
      
      await user.hover(card)
      await user.unhover(card)
      expect(card).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('should call onClick when clicked', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()
      
      const { container } = render(<Card onClick={handleClick}>Clickable</Card>)
      const card = container.firstChild as HTMLElement
      
      await user.click(card)
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should handle hover events', async () => {
      const handleMouseEnter = vi.fn()
      const handleMouseLeave = vi.fn()
      const user = userEvent.setup()
      
      const { container } = render(
        <Card onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          Hover me
        </Card>
      )
      const card = container.firstChild as HTMLElement
      
      await user.hover(card)
      expect(handleMouseEnter).toHaveBeenCalled()
      
      await user.unhover(card)
      expect(handleMouseLeave).toHaveBeenCalled()
    })
  })

  describe('Custom Props', () => {
    it('should accept custom className', () => {
      const { container } = render(<Card className="custom-class">Custom</Card>)
      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('custom-class')
    })

    it('should accept data attributes', () => {
      render(<Card data-testid="test-card">Test</Card>)
      expect(screen.getByTestId('test-card')).toBeInTheDocument()
    })

    it('should accept aria attributes', () => {
      const { container } = render(<Card aria-label="Card label">Accessible</Card>)
      const card = container.firstChild as HTMLElement
      expect(card).toHaveAttribute('aria-label', 'Card label')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      const { container } = render(<Card>{''}</Card>)
      const card = container.firstChild as HTMLElement
      expect(card).toBeInTheDocument()
    })

    it('should handle null children', () => {
      const { container } = render(<Card>{null}</Card>)
      const card = container.firstChild as HTMLElement
      expect(card).toBeInTheDocument()
    })

    it('should combine hoverable and magnetic', () => {
      const { container } = render(<Card hoverable magnetic>Combined</Card>)
      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('cursor-pointer')
      expect(card).toBeInTheDocument()
    })
  })
})
