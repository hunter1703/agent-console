import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CodeBlock } from './CodeBlock'

// Mock shiki
vi.mock('shiki', () => ({
  codeToHtml: vi.fn(async (code: string) => {
    return `<pre><code>${code}</code></pre>`
  }),
}))

describe('CodeBlock', () => {
  const originalClipboard = navigator.clipboard

  beforeEach(() => {
    // Mock clipboard API
    const mockClipboard = {
      writeText: vi.fn(() => Promise.resolve()),
    }
    Object.defineProperty(navigator, 'clipboard', {
      value: mockClipboard,
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      writable: true,
      configurable: true,
    })
  })

  it('renders code with language label', async () => {
    render(<CodeBlock code="const x = 1" language="typescript" />)
    
    await waitFor(() => {
      expect(screen.getByText('typescript')).toBeInTheDocument()
    })
  })

  it('renders code content', async () => {
    const code = 'const x = 1'
    render(<CodeBlock code={code} language="typescript" />)
    
    await waitFor(() => {
      expect(screen.getByText(code)).toBeInTheDocument()
    })
  })

  it('shows copy button', async () => {
    render(<CodeBlock code="const x = 1" language="typescript" />)
    
    await waitFor(() => {
      const copyButton = screen.getByLabelText('Copy code')
      expect(copyButton).toBeInTheDocument()
    })
  })

  it('copies code to clipboard when copy button is clicked', async () => {
    const user = userEvent.setup()
    const code = 'const x = 1'
    const writeTextSpy = vi.fn(() => Promise.resolve())
    
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextSpy },
      writable: true,
      configurable: true,
    })
    
    render(<CodeBlock code={code} language="typescript" />)
    
    await waitFor(() => {
      expect(screen.getByLabelText('Copy code')).toBeInTheDocument()
    })
    
    const copyButton = screen.getByLabelText('Copy code')
    await user.click(copyButton)
    
    expect(writeTextSpy).toHaveBeenCalledWith(code)
  })

  it('shows check icon after copying', async () => {
    const user = userEvent.setup()
    
    render(<CodeBlock code="const x = 1" language="typescript" />)
    
    await waitFor(() => {
      expect(screen.getByLabelText('Copy code')).toBeInTheDocument()
    })
    
    const copyButton = screen.getByLabelText('Copy code')
    await user.click(copyButton)
    
    await waitFor(() => {
      expect(screen.getByLabelText('Copied')).toBeInTheDocument()
    })
  })

  it('defaults to text language when not specified', async () => {
    render(<CodeBlock code="plain text" />)
    
    await waitFor(() => {
      expect(screen.getByText('text')).toBeInTheDocument()
    })
  })

  it('applies custom className', async () => {
    const { container } = render(
      <CodeBlock code="test" language="typescript" className="custom-class" />
    )
    
    await waitFor(() => {
      const wrapper = container.querySelector('.code-block-wrapper')
      expect(wrapper).toHaveClass('custom-class')
    })
  })

  it('shows loading state initially', () => {
    render(<CodeBlock code="const x = 1" language="typescript" />)
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })
})
