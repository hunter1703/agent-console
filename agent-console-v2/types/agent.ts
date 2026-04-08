/**
 * Agent Types
 * 
 * Type definitions for agents and agent-related data.
 */

export interface Agent {
  id: string
  name: string
  description?: string
  modelId: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  tools?: string[]
  createdAt: string
  updatedAt: string
}

export interface AgentRequest {
  name: string
  description?: string
  modelId: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  tools?: string[]
}

export interface AgentResponse {
  agent: Agent
}

export interface AgentListResponse {
  agents: Agent[]
}
