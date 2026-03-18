/**
 * API Module Index
 * Re-exports all API modules for convenient importing
 */

// Core API modules
export * from './catalog';
export * from './agents';
export * from './sessions';
export * from './streaming';

// Legacy re-exports for backward compatibility
// These will be removed in future versions
export {
    fetchAgents,
    fetchAgentConfig,
    createAgent,
    updateAgent,
    deleteAgent,
} from './agents';

export {
    fetchSessions,
    searchSessions,
    deleteSession,
    getSessionById,
} from './sessions';

export {
    catalogList,
    catalogSearch,
    catalogGetById,
    catalogCreate,
    catalogUpdate,
    catalogDelete,
} from './catalog';

export {
    fetchSseStream,
    consumeSseStream,
    streamAgentChat,
    createStreamController,
    cancelStream,
} from './streaming';

// Re-export types
export type {
    CatalogQuery,
    CatalogResult,
    CatalogSearchOptions,
} from './catalog';

export type { AgentPage } from './agents';

export type { SessionSummary, SessionPage } from './sessions';

export type { SSEEvent, StreamOptions, StreamCallbacks } from './streaming';
