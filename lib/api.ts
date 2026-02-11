import { AgentConfig } from "@/models/Agent";
import { MOCK_AGENTS } from "./mock";
import { fetchAgents as fetchAgentsV1, createAgent as createAgentV1, updateAgent as updateAgentV1, deleteAgent as deleteAgentV1, searchCatalog, AssetRequest, Query, Page, PaginatedResult } from './api-v1';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
export const IS_MOCK = process.env.NEXT_PUBLIC_MOCK_MODE ? process.env.NEXT_PUBLIC_MOCK_MODE === "true" : false; // Default to false (use real API)

export async function fetchAgents(): Promise<AgentConfig[]> {
    if (IS_MOCK) {
        return Promise.resolve(MOCK_AGENTS);
    }
    
    // Use the new API to search for agents
    const assetRequest: AssetRequest = {
        assetType: "agent",
        query: {
            page: {
                offset: 0,
                limit: 50
            }
        }
    };

    try {
        const result: PaginatedResult = await searchCatalog(assetRequest);
        
        // Map the new API response to the AgentConfig format
        if (result.items && Array.isArray(result.items)) {
            return result.items.map((item: any) => ({
                id: item.agentId || item.id,
                name: item.name || item.agentId || "Unnamed Agent",
                description: item.description || "No description available",
                avatar: item.avatar,
                systemPrompt: item.model?.systemPrompt,
                tools: item.model?.tools?.enabled || [],
                metadata: item.metadata || {}
            }));
        }
        return [];
    } catch (error) {
        console.error("Error fetching agents with new API:", error);
        throw new Error("Failed to fetch agents");
    }
}

export async function fetchAgentConfig(id: string): Promise<AgentConfig> {
    if (IS_MOCK) {
        const agent = MOCK_AGENTS.find(a => a.id === id);
        if (!agent) throw new Error("Agent not found");
        return Promise.resolve(agent);
    }
    
    // Use the new API to get a specific agent by searching for it
    try {
        const assetRequest: AssetRequest = {
            assetType: "agent",
            keys: [id],
            query: {
                page: {
                    offset: 0,
                    limit: 1
                }
            }
        };
        
        const result: PaginatedResult = await searchCatalog(assetRequest);
        
        if (result.items && result.items.length > 0) {
            const item = result.items[0];
            return {
                id: item.agentId || item.id,
                name: item.name || item.agentId || "Unnamed Agent",
                description: item.description || "No description available",
                avatar: item.avatar,
                systemPrompt: item.model?.systemPrompt,
                tools: item.model?.tools?.enabled || [],
                metadata: item.metadata || {}
            };
        }
        
        throw new Error("Agent not found");
    } catch (error) {
        console.error("Error fetching agent with new API:", error);
        throw new Error("Failed to fetch agent config");
    }
}

export async function createAgent(config: Partial<AgentConfig>): Promise<AgentConfig> {
    if (IS_MOCK) {
        const newAgent = { ...config, id: `mock-${Date.now()}` } as AgentConfig;
        MOCK_AGENTS.push(newAgent);
        return Promise.resolve(newAgent);
    }
    
    // Use the new API for creating agents
    const newAgentConfig = {
        agentId: config.id,
        name: config.name,
        description: config.description,
        avatar: config.avatar,
        model: {
            systemPrompt: config.systemPrompt,
            tools: {
                enabled: config.tools || []
            }
        },
        metadata: config.metadata
    };
    
    return await createAgentV1(newAgentConfig as any);
}

export async function updateAgent(id: string, config: Partial<AgentConfig>): Promise<AgentConfig> {
    if (IS_MOCK) {
        const index = MOCK_AGENTS.findIndex(a => a.id === id);
        if (index !== -1) MOCK_AGENTS[index] = { ...MOCK_AGENTS[index], ...config };
        return Promise.resolve(MOCK_AGENTS[index]);
    }
    
    // Use the new API for updating agents
    const updatedConfig = {
        agentId: id,
        ...config,
        model: {
            systemPrompt: config.systemPrompt,
            tools: {
                enabled: config.tools || []
            }
        },
        metadata: config.metadata
    };
    
    return await updateAgentV1(id, updatedConfig as any);
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
