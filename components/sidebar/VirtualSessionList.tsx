'use client'

/**
 * Virtual Session List Component
 * 
 * High-performance session list using virtual scrolling.
 * Only renders visible sessions for optimal performance with 100+ sessions.
 * 
 * Performance:
 * - Virtual scrolling with @tanstack/react-virtual
 * - Dynamic height estimation based on depth
 * - 5 items overscan for smooth scrolling
 */

import { motion } from 'framer-motion'
import { Plus, MessageSquare } from 'lucide-react'
import { useState, useMemo, useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { cn } from '@/lib/utils'
import { springPresets } from '@/lib/constants/animations'
import { SessionItem } from './SessionItem'
import { Skeleton } from '@/components/common/Skeleton'
import { Button } from '@/components/common/Button'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'

export interface Session {
  id: string
  agentName: string
  agentAvatarUrl?: string
  lastMessage?: string
  lastActivity: Date
  parentSessionId?: string
}

export interface SessionWithChildren extends Session {
  children?: SessionWithChildren[]
  depth?: number
}

export interface VirtualSessionListProps {
  sessions: Session[]
  activeSessionId?: string
  isLoading?: boolean
  onSessionClick?: (sessionId: string) => void
  onSessionDelete?: (sessionId: string) => void
  onCreateSession?: () => void
  className?: string
}

// Build tree structure and flatten for virtual scrolling
function buildFlatSessionList(sessions: Session[]): SessionWithChildren[] {
  const sessionMap = new Map<string, SessionWithChildren>()
  const rootSessions: SessionWithChildren[] = []

  // Create map of all sessions
  sessions.forEach((session) => {
    sessionMap.set(session.id, { ...session, children: [], depth: 0 })
  })

  // Build tree structure
  sessions.forEach((session) => {
    const sessionWithChildren = sessionMap.get(session.id)!
    
    if (session.parentSessionId) {
      const parent = sessionMap.get(session.parentSessionId)
      if (parent) {
        parent.children = parent.children || []
        parent.children.push(sessionWithChildren)
        sessionWithChildren.depth = (parent.depth || 0) + 1
      } else {
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

  // Flatten tree for virtual scrolling
  const flatList: SessionWithChildren[] = []
  const flatten = (session: SessionWithChildren, expandedIds: Set<string>) => {
    flatList.push(session)
    if (session.children && expandedIds.has(session.id)) {
      session.children.forEach((child) => flatten(child, expandedIds))
    }
  }

  return rootSessions
}

export function VirtualSessionList({
  sessions,
  activeSessionId,
  isLoading = false,
  onSessionClick,
  onSessionDelete,
  onCreateSession,
  className,
}: VirtualSessionListProps) {
  const { shouldAnimate } = useReducedMotion()
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const parentRef = useRef<HTMLDivElement>(null)

  // Build flat list for virtual scrolling
  const flatSessionList = useMemo(() => {
    const sessionTree = buildFlatSessionList(sessions)
    const flatList: SessionWithChildren[] = []
    
    const flatten = (session: SessionWithChildren) => {
      flatList.push(session)
      if (session.children && expandedIds.has(session.id)) {
        session.children.forEach((child) => flatten(child))
      }
    }
    
    sessionTree.forEach((session) => flatten(session))
    return flatList
  }, [sessions, expandedIds])

  // Virtual scrolling setup
  const virtualizer = useVirtualizer({
    count: flatSessionList.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => {
      // Estimate height based on depth and content
      const session = flatSessionList[index]
      const baseHeight = 60
      const depthOffset = (session.depth || 0) * 4
      return baseHeight + depthOffset
    },
    overscan: 5,
  })

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

  const virtualItems = virtualizer.getVirtualItems()

  // Session list with virtual scrolling
  return (
    <div
      ref={parentRef}
      className={cn('h-full overflow-y-auto overflow-x-hidden p-2', className)}
      style={{
        contain: 'strict',
      }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualItem) => {
          const session = flatSessionList[virtualItem.index]
          const hasChildren = session.children && session.children.length > 0
          const isExpanded = expandedIds.has(session.id)

          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <SessionItem
                id={session.id}
                agentName={session.agentName}
                agentAvatarUrl={session.agentAvatarUrl}
                lastMessage={session.lastMessage}
                lastActivity={session.lastActivity}
                childCount={session.children?.length || 0}
                depth={session.depth || 0}
                isActive={session.id === activeSessionId}
                isExpanded={isExpanded}
                onClick={() => onSessionClick?.(session.id)}
                onToggleExpand={hasChildren ? () => handleToggleExpand(session.id) : undefined}
                onDelete={() => onSessionDelete?.(session.id)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
