// Generated from OpenAPI specification

export interface AgentConfig {
  type?: string;
  agentId?: string;
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
  page?: Page;
}

export interface AssetResponse {
  data?: any[];
  nextPageToken?: string;
  totalCount?: number;
}

export interface ContextManagerConfig {
  type?: string;
}

export interface Page {
  offset?: number;
  limit?: number;
}

export interface PublisherBaseEvent {
  // Empty object as defined in the schema
  [key: string]: any;
}

export interface PublisherMapStringObject {
  // Empty object as defined in the schema
  [key: string]: any;
}

export interface SessionServiceConfig {
  type?: string;
}

export interface ToolsConfig {
  enabled?: string[];
  configs?: { [key: string]: { [key: string]: any } };
  standardTools?: string[];
}