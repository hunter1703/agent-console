// Generated from OpenAPI specification

export interface AgentConfig {
  id?: string;
  type?: string;
  name?: string;
  description?: string;
  avatar?: string;
  model?: AgentModelConfig;
  sessionStore?: SessionServiceConfig;
}

export interface AgentModelConfig {
  modelId?: string;
  role?: string;
  systemPrompt?: string;
  contextManagerConfig?: ContextManagerConfig;
  tools?: ToolsConfig;
  type?: string;
}

export interface AgentRequest {
  type?: string;
  agentId?: string;
  agentConfigPath?: string;
  sessionId?: string;
  message?: string;
}

export interface AgentResponse {
  // Empty object as defined in the schema
  [key: string]: any;
}

export interface AssetRequest {
  assetType?: string;
  keys?: string[];
  query?: Query;
  options?: { [key: string]: any };
}

export interface ContextManagerConfig {
  type?: string;
}

export interface LastNContextManagerConfig extends ContextManagerConfig {
  keepLast?: number;
}

export interface Page {
  offset?: number;
  limit?: number;
  cursor?: string;
}

export interface PaginatedResult {
  items?: any[];
  nextCursor?: string;
  total?: number;
  hasMore?: boolean;
}

export interface PublisherBaseEvent {
  // Empty object as defined in the schema
  [key: string]: any;
}

export interface PublisherMapStringObject {
  // Empty object as defined in the schema
  [key: string]: any;
}

export interface Query {
  page?: Page;
}

export interface SessionServiceConfig {
  type?: string;
}

export interface AgentSessionDTO {
  id?: string;
  agentId?: string;
  title?: string;
  createdAt?: number;
  lastActiveAt?: number;
  messages?: any[];
  threadId?: string;
  events?: any[];
  pause?: {
    paused?: boolean;
    reason?: string;
    prompt?: string;
    options?: string[];
    requestedAt?: number;
  };
}

export interface InMemorySessionServiceConfig extends SessionServiceConfig {
}

export interface MongoSessionServiceConfig extends SessionServiceConfig {
  connectionString?: string;
}

export interface ToolsConfig {
  enabled?: string[];
  configs?: { [key: string]: { [key: string]: any } };
  standardTools?: string[];
}
