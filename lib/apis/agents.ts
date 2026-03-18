/**
 * Agents API Module
 * Handles agent-specific operations
 */

import { AgentConfig } from '@/models/Agent';
import { catalogList, catalogGetById, catalogCreate, catalogUpdate, catalogDelete, CatalogResult } from './catalog';
import { API_CONFIG } from '../config';

const API_BASE = API_CONFIG.BASE_URL;

// ============================================================================
// Types
// ============================================================================

export interface AgentPage {
    agents: AgentConfig[];
    hasMore: boolean;
    total: number;
}

// ============================================================================
// Functions
// ============================================================================

/**
 * Fetch a list of agents with pagination
 */
export async function fetchAgents(options?: { offset?: number; limit?: number }): Promise<AgentPage> {
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? 20;

    try {
        const result: CatalogResult = await catalogList({
            assetType: 'agent',
            query: {
                page: { offset, limit },
            },
        });

        const agents = (result.items || []).map(mapAgent);
        return {
            agents,
            hasMore: result.hasMore ?? false,
            total: result.total ?? agents.length,
        };
    } catch (error) {
        console.error('Error fetching agents:', error);
        throw new Error('Failed to fetch agents');
    }
}

/**
 * Fetch a specific agent by ID
 */
export async function fetchAgentConfig(id: string): Promise<AgentConfig> {
    try {
        const item = await catalogGetById('agent', id);
        return mapAgent(item);
    } catch (error) {
        console.error('Error fetching agent config:', error);
        throw new Error('Failed to fetch agent config');
    }
}

/**
 * Create a new agent
 * Note: Server generates the ID - never send it on creation
 */
export async function createAgent(config: Partial<AgentConfig>): Promise<AgentConfig> {
    const { id: _ignored, metadata: _meta, ...configWithoutId } = config;
    const result = await catalogCreate('agent', configWithoutId);
    return mapAgent(result);
}

/**
 * Update an existing agent
 * Note: ID must appear in both URL and body per API spec
 */
export async function updateAgent(id: string, config: Partial<AgentConfig>): Promise<AgentConfig> {
    const { metadata: _meta, ...rest } = config;
    const result = await catalogUpdate('agent', id, { ...rest, id });
    return mapAgent(result);
}

/**
 * Delete an agent
 */
export async function deleteAgent(id: string): Promise<void> {
    await catalogDelete('agent', id);
}

// ============================================================================
// Helpers
// ============================================================================

function mapAgent(item: any): AgentConfig {
    return {
        ...item,
        name: item.name || 'Unnamed Agent',
        metadata: item.metadata || {},
    };
}
