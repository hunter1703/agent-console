/**
 * Agent Store
 * 
 * Manages agent state and operations.
 */

import { create } from 'zustand'
import type { Agent } from '@/types/agent'

interface AgentState {
  // State
  agents: Agent[]
  selectedAgentId: string | null
  loading: boolean
  error: string | null
  
  // Actions
  setAgents: (agents: Agent[]) => void
  addAgent: (agent: Agent) => void
  updateAgent: (id: string, updates: Partial<Agent>) => void
  deleteAgent: (id: string) => void
  selectAgent: (id: string | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  fetchAgents: () => Promise<void>
  createAgentAsync: (data: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Agent>
  updateAgentAsync: (id: string, updates: Partial<Agent>) => Promise<void>
  deleteAgentAsync: (id: string) => Promise<void>
  
  // Selectors
  getAgentById: (id: string) => Agent | undefined
  getSelectedAgent: () => Agent | undefined
}

export const useAgentStore = create<AgentState>((set, get) => ({
  // Initial state
  agents: [],
  selectedAgentId: null,
  loading: false,
  error: null,
  
  // Actions
  setAgents: (agents) => set({ agents, error: null }),
  
  addAgent: (agent) => set((state) => ({ 
    agents: [...state.agents, agent],
    error: null,
  })),
  
  updateAgent: (id, updates) => set((state) => ({
    agents: state.agents.map((agent) =>
      agent.id === id ? { ...agent, ...updates } : agent
    ),
    error: null,
  })),
  
  deleteAgent: (id) => set((state) => ({
    agents: state.agents.filter((agent) => agent.id !== id),
    selectedAgentId: state.selectedAgentId === id ? null : state.selectedAgentId,
    error: null,
  })),
  
  selectAgent: (id) => set({ selectedAgentId: id }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  fetchAgents: async () => {
    set({ loading: true, error: null })
    try {
      const { agentService } = await import('@/lib/api/services')
      const agents = await agentService.list()
      set({ agents, loading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch agents',
        loading: false 
      })
    }
  },
  
  createAgentAsync: async (data) => {
    set({ loading: true, error: null })
    try {
      const { agentService } = await import('@/lib/api/services')
      const agent = await agentService.create(data)
      set((state) => ({
        agents: [...state.agents, agent],
        loading: false,
      }))
      return agent
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create agent',
        loading: false 
      })
      throw error
    }
  },
  
  updateAgentAsync: async (id, updates) => {
    set({ loading: true, error: null })
    try {
      const { agentService } = await import('@/lib/api/services')
      const updatedAgent = await agentService.update(id, updates)
      set((state) => ({
        agents: state.agents.map((agent) =>
          agent.id === id ? updatedAgent : agent
        ),
        loading: false,
      }))
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update agent',
        loading: false 
      })
      throw error
    }
  },
  
  deleteAgentAsync: async (id) => {
    set({ loading: true, error: null })
    try {
      const { agentService } = await import('@/lib/api/services')
      await agentService.delete(id)
      set((state) => ({
        agents: state.agents.filter((agent) => agent.id !== id),
        selectedAgentId: state.selectedAgentId === id ? null : state.selectedAgentId,
        loading: false,
      }))
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete agent',
        loading: false 
      })
      throw error
    }
  },
  
  // Selectors
  getAgentById: (id) => get().agents.find((agent) => agent.id === id),
  
  getSelectedAgent: () => {
    const { selectedAgentId, agents } = get()
    if (!selectedAgentId) return undefined
    return agents.find((agent) => agent.id === selectedAgentId)
  },
}))
