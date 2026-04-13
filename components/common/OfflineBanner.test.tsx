import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { OfflineBanner } from './OfflineBanner'

// Mock navigator.onLine
const mockNavigatorOnLine = (value: boolean) => {
  Object.defineProperty(navigator, 'onLine', {
    writable: true,
    value,
  })
}

describe('OfflineBanner', () => {
  beforeEach(() => {
    // Reset to online state before each test
    mockNavigatorOnLine(true)
  })

  it('should not render when online', () => {
    mockNavigatorOnLine(true)
    render(<OfflineBanner />)
    
    expect(
      screen.queryByText(/You're currently offline/i)
    ).not.toBeInTheDocument()
  })

  it('should render when offline', () => {
    mockNavigatorOnLine(false)
    render(<OfflineBanner />)
    
    expect(
      screen.getByText(/You're currently offline/i)
    ).toBeInTheDocument()
  })

  it('should show offline message and description', () => {
    mockNavigatorOnLine(false)
    render(<OfflineBanner />)
    
    expect(
      screen.getByText(/You're currently offline/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Some features may be unavailable/i)
    ).toBeInTheDocument()
  })

  it('should dismiss banner when close button is clicked', async () => {
    mockNavigatorOnLine(false)
    render(<OfflineBanner />)
    
    const dismissButton = screen.getByLabelText(/dismiss offline banner/i)
    fireEvent.click(dismissButton)
    
    await waitFor(() => {
      expect(
        screen.queryByText(/You're currently offline/i)
      ).not.toBeInTheDocument()
    })
  })

  it('should show banner when going offline', async () => {
    mockNavigatorOnLine(true)
    render(<OfflineBanner />)
    
    // Initially should not be visible
    expect(
      screen.queryByText(/You're currently offline/i)
    ).not.toBeInTheDocument()
    
    // Simulate going offline
    mockNavigatorOnLine(false)
    window.dispatchEvent(new Event('offline'))
    
    await waitFor(() => {
      expect(
        screen.getByText(/You're currently offline/i)
      ).toBeInTheDocument()
    })
  })

  it('should hide banner when going back online', async () => {
    mockNavigatorOnLine(false)
    render(<OfflineBanner />)
    
    // Initially should be visible
    expect(
      screen.getByText(/You're currently offline/i)
    ).toBeInTheDocument()
    
    // Simulate going online
    mockNavigatorOnLine(true)
    window.dispatchEvent(new Event('online'))
    
    await waitFor(() => {
      expect(
        screen.queryByText(/You're currently offline/i)
      ).not.toBeInTheDocument()
    })
  })

  it('should apply custom className', () => {
    mockNavigatorOnLine(false)
    const { container } = render(<OfflineBanner className="custom-class" />)
    
    const banner = container.querySelector('.custom-class')
    expect(banner).toBeInTheDocument()
  })

  it('should show banner again after dismissing and going offline again', async () => {
    mockNavigatorOnLine(false)
    render(<OfflineBanner />)
    
    // Dismiss the banner
    const dismissButton = screen.getByLabelText(/dismiss offline banner/i)
    fireEvent.click(dismissButton)
    
    await waitFor(() => {
      expect(
        screen.queryByText(/You're currently offline/i)
      ).not.toBeInTheDocument()
    })
    
    // Go online then offline again
    mockNavigatorOnLine(true)
    window.dispatchEvent(new Event('online'))
    
    mockNavigatorOnLine(false)
    window.dispatchEvent(new Event('offline'))
    
    await waitFor(() => {
      expect(
        screen.getByText(/You're currently offline/i)
      ).toBeInTheDocument()
    })
  })
})
