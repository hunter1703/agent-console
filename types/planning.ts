/**
 * Planning Types
 * 
 * Type definitions for planning and task management.
 */

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'SKIPPED'

export interface Task {
  taskId: string
  name: string
  goal: string
  description?: string
  status: TaskStatus
  parentId?: string
  result?: string
}

export interface Plan {
  planId: string
  title: string
  goal: string
  status: TaskStatus
  tasks: Task[]
  result?: string
  createdTime?: string
}

// Legacy types for backward compatibility
export type LegacyTaskStatus = 'pending' | 'in-progress' | 'completed' | 'failed' | 'skipped'

export interface LegacyTask {
  id: string
  title: string
  description?: string
  status: LegacyTaskStatus
  parentTaskId?: string
  order: number
  progress?: number
  startedAt?: string
  completedAt?: string
  error?: string
}

export interface PlanningState {
  sessionId: string
  tasks: LegacyTask[]
  overallProgress: number
  isPlanning: boolean
  lastUpdated: string
}

export interface TaskWithChildren extends LegacyTask {
  children: TaskWithChildren[]
  depth: number
}
