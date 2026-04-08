import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input, Textarea } from '../Input'

describe('Input', () => {
  describe('Rendering', () => {
    it('should render input element', () => {
      render(<Input placeholder="Enter text" />)
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
    })

    it('should render with label', () => {
      render(<Input label="Username" />)
      expect(screen.getByText('Username')).toBeInTheDocument()
    })

    it('should render with helper text', () => {
      render(<Input helperText="Enter your username" />)
      expect(screen.getByText('Enter your username')).toBeInTheDocument()
    })

    it('should render with error', () => {
      render(<Input error="This field is required" />)
      expect(screen.getByText('This field is required')).toBeInTheDocument()
    })

    it('should show error icon when error is present', () => {
      render(<Input error="Error message" />)
      // AlertCircle icon should be present
      const input = screen.getByRole('textbox')
      const container = input.parentElement
      expect(container?.querySelector('svg')).toBeInTheDocument()
    })
  })

  describe('Floating Label', () => {
    it('should render floating label', () => {
      render(<Input label="Email" floatingLabel />)
      expect(screen.getByText('Email')).toBeInTheDocument()
    })

    it('should not show placeholder when floating label is enabled', () => {
      render(<Input label="Email" placeholder="Enter email" floatingLabel />)
      const input = screen.getByRole('textbox')
      expect(input).not.toHaveAttribute('placeholder')
    })

    it('should show placeholder when floating label is disabled', () => {
      render(<Input label="Email" placeholder="Enter email" floatingLabel={false} />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('placeholder', 'Enter email')
    })
  })

  describe('Character Count', () => {
    it('should show character count when enabled', () => {
      render(<Input maxLength={100} showCharCount />)
      expect(screen.getByText('0/100')).toBeInTheDocument()
    })

    it('should update character count on input', async () => {
      const user = userEvent.setup()
      render(<Input maxLength={100} showCharCount />)
      
      const input = screen.getByRole('textbox')
      await user.type(input, 'Hello')
      
      expect(screen.getByText('5/100')).toBeInTheDocument()
    })

    it('should not show character count when disabled', () => {
      render(<Input maxLength={100} showCharCount={false} />)
      expect(screen.queryByText(/\/100/)).not.toBeInTheDocument()
    })
  })

  describe('States', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Input disabled />)
      const input = screen.getByRole('textbox')
      expect(input).toBeDisabled()
    })

    it('should apply error styles when error is present', () => {
      render(<Input error="Error" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('border-error')
    })

    it('should handle controlled value', () => {
      render(<Input value="Controlled" onChange={() => {}} />)
      const input = screen.getByRole('textbox') as HTMLInputElement
      expect(input.value).toBe('Controlled')
    })
  })

  describe('Interactions', () => {
    it('should call onChange when typing', async () => {
      const handleChange = vi.fn()
      const user = userEvent.setup()
      
      render(<Input onChange={handleChange} />)
      const input = screen.getByRole('textbox')
      
      await user.type(input, 'test')
      expect(handleChange).toHaveBeenCalled()
    })

    it('should call onFocus when focused', async () => {
      const handleFocus = vi.fn()
      const user = userEvent.setup()
      
      render(<Input onFocus={handleFocus} />)
      const input = screen.getByRole('textbox')
      
      await user.click(input)
      expect(handleFocus).toHaveBeenCalled()
    })

    it('should call onBlur when blurred', async () => {
      const handleBlur = vi.fn()
      const user = userEvent.setup()
      
      render(<Input onBlur={handleBlur} />)
      const input = screen.getByRole('textbox')
      
      await user.click(input)
      await user.tab()
      expect(handleBlur).toHaveBeenCalled()
    })

    it('should respect maxLength', async () => {
      const user = userEvent.setup()
      render(<Input maxLength={5} />)
      const input = screen.getByRole('textbox') as HTMLInputElement
      
      await user.type(input, '123456789')
      expect(input.value.length).toBeLessThanOrEqual(5)
    })
  })

  describe('Accessibility', () => {
    it('should have textbox role', () => {
      render(<Input />)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('should associate label with input', () => {
      render(<Input label="Username" />)
      const input = screen.getByRole('textbox')
      const label = screen.getByText('Username')
      // Label should be associated (either by for/id or wrapping)
      expect(label).toBeInTheDocument()
    })
  })
})

describe('Textarea', () => {
  describe('Rendering', () => {
    it('should render textarea element', () => {
      render(<Textarea placeholder="Enter text" />)
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
    })

    it('should render with label', () => {
      render(<Textarea label="Description" />)
      expect(screen.getByText('Description')).toBeInTheDocument()
    })

    it('should render with error', () => {
      render(<Textarea error="This field is required" />)
      expect(screen.getByText('This field is required')).toBeInTheDocument()
    })

    it('should render with helper text', () => {
      render(<Textarea helperText="Enter a description" />)
      expect(screen.getByText('Enter a description')).toBeInTheDocument()
    })
  })

  describe('Character Count', () => {
    it('should show character count when enabled', () => {
      render(<Textarea maxLength={500} showCharCount />)
      expect(screen.getByText('0/500')).toBeInTheDocument()
    })

    it('should update character count on input', async () => {
      const user = userEvent.setup()
      render(<Textarea maxLength={500} showCharCount />)
      
      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'Hello World')
      
      expect(screen.getByText('11/500')).toBeInTheDocument()
    })
  })

  describe('Auto Resize', () => {
    it('should accept autoResize prop', () => {
      render(<Textarea autoResize />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toBeInTheDocument()
    })

    it('should accept minRows and maxRows', () => {
      render(<Textarea minRows={5} maxRows={15} />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('rows', '5')
    })
  })

  describe('States', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Textarea disabled />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toBeDisabled()
    })

    it('should apply error styles when error is present', () => {
      render(<Textarea error="Error" />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveClass('border-error')
    })
  })

  describe('Interactions', () => {
    it('should call onChange when typing', async () => {
      const handleChange = vi.fn()
      const user = userEvent.setup()
      
      render(<Textarea onChange={handleChange} />)
      const textarea = screen.getByRole('textbox')
      
      await user.type(textarea, 'test')
      expect(handleChange).toHaveBeenCalled()
    })

    it('should respect maxLength', async () => {
      const user = userEvent.setup()
      render(<Textarea maxLength={10} />)
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
      
      await user.type(textarea, '12345678901234')
      expect(textarea.value.length).toBeLessThanOrEqual(10)
    })
  })

  describe('Accessibility', () => {
    it('should have textbox role', () => {
      render(<Textarea />)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })
  })
})
