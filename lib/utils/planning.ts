/**
 * Planning Utilities
 * 
 * Helper functions for working with planning data structures.
 */

import type { Task, TaskWithChildren } from '@/types/planning'

/**
 * Build hierarchical tree from flat task list
 * Tasks with parentId are nested under their parent
 */
export function buildTaskTree(tasks: Task[]): TaskWithChildren[] {
  const taskMap = new Map<string, TaskWithChildren>()
  const rootTasks: TaskWithChildren[] = []

  // First pass: create all task nodes
  tasks.forEach(task => {
    taskMap.set(task.taskId, {
      ...task,
      children: [],
      depth: 0,
    })
  })

  // Second pass: build hierarchy
  tasks.forEach(task => {
    const taskNode = taskMap.get(task.taskId)!
    
    if (task.parentId) {
      const parent = taskMap.get(task.parentId)
      if (parent) {
        parent.children.push(taskNode)
        taskNode.depth = parent.depth + 1
      } else {
        // Parent not found, treat as root
        rootTasks.push(taskNode)
      }
    } else {
      rootTasks.push(taskNode)
    }
  })

  // Sort children by order (if needed)
  const sortChildren = (node: TaskWithChildren) => {
    node.children.sort((a, b) => a.name.localeCompare(b.name))
    node.children.forEach(sortChildren)
  }
  rootTasks.forEach(sortChildren)

  return rootTasks
}

/**
 * Calculate completion statistics
 */
export function getTaskStats(tasks: Task[]) {
  const total = tasks.length
  const completed = tasks.filter(t => t.status === 'COMPLETED').length
  const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length
  const failed = tasks.filter(t => t.status === 'FAILED').length
  const pending = tasks.filter(t => t.status === 'TODO').length

  return {
    total,
    completed,
    inProgress,
    failed,
    pending,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
  }
}

/**
 * Get status color (minimal, grayscale-first)
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'COMPLETED':
      return 'text-green-500'
    case 'IN_PROGRESS':
      return 'text-amber-500'
    case 'FAILED':
      return 'text-red-500'
    case 'SKIPPED':
      return 'text-text-tertiary'
    default:
      return 'text-text-secondary'
  }
}

/**
 * Get status icon
 */
export function getStatusIcon(status: string): string {
  switch (status) {
    case 'COMPLETED':
      return '✓'
    case 'IN_PROGRESS':
      return '⟳'
    case 'FAILED':
      return '✗'
    case 'SKIPPED':
      return '⊘'
    default:
      return '○'
  }
}
