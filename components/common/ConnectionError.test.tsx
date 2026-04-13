import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ConnectionError } from './ConnectionError'

describe('ConnectionError', () => {
  it('should render with default message', () => {
    render(<ConnectionError />)
    
    expect(screen.getByText('Connection Error')).toBeInTheDocument()
    expect(
      screen.getByText(/Unable to connect to the server/i)
    ).toBeInTheDocument()
  })

  it('should render with custom message', () => {
    const customMessage = 'Custom error message'
    render(<ConnectionError message={customMessage} />)
    
    expect(screen.getByText(customMessage)).toBeInTheDocument()
  })

  it('should show disconnected status initially', () => {
    render(<ConnectionError />)
    
    expect(screen.getByText('Disconnected')).toBeInTheDocument()
  })

  it('should call onRetry when retry button is clicked', async () => {
    const onRetry = jest.fn().mockResolvedValue(undefined)
    render(<ConnectionError onRetry={onRetry} />)
    
    const retryButton = screen.getByRole('button', { name: /try again/i })
    fireEvent.click(retryButton)
    
    await waitFor(() => {
      expect(onRetry).toHaveBeenCalledTimes(1)
    })
  })

  it('should show connecting status during retry', async () => {
    const onRetry = jest.fn(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    )
    render(<ConnectionError onRetry={onRetry} />)
    
    const retryButton = screen.getByRole('button', { name: /try again/i })
    fireEvent.click(retryButton)
    
    await waitFor(() => {
      expect(screen.getByText('Connecting...')).toBeInTheDocument()
    })
  })

  it('should show connected status after successful retry', async () => {
    const onRetry = jest.fn().mockResolvedValue(undefined)
    render(<ConnectionError onRetry={onRetry} />)
    
    const retryButton = screen.getByRole('button', { name: /try again/i })
    fireEvent.click(retryButton)
    
    await waitFor(() => {
      expect(screen.getByText('Connected')).toBeInTheDocument()
    })
  })

  it('should return to disconnected status after failed retry', async () => {
    const onRetry = jest.fn().mockRejectedValue(new Error('Failed'))
    render(<ConnectionError onRetry={onRetry} />)
    
    const retryButton = screen.getByRole('button', { name: /try again/i })
    fireEvent.click(retryButton)
    
    await waitFor(() => {
      expect(screen.getByText('Disconnected')).toBeInTheDocument()
    })
  })

  it('should disable retry button during connection attempt', async () => {
    const onRetry = jest.fn(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    )
    render(<ConnectionError onRetry={onRetry} />)
    
    const retryButton = screen.getByRole('button', { name: /try again/i })
    fireEvent.click(retryButton)
    
    await waitFor(() => {
      expect(retryButton).toBeDisabled()
    })
  })

  it('should apply custom className', () => {
    const { container } = render(
      <ConnectionError className="custom-class" />
    )
    
    const errorDiv = container.firstChild
    expect(errorDiv).toHaveClass('custom-class')
  })
})
