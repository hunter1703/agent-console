'use client'

/**
 * Session List Component
 * 
 * Hierarchical tree view of sessions with expand/collapse.
 * Supports nested sessions, sorting, and infinite scroll.
 * 
 * Design Philosophy:
 * - Clear visual hierarchy with depth indicators
 * - Smooth expand/collapse animations
 * - Efficient rendering for large lists
 */

import { motion } from 'framer-motion'
import { Plus, MessageSquare } from 'lucide-react'
import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { springPresets } from '@/lib/constants/animations'
import { SessionItem } from './SessionItem'
import { Skeleton } from '@/components/common/Skeleton'
import { Button } from '@/components/common/Button'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'

export interface Session {
  id: string
  sessionTitle: string
  agentName: string
  agentId?: string
  lastMessage?: string
  lastActivity: Date
  parentSessionId?: string
}

export interface SessionWithChildren extends Session {
  children?: SessionWithChildren[]
}

export interface SessionListProps {
  sessions: Session[]
  activeSessionId?: string
  isLoading?: boolean
  onSessionClick?: (sessionId: string) => void
  onSessionDelete?: (sessionId: string) => void
  onCreateSession?: () => void
  className?: string
}

// Build tree structure from flat array
function buildSessionTree(sessions: Session[]): SessionWithChildren[] {
  const sessionMap = new Map<string, SessionWithChildren>()
  const rootSessions: SessionWithChildren[] = []

  // Create map of all sessions
  sessions.forEach((session) => {
    sessionMap.set(session.id, { ...session, children: [] })
  })

  // Build tree structure
  sessions.forEach((session) => {
    const sessionWithChildren = sessionMap.get(session.id)!
    
    if (session.parentSessionId) {
      const parent = sessionMap.get(session.parentSessionId)
      if (parent) {
        parent.children = parent.children || []
        parent.children.push(sessionWithChildren)
      } else {
        // Parent not found, treat as root
        rootSessions.push(sessionWithChildren)
      }
    } else {
      rootSessions.push(sessionWithChildren)
    }
  })

  // Sort by lastActivity (most recent first)
  const sortByActivity = (a: SessionWithChildren, b: SessionWithChildren) =>
    b.lastActivity.getTime() - a.lastActivity.getTime()

  rootSessions.sort(sortByActivity)
  rootSessions.forEach((session) => {
    if (session.children) {
      session.children.sort(sortByActivity)
    }
  })

  return rootSessions
}

export function SessionList({
  sessions,
  activeSessionId,
  isLoading = false,
  onSessionClick,
  onSessionDelete,
  onCreateSession,
  className,
}: SessionListProps) {
  const { shouldAnimate } = useReducedMotion()
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  // Build tree structure
  const sessionTree = useMemo(() => buildSessionTree(sessions), [sessions])

  // Toggle expand/collapse
  const handleToggleExpand = (sessionId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(sessionId)) {
        next.delete(sessionId)
      } else {
        next.add(sessionId)
      }
      return next
    })
  }

  // Render session tree recursively
  const renderSession = (session: SessionWithChildren, depth = 0) => {
    const hasChildren = session.children && session.children.length > 0
    const isExpanded = expandedIds.has(session.id)

    return (
      <SessionItem
        key={session.id}
        id={session.id}
        sessionTitle={session.sessionTitle}
        agentName={session.agentName}
        agentId={session.agentId}
        lastMessage={session.lastMessage}
        lastActivity={session.lastActivity}
        childCount={session.children?.length || 0}
        depth={depth}
        isActive={session.id === activeSessionId}
        isExpanded={isExpanded}
        onClick={() => onSessionClick?.(session.id)}
        onToggleExpand={() => handleToggleExpand(session.id)}
        onDelete={() => onSessionDelete?.(session.id)}
      >
        {hasChildren && isExpanded && (
          <div>
            {session.children!.map((child) => renderSession(child, depth + 1))}
          </div>
        )}
      </SessionItem>
    )
  }

  // Stagger animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldAnimate ? 0.05 : 0,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: springPresets.default,
    },
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('space-y-2 p-4', className)}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="py-3">
            <div className="flex items-start gap-3">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-2 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Empty state
  if (sessions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={shouldAnimate ? springPresets.default : { duration: 0 }}
        className={cn(
          'flex flex-col items-center justify-center',
          'p-8 text-center',
          className
        )}
      >
        <div className="w-12 h-12 rounded-full bg-surface-elevated flex items-center justify-center mb-4">
          <MessageSquare size={24} className="text-text-tertiary" />
        </div>
        <h3 className="text-sm font-semibold text-text-primary mb-2">
          No conversations yet
        </h3>
        <p className="text-xs text-text-secondary mb-4 max-w-[200px]">
          Start a conversation with an agent to begin
        </p>
        {onCreateSession && (
          <Button
            size="sm"
            icon={<Plus size={16} />}
            onClick={onCreateSession}
          >
            New Chat
          </Button>
        )}
      </motion.div>
    )
  }

  // Session list
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn('space-y-1 px-3 py-2', className)}
    >
      {sessionTree.map((session) => (
        <motion.div
          key={session.id}
          variants={itemVariants}
        >
          {renderSession(session)}
        </motion.div>
      ))}
    </motion.div>
  )
}
