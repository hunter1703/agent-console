'use client'

/**
 * Task List Component
 * 
 * Renders hierarchical task tree with stagger animation.
 * Recursively renders nested tasks with proper indentation.
 */

import { motion } from 'framer-motion'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'
import { TaskItem } from './TaskItem'
import { buildTaskTree } from '@/lib/utils/planning'
import type { Task, TaskWithChildren } from '@/types/planning'

export interface TaskListProps {
  tasks: Task[]
  className?: string
}

function TaskTreeNode({ task, index }: { task: TaskWithChildren; index: number }) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.3,
        delay: prefersReducedMotion ? 0 : index * 0.05,
        ease: 'easeOut',
      }}
    >
      <TaskItem task={task} />
      
      {/* Render children recursively */}
      {task.children.length > 0 && (
        <div className="task-children">
          {task.children.map((child, i) => (
            <TaskTreeNode key={child.taskId} task={child} index={i} />
          ))}
        </div>
      )}
    </motion.div>
  )
}

export function TaskList({ tasks, className = '' }: TaskListProps) {
  const taskTree = buildTaskTree(tasks)

  if (taskTree.length === 0) {
    return (
      <div className={`task-list-empty text-center py-8 text-text-tertiary text-sm ${className}`}>
        No tasks yet
      </div>
    )
  }

  return (
    <div className={`task-list space-y-1 ${className}`}>
      {taskTree.map((task, index) => (
        <TaskTreeNode key={task.taskId} task={task} index={index} />
      ))}
    </div>
  )
}
