export interface ModelConfig {
  id: string;
  name: string;
  type: string;
  model: string;
  baseUrl?: string;
  temperature?: number;
  topK?: number;
  topP?: number;
  repeatPenalty?: number;
  numPredict?: number;
  maxContextLength?: number;
  stopTokens?: string[];
  responseFormat?: string;
  apiKey?: string;
  toolCallingEnabled?: boolean;
  toolCallingSupported?: boolean;
  contextManagerConfig?: import("./Agent").ContextManagerConfig;
  serverCommand?: string;
  serverArgs?: string[];
  serverWorkdir?: string;
  capabilities?: string[];
  metadata?: Record<string, any>;
}