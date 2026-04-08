/**
 * Session Types
 * 
 * Type definitions for sessions and session hierarchy.
 */

export interface Session {
  id: string
  agentId: string
  parentSessionId?: string
  title?: string
  status: 'active' | 'completed' | 'failed'
  createdAt: string
  updatedAt: string
  lastMessageAt?: string
}

export interface SessionRequest {
  agentId: string
  parentSessionId?: string
  title?: string
}

export interface SessionResponse {
  session: Session
}

export interface SessionListResponse {
  sessions: Session[]
}

export interface SessionWithChildren extends Session {
  children: SessionWithChildren[]
  depth: number
}
