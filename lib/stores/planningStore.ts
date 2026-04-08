/**
 * Planning Store
 * 
 * Manages planning state and task hierarchy.
 */

import { create } from 'zustand'
import type { PlanningState, Task, TaskWithChildren } from '@/types/planning'

interface PlanningStoreState {
  // State
  planningBySession: Record<string, PlanningState>
  expandedTaskIds: Set<string>
  
  // Actions
  setPlanningState: (sessionId: string, planning: PlanningState) => void
  updatePlanningState: (sessionId: string, updates: Partial<PlanningState>) => void
  addTask: (sessionId: string, task: Task) => void
  updateTask: (sessionId: string, taskId: string, updates: Partial<Task>) => void
  updateTaskStatus: (sessionId: string, taskId: string, status: Task['status']) => void
  deleteTask: (sessionId: string, taskId: string) => void
  clearPlanning: (sessionId: string) => void
  toggleTaskExpanded: (taskId: string) => void
  
  // Selectors
  getPlanningState: (sessionId: string) => PlanningState | undefined
  getTasks: (sessionId: string) => Task[]
  getTaskById: (sessionId: string, taskId: string) => Task | undefined
  getTaskHierarchy: (sessionId: string) => TaskWithChildren[]
  getChildTasks: (sessionId: string, parentTaskId: string) => Task[]
  calculateProgress: (sessionId: string) => number
}

export const usePlanningStore = create<PlanningStoreState>((set, get) => ({
  // Initial state
  planningBySession: {},
  expandedTaskIds: new Set(),
  
  // Actions
  setPlanningState: (sessionId, planning) => set((state) => ({
    planningBySession: {
      ...state.planningBySession,
      [sessionId]: planning,
    },
  })),
  
  updatePlanningState: (sessionId, updates) => set((state) => {
    const existing = state.planningBySession[sessionId]
    if (!existing) return state
    
    return {
      planningBySession: {
        ...state.planningBySession,
        [sessionId]: {
          ...existing,
          ...updates,
          lastUpdated: new Date().toISOString(),
        },
      },
    }
  }),
  
  addTask: (sessionId, task) => set((state) => {
    const planning = state.planningBySession[sessionId]
    if (!planning) return state
    
    return {
      planningBySession: {
        ...state.planningBySession,
        [sessionId]: {
          ...planning,
          tasks: [...planning.tasks, task],
          lastUpdated: new Date().toISOString(),
        },
      },
    }
  }),
  
  updateTask: (sessionId, taskId, updates) => set((state) => {
    const planning = state.planningBySession[sessionId]
    if (!planning) return state
    
    return {
      planningBySession: {
        ...state.planningBySession,
        [sessionId]: {
          ...planning,
          tasks: planning.tasks.map((task) =>
            task.id === taskId ? { ...task, ...updates } : task
          ),
          lastUpdated: new Date().toISOString(),
        },
      },
    }
  }),
  
  updateTaskStatus: (sessionId, taskId, status) => {
    const updates: Partial<Task> = { status }
    
    if (status === 'in-progress' && !get().getTaskById(sessionId, taskId)?.startedAt) {
      updates.startedAt = new Date().toISOString()
    }
    
    if ((status === 'completed' || status === 'failed' || status === 'skipped') && 
        !get().getTaskById(sessionId, taskId)?.completedAt) {
      updates.completedAt = new Date().toISOString()
    }
    
    get().updateTask(sessionId, taskId, updates)
    
    // Recalculate overall progress
    const progress = get().calculateProgress(sessionId)
    get().updatePlanningState(sessionId, { overallProgress: progress })
  },
  
  deleteTask: (sessionId, taskId) => set((state) => {
    const planning = state.planningBySession[sessionId]
    if (!planning) return state
    
    // Also delete child tasks
    const childIds = planning.tasks
      .filter((t) => t.parentTaskId === taskId)
      .map((t) => t.id)
    
    const idsToDelete = new Set([taskId, ...childIds])
    
    return {
      planningBySession: {
        ...state.planningBySession,
        [sessionId]: {
          ...planning,
          tasks: planning.tasks.filter((t) => !idsToDelete.has(t.id)),
          lastUpdated: new Date().toISOString(),
        },
      },
    }
  }),
  
  clearPlanning: (sessionId) => set((state) => {
    const newState = { ...state.planningBySession }
    delete newState[sessionId]
    return { planningBySession: newState }
  }),
  
  toggleTaskExpanded: (taskId) => set((state) => {
    const newExpanded = new Set(state.expandedTaskIds)
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId)
    } else {
      newExpanded.add(taskId)
    }
    return { expandedTaskIds: newExpanded }
  }),
  
  // Selectors
  getPlanningState: (sessionId) => get().planningBySession[sessionId],
  
  getTasks: (sessionId) => {
    const planning = get().planningBySession[sessionId]
    return planning?.tasks || []
  },
  
  getTaskById: (sessionId, taskId) => {
    const tasks = get().getTasks(sessionId)
    return tasks.find((task) => task.id === taskId)
  },
  
  getTaskHierarchy: (sessionId) => {
    const tasks = get().getTasks(sessionId)
    
    // Build hierarchy recursively
    const buildTree = (parentId: string | undefined, depth: number): TaskWithChildren[] => {
      return tasks
        .filter((t) => t.parentTaskId === parentId)
        .sort((a, b) => a.order - b.order)
        .map((task) => ({
          ...task,
          children: buildTree(task.id, depth + 1),
          depth,
        }))
    }
    
    return buildTree(undefined, 0)
  },
  
  getChildTasks: (sessionId, parentTaskId) => {
    const tasks = get().getTasks(sessionId)
    return tasks.filter((task) => task.parentTaskId === parentTaskId)
  },
  
  calculateProgress: (sessionId) => {
    const tasks = get().getTasks(sessionId)
    if (tasks.length === 0) return 0
    
    const completedCount = tasks.filter((t) => 
      t.status === 'completed' || t.status === 'skipped'
    ).length
    
    return Math.round((completedCount / tasks.length) * 100)
  },
}))
