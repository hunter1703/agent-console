/**
 * Planning Card Footer Component Tests
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PlanningCardFooter } from './PlanningCardFooter'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  useMotionValue: (initial: number) => initial,
  useTransform: (value: number, transform: (v: number) => number) => transform(value),
  animate: vi.fn(() => ({ stop: vi.fn() })),
}))

// Mock useReducedMotion hook
vi.mock('@/lib/hooks/useReducedMotion', () => ({
  useReducedMotion: () => true, // Always use reduced motion in tests for predictable values
}))

describe('PlanningCardFooter', () => {
  it('should render task counts', () => {
    render(
      <PlanningCardFooter
        totalTasks={10}
        completedTasks={5}
      />
    )

    expect(screen.getByText('Tasks:')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('should render estimated time when provided', () => {
    render(
      <PlanningCardFooter
        totalTasks={10}
        completedTasks={5}
        estimatedTime="2h 30m"
      />
    )

    expect(screen.getByText('Est:')).toBeInTheDocument()
    expect(screen.getByText('2h 30m')).toBeInTheDocument()
  })

  it('should render elapsed time when provided', () => {
    render(
      <PlanningCardFooter
        totalTasks={10}
        completedTasks={5}
        elapsedTime="1h 15m"
      />
    )

    expect(screen.getByText('Elapsed:')).toBeInTheDocument()
    expect(screen.getByText('1h 15m')).toBeInTheDocument()
  })

  it('should not render estimated time when not provided', () => {
    render(
      <PlanningCardFooter
        totalTasks={10}
        completedTasks={5}
      />
    )

    expect(screen.queryByText('Est:')).not.toBeInTheDocument()
  })

  it('should not render elapsed time when not provided', () => {
    render(
      <PlanningCardFooter
        totalTasks={10}
        completedTasks={5}
      />
    )

    expect(screen.queryByText('Elapsed:')).not.toBeInTheDocument()
  })

  it('should render all time fields when provided', () => {
    render(
      <PlanningCardFooter
        totalTasks={10}
        completedTasks={5}
        estimatedTime="2h 30m"
        elapsedTime="1h 15m"
      />
    )

    expect(screen.getByText('Est:')).toBeInTheDocument()
    expect(screen.getByText('2h 30m')).toBeInTheDocument()
    expect(screen.getByText('Elapsed:')).toBeInTheDocument()
    expect(screen.getByText('1h 15m')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(
      <PlanningCardFooter
        totalTasks={10}
        completedTasks={5}
        className="custom-class"
      />
    )

    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })

  it('should have correct styling classes', () => {
    const { container } = render(
      <PlanningCardFooter
        totalTasks={10}
        completedTasks={5}
      />
    )

    const footer = container.querySelector('.planning-card-footer')
    expect(footer).toHaveClass(
      'flex',
      'items-center',
      'justify-between',
      'border-t',
      'border-border-subtle/50',
      'pt-5',
      'mt-2',
      'text-xs',
      'text-text-tertiary'
    )
  })

  it('should handle zero completed tasks', () => {
    render(
      <PlanningCardFooter
        totalTasks={10}
        completedTasks={0}
      />
    )

    const zeros = screen.getAllByText('0')
    expect(zeros.length).toBeGreaterThan(0)
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('should handle all tasks completed', () => {
    render(
      <PlanningCardFooter
        totalTasks={10}
        completedTasks={10}
      />
    )

    // Should have two instances of "10" (completed and total)
    const tens = screen.getAllByText('10')
    expect(tens).toHaveLength(2)
  })
})
