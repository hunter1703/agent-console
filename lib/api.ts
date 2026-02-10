import { AgentConfig } from "@/models/Agent";
import { MOCK_AGENTS } from "./mock";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";
export const IS_MOCK = process.env.NEXT_PUBLIC_MOCK_MODE === "true";

interface AgentInfo {
    id: string;
    object: string;
    created: number;
    ownedBy: string;
    description?: string;
}

interface ListAgentsResponse {
    object: string;
    data: AgentInfo[];
}

function mapAgentInfoToConfig(info: AgentInfo): AgentConfig {
    return {
        id: info.id,
        name: info.id, // Fallback to ID for name
        description: info.description || `Agent provided by ${info.ownedBy || "system"}`,
    };
}

export async function fetchAgents(): Promise<AgentConfig[]> {
    if (IS_MOCK) {
        return Promise.resolve(MOCK_AGENTS);
    }
    const res = await fetch(`${API_BASE}/v1/agents`);
    if (!res.ok) throw new Error("Failed to fetch agents");
    const data: ListAgentsResponse = await res.json();
    return data.data.map(mapAgentInfoToConfig);
}

export async function fetchAgentConfig(id: string): Promise<AgentConfig> {
    if (IS_MOCK) {
        const agent = MOCK_AGENTS.find(a => a.id === id);
        if (!agent) throw new Error("Agent not found");
        return Promise.resolve(agent);
    }
    const res = await fetch(`${API_BASE}/v1/agents/${id}`);
    if (!res.ok) throw new Error("Failed to fetch agent config");
    const info: AgentInfo = await res.json();
    return mapAgentInfoToConfig(info);
}

export async function createAgent(config: Partial<AgentConfig>): Promise<AgentConfig> {
    if (IS_MOCK) {
        const newAgent = { ...config, id: `mock-${Date.now()}` } as AgentConfig;
        MOCK_AGENTS.push(newAgent);
        return Promise.resolve(newAgent);
    }
    const res = await fetch(`${API_BASE}/v1/agents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
    });
    if (!res.ok) throw new Error("Failed to create agent");
    const info: AgentInfo = await res.json();
    return mapAgentInfoToConfig(info);
}

export async function updateAgent(id: string, config: Partial<AgentConfig>): Promise<AgentConfig> {
    if (IS_MOCK) {
        const index = MOCK_AGENTS.findIndex(a => a.id === id);
        if (index !== -1) MOCK_AGENTS[index] = { ...MOCK_AGENTS[index], ...config };
        return Promise.resolve(MOCK_AGENTS[index]);
    }
    const res = await fetch(`${API_BASE}/v1/agents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
    });
    if (!res.ok) throw new Error("Failed to update agent");
    const info: AgentInfo = await res.json();
    return mapAgentInfoToConfig(info);
}

export async function deleteAgent(id: string): Promise<void> {
    if (IS_MOCK) {
        const index = MOCK_AGENTS.findIndex(a => a.id === id);
        if (index !== -1) MOCK_AGENTS.splice(index, 1);
        return Promise.resolve();
    }
    const res = await fetch(`${API_BASE}/v1/agents/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete agent");
}
