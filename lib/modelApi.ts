import { ModelConfig } from "@/models/Model"; // We'll create this model later
import { MOCK_MODELS } from "./mock";
import { API_CONFIG } from './config';

const API_BASE = API_CONFIG.BASE_URL;
export const IS_MOCK = process.env.NEXT_PUBLIC_MOCK_MODE ? process.env.NEXT_PUBLIC_MOCK_MODE === "true" : false;

export interface ModelPage {
  models: ModelConfig[];
  hasMore: boolean;
  total: number;
}

function mapModel(item: any): ModelConfig {
  return { ...item, name: item.name || item.modelId || "Unnamed Model" };
}

export async function fetchModels(options?: { offset?: number; limit?: number }): Promise<ModelPage> {
  const offset = options?.offset ?? 0;
  const limit = options?.limit ?? 20;

  if (IS_MOCK) {
    const slice = MOCK_MODELS.slice(offset, offset + limit);
    return { models: slice, hasMore: offset + limit < MOCK_MODELS.length, total: MOCK_MODELS.length };
  }

  try {
    const response = await fetch(`${API_BASE}/v1/catalog/list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assetType: "model",
        query: { page: { offset, limit } },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    const models = (result.items || []).map(mapModel);
    return { models, hasMore: result.hasMore ?? false, total: result.total ?? models.length };
  } catch (error) {
    console.error("Error fetching models:", error);
    throw new Error("Failed to fetch models");
  }
}

export async function fetchModelConfig(id: string): Promise<ModelConfig> {
  if (IS_MOCK) {
    const model = MOCK_MODELS.find(m => m.id === id);
    if (!model) throw new Error("Model not found");
    return Promise.resolve(model);
  }

  // Use the dedicated model API to get a model by ID
  try {
    const response = await fetch(`${API_BASE}/v1/model/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch model: ${response.status} ${response.statusText}`);
    }

    const item = await response.json();
    return { ...item, name: item.name || item.modelId || "Unnamed Model" };
  } catch (error) {
    console.error("Error fetching model:", error);
    throw new Error("Failed to fetch model config");
  }
}

export async function createModel(config: ModelConfig): Promise<ModelConfig> {
  if (IS_MOCK) {
    const newModel = { ...config, id: `mock-${Date.now()}` } as ModelConfig;
    MOCK_MODELS.push(newModel);
    return Promise.resolve(newModel);
  }

  // Per OpenAPI spec: DO NOT include 'id' field when creating - server generates it
  const { id, ...configWithoutId } = config;

  try {
    const response = await fetch(`${API_BASE}/v1/model`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(configWithoutId)  // No id field
    });

    if (!response.ok) {
      throw new Error(`Failed to create model: ${response.status} ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error creating model:", error);
    throw new Error("Failed to create model");
  }
}

export async function updateModel(id: string, config: ModelConfig): Promise<ModelConfig> {
  if (IS_MOCK) {
    const index = MOCK_MODELS.findIndex(m => m.id === id);
    if (index !== -1) MOCK_MODELS[index] = { ...MOCK_MODELS[index], ...config };
    return Promise.resolve(MOCK_MODELS[index]);
  }

  // Per OpenAPI spec: MUST include 'id' in both URL and request body when updating
  const updatedConfig = {
    ...config,
    id: id  // Ensure id is in the body
  };

  try {
    const response = await fetch(`${API_BASE}/v1/model/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedConfig)
    });

    if (!response.ok) {
      throw new Error(`Failed to update model: ${response.status} ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error updating model:", error);
    throw new Error("Failed to update model");
  }
}

export async function deleteModel(id: string): Promise<void> {
  if (IS_MOCK) {
    const index = MOCK_MODELS.findIndex(m => m.id === id);
    if (index !== -1) MOCK_MODELS.splice(index, 1);
    return Promise.resolve();
  }

  // Use the dedicated model API to delete models
  try {
    const response = await fetch(`${API_BASE}/v1/model/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Failed to delete model: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error deleting model:", error);
    throw new Error("Failed to delete model");
  }
}