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
  const tasks = (args.tasks || []).map((task: any, index: number) => ({
    name: task.name || task.task || `Task ${index + 1}`,
    goal: task.goal || '',
    description: task.description,
    status: 'TODO' as const,
    parent: task.parent,
  }))
  
  return {
    planId: `plan-${Date.now()}`,
    title: args.title || 'Untitled Plan',
    goal: args.goal || '',
    status: 'TODO',
    tasks,
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
  const name = args.name || args.task || result?.task || ''
  const parent = args.parent
  const newTask: Task = {
    name,
    goal: args.goal,
    status: 'TODO',
    ...(args.description && { description: args.description }),
    ...(parent && { parent }),
  }
  
  return {
    ...plan,
    tasks: [...(plan.tasks || []), newTask],
  }
}



/**
 * Complete a task from complete_task tool
 */
export function completeTask(plan: Plan, args: Record<string, any>, resultObj?: any): Plan {
  const taskName = resultObj?.completed_task || args.task || args.name
  const status = (args.status?.toUpperCase() === 'FAILED' || args.status?.toUpperCase() === 'ABANDONED') ? 'FAILED' : 'COMPLETED'

  let updatedTasks: Task[] = plan.tasks.map(task =>
    task.name === taskName
      ? { ...task, status }
      : task
  )

  const isPlanFinished = resultObj?.plan_finished || (updatedTasks.length > 0 && updatedTasks.every(t => t.status === 'COMPLETED' || t.status === 'FAILED'))
  const planStatus = resultObj?.plan_status?.toUpperCase() === 'ABANDONED' ? 'FAILED' : 'COMPLETED'

  if (!isPlanFinished) {
    if (Array.isArray(resultObj?.active_lineage)) {
      const lineageSet = new Set(
        resultObj.active_lineage.map((t: any) => (typeof t === 'string' ? t : t?.name))
      )
      updatedTasks = updatedTasks.map(task => {
        if (lineageSet.has(task.name)) {
          return { ...task, status: 'IN_PROGRESS' as const }
        }
        return task
      })
    } else if (resultObj?.next_task) {
      const nextTaskName =
        typeof resultObj.next_task === 'string' ? resultObj.next_task : resultObj.next_task?.name
      updatedTasks = updatedTasks.map(task => {
        if (task.name === nextTaskName) {
          return { ...task, status: 'IN_PROGRESS' as const }
        }
        return task
      })
    }
  }

  return {
    ...plan,
    status: isPlanFinished ? planStatus : 'IN_PROGRESS',
    tasks: updatedTasks,
  }
}

/**
 * Finish the entire plan from finish_plan tool
 */
export function finishPlan(plan: Plan, args: Record<string, any>): Plan {
  const status = args.status?.toUpperCase() === 'DONE' ? 'COMPLETED' : 'FAILED'

  return {
    ...plan,
    status,
  }
}

/**
 * Replace the entire plan from view_plan tool result
 */
export function replacePlanFromView(viewResult: any): Plan {
  return viewResult as Plan
}
