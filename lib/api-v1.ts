import { AgentConfig, AgentRequest, AgentResponse, AssetRequest, PaginatedResult, PublisherBaseEvent, PublisherMapStringObject } from '@/models/ApiSchemas';
import { API_CONFIG } from './config';

export const IS_MOCK = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';

// Agent APIs
export async function createAgent(agentConfig: AgentConfig): Promise<AgentConfig> {
  const res = await fetch(`${API_CONFIG.BASE_URL}/v1/agent/agent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(agentConfig),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to create agent: ${res.status} - ${errorText}`);
  }

  return res.json();
}

export async function updateAgent(agentId: string, agentConfig: AgentConfig): Promise<AgentConfig> {
  const res = await fetch(`${API_CONFIG.BASE_URL}/v1/agent/agent/${agentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(agentConfig),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to update agent: ${res.status} - ${errorText}`);
  }

  return res.json();
}

export async function deleteAgent(agentId: string): Promise<void> {
  const res = await fetch(`${API_CONFIG.BASE_URL}/v1/agent/agent/${agentId}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to delete agent: ${res.status} - ${errorText}`);
  }
}

// Agent Execution APIs
export async function* streamAgentEvents(agentRequest: AgentRequest): AsyncGenerator<PublisherBaseEvent, void, unknown> {
  const response = await fetch(`${API_CONFIG.BASE_URL}/v1/agent/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream'
    },
    body: JSON.stringify(agentRequest),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to stream agent events: ${response.status} - ${errorText}`);
  }

  if (!response.body) {
    throw new Error('Response body is null');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');

      // Keep the last incomplete line in the buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.substring(6); // Remove 'data: ' prefix

          // Handle the special case where data is [DONE]
          if (dataStr.trim() === '[DONE]') {
            return; // End the generator
          }

          try {
            const parsedData = JSON.parse(dataStr);
            yield parsedData as PublisherBaseEvent;
          } catch (e) {
            console.error('Error parsing SSE data:', dataStr, e);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export async function invokeAgentSync(agentRequest: AgentRequest): Promise<AgentResponse> {
  const res = await fetch(`${API_CONFIG.BASE_URL}/v1/invoke`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(agentRequest),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to invoke agent: ${res.status} - ${errorText}`);
  }

  return res.json();
}

export async function* streamAgentResponses(agentRequest: any): AsyncGenerator<PublisherMapStringObject, void, unknown> {
  const response = await fetch(`${API_CONFIG.BASE_URL}/v1/responses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream'
    },
    body: JSON.stringify(agentRequest),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to stream agent responses: ${response.status} - ${errorText}`);
  }

  if (!response.body) {
    throw new Error('Response body is null');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');

      // Keep the last incomplete line in the buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.substring(6); // Remove 'data: ' prefix

          // Handle the special case where data is [DONE]
          if (dataStr.trim() === '[DONE]') {
            return; // End the generator
          }

          try {
            const parsedData = JSON.parse(dataStr);
            yield parsedData as PublisherMapStringObject;
          } catch (e) {
            console.error('Error parsing SSE data:', dataStr, e);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// Catalog APIs
export async function searchCatalog(assetRequest: AssetRequest): Promise<PaginatedResult> {
  const res = await fetch(`${API_CONFIG.BASE_URL}/v1/catalog/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(assetRequest),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to search catalog: ${res.status} - ${errorText}`);
  }

  return res.json();
}

export async function getResourceById(resourceType: string, id: string, options?: { [key: string]: any }, projection?: string): Promise<any> {
  let url = `${API_CONFIG.BASE_URL}/v1/catalog/${resourceType}/${id}`;
  const params = new URLSearchParams();

  if (projection) {
    params.append('projection', projection);
  }

  if (options) {
    Object.entries(options).forEach(([key, value]) => {
      params.append(key, String(value));
    });
  }

  const queryString = params.toString();
  if (queryString) {
    url += `?${queryString}`;
  }

  const res = await fetch(url);

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to get resource: ${res.status} - ${errorText}`);
  }

  return res.json();
}