import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Avatar } from '../Avatar'

describe('Avatar', () => {
  describe('Rendering', () => {
    it('should render with initials when no src provided', () => {
      render(<Avatar name="John Doe" />)
      expect(screen.getByText('JD')).toBeInTheDocument()
    })

    it('should render with image when src provided', () => {
      render(<Avatar name="John Doe" src="https://example.com/avatar.jpg" />)
      const img = screen.getByAltText('John Doe')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg')
    })

    it('should extract initials from single name', () => {
      render(<Avatar name="John" />)
      expect(screen.getByText('J')).toBeInTheDocument()
    })

    it('should extract initials from full name', () => {
      render(<Avatar name="John Michael Doe" />)
      // Should use first and last name
      expect(screen.getByText('JD')).toBeInTheDocument()
    })

    it('should handle names with extra spaces', () => {
      render(<Avatar name="  John   Doe  " />)
      expect(screen.getByText('JD')).toBeInTheDocument()
    })
  })

  describe('Sizes', () => {
    it('should render small size', () => {
      render(<Avatar name="John Doe" size="sm" />)
      const avatar = screen.getByText('JD').parentElement
      expect(avatar).toHaveClass('w-8')
      expect(avatar).toHaveClass('h-8')
    })

    it('should render medium size', () => {
      render(<Avatar name="John Doe" size="md" />)
      const avatar = screen.getByText('JD').parentElement
      expect(avatar).toHaveClass('w-10')
      expect(avatar).toHaveClass('h-10')
    })

    it('should render large size', () => {
      render(<Avatar name="John Doe" size="lg" />)
      const avatar = screen.getByText('JD').parentElement
      expect(avatar).toHaveClass('w-12')
      expect(avatar).toHaveClass('h-12')
    })
  })

  describe('Variants', () => {
    it('should render user variant', () => {
      render(<Avatar name="John Doe" variant="user" />)
      const avatar = screen.getByText('JD').parentElement
      expect(avatar).toHaveClass('bg-gradient-to-br')
      expect(avatar).toHaveClass('from-primary')
    })

    it('should render agent variant', () => {
      render(<Avatar name="Agent Smith" variant="agent" />)
      const avatar = screen.getByText('AS').parentElement
      expect(avatar).toHaveClass('bg-surface')
      expect(avatar).toHaveClass('border')
    })
  })

  describe('Interactive', () => {
    it('should apply cursor-pointer when interactive', () => {
      render(<Avatar name="John Doe" interactive />)
      const avatar = screen.getByText('JD').parentElement
      expect(avatar).toHaveClass('cursor-pointer')
    })

    it('should not apply cursor-pointer when not interactive', () => {
      render(<Avatar name="John Doe" interactive={false} />)
      const avatar = screen.getByText('JD').parentElement
      expect(avatar).not.toHaveClass('cursor-pointer')
    })
  })

  describe('Custom Props', () => {
    it('should accept custom className', () => {
      render(<Avatar name="John Doe" className="custom-class" />)
      const avatar = screen.getByText('JD').parentElement
      expect(avatar).toHaveClass('custom-class')
    })

    it('should accept data attributes', () => {
      render(<Avatar name="John Doe" data-testid="test-avatar" />)
      expect(screen.getByTestId('test-avatar')).toBeInTheDocument()
    })

    it('should accept aria attributes', () => {
      render(<Avatar name="John Doe" aria-label="User avatar" />)
      const avatar = screen.getByText('JD').parentElement
      expect(avatar).toHaveAttribute('aria-label', 'User avatar')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty name', () => {
      render(<Avatar name="" />)
      // Should render without crashing
      expect(document.querySelector('.rounded-full')).toBeInTheDocument()
    })

    it('should handle single character name', () => {
      render(<Avatar name="J" />)
      expect(screen.getByText('J')).toBeInTheDocument()
    })

    it('should handle lowercase names', () => {
      render(<Avatar name="john doe" />)
      expect(screen.getByText('JD')).toBeInTheDocument()
    })

    it('should handle names with special characters', () => {
      render(<Avatar name="John-Paul O'Brien" />)
      // Should extract first and last parts
      const avatar = screen.getByText(/[A-Z]{1,2}/).parentElement
      expect(avatar).toBeInTheDocument()
    })

    it('should handle very long names', () => {
      render(<Avatar name="John Michael Christopher Alexander Doe" />)
      // Should use first and last
      expect(screen.getByText('JD')).toBeInTheDocument()
    })

    it('should render image with correct object-fit', () => {
      render(<Avatar name="John Doe" src="https://example.com/avatar.jpg" />)
      const img = screen.getByAltText('John Doe')
      expect(img).toHaveClass('object-cover')
    })
  })

  describe('Accessibility', () => {
    it('should have alt text for image', () => {
      render(<Avatar name="John Doe" src="https://example.com/avatar.jpg" />)
      const img = screen.getByAltText('John Doe')
      expect(img).toBeInTheDocument()
    })

    it('should be non-selectable', () => {
      render(<Avatar name="John Doe" />)
      const avatar = screen.getByText('JD').parentElement
      expect(avatar).toHaveClass('select-none')
    })
  })
})
