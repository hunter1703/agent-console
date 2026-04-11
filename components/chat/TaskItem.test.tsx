/**
 * Task Item Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskItem } from './TaskItem'

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

describe('TaskItem', () => {
  const mockOnToggleExpand = vi.fn()

  beforeEach(() => {
    mockOnToggleExpand.mockClear()
  })

  it('should render task title', () => {
    render(
      <TaskItem
        id="task-1"
        title="My Task"
        status="pending"
      />
    )

    expect(screen.getByText('My Task')).toBeInTheDocument()
  })

  it('should render pending status with circle icon', () => {
    const { container } = render(
      <TaskItem
        id="task-1"
        title="My Task"
        status="pending"
      />
    )

    // Check for circle icon (lucide-react renders as svg)
    const icon = container.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('should render in-progress status with loader icon', () => {
    const { container } = render(
      <TaskItem
        id="task-1"
        title="My Task"
        status="in-progress"
      />
    )

    const icon = container.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('should render completed status with checkmark and strikethrough', () => {
    const { container } = render(
      <TaskItem
        id="task-1"
        title="My Task"
        status="completed"
      />
    )

    const title = screen.getByText('My Task')
    expect(title).toHaveClass('line-through')
  })

  it('should render failed status with alert icon', () => {
    const { container } = render(
      <TaskItem
        id="task-1"
        title="My Task"
        status="failed"
      />
    )

    const icon = container.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('should render skipped status with alert icon', () => {
    const { container } = render(
      <TaskItem
        id="task-1"
        title="My Task"
        status="skipped"
      />
    )

    const icon = container.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('should apply depth-based indentation', () => {
    const { container } = render(
      <TaskItem
        id="task-1"
        title="My Task"
        status="pending"
        depth={2}
      />
    )

    const taskItem = container.querySelector('.task-item')
    expect(taskItem).toHaveStyle({ paddingLeft: '40px' }) // 8 + 2 * 16
  })

  it('should show expand button when hasSubtasks is true', () => {
    render(
      <TaskItem
        id="task-1"
        title="My Task"
        status="pending"
        hasSubtasks={true}
        onToggleExpand={mockOnToggleExpand}
      />
    )

    expect(screen.getByLabelText('Expand subtasks')).toBeInTheDocument()
  })

  it('should not show expand button when hasSubtasks is false', () => {
    render(
      <TaskItem
        id="task-1"
        title="My Task"
        status="pending"
        hasSubtasks={false}
      />
    )

    expect(screen.queryByLabelText('Expand subtasks')).not.toBeInTheDocument()
  })

  it('should call onToggleExpand when expand button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <TaskItem
        id="task-1"
        title="My Task"
        status="pending"
        hasSubtasks={true}
        isExpanded={false}
        onToggleExpand={mockOnToggleExpand}
      />
    )

    const expandButton = screen.getByLabelText('Expand subtasks')
    await user.click(expandButton)

    expect(mockOnToggleExpand).toHaveBeenCalledTimes(1)
  })

  it('should show correct aria-label when expanded', () => {
    render(
      <TaskItem
        id="task-1"
        title="My Task"
        status="pending"
        hasSubtasks={true}
        isExpanded={true}
        onToggleExpand={mockOnToggleExpand}
      />
    )

    expect(screen.getByLabelText('Collapse subtasks')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(
      <TaskItem
        id="task-1"
        title="My Task"
        status="pending"
        className="custom-class"
      />
    )

    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })

  it('should have hover styles', () => {
    const { container } = render(
      <TaskItem
        id="task-1"
        title="My Task"
        status="pending"
      />
    )

    const taskItem = container.querySelector('.task-item')
    expect(taskItem).toHaveClass('hover:bg-surface-hover/50')
  })
})
