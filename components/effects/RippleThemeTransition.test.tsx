/**
 * RippleThemeTransition Component Tests
 */

import { render, screen, act, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { RippleThemeTransition, useRippleThemeTransition } from './RippleThemeTransition'
import { useTheme } from '@/lib/hooks/useTheme'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, onAnimationComplete, ...props }: any) => (
      <div
        data-testid="ripple-element"
        onClick={() => onAnimationComplete?.()}
        {...props}
      >
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
}))

// Mock useTheme hook
vi.mock('@/lib/hooks/useTheme')
const mockUseTheme = useTheme as any

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
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

describe('RippleThemeTransition', () => {
  beforeEach(() => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: vi.fn(),
      toggleTheme: vi.fn(),
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders ripple when active', () => {
    render(
      <RippleThemeTransition
        isActive={true}
        origin={{ x: 100, y: 100 }}
      />
    )

    expect(screen.getByTestId('ripple-element')).toBeInTheDocument()
  })

  it('does not render ripple when inactive', () => {
    render(
      <RippleThemeTransition
        isActive={false}
        origin={{ x: 100, y: 100 }}
      />
    )

    expect(screen.queryByTestId('ripple-element')).not.toBeInTheDocument()
  })

  it('uses correct background color for light theme', () => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: vi.fn(),
      toggleTheme: vi.fn(),
    })

    render(
      <RippleThemeTransition
        isActive={true}
        origin={{ x: 100, y: 100 }}
      />
    )

    const ripple = screen.getByTestId('ripple-element')
    expect(ripple).toHaveStyle({ backgroundColor: '#09090B' })
  })

  it('uses correct background color for dark theme', () => {
    mockUseTheme.mockReturnValue({
      theme: 'dark',
      setTheme: vi.fn(),
      toggleTheme: vi.fn(),
    })

    render(
      <RippleThemeTransition
        isActive={true}
        origin={{ x: 100, y: 100 }}
      />
    )

    const ripple = screen.getByTestId('ripple-element')
    expect(ripple).toHaveStyle({ backgroundColor: '#FFFFFF' })
  })

  it('calls onComplete when animation finishes', () => {
    const onComplete = vi.fn()

    render(
      <RippleThemeTransition
        isActive={true}
        origin={{ x: 100, y: 100 }}
        onComplete={onComplete}
      />
    )

    const ripple = screen.getByTestId('ripple-element')
    act(() => {
      ripple.click() // Trigger onAnimationComplete
    })

    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('respects prefers-reduced-motion', async () => {
    // Mock reduced motion preference
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    render(
      <RippleThemeTransition
        isActive={true}
        origin={{ x: 100, y: 100 }}
      />
    )

    // Component should still render but with instant transition
    expect(screen.getByTestId('ripple-element')).toBeInTheDocument()
  })
})

describe('useRippleThemeTransition', () => {
  const TestComponent = () => {
    const { isTransitioning, rippleOrigin, triggerRipple, completeTransition } =
      useRippleThemeTransition()

    return (
      <div>
        <div data-testid="is-transitioning">
          {isTransitioning ? 'true' : 'false'}
        </div>
        <div data-testid="ripple-origin">
          {rippleOrigin.x},{rippleOrigin.y}
        </div>
        <button
          data-testid="trigger-button"
          onClick={() => {
            const element = document.createElement('div')
            element.getBoundingClientRect = () => ({
              left: 50,
              top: 50,
              width: 100,
              height: 100,
              right: 150,
              bottom: 150,
              x: 50,
              y: 50,
              toJSON: () => {},
            })
            triggerRipple(element)
          }}
        >
          Trigger
        </button>
        <button data-testid="complete-button" onClick={completeTransition}>
          Complete
        </button>
      </div>
    )
  }

  it('initializes with correct default values', () => {
    render(<TestComponent />)

    expect(screen.getByTestId('is-transitioning')).toHaveTextContent('false')
    expect(screen.getByTestId('ripple-origin')).toHaveTextContent('0,0')
  })

  it('triggers ripple transition correctly', () => {
    render(<TestComponent />)

    act(() => {
      screen.getByTestId('trigger-button').click()
    })

    expect(screen.getByTestId('is-transitioning')).toHaveTextContent('true')
    expect(screen.getByTestId('ripple-origin')).toHaveTextContent('100,100')
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

  it('handles null element gracefully', () => {
    const TestComponentWithNull = () => {
      const { triggerRipple } = useRippleThemeTransition()

      return (
        <button
          data-testid="trigger-null"
          onClick={() => triggerRipple(null)}
        >
          Trigger Null
        </button>
      )
    }

    render(<TestComponentWithNull />)

    // Should not throw error
    expect(() => {
      act(() => {
        screen.getByTestId('trigger-null').click()
      })
    }).not.toThrow()
  })
})