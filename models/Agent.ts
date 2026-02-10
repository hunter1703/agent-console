export interface AgentConfig {
    id: string;
    name: string;
    description: string;
    systemPrompt?: string;
    tools?: string[];
    metadata?: Record<string, any>;
    avatar?: string;
}
