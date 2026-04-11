/**
 * Task Stepper Component Tests
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TaskStepper } from './TaskStepper'
import type { Task } from '@/types/planning'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
}))

// Mock useReducedMotion hook
vi.mock('@/lib/hooks/useReducedMotion', () => ({
  useReducedMotion: () => false,
}))

describe('TaskStepper', () => {
  const mockTasks: Task[] = [
    {
      id: 'task-1',
      title: 'Task 1',
      status: 'completed',
      order: 1,
    },
    {
      id: 'task-2',
      title: 'Task 2',
      status: 'completed',
      order: 2,
    },
    {
      id: 'task-3',
      title: 'Task 3',
      status: 'in-progress',
      order: 3,
    },
    {
      id: 'task-4',
      title: 'Task 4',
      status: 'pending',
      order: 4,
    },
    {
      id: 'task-5',
      title: 'Task 5',
      status: 'pending',
      order: 5,
    },
  ]

  it('should render all tasks', () => {
    render(<TaskStepper tasks={mockTasks} />)

    expect(screen.getByText('Task 1')).toBeInTheDocument()
    expect(screen.getByText('Task 2')).toBeInTheDocument()
    expect(screen.getByText('Task 3')).toBeInTheDocument()
    expect(screen.getByText('Task 4')).toBeInTheDocument()
    expect(screen.getByText('Task 5')).toBeInTheDocument()
  })

  it('should limit visible tasks to maxVisible', () => {
    render(<TaskStepper tasks={mockTasks} maxVisible={3} />)

    expect(screen.getByText('Task 1')).toBeInTheDocument()
    expect(screen.getByText('Task 2')).toBeInTheDocument()
    expect(screen.getByText('Task 3')).toBeInTheDocument()
    expect(screen.queryByText('Task 4')).not.toBeInTheDocument()
    expect(screen.queryByText('Task 5')).not.toBeInTheDocument()
  })

  it('should show summary when tasks exceed maxVisible', () => {
    render(<TaskStepper tasks={mockTasks} maxVisible={3} />)

    expect(screen.getByText('+2 more tasks')).toBeInTheDocument()
  })

  it('should not show summary when tasks do not exceed maxVisible', () => {
    render(<TaskStepper tasks={mockTasks.slice(0, 3)} maxVisible={5} />)

    expect(screen.queryByText(/more tasks/)).not.toBeInTheDocument()
  })

  it('should filter out child tasks', () => {
    const tasksWithChildren: Task[] = [
      ...mockTasks,
      {
        id: 'task-1-1',
        title: 'Child Task',
        status: 'pending',
        parentTaskId: 'task-1',
        order: 6,
      },
    ]

    render(<TaskStepper tasks={tasksWithChildren} />)

    expect(screen.queryByText('Child Task')).not.toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(<TaskStepper tasks={mockTasks} className="custom-class" />)

    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })

  it('should render icons for different statuses', () => {
    const { container } = render(<TaskStepper tasks={mockTasks} />)

    // Check that SVG icons are rendered
    const icons = container.querySelectorAll('svg')
    expect(icons.length).toBeGreaterThan(0)
  })

  it('should handle empty tasks array', () => {
    const { container } = render(<TaskStepper tasks={[]} />)

    expect(container.querySelector('.task-stepper')).toBeInTheDocument()
  })

  it('should render connecting lines between tasks', () => {
    const { container } = render(<TaskStepper tasks={mockTasks.slice(0, 3)} />)

    // Should have connecting lines (flex-1 elements between circles)
    const lines = container.querySelectorAll('.flex-1.h-0\\.5')
    expect(lines.length).toBeGreaterThan(0)
  })
})
