import { AgentConfig } from "@/models/Agent";
import { MOCK_AGENTS } from "./mock";
import { createAgent as createAgentV1, updateAgent as updateAgentV1, deleteAgent as deleteAgentV1, getResourceById } from './api-v1';
export { getResourceById };
import { API_CONFIG } from './config';

const API_BASE = API_CONFIG.BASE_URL;
export const IS_MOCK = process.env.NEXT_PUBLIC_MOCK_MODE ? process.env.NEXT_PUBLIC_MOCK_MODE === "true" : false; // Default to false (use real API)

// Type definition for paginated results
interface PaginatedResult {
    items: any[];
    total?: number;
    hasMore?: boolean;
    nextCursor?: string;
}

/**
 * Checks the system health status.
 */
export async function checkHealth(): Promise<boolean> {
    if (IS_MOCK) return true;
    try {
        const response = await fetch(`${API_BASE}/health`, { method: "GET", cache: "no-store" });
        return response.ok;
    } catch (error) {
        return false;
    }
}

// Type definition for schema responses
export interface SchemaResponse {
    schema: any;
    layout?: Record<string, any>;
}

export async function fetchSchema(
    assetType: string,
    mode?: "create" | "edit" | "view",
): Promise<SchemaResponse | null> {
    try {
        const query = mode ? `?mode=${mode}` : "";
        const response = await fetch(`${API_BASE}/schemas/${assetType}${query}`);
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

export interface AgentPage {
    agents: AgentConfig[];
    hasMore: boolean;
    total: number;
}

function mapAgent(item: any): AgentConfig {
    return { ...item, name: item.name || "Unnamed Agent", metadata: item.metadata || {} };
}

export async function fetchAgents(options?: { offset?: number; limit?: number }): Promise<AgentPage> {
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? 20;

    if (IS_MOCK) {
        const slice = MOCK_AGENTS.slice(offset, offset + limit);
        return { agents: slice, hasMore: offset + limit < MOCK_AGENTS.length, total: MOCK_AGENTS.length };
    }

    try {
        const response = await fetch(`${API_BASE}/v1/catalog/list`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                assetType: "agent",
                query: { page: { offset, limit } },
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch agents: ${response.status} ${response.statusText}`);
        }

        const result: PaginatedResult = await response.json();
        const agents = (result.items || []).map(mapAgent);
        return { agents, hasMore: result.hasMore ?? false, total: result.total ?? agents.length };
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
        return { ...item, name: item.name || "Unnamed Agent", metadata: item.metadata || {} };
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

    // Server generates the ID — never send it on creation.
    const { id: _ignored, metadata: _meta, ...configWithoutId } = config;
    return await createAgentV1(configWithoutId as any) as AgentConfig;
}

export async function updateAgent(id: string, config: Partial<AgentConfig>): Promise<AgentConfig> {
    if (IS_MOCK) {
        const index = MOCK_AGENTS.findIndex(a => a.id === id);
        if (index !== -1) MOCK_AGENTS[index] = { ...MOCK_AGENTS[index], ...config };
        return Promise.resolve(MOCK_AGENTS[index]);
    }

    // id must appear in both URL and body per API spec.
    const { metadata: _meta, ...rest } = config;
    return await updateAgentV1(id, { ...rest, id } as any) as AgentConfig;
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

/* ── Session APIs ─────────────────────────────────────────────────────────── */

export interface SessionSummary {
    id: string;
    agentId: string;
    title?: string;
    lastActiveAt: number;
    threadId?: string;
}

export interface SessionPage {
    sessions: SessionSummary[];
    hasMore: boolean;
    total: number;
}

function normalizeSession(item: any): SessionSummary {
    return {
        id: item.id || item.sessionId || item.threadId || "",
        agentId: item.agentId || "",
        // API returns `name` not `title` in the list endpoint
        title: item.title || item.name || undefined,
        // Use 0 when no timestamp — sorts to the end; real timestamps sort correctly
        lastActiveAt: item.lastActiveAt || item.updatedTime || item.createdTime || 0,
        threadId: item.threadId || undefined,
    };
}

function sortSessionsDesc(sessions: SessionSummary[]): SessionSummary[] {
    return [...sessions].sort((a, b) => b.lastActiveAt - a.lastActiveAt);
}

export async function fetchSessions(options?: {
    agentId?: string;
    limit?: number;
    offset?: number;
}): Promise<SessionPage> {
    const body: any = {
        assetType: "session",
        query: {
            page: { offset: options?.offset ?? 0, limit: options?.limit ?? 20 },
        },
    };
    if (options?.agentId) {
        body.query.filter = { field: "agentId", op: "EQ", values: [options.agentId] };
    }

    try {
        const res = await fetch(`${API_BASE}/v1/catalog/list`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        if (!res.ok) return { sessions: [], hasMore: false, total: 0 };
        const result: PaginatedResult = await res.json();
        return {
            sessions: sortSessionsDesc((result.items || []).map(normalizeSession)),
            hasMore: result.hasMore ?? false,
            total: result.total ?? 0,
        };
    } catch {
        return { sessions: [], hasMore: false, total: 0 };
    }
}

export async function searchSessions(
    query: string,
    agentId?: string,
    offset = 0,
    limit = 20
): Promise<SessionPage> {
    const body: any = {
        assetType: "session",
        options: { query },
        query: { page: { offset, limit } },
    };
    if (agentId) {
        body.query.filter = { field: "agentId", op: "EQ", values: [agentId] };
    }

    try {
        const res = await fetch(`${API_BASE}/v1/catalog/search`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        if (!res.ok) return { sessions: [], hasMore: false, total: 0 };
        const result: PaginatedResult = await res.json();
        return {
            sessions: sortSessionsDesc((result.items || []).map(normalizeSession)),
            hasMore: result.hasMore ?? false,
            total: result.total ?? 0,
        };
    } catch {
        return { sessions: [], hasMore: false, total: 0 };
    }
}

export async function deleteSession(sessionId: string): Promise<void> {
    try {
        await fetch(`${API_BASE}/v1/agent/session/${sessionId}`, { method: "DELETE" });
    } catch {
        /* ignore network errors — optimistic removal already applied */
    }
}
