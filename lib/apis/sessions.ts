/**
 * Sessions API Module
 * Handles session-specific operations
 */

import { catalogList, catalogSearch, catalogDelete, catalogGetById, CatalogResult } from './catalog';
import { API_CONFIG } from '../config';

const API_BASE = API_CONFIG.BASE_URL;

// ============================================================================
// Types
// ============================================================================

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

// ============================================================================
// Functions
// ============================================================================

/**
 * Fetch sessions with optional agent filter and pagination
 */
export async function fetchSessions(options?: {
    agentId?: string;
    limit?: number;
    offset?: number;
}): Promise<SessionPage> {
    const body: any = {
        assetType: 'session',
        query: {
            page: { offset: options?.offset ?? 0, limit: options?.limit ?? 20 },
        },
    };

    if (options?.agentId) {
        body.query!.filter = {
            field: 'agentId',
            op: 'EQ',
            values: [options.agentId],
        };
    }

    try {
        const result: CatalogResult = await catalogList(body);
        return {
            sessions: sortSessionsDesc((result.items || []).map(normalizeSession)),
            hasMore: result.hasMore ?? false,
            total: result.total ?? 0,
        };
    } catch {
        return { sessions: [], hasMore: false, total: 0 };
    }
}

/**
 * Search sessions with optional agent filter
 */
export async function searchSessions(
    query: string,
    agentId?: string,
    offset = 0,
    limit = 20
): Promise<SessionPage> {
    const body: any = {
        assetType: 'session',
        options: { query },
        query: {
            page: { offset, limit },
        },
    };

    if (agentId) {
        body.query!.filter = {
            field: 'agentId',
            op: 'EQ',
            values: [agentId],
        };
    }

    try {
        const result: CatalogResult = await catalogSearch(body);
        return {
            sessions: sortSessionsDesc((result.items || []).map(normalizeSession)),
            hasMore: result.hasMore ?? false,
            total: result.total ?? 0,
        };
    } catch {
        return { sessions: [], hasMore: false, total: 0 };
    }
}

/**
 * Delete a session
 */
export async function deleteSession(sessionId: string): Promise<void> {
    try {
        await catalogDelete('session', sessionId);
    } catch {
        // Ignore network errors - optimistic removal already applied
    }
}

/**
 * Get session by ID with optional event history
 */
export async function getSessionById(
    sessionId: string,
    options?: { includeEvents?: boolean }
): Promise<any> {
    return catalogGetById('session', sessionId, options);
}

// ============================================================================
// Helpers
// ============================================================================

function normalizeSession(item: any): SessionSummary {
    return {
        id: item.id || item.sessionId || item.threadId || '',
        agentId: item.agentId || '',
        // API returns `name` not `title` in the list endpoint
        title: item.title || item.name || undefined,
        // Use 0 when no timestamp - sorts to the end; real timestamps sort correctly
        lastActiveAt: item.lastActiveAt || item.updatedTime || item.createdTime || 0,
        threadId: item.threadId || undefined,
    };
}

function sortSessionsDesc(sessions: SessionSummary[]): SessionSummary[] {
    return [...sessions].sort((a, b) => b.lastActiveAt - a.lastActiveAt);
}
