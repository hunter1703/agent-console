/**
 * Planning Types
 * 
 * Type definitions for planning and task management.
 */

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'SKIPPED'

export interface Task {
  name: string
  goal: string
  description?: string
  status: TaskStatus
  parent?: string
}

export interface Plan {
  planId: string
  title: string
  goal: string
  status: TaskStatus
  tasks: Task[]
  createdTime?: string
}

export interface TaskWithChildren extends Task {
  children: TaskWithChildren[]
  depth: number
}
