/**
 * Planning Card Component Tests
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PlanningCard } from './PlanningCard'
import type { PlanningState } from '@/types/planning'

// Mock child components
vi.mock('./PlanningCardHeader', () => ({
  PlanningCardHeader: ({ title, isCollapsed, onToggleCollapse }: any) => (
    <div data-testid="planning-card-header">
      <h3>{title}</h3>
      <button
        onClick={onToggleCollapse}
        aria-label={isCollapsed ? 'Expand planning card' : 'Collapse planning card'}
      >
        Toggle
      </button>
    </div>
  ),
}))

vi.mock('./TaskList', () => ({
  TaskList: ({ tasks }: any) => (
    <div data-testid="task-list">
      {tasks.map((task: any) => (
        <div key={task.id}>{task.title}</div>
      ))}
    </div>
  ),
}))

vi.mock('./PlanningCardFooter', () => ({
  PlanningCardFooter: ({ totalTasks, completedTasks }: any) => (
    <div data-testid="planning-card-footer">
      Tasks: {completedTasks} / {totalTasks}
    </div>
  ),
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    svg: ({ children, ...props }: any) => <svg {...props}>{children}</svg>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// Mock useReducedMotion hook
vi.mock('@/lib/hooks/useReducedMotion', () => ({
  useReducedMotion: () => false,
}))

describe('PlanningCard', () => {
  const mockPlanning: PlanningState = {
    sessionId: 'session-1',
    tasks: [
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
    ],
    overallProgress: 33.33,
    isPlanning: false,
    lastUpdated: new Date().toISOString(),
  }

  it('should render planning card', () => {
    render(<PlanningCard planning={mockPlanning} />)
    
    expect(screen.getByTestId('planning-card-header')).toBeInTheDocument()
    expect(screen.getByTestId('task-list')).toBeInTheDocument()
    expect(screen.getByTestId('planning-card-footer')).toBeInTheDocument()
  })

  it('should display task count in footer', () => {
    render(<PlanningCard planning={mockPlanning} />)
    
    expect(screen.getByText('Tasks: 1 / 3')).toBeInTheDocument()
  })

  it('should toggle collapse state', async () => {
    const user = userEvent.setup()
    render(<PlanningCard planning={mockPlanning} />)
    
    const collapseButton = screen.getByLabelText('Collapse planning card')
    
    // Initially expanded - check for task list
    expect(screen.getByTestId('task-list')).toBeInTheDocument()
    
    // Click to collapse
    await user.click(collapseButton)
    
    // Button label should change
    expect(screen.getByLabelText('Expand planning card')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(
      <PlanningCard planning={mockPlanning} className="custom-class" />
    )
    
    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })

  it('should have frosted glass styling', () => {
    const { container } = render(<PlanningCard planning={mockPlanning} />)
    
    const card = container.querySelector('.planning-card')
    expect(card).toHaveStyle({
      backdropFilter: 'blur(20px)',
    })
  })

  it('should render animated blob background', () => {
    const { container } = render(<PlanningCard planning={mockPlanning} />)
    
    const blob = container.querySelector('.planning-blob')
    expect(blob).toBeInTheDocument()
  })
})
