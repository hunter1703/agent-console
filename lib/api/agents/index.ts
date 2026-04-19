/**
 * Agents API
 * 
 * All agent-related API calls.
 */

import { get, post, put, del } from '../client';
import type { Agent, PaginatedResult, Query } from '../types';

/**
 * List all agents
 */
export async function listAgents(query?: Query): Promise<PaginatedResult<Agent>> {
  const params = new URLSearchParams();
  
  if (query?.pageSize) params.append('pageSize', query.pageSize.toString());
  if (query?.pageNumber) params.append('pageNumber', query.pageNumber.toString());
  
  const queryString = params.toString();
  const endpoint = `/v1/agents${queryString ? `?${queryString}` : ''}`;
  
  return get<PaginatedResult<Agent>>(endpoint);
}

/**
 * Get agent by ID
 */
export async function getAgent(agentId: string): Promise<Agent> {
  return get<Agent>(`/v1/agents/${agentId}`);
}

/**
 * Create new agent
 */
export async function createAgent(agent: Partial<Agent>): Promise<Agent> {
  return post<Agent>('/v1/agents', agent);
}

/**
 * Update agent
 */
export async function updateAgent(agentId: string, updates: Partial<Agent>): Promise<Agent> {
  return put<Agent>(`/v1/agents/${agentId}`, updates);
}

/**
 * Delete agent
 */
export async function deleteAgent(agentId: string): Promise<void> {
  return del<void>(`/v1/agents/${agentId}`);
}

/**
 * Get agent name (cached)
 */
const agentNameCache = new Map<string, string>();

export async function getAgentName(agentId: string): Promise<string> {
  if (agentNameCache.has(agentId)) {
    return agentNameCache.get(agentId)!;
  }
  
  try {
    const agent = await getAgent(agentId);
    const name = agent.name || agent.agentId;
    agentNameCache.set(agentId, name);
    return name;
  } catch (error) {
    console.warn(`Failed to get agent name for ${agentId}:`, error);
    // Fallback to formatted agent ID
    const fallbackName = agentId
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    agentNameCache.set(agentId, fallbackName);
    return fallbackName;
  }
}

/**
 * Clear agent name cache
 */
export function clearAgentNameCache(): void {
  agentNameCache.clear();
}
