/**
 * Planning Types
 * 
 * Type definitions for planning and task management.
 */

export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'failed' | 'skipped'

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  parentTaskId?: string
  order: number
  progress?: number
  startedAt?: string
  completedAt?: string
  error?: string
}

export interface PlanningState {
  sessionId: string
  tasks: Task[]
  overallProgress: number
  isPlanning: boolean
  lastUpdated: string
}

export interface TaskWithChildren extends Task {
  children: TaskWithChildren[]
  depth: number
}
