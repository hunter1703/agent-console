/**
 * ParticleThemeTransition Component Tests
 */

import { render, screen, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { ParticleThemeTransition, useParticleThemeTransition } from './ParticleThemeTransition'
import { useTheme } from '@/lib/hooks/useTheme'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, style, ...props }: any) => (
      <div
        data-testid="particle-element"
        data-particle-color={style?.backgroundColor}
        {...props}
      >
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: any) => <div data-testid="animate-presence">{children}</div>,
}))

// Mock useTheme hook
vi.mock('@/lib/hooks/useTheme')
const mockUseTheme = useTheme as any

// Mock window.matchMedia
const mockMatchMedia = vi.fn().mockImplementation((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}))

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
})

// Mock window dimensions
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
})

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 768,
})

describe('ParticleThemeTransition', () => {
  beforeEach(() => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: vi.fn(),
      toggleTheme: vi.fn(),
    })
    vi.clearAllTimers()
    vi.useFakeTimers()
    // Reset matchMedia mock
    mockMatchMedia.mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  it('does not render particles when inactive', () => {
    render(
      <ParticleThemeTransition isActive={false} />
    )

    expect(screen.queryByTestId('particle-element')).not.toBeInTheDocument()
  })

  it('renders particles when active', () => {
    render(
      <ParticleThemeTransition isActive={true} />
    )

    // The particles should be generated immediately when isActive becomes true
    const particles = screen.queryAllByTestId('particle-element')
    expect(particles.length).toBeGreaterThan(0)
  })

  it('generates particles in expected range (20-30)', () => {
    render(
      <ParticleThemeTransition isActive={true} />
    )

    const particles = screen.queryAllByTestId('particle-element')
    expect(particles.length).toBeGreaterThanOrEqual(20)
    expect(particles.length).toBeLessThanOrEqual(30)
  })

  it('uses correct particle color for light theme', () => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: vi.fn(),
      toggleTheme: vi.fn(),
    })

    render(
      <ParticleThemeTransition isActive={true} />
    )

    const particles = screen.queryAllByTestId('particle-element')
    if (particles.length > 0) {
      expect(particles[0]).toHaveAttribute('data-particle-color', '#F59E0B')
    }
  })

  it('uses correct particle color for dark theme', () => {
    mockUseTheme.mockReturnValue({
      theme: 'dark',
      setTheme: vi.fn(),
      toggleTheme: vi.fn(),
    })

    render(
      <ParticleThemeTransition isActive={true} />
    )

    const particles = screen.queryAllByTestId('particle-element')
    if (particles.length > 0) {
      expect(particles[0]).toHaveAttribute('data-particle-color', '#FAFAFA')
    }
  })

  it('calls onComplete when animation finishes', () => {
    const onComplete = vi.fn()

    render(
      <ParticleThemeTransition isActive={true} onComplete={onComplete} />
    )

    // Fast-forward through all timers
    act(() => {
      vi.runAllTimers()
    })

    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('respects prefers-reduced-motion by skipping particles', () => {
    // Mock reduced motion preference
    mockMatchMedia.mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    const onComplete = vi.fn()

    render(
      <ParticleThemeTransition isActive={true} onComplete={onComplete} />
    )

    // Should not generate particles
    const particles = screen.queryAllByTestId('particle-element')
    expect(particles.length).toBe(0)

    // Should still call onComplete
    act(() => {
      vi.runAllTimers()
    })

    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('clears particles after animation completes', () => {
    render(
      <ParticleThemeTransition isActive={true} />
    )

    // Initially should have particles
    let particles = screen.queryAllByTestId('particle-element')
    expect(particles.length).toBeGreaterThan(0)

    // After all timers complete, particles should be cleared
    act(() => {
      vi.runAllTimers()
    })

    particles = screen.queryAllByTestId('particle-element')
    expect(particles.length).toBe(0)
  })

  it('handles window dimensions correctly', () => {
    // Change window dimensions
    Object.defineProperty(window, 'innerWidth', { value: 800 })
    Object.defineProperty(window, 'innerHeight', { value: 600 })

    render(
      <ParticleThemeTransition isActive={true} />
    )

    // Should still generate particles without error
    const particles = screen.queryAllByTestId('particle-element')
    expect(particles.length).toBeGreaterThan(0)
  })
})

describe('useParticleThemeTransition', () => {
  const TestComponent = () => {
    const { isTransitioning, triggerParticles, completeTransition } =
      useParticleThemeTransition()

    return (
      <div>
        <div data-testid="is-transitioning">
          {isTransitioning ? 'true' : 'false'}
        </div>
        <button data-testid="trigger-button" onClick={triggerParticles}>
          Trigger
        </button>
        <button data-testid="complete-button" onClick={completeTransition}>
          Complete
        </button>
      </div>
    )
  }

  beforeEach(() => {
    vi.clearAllTimers()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('initializes with correct default values', () => {
    render(<TestComponent />)

    expect(screen.getByTestId('is-transitioning')).toHaveTextContent('false')
  })

  it('triggers particle transition correctly', () => {
    render(<TestComponent />)

    act(() => {
      screen.getByTestId('trigger-button').click()
    })

    expect(screen.getByTestId('is-transitioning')).toHaveTextContent('true')
  })

  it('completes transition correctly', () => {
    render(<TestComponent />)

    // First trigger a transition
    act(() => {
      screen.getByTestId('trigger-button').click()
    })

    expect(screen.getByTestId('is-transitioning')).toHaveTextContent('true')

    // Then complete it
    act(() => {
      screen.getByTestId('complete-button').click()
    })

    expect(screen.getByTestId('is-transitioning')).toHaveTextContent('false')
  })

  it('can trigger multiple transitions', () => {
    render(<TestComponent />)

    // Trigger first transition
    act(() => {
      screen.getByTestId('trigger-button').click()
    })
    expect(screen.getByTestId('is-transitioning')).toHaveTextContent('true')

    // Complete first transition
    act(() => {
      screen.getByTestId('complete-button').click()
    })
    expect(screen.getByTestId('is-transitioning')).toHaveTextContent('false')

    // Trigger second transition
    act(() => {
      screen.getByTestId('trigger-button').click()
    })
    expect(screen.getByTestId('is-transitioning')).toHaveTextContent('true')
  })
})