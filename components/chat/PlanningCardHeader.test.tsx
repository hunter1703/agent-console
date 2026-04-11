/**
 * Planning Card Header Component Tests
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PlanningCardHeader } from './PlanningCardHeader'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
}))

// Mock useReducedMotion hook
vi.mock('@/lib/hooks/useReducedMotion', () => ({
  useReducedMotion: () => false,
}))

describe('PlanningCardHeader', () => {
  const mockOnToggleCollapse = vi.fn()

  beforeEach(() => {
    mockOnToggleCollapse.mockClear()
  })

  it('should render title', () => {
    render(
      <PlanningCardHeader
        title="My Plan"
        status="working"
        isCollapsed={false}
        onToggleCollapse={mockOnToggleCollapse}
      />
    )

    expect(screen.getByText('My Plan')).toBeInTheDocument()
  })

  it('should render working status badge', () => {
    render(
      <PlanningCardHeader
        title="My Plan"
        status="working"
        isCollapsed={false}
        onToggleCollapse={mockOnToggleCollapse}
      />
    )

    expect(screen.getByText('In Progress')).toBeInTheDocument()
  })

  it('should render completed status badge', () => {
    render(
      <PlanningCardHeader
        title="My Plan"
        status="completed"
        isCollapsed={false}
        onToggleCollapse={mockOnToggleCollapse}
      />
    )

    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('should render abandoned status badge', () => {
    render(
      <PlanningCardHeader
        title="My Plan"
        status="abandoned"
        isCollapsed={false}
        onToggleCollapse={mockOnToggleCollapse}
      />
    )

    expect(screen.getByText('Abandoned')).toBeInTheDocument()
  })

  it('should call onToggleCollapse when collapse button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <PlanningCardHeader
        title="My Plan"
        status="working"
        isCollapsed={false}
        onToggleCollapse={mockOnToggleCollapse}
      />
    )

    const collapseButton = screen.getByLabelText('Collapse planning card')
    await user.click(collapseButton)

    expect(mockOnToggleCollapse).toHaveBeenCalledTimes(1)
  })

  it('should show correct aria-label when collapsed', () => {
    render(
      <PlanningCardHeader
        title="My Plan"
        status="working"
        isCollapsed={true}
        onToggleCollapse={mockOnToggleCollapse}
      />
    )

    expect(screen.getByLabelText('Expand planning card')).toBeInTheDocument()
  })

  it('should show correct aria-label when expanded', () => {
    render(
      <PlanningCardHeader
        title="My Plan"
        status="working"
        isCollapsed={false}
        onToggleCollapse={mockOnToggleCollapse}
      />
    )

    expect(screen.getByLabelText('Collapse planning card')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(
      <PlanningCardHeader
        title="My Plan"
        status="working"
        isCollapsed={false}
        onToggleCollapse={mockOnToggleCollapse}
        className="custom-class"
      />
    )

    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })
})
