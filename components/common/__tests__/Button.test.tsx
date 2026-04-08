import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../Button'

describe('Button', () => {
  describe('Rendering', () => {
    it('should render with children', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
    })

    it('should render with icon on left', () => {
      render(
        <Button icon={<span data-testid="icon">🔥</span>} iconPosition="left">
          With Icon
        </Button>
      )
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(screen.getByTestId('icon')).toBeInTheDocument()
    })

    it('should render with icon on right', () => {
      render(
        <Button icon={<span data-testid="icon">→</span>} iconPosition="right">
          Next
        </Button>
      )
      expect(screen.getByTestId('icon')).toBeInTheDocument()
    })

    it('should show loading spinner when loading', () => {
      render(<Button loading>Loading</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      // Loader2 icon should be present
      expect(button.querySelector('svg')).toBeInTheDocument()
    })
  })

  describe('Variants', () => {
    it('should render primary variant', () => {
      render(<Button variant="primary">Primary</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-primary')
    })

    it('should render secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-transparent')
      expect(button).toHaveClass('border-2')
    })

    it('should render ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-transparent')
    })

    it('should render danger variant', () => {
      render(<Button variant="danger">Delete</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-error')
    })
  })

  describe('Sizes', () => {
    it('should render small size', () => {
      render(<Button size="sm">Small</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-9')
    })

    it('should render medium size', () => {
      render(<Button size="md">Medium</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-11')
    })

    it('should render large size', () => {
      render(<Button size="lg">Large</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-13')
    })
  })

  describe('States', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveClass('opacity-40')
    })

    it('should be disabled when loading', () => {
      render(<Button loading>Loading</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should not be disabled by default', () => {
      render(<Button>Enabled</Button>)
      const button = screen.getByRole('button')
      expect(button).not.toBeDisabled()
    })
  })

  describe('Interactions', () => {
    it('should call onClick when clicked', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()
      
      render(<Button onClick={handleClick}>Click me</Button>)
      const button = screen.getByRole('button')
      
      await user.click(button)
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should not call onClick when disabled', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()
      
      render(<Button onClick={handleClick} disabled>Disabled</Button>)
      const button = screen.getByRole('button')
      
      await user.click(button)
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('should not call onClick when loading', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()
      
      render(<Button onClick={handleClick} loading>Loading</Button>)
      const button = screen.getByRole('button')
      
      await user.click(button)
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('should handle mouse move for magnetic effect', async () => {
      const handleMouseMove = vi.fn()
      const user = userEvent.setup()
      
      render(
        <Button magnetic onMouseMove={handleMouseMove}>
          Magnetic
        </Button>
      )
      const button = screen.getByRole('button')
      
      await user.hover(button)
      // Mouse move should be called
      expect(handleMouseMove).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have button role', () => {
      render(<Button>Button</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should support custom aria-label', () => {
      render(<Button aria-label="Custom label">Icon</Button>)
      expect(screen.getByRole('button', { name: 'Custom label' })).toBeInTheDocument()
    })

    it('should be keyboard accessible', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()
      
      render(<Button onClick={handleClick}>Press me</Button>)
      const button = screen.getByRole('button')
      
      button.focus()
      expect(button).toHaveFocus()
      
      await user.keyboard('{Enter}')
      expect(handleClick).toHaveBeenCalled()
    })
  })

  describe('Custom Props', () => {
    it('should accept custom className', () => {
      render(<Button className="custom-class">Custom</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
    })

    it('should forward ref', () => {
      const ref = vi.fn()
      render(<Button ref={ref}>With Ref</Button>)
      expect(ref).toHaveBeenCalled()
    })

    it('should accept type attribute', () => {
      render(<Button type="submit">Submit</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'submit')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty children gracefully', () => {
      render(<Button>{''}</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should handle magnetic prop without onMouseMove', () => {
      render(<Button magnetic>Magnetic</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should not show icon when loading', () => {
      render(
        <Button loading icon={<span data-testid="icon">🔥</span>}>
          Loading
        </Button>
      )
      expect(screen.queryByTestId('icon')).not.toBeInTheDocument()
    })
  })
})
