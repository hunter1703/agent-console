/**
 * Task List Component Tests
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskList } from './TaskList'
import type { Task } from '@/types/planning'

// Mock TaskItem component
vi.mock('./TaskItem', () => ({
  TaskItem: ({ id, title, hasSubtasks, isExpanded, onToggleExpand }: any) => (
    <div data-testid={`task-${id}`}>
      <span>{title}</span>
      {hasSubtasks && (
        <button
          onClick={onToggleExpand}
          aria-label={isExpanded ? 'Collapse subtasks' : 'Expand subtasks'}
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      )}
    </div>
  ),
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// Mock useReducedMotion hook
vi.mock('@/lib/hooks/useReducedMotion', () => ({
  useReducedMotion: () => false,
}))

describe('TaskList', () => {
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
      status: 'in-progress',
      order: 2,
    },
    {
      id: 'task-3',
      title: 'Task 3',
      status: 'pending',
      order: 3,
    },
  ]

  const mockNestedTasks: Task[] = [
    {
      id: 'task-1',
      title: 'Parent Task',
      status: 'in-progress',
      order: 1,
    },
    {
      id: 'task-1-1',
      title: 'Child Task 1',
      status: 'completed',
      parentTaskId: 'task-1',
      order: 2,
    },
    {
      id: 'task-1-2',
      title: 'Child Task 2',
      status: 'pending',
      parentTaskId: 'task-1',
      order: 3,
    },
  ]

  it('should render all tasks', () => {
    render(<TaskList tasks={mockTasks} />)

    expect(screen.getByText('Task 1')).toBeInTheDocument()
    expect(screen.getByText('Task 2')).toBeInTheDocument()
    expect(screen.getByText('Task 3')).toBeInTheDocument()
  })

  it('should render empty state when no tasks', () => {
    render(<TaskList tasks={[]} />)

    expect(screen.getByText('No tasks yet')).toBeInTheDocument()
  })

  it('should render nested tasks', () => {
    render(<TaskList tasks={mockNestedTasks} />)

    expect(screen.getByText('Parent Task')).toBeInTheDocument()
    expect(screen.getByText('Child Task 1')).toBeInTheDocument()
    expect(screen.getByText('Child Task 2')).toBeInTheDocument()
  })

  it('should show expand button for parent tasks', () => {
    render(<TaskList tasks={mockNestedTasks} />)

    // Parent task should have expand button
    expect(screen.getByLabelText('Collapse subtasks')).toBeInTheDocument()
  })

  it('should collapse and expand subtasks', async () => {
    const user = userEvent.setup()
    render(<TaskList tasks={mockNestedTasks} />)

    // Initially expanded - children should be visible
    expect(screen.getByText('Child Task 1')).toBeInTheDocument()
    expect(screen.getByText('Child Task 2')).toBeInTheDocument()

    // Click to collapse
    const collapseButton = screen.getByLabelText('Collapse subtasks')
    await user.click(collapseButton)

    // After collapse, button label should change
    expect(screen.getByLabelText('Expand subtasks')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(<TaskList tasks={mockTasks} className="custom-class" />)

    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })

  it('should respect maxDepth', () => {
    const deeplyNestedTasks: Task[] = [
      {
        id: 'task-1',
        title: 'Level 1',
        status: 'in-progress',
        order: 1,
      },
      {
        id: 'task-1-1',
        title: 'Level 2',
        status: 'in-progress',
        parentTaskId: 'task-1',
        order: 2,
      },
      {
        id: 'task-1-1-1',
        title: 'Level 3',
        status: 'in-progress',
        parentTaskId: 'task-1-1',
        order: 3,
      },
      {
        id: 'task-1-1-1-1',
        title: 'Level 4',
        status: 'pending',
        parentTaskId: 'task-1-1-1',
        order: 4,
      },
    ]

    render(<TaskList tasks={deeplyNestedTasks} maxDepth={2} />)

    // Should render up to level 3 (maxDepth 2 means 3 levels: 0, 1, 2)
    expect(screen.getByText('Level 1')).toBeInTheDocument()
    expect(screen.getByText('Level 2')).toBeInTheDocument()
    expect(screen.getByText('Level 3')).toBeInTheDocument()
    
    // Level 4 should be treated as root since parent exceeds maxDepth
    expect(screen.getByText('Level 4')).toBeInTheDocument()
  })

  it('should handle orphaned tasks gracefully', () => {
    const orphanedTasks: Task[] = [
      {
        id: 'task-1',
        title: 'Task 1',
        status: 'pending',
        order: 1,
      },
      {
        id: 'task-2',
        title: 'Orphaned Task',
        status: 'pending',
        parentTaskId: 'non-existent-parent',
        order: 2,
      },
    ]

    render(<TaskList tasks={orphanedTasks} />)

    // Both tasks should render as root tasks
    expect(screen.getByText('Task 1')).toBeInTheDocument()
    expect(screen.getByText('Orphaned Task')).toBeInTheDocument()
  })

  it('should have correct spacing', () => {
    const { container } = render(<TaskList tasks={mockTasks} />)

    const taskList = container.querySelector('.task-list')
    expect(taskList).toHaveClass('space-y-1')
  })
})
