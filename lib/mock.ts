import { AgentConfig } from "@/models/Agent";
import { ModelConfig } from "@/models/Model";
import { AgentEvent } from "@/models/Events";

export const MOCK_AGENTS: AgentConfig[] = [];
export const MOCK_MODELS: ModelConfig[] = [
  {
    id: "model-openai-gpt4",
    type: "OPEN_AI_COMPATIBLE",
    name: "OpenAI GPT-4",
    model: "gpt-4-turbo-preview",
    baseUrl: "https://api.openai.com/v1",
    capabilities: ["chat", "completion", "vision"],
    temperature: 0.7,
    toolCallingEnabled: true,
    toolCallingSupported: true
  },
  {
    id: "model-anthropic-claude3",
    type: "OPEN_AI_COMPATIBLE",
    name: "Anthropic Claude 3",
    model: "claude-3-opus-20240229",
    capabilities: ["chat", "completion", "reasoning"],
    temperature: 0.5,
    toolCallingEnabled: true,
    toolCallingSupported: true
  },
  {
    id: "model-google-gemini",
    type: "GEMINI",
    name: "Google Gemini Pro",
    model: "gemini-pro",
    capabilities: ["chat", "completion", "multimodal"],
    temperature: 0.6,
    toolCallingEnabled: true,
    toolCallingSupported: true
  }
];

export async function* mockStreamResponse(
    prompt: string
): AsyncGenerator<AgentEvent, void, unknown> {
    const threadId = "mock-thread-" + Math.random().toString(36).slice(2, 9);

    yield { type: "SessionAssigned", threadId };
    await delay(500);

    yield { type: "ThinkingStart", stepName: "Analyzing prompt" };
    await delay(800);
    yield { type: "ThinkingUpdate", content: "Looking for stock tickers in prompt..." };
    await delay(600);
    yield { type: "ThinkingEnd" };

    yield { type: "ToolCallStarted", toolName: "fetch_price", toolCallId: "tc_1" };
    await delay(1000);
    yield { type: "ToolResult", toolName: "fetch_price", content: "AAPL: $185.92 (+1.2%)", toolCallId: "tc_1" };
    await delay(500);
    yield { type: "ToolCallEnded", toolName: "fetch_price", toolCallId: "tc_1" };

    yield { type: "AssistantTextDelta", content: "Based on the latest data, Apple (AAPL) is performing well today. " };
    await delay(400);
    yield { type: "AssistantTextDelta", content: "The stock is currently trading at $185.92." };
    await delay(400);
    yield { type: "AssistantTextFinal" };

    yield { type: "StreamEnd" };
}

function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
