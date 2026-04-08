import { describe, it, expect, beforeEach } from 'vitest'
import { usePlanningStore } from '../planningStore'
import type { PlanningState, Task } from '@/types/planning'

describe('planningStore', () => {
  beforeEach(() => {
    // Reset store before each test
    usePlanningStore.setState({
      planningBySession: {},
      expandedTaskIds: new Set(),
    })
  })

  describe('Initialization', () => {
    it('should initialize with empty state', () => {
      const state = usePlanningStore.getState()
      expect(state.planningBySession).toEqual({})
      expect(state.expandedTaskIds).toEqual(new Set())
    })
  })

  describe('Planning State Management', () => {
    const sessionId = 'session-1'
    const planningState: PlanningState = {
      status: 'planning',
      tasks: [],
      overallProgress: 0,
      lastUpdated: new Date().toISOString(),
    }

    it('should set planning state', () => {
      usePlanningStore.getState().setPlanningState(sessionId, planningState)
      const state = usePlanningStore.getState().getPlanningState(sessionId)
      expect(state).toEqual(planningState)
    })

    it('should update planning state', () => {
      usePlanningStore.getState().setPlanningState(sessionId, planningState)
      usePlanningStore.getState().updatePlanningState(sessionId, { status: 'executing' })

      const state = usePlanningStore.getState().getPlanningState(sessionId)
      expect(state?.status).toBe('executing')
    })

    it('should update lastUpdated when updating planning state', () => {
      usePlanningStore.getState().setPlanningState(sessionId, planningState)
      const originalTimestamp = planningState.lastUpdated

      // Wait a bit to ensure timestamp changes
      setTimeout(() => {
        usePlanningStore.getState().updatePlanningState(sessionId, { status: 'executing' })
        const state = usePlanningStore.getState().getPlanningState(sessionId)
        expect(state?.lastUpdated).not.toBe(originalTimestamp)
      }, 10)
    })

    it('should clear planning state', () => {
      usePlanningStore.getState().setPlanningState(sessionId, planningState)
      usePlanningStore.getState().clearPlanning(sessionId)

      const state = usePlanningStore.getState().getPlanningState(sessionId)
      expect(state).toBeUndefined()
    })
  })

  describe('Task Management', () => {
    const sessionId = 'session-1'
    const task: Task = {
      id: 'task-1',
      title: 'Test Task',
      description: 'Test description',
      status: 'pending',
      order: 0,
    }

    beforeEach(() => {
      const planningState: PlanningState = {
        status: 'planning',
        tasks: [],
        overallProgress: 0,
        lastUpdated: new Date().toISOString(),
      }
      usePlanningStore.getState().setPlanningState(sessionId, planningState)
    })

    it('should add task', () => {
      usePlanningStore.getState().addTask(sessionId, task)
      const tasks = usePlanningStore.getState().getTasks(sessionId)
      expect(tasks).toHaveLength(1)
      expect(tasks[0]).toEqual(task)
    })

    it('should add multiple tasks', () => {
      const task2: Task = {
        id: 'task-2',
        title: 'Second Task',
        status: 'pending',
        order: 1,
      }

      usePlanningStore.getState().addTask(sessionId, task)
      usePlanningStore.getState().addTask(sessionId, task2)

      const tasks = usePlanningStore.getState().getTasks(sessionId)
      expect(tasks).toHaveLength(2)
    })

    it('should update task', () => {
      usePlanningStore.getState().addTask(sessionId, task)
      usePlanningStore.getState().updateTask(sessionId, 'task-1', { 
        title: 'Updated Title' 
      })

      const updated = usePlanningStore.getState().getTaskById(sessionId, 'task-1')
      expect(updated?.title).toBe('Updated Title')
    })

    it('should update task status', () => {
      usePlanningStore.getState().addTask(sessionId, task)
      usePlanningStore.getState().updateTaskStatus(sessionId, 'task-1', 'in-progress')

      const updated = usePlanningStore.getState().getTaskById(sessionId, 'task-1')
      expect(updated?.status).toBe('in-progress')
    })

    it('should set startedAt when status changes to in-progress', () => {
      usePlanningStore.getState().addTask(sessionId, task)
      usePlanningStore.getState().updateTaskStatus(sessionId, 'task-1', 'in-progress')

      const updated = usePlanningStore.getState().getTaskById(sessionId, 'task-1')
      expect(updated?.startedAt).toBeDefined()
    })

    it('should set completedAt when status changes to completed', () => {
      usePlanningStore.getState().addTask(sessionId, task)
      usePlanningStore.getState().updateTaskStatus(sessionId, 'task-1', 'completed')

      const updated = usePlanningStore.getState().getTaskById(sessionId, 'task-1')
      expect(updated?.completedAt).toBeDefined()
    })

    it('should set completedAt when status changes to failed', () => {
      usePlanningStore.getState().addTask(sessionId, task)
      usePlanningStore.getState().updateTaskStatus(sessionId, 'task-1', 'failed')

      const updated = usePlanningStore.getState().getTaskById(sessionId, 'task-1')
      expect(updated?.completedAt).toBeDefined()
    })

    it('should set completedAt when status changes to skipped', () => {
      usePlanningStore.getState().addTask(sessionId, task)
      usePlanningStore.getState().updateTaskStatus(sessionId, 'task-1', 'skipped')

      const updated = usePlanningStore.getState().getTaskById(sessionId, 'task-1')
      expect(updated?.completedAt).toBeDefined()
    })

    it('should delete task', () => {
      usePlanningStore.getState().addTask(sessionId, task)
      usePlanningStore.getState().deleteTask(sessionId, 'task-1')

      const tasks = usePlanningStore.getState().getTasks(sessionId)
      expect(tasks).toHaveLength(0)
    })

    it('should delete child tasks when deleting parent', () => {
      const parentTask: Task = {
        id: 'parent',
        title: 'Parent',
        status: 'pending',
        order: 0,
      }

      const childTask: Task = {
        id: 'child',
        title: 'Child',
        status: 'pending',
        order: 0,
        parentTaskId: 'parent',
      }

      usePlanningStore.getState().addTask(sessionId, parentTask)
      usePlanningStore.getState().addTask(sessionId, childTask)
      usePlanningStore.getState().deleteTask(sessionId, 'parent')

      const tasks = usePlanningStore.getState().getTasks(sessionId)
      expect(tasks).toHaveLength(0)
    })
  })

  describe('Task Selectors', () => {
    const sessionId = 'session-1'

    beforeEach(() => {
      const planningState: PlanningState = {
        status: 'planning',
        tasks: [],
        overallProgress: 0,
        lastUpdated: new Date().toISOString(),
      }
      usePlanningStore.getState().setPlanningState(sessionId, planningState)
    })

    it('should get tasks for session', () => {
      const task: Task = {
        id: 'task-1',
        title: 'Test',
        status: 'pending',
        order: 0,
      }

      usePlanningStore.getState().addTask(sessionId, task)
      const tasks = usePlanningStore.getState().getTasks(sessionId)
      expect(tasks).toHaveLength(1)
    })

    it('should return empty array for non-existent session', () => {
      const tasks = usePlanningStore.getState().getTasks('non-existent')
      expect(tasks).toEqual([])
    })

    it('should get task by id', () => {
      const task: Task = {
        id: 'task-1',
        title: 'Test',
        status: 'pending',
        order: 0,
      }

      usePlanningStore.getState().addTask(sessionId, task)
      const found = usePlanningStore.getState().getTaskById(sessionId, 'task-1')
      expect(found).toEqual(task)
    })

    it('should return undefined for non-existent task', () => {
      const found = usePlanningStore.getState().getTaskById(sessionId, 'non-existent')
      expect(found).toBeUndefined()
    })

    it('should get child tasks', () => {
      const parentTask: Task = {
        id: 'parent',
        title: 'Parent',
        status: 'pending',
        order: 0,
      }

      const childTask1: Task = {
        id: 'child-1',
        title: 'Child 1',
        status: 'pending',
        order: 0,
        parentTaskId: 'parent',
      }

      const childTask2: Task = {
        id: 'child-2',
        title: 'Child 2',
        status: 'pending',
        order: 1,
        parentTaskId: 'parent',
      }

      usePlanningStore.getState().addTask(sessionId, parentTask)
      usePlanningStore.getState().addTask(sessionId, childTask1)
      usePlanningStore.getState().addTask(sessionId, childTask2)

      const children = usePlanningStore.getState().getChildTasks(sessionId, 'parent')
      expect(children).toHaveLength(2)
    })
  })

  describe('Task Hierarchy', () => {
    const sessionId = 'session-1'

    beforeEach(() => {
      const planningState: PlanningState = {
        status: 'planning',
        tasks: [],
        overallProgress: 0,
        lastUpdated: new Date().toISOString(),
      }
      usePlanningStore.getState().setPlanningState(sessionId, planningState)
    })

    it('should build task hierarchy', () => {
      const tasks: Task[] = [
        { id: 'task-1', title: 'Task 1', status: 'pending', order: 0 },
        { id: 'task-2', title: 'Task 2', status: 'pending', order: 1 },
        { id: 'task-1-1', title: 'Task 1.1', status: 'pending', order: 0, parentTaskId: 'task-1' },
        { id: 'task-1-2', title: 'Task 1.2', status: 'pending', order: 1, parentTaskId: 'task-1' },
      ]

      tasks.forEach(task => usePlanningStore.getState().addTask(sessionId, task))

      const hierarchy = usePlanningStore.getState().getTaskHierarchy(sessionId)
      expect(hierarchy).toHaveLength(2) // Two root tasks
      expect(hierarchy[0].children).toHaveLength(2) // First task has 2 children
      expect(hierarchy[0].depth).toBe(0)
      expect(hierarchy[0].children[0].depth).toBe(1)
    })

    it('should sort tasks by order', () => {
      const tasks: Task[] = [
        { id: 'task-2', title: 'Task 2', status: 'pending', order: 1 },
        { id: 'task-1', title: 'Task 1', status: 'pending', order: 0 },
        { id: 'task-3', title: 'Task 3', status: 'pending', order: 2 },
      ]

      tasks.forEach(task => usePlanningStore.getState().addTask(sessionId, task))

      const hierarchy = usePlanningStore.getState().getTaskHierarchy(sessionId)
      expect(hierarchy[0].id).toBe('task-1')
      expect(hierarchy[1].id).toBe('task-2')
      expect(hierarchy[2].id).toBe('task-3')
    })

    it('should handle deeply nested tasks', () => {
      const tasks: Task[] = [
        { id: 'level-0', title: 'Level 0', status: 'pending', order: 0 },
        { id: 'level-1', title: 'Level 1', status: 'pending', order: 0, parentTaskId: 'level-0' },
        { id: 'level-2', title: 'Level 2', status: 'pending', order: 0, parentTaskId: 'level-1' },
      ]

      tasks.forEach(task => usePlanningStore.getState().addTask(sessionId, task))

      const hierarchy = usePlanningStore.getState().getTaskHierarchy(sessionId)
      expect(hierarchy[0].depth).toBe(0)
      expect(hierarchy[0].children[0].depth).toBe(1)
      expect(hierarchy[0].children[0].children[0].depth).toBe(2)
    })
  })

  describe('Progress Calculation', () => {
    const sessionId = 'session-1'

    beforeEach(() => {
      const planningState: PlanningState = {
        status: 'planning',
        tasks: [],
        overallProgress: 0,
        lastUpdated: new Date().toISOString(),
      }
      usePlanningStore.getState().setPlanningState(sessionId, planningState)
    })

    it('should calculate 0% for no tasks', () => {
      const progress = usePlanningStore.getState().calculateProgress(sessionId)
      expect(progress).toBe(0)
    })

    it('should calculate 0% for all pending tasks', () => {
      const tasks: Task[] = [
        { id: 'task-1', title: 'Task 1', status: 'pending', order: 0 },
        { id: 'task-2', title: 'Task 2', status: 'pending', order: 1 },
      ]

      tasks.forEach(task => usePlanningStore.getState().addTask(sessionId, task))

      const progress = usePlanningStore.getState().calculateProgress(sessionId)
      expect(progress).toBe(0)
    })

    it('should calculate 50% for half completed', () => {
      const tasks: Task[] = [
        { id: 'task-1', title: 'Task 1', status: 'completed', order: 0 },
        { id: 'task-2', title: 'Task 2', status: 'pending', order: 1 },
      ]

      tasks.forEach(task => usePlanningStore.getState().addTask(sessionId, task))

      const progress = usePlanningStore.getState().calculateProgress(sessionId)
      expect(progress).toBe(50)
    })

    it('should calculate 100% for all completed', () => {
      const tasks: Task[] = [
        { id: 'task-1', title: 'Task 1', status: 'completed', order: 0 },
        { id: 'task-2', title: 'Task 2', status: 'completed', order: 1 },
      ]

      tasks.forEach(task => usePlanningStore.getState().addTask(sessionId, task))

      const progress = usePlanningStore.getState().calculateProgress(sessionId)
      expect(progress).toBe(100)
    })

    it('should count skipped tasks as completed', () => {
      const tasks: Task[] = [
        { id: 'task-1', title: 'Task 1', status: 'completed', order: 0 },
        { id: 'task-2', title: 'Task 2', status: 'skipped', order: 1 },
      ]

      tasks.forEach(task => usePlanningStore.getState().addTask(sessionId, task))

      const progress = usePlanningStore.getState().calculateProgress(sessionId)
      expect(progress).toBe(100)
    })

    it('should update overall progress when task status changes', () => {
      const tasks: Task[] = [
        { id: 'task-1', title: 'Task 1', status: 'pending', order: 0 },
        { id: 'task-2', title: 'Task 2', status: 'pending', order: 1 },
      ]

      tasks.forEach(task => usePlanningStore.getState().addTask(sessionId, task))

      usePlanningStore.getState().updateTaskStatus(sessionId, 'task-1', 'completed')

      const state = usePlanningStore.getState().getPlanningState(sessionId)
      expect(state?.overallProgress).toBe(50)
    })
  })

  describe('Task Expansion', () => {
    it('should toggle task expanded state', () => {
      usePlanningStore.getState().toggleTaskExpanded('task-1')
      expect(usePlanningStore.getState().expandedTaskIds.has('task-1')).toBe(true)

      usePlanningStore.getState().toggleTaskExpanded('task-1')
      expect(usePlanningStore.getState().expandedTaskIds.has('task-1')).toBe(false)
    })

    it('should track multiple expanded tasks', () => {
      usePlanningStore.getState().toggleTaskExpanded('task-1')
      usePlanningStore.getState().toggleTaskExpanded('task-2')

      expect(usePlanningStore.getState().expandedTaskIds.has('task-1')).toBe(true)
      expect(usePlanningStore.getState().expandedTaskIds.has('task-2')).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('should handle updating non-existent planning state', () => {
      usePlanningStore.getState().updatePlanningState('non-existent', { status: 'executing' })
      // Should not throw
      expect(usePlanningStore.getState().getPlanningState('non-existent')).toBeUndefined()
    })

    it('should handle adding task to non-existent session', () => {
      const task: Task = {
        id: 'task-1',
        title: 'Test',
        status: 'pending',
        order: 0,
      }

      usePlanningStore.getState().addTask('non-existent', task)
      // Should not throw
      expect(usePlanningStore.getState().getTasks('non-existent')).toEqual([])
    })

    it('should handle updating non-existent task', () => {
      const sessionId = 'session-1'
      const planningState: PlanningState = {
        status: 'planning',
        tasks: [],
        overallProgress: 0,
        lastUpdated: new Date().toISOString(),
      }

      usePlanningStore.getState().setPlanningState(sessionId, planningState)
      usePlanningStore.getState().updateTask(sessionId, 'non-existent', { title: 'Updated' })

      // Should not throw
      expect(usePlanningStore.getState().getTasks(sessionId)).toHaveLength(0)
    })
  })
})
