import { AgentConfig } from "@/models/Agent";
import { MOCK_AGENTS } from "./mock";
import { createAgent as createAgentV1, updateAgent as updateAgentV1, deleteAgent as deleteAgentV1 } from './api-v1';
import { API_CONFIG } from './config';

const API_BASE = API_CONFIG.BASE_URL;
export const IS_MOCK = process.env.NEXT_PUBLIC_MOCK_MODE ? process.env.NEXT_PUBLIC_MOCK_MODE === "true" : false; // Default to false (use real API)

// Type definition for catalog items
export interface CatalogItem {
    id: string;
    name: string;
    [key: string]: any;
}

// Type definition for paginated results
interface PaginatedResult {
    items: any[];
    total?: number;
    hasMore?: boolean;
    nextCursor?: string;
}

/**
 * Generic function to fetch a list of entities from the Catalog API.
 * Used for populating dropdowns and selection menus.
 */
export async function fetchCatalogList(assetType: string): Promise<CatalogItem[]> {
    if (IS_MOCK) {
        // In mock mode, we return empty or pre-defined mocks if available
        return [];
    }

    try {
        const response = await fetch(`${API_BASE}/v1/catalog/list`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                assetType,
                query: {
                    page: {
                        offset: 0,
                        limit: 100
                    }
                }
            })
        });

        if (!response.ok) {
            console.warn(`Failed to fetch catalog list for ${assetType}: ${response.status}`);
            return [];
        }

        const result: PaginatedResult = await response.json();
        return result.items || [];
    } catch (error) {
        console.error(`Error fetching catalog list for ${assetType}:`, error);
        return [];
    }
}

// Type definition for schema responses
export interface SchemaResponse {
    schema: any;
    layout?: {
        [key: string]: any;
    };
}

export async function fetchSchema(assetType: string): Promise<SchemaResponse | null> {
    if (IS_MOCK) {
        return null;
    }

    try {
        const response = await fetch(`${API_BASE}/v1/schemas/${assetType}`);
        if (!response.ok) {
            console.warn(`Failed to fetch schema for ${assetType}: ${response.status}`);
            return null;
        }
        return await response.json() as SchemaResponse;
    } catch (error) {
        console.error(`Error fetching schema for ${assetType}:`, error);
        return null;
    }
}

export async function fetchAgents(): Promise<AgentConfig[]> {
    if (IS_MOCK) {
        return Promise.resolve(MOCK_AGENTS);
    }

    // Use catalog/list API to get all agents (per OpenAPI spec)
    try {
        const response = await fetch(`${API_BASE}/v1/catalog/list`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                assetType: "agent",
                query: {
                    page: {
                        offset: 0,
                        limit: 100
                    }
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch agents: ${response.status} ${response.statusText}`);
        }

        const result: PaginatedResult = await response.json();

        // Map the API response to the AgentConfig format
        if (result.items && Array.isArray(result.items)) {
            return result.items.map((item: any) => ({
                id: item.id,
                type: item.type,
                name: item.name || "Unnamed Agent",
                description: item.description,
                avatar: item.avatar,
                model: {
                    modelId: item.model?.modelId,
                    role: item.model?.role,
                    systemPrompt: item.model?.systemPrompt,
                    contextManagerConfig: item.model?.contextManagerConfig,
                    tools: item.model?.tools,
                    type: item.model?.type
                },
                sessionStore: item.sessionStore,
                metadata: item.metadata || {}
            }));
        }
        return [];
    } catch (error) {
        console.error("Error fetching agents:", error);
        throw new Error("Failed to fetch agents");
    }
}

export async function fetchAgentConfig(id: string): Promise<AgentConfig> {
    if (IS_MOCK) {
        const agent = MOCK_AGENTS.find(a => a.id === id);
        if (!agent) throw new Error("Agent not found");
        return Promise.resolve(agent);
    }

    // Use catalog GET endpoint to fetch specific agent by ID (per OpenAPI spec)
    try {
        const response = await fetch(`${API_BASE}/v1/catalog/agent/${id}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch agent: ${response.status} ${response.statusText}`);
        }

        const item = await response.json();
        return {
            id: item.id,
            type: item.type,
            name: item.name || "Unnamed Agent",
            description: item.description,
            avatar: item.avatar,
            model: {
                modelId: item.model?.modelId,
                role: item.model?.role,
                systemPrompt: item.model?.systemPrompt,
                contextManagerConfig: item.model?.contextManagerConfig,
                tools: item.model?.tools,
                type: item.model?.type
            },
            sessionStore: item.sessionStore,
            metadata: item.metadata || {}
        };
    } catch (error) {
        console.error("Error fetching agent config:", error);
        throw new Error("Failed to fetch agent config");
    }
}

export async function createAgent(config: Partial<AgentConfig>): Promise<AgentConfig> {
    if (IS_MOCK) {
        const newAgent = { ...config, id: `mock-${Date.now()}` } as AgentConfig;
        MOCK_AGENTS.push(newAgent);
        return Promise.resolve(newAgent);
    }

    // Per OpenAPI spec: DO NOT include 'id' field when creating - server generates it
    const { id, ...configWithoutId } = config;

    const newAgentConfig = {
        // No id field - server will generate it
        type: configWithoutId.type,
        name: configWithoutId.name,
        description: configWithoutId.description,
        avatar: configWithoutId.avatar,
        model: configWithoutId.model,
        sessionStore: configWithoutId.sessionStore
    };

    return await createAgentV1(newAgentConfig as any) as AgentConfig;
}

export async function updateAgent(id: string, config: Partial<AgentConfig>): Promise<AgentConfig> {
    if (IS_MOCK) {
        const index = MOCK_AGENTS.findIndex(a => a.id === id);
        if (index !== -1) MOCK_AGENTS[index] = { ...MOCK_AGENTS[index], ...config };
        return Promise.resolve(MOCK_AGENTS[index]);
    }

    // Per OpenAPI spec: MUST include 'id' in both URL and request body when updating
    const updatedConfig = {
        id: id,  // Required in body for updates
        type: config.type,
        name: config.name,
        description: config.description,
        avatar: config.avatar,
        model: config.model,
        sessionStore: config.sessionStore
    };

    return await updateAgentV1(id, updatedConfig as any) as AgentConfig;
}

export async function deleteAgent(id: string): Promise<void> {
    if (IS_MOCK) {
        const index = MOCK_AGENTS.findIndex(a => a.id === id);
        if (index !== -1) MOCK_AGENTS.splice(index, 1);
        return Promise.resolve();
    }

    // Use the new API for deleting agents
    await deleteAgentV1(id);
}
