export interface AgentConfig {
    id: string;
    name: string;
    type: string;
    description?: string;
    avatar?: string;
    model?: AgentModelConfig;
    sessionStore?: SessionServiceConfig;
    routingModelId?: string | null;
    routingHistorySize?: number;
    metadata?: Record<string, any>;
    [key: string]: any; // allow schema-driven fields without frontend changes
}

export interface AgentModelConfig {
    modelId: string;
    role: string;
    systemPrompt: string;
    contextManagerConfig: ContextManagerConfig;
    tools: ToolsConfig;
    type: string;
}

export interface ContextManagerConfig {
    type: string;
    [key: string]: any;
}

export interface LastNContextManagerConfig extends ContextManagerConfig {
    keepLast: number;
}

export interface SessionServiceConfig {
    type: string;
}

export interface InMemorySessionServiceConfig extends SessionServiceConfig {
}

export interface MongoSessionServiceConfig extends SessionServiceConfig {
    connectionString?: string;
}

export interface ToolsConfig {
    enabled: string[];
    configs: { [key: string]: { [key: string]: any } };
    standardTools: string[];
}
