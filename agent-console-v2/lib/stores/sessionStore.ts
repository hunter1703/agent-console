/**
 * Session Store
 * 
 * Manages session state with hierarchy support.
 */

import { create } from 'zustand'
import type { Session, SessionWithChildren } from '@/types/session'

interface SessionState {
  // State
  sessions: Session[]
  selectedSessionId: string | null
  expandedSessionIds: Set<string>
  loading: boolean
  error: string | null
  
  // Actions
  setSessions: (sessions: Session[]) => void
  setSessionsAction: (sessions: Session[]) => void // Alias for tests
  addSession: (session: Session) => void
  updateSession: (id: string, updates: Partial<Session>) => void
  deleteSession: (id: string) => void
  selectSession: (id: string | null) => void
  toggleSessionExpanded: (id: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  fetchSessions: (agentId?: string) => Promise<void>
  
  // Selectors
  getSessionById: (id: string) => Session | undefined
  getSelectedSession: () => Session | undefined
  getSessionsByAgent: (agentId: string) => Session[]
  getSessionHierarchy: () => SessionWithChildren[]
  getSessionTree: () => SessionWithChildren[] // Alias for getSessionHierarchy
  getChildSessions: (parentId: string) => Session[]
}

export const useSessionStore = create<SessionState>((set, get) => ({
  // Initial state
  sessions: [],
  selectedSessionId: null,
  expandedSessionIds: new Set(),
  loading: false,
  error: null,
  
  // Actions
  setSessions: (sessions) => set({ sessions, error: null }),
  
  setSessionsAction: (sessions) => set({ sessions, error: null }), // Alias for tests
  
  addSession: (session) => set((state) => ({
    sessions: [...state.sessions, session],
    error: null,
  })),
  
  updateSession: (id, updates) => set((state) => ({
    sessions: state.sessions.map((session) =>
      session.id === id ? { ...session, ...updates } : session
    ),
    error: null,
  })),
  
  deleteSession: (id) => set((state) => {
    // Also delete child sessions
    const childIds = state.sessions
      .filter((s) => s.parentSessionId === id)
      .map((s) => s.id)
    
    const idsToDelete = new Set([id, ...childIds])
    
    return {
      sessions: state.sessions.filter((s) => !idsToDelete.has(s.id)),
      selectedSessionId: state.selectedSessionId === id ? null : state.selectedSessionId,
      error: null,
    }
  }),
  
  selectSession: (id) => set({ selectedSessionId: id }),
  
  toggleSessionExpanded: (id) => set((state) => {
    const newExpanded = new Set(state.expandedSessionIds)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    return { expandedSessionIds: newExpanded }
  }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  fetchSessions: async (agentId?: string) => {
    set({ loading: true, error: null })
    try {
      const { apiClient } = await import('@/lib/api/client')
      const sessions = await apiClient.listSessions()
      // Filter by agentId if provided
      const filteredSessions = agentId 
        ? sessions.filter(s => s.agentId === agentId)
        : sessions
      set({ sessions: filteredSessions, loading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch sessions',
        loading: false 
      })
    }
  },
  
  // Selectors
  getSessionById: (id) => get().sessions.find((session) => session.id === id),
  
  getSelectedSession: () => {
    const { selectedSessionId, sessions } = get()
    if (!selectedSessionId) return undefined
    return sessions.find((session) => session.id === selectedSessionId)
  },
  
  getSessionsByAgent: (agentId) => 
    get().sessions.filter((session) => session.agentId === agentId),
  
  getSessionHierarchy: () => {
    const { sessions } = get()
    
    // Build hierarchy recursively
    const buildTree = (parentId: string | undefined, depth: number): SessionWithChildren[] => {
      return sessions
        .filter((s) => s.parentSessionId === parentId)
        .map((session) => ({
          ...session,
          children: buildTree(session.id, depth + 1),
          depth,
        }))
        .sort((a, b) => 
          new Date(b.lastMessageAt || b.createdAt).getTime() - 
          new Date(a.lastMessageAt || a.createdAt).getTime()
        )
    }
    
    return buildTree(undefined, 0)
  },
  
  getSessionTree: () => get().getSessionHierarchy(), // Alias for tests
  
  getChildSessions: (parentId) =>
    get().sessions.filter((session) => session.parentSessionId === parentId),
}))
