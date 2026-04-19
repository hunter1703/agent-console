/**
 * Planning Mutations
 * 
 * Utility functions for mutating plan state based on planning tool calls.
 * Each function corresponds to a planning tool from the backend.
 */

import type { Plan, Task } from '@/types/planning'

/**
 * Create a new plan from create_plan tool arguments
 */
export function createPlanFromToolCall(args: Record<string, any>, timestamp?: number): Plan {
  // Generate task IDs for tasks that don't have them
  const tasksWithIds = (args.tasks || []).map((task: any, index: number) => ({
    ...task,
    taskId: task.taskId || task.task_id || `task-${index}-${Date.now()}`,
    name: task.name,
    goal: task.goal,
    description: task.description,
    status: 'TODO' as const,
    parentId: task.parentId || task.parent_id,
  }))
  
  return {
    planId: `plan-${Date.now()}`,
    title: args.title || 'Untitled Plan',
    goal: args.goal || '',
    status: 'TODO',
    tasks: tasksWithIds,
    createdTime: timestamp ? new Date(timestamp).toISOString() : new Date().toISOString(),
  }
}

/**
 * Update plan title and/or goal from update_plan tool
 */
export function updatePlanInfo(plan: Plan, args: Record<string, any>): Plan {
  return {
    ...plan,
    ...(args.title && { title: args.title }),
    ...(args.goal && { goal: args.goal }),
  }
}

/**
 * Add a new task to the plan from add_task tool
 */
export function addTaskToPlan(plan: Plan, args: Record<string, any>, result: any): Plan {
  const newTask: Task = {
    taskId: result.task_id || `task-${Date.now()}`,
    name: args.name,
    goal: args.goal,
    status: 'TODO',
    ...(args.description && { description: args.description }),
    ...(args.parent_id && { parentId: args.parent_id }),
  }
  
  return {
    ...plan,
    tasks: [...(plan.tasks || []), newTask],
  }
}

/**
 * Update task information from update_task_info tool
 */
export function updateTaskInfo(plan: Plan, args: Record<string, any>): Plan {
  const taskId = args.task_id
  
  return {
    ...plan,
    tasks: plan.tasks.map(task =>
      task.taskId === taskId
        ? {
            ...task,
            ...(args.name && { name: args.name }),
            ...(args.goal && { goal: args.goal }),
            ...(args.description && { description: args.description }),
          }
        : task
    ),
  }
}

/**
 * Mark a task as IN_PROGRESS from start_task tool
 * Also marks the plan as IN_PROGRESS if this is the first task started
 */
export function startTask(plan: Plan, args: Record<string, any>): Plan {
  const taskId = args.task_id
  const hasInProgressTasks = plan.tasks.some(t => t.status === 'IN_PROGRESS')
  
  return {
    ...plan,
    // Mark plan as IN_PROGRESS if this is the first task being started
    status: hasInProgressTasks || plan.status === 'IN_PROGRESS' ? plan.status : 'IN_PROGRESS',
    tasks: plan.tasks.map(task =>
      task.taskId === taskId
        ? { ...task, status: 'IN_PROGRESS' }
        : task
    ),
  }
}

/**
 * Complete a task from complete_task tool
 */
export function completeTask(plan: Plan, args: Record<string, any>): Plan {
  const taskId = args.task_id
  const status = args.status?.toUpperCase() === 'DONE' ? 'COMPLETED' : 'FAILED'
  const result = args.result
  
  return {
    ...plan,
    tasks: plan.tasks.map(task =>
      task.taskId === taskId
        ? { ...task, status, result }
        : task
    ),
  }
}

/**
 * Finish the entire plan from finish_plan tool
 */
export function finishPlan(plan: Plan, args: Record<string, any>): Plan {
  const status = args.status?.toUpperCase() === 'DONE' ? 'COMPLETED' : 'FAILED'
  const result = args.result
  
  return {
    ...plan,
    status,
    result,
  }
}

/**
 * Replace the entire plan from view_plan tool result
 */
export function replacePlanFromView(viewResult: any): Plan {
  // The view_plan tool returns the complete Plan object
  return viewResult as Plan
}
