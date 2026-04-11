import { describe, it, expect, vi } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { MathRenderer } from './MathRenderer'

// Mock katex
vi.mock('katex', () => ({
  default: {
    render: vi.fn((math, element) => {
      element.innerHTML = `<span class="katex">${math}</span>`
    }),
  },
}))

describe('MathRenderer', () => {
  it('renders inline math', async () => {
    const { container } = render(
      <MathRenderer math="x^2 + y^2 = z^2" displayMode={false} />
    )
    
    await waitFor(() => {
      expect(container.querySelector('.katex')).toBeInTheDocument()
    })
  })

  it('renders block math with padding and background', async () => {
    const { container } = render(
      <MathRenderer math="\\int_0^\\infty e^{-x^2} dx" displayMode={true} />
    )
    
    await waitFor(() => {
      const wrapper = container.querySelector('.bg-surface')
      expect(wrapper).toBeInTheDocument()
      expect(wrapper).toHaveClass('p-4', 'rounded-xl')
    })
  })

  it('applies custom className', async () => {
    const { container } = render(
      <MathRenderer math="a + b" displayMode={false} className="custom-class" />
    )
    
    await waitFor(() => {
      const span = container.querySelector('span')
      expect(span).toHaveClass('custom-class')
    })
  })
})
