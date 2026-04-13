import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { ErrorBoundary, withErrorBoundary } from './ErrorBoundary'

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

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error
beforeEach(() => {
  console.error = vi.fn()
})

afterEach(() => {
  console.error = originalConsoleError
})

// Test component that throws an error
const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('renders error UI when child component throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText(/We encountered an unexpected error/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /report issue/i })).toBeInTheDocument()
  })

  it('calls onError callback when error occurs', () => {
    const onError = vi.fn()
    
    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    )
  })

  it('resets error state when retry button is clicked', () => {
    const TestComponent = () => <ThrowError shouldThrow={true} />
    
    render(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    )
    
    // Error UI should be visible
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    
    // Click retry button - this should reset the error state
    fireEvent.click(screen.getByRole('button', { name: /try again/i }))
    
    // The error boundary should attempt to re-render the children
    // Since the component still throws, it should catch the error again
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('renders custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>
    
    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Custom error message')).toBeInTheDocument()
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
  })

  it('shows error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Error Details (Development)')).toBeInTheDocument()
    
    process.env.NODE_ENV = originalEnv
  })

  it('logs error to console', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(console.error).toHaveBeenCalledWith(
      'ErrorBoundary caught an error:',
      expect.any(Error),
      expect.any(Object)
    )
  })
})

describe('withErrorBoundary', () => {
  it('wraps component with error boundary', () => {
    const TestComponent = ({ shouldThrow = false }: { shouldThrow?: boolean }) => (
      <ThrowError shouldThrow={shouldThrow} />
    )
    
    const WrappedComponent = withErrorBoundary(TestComponent)
    
    render(<WrappedComponent shouldThrow={false} />)
    expect(screen.getByText('No error')).toBeInTheDocument()
    
    render(<WrappedComponent shouldThrow={true} />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('passes error boundary props to wrapper', () => {
    const onError = vi.fn()
    const TestComponent = () => <ThrowError shouldThrow={true} />
    
    const WrappedComponent = withErrorBoundary(TestComponent, { onError })
    
    render(<WrappedComponent />)
    
    expect(onError).toHaveBeenCalled()
  })
})