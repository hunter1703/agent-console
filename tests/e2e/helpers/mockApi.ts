import { Page, Route } from "@playwright/test";
import agentSchema from "../fixtures/agent-schema.json";
import modelSchema from "../fixtures/model-schema.json";
import catalogAgents from "../fixtures/catalog-agents.json";
import catalogModels from "../fixtures/catalog-models.json";
import catalogTools from "../fixtures/catalog-tools.json";

export interface MockApiState {
  createdAgents: any[];
  updatedAgents: any[];
  createdModels: any[];
  updatedModels: any[];
  dynamicSchemaRequests: any[];
}

interface MockApiOptions {
  omitAgentWizardLayout?: boolean;
  offlineHealth?: boolean;
  emptyDynamicSchema?: boolean;
}

function json(route: Route, payload: unknown, status = 200): Promise<void> {
  return route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(payload),
  });
}

function parseBody(route: Route): any {
  const raw = route.request().postData();
  if (!raw) {
    return {};
  }
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export async function installMockApi(
  page: Page,
  options: MockApiOptions = {},
): Promise<MockApiState> {
  const state: MockApiState = {
    createdAgents: [],
    updatedAgents: [],
    createdModels: [],
    updatedModels: [],
    dynamicSchemaRequests: [],
  };

  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method().toUpperCase();

    if (path === "/api/health" && options.offlineHealth) {
      await route.fulfill({ status: 503, contentType: "text/plain", body: "offline" });
      return;
    }

    if (path === "/api/health") {
      await route.fulfill({ status: 200, contentType: "text/plain", body: "ok" });
      return;
    }

    if (path === "/api/schemas/agent" && method === "GET") {
      const payload = options.omitAgentWizardLayout
        ? {
            ...agentSchema,
            layout: {
              ...agentSchema.layout,
              fields: Object.fromEntries(
                Object.entries(agentSchema.layout.fields || {}).map(([pointer, field]) => [
                  pointer,
                  {
                    ...(field as Record<string, unknown>),
                    step: undefined,
                    section: undefined,
                  },
                ]),
              ),
            },
          }
        : agentSchema;
      await json(route, payload);
      return;
    }

    if (path === "/api/schemas/model" && method === "GET") {
      await json(route, modelSchema);
      return;
    }

    if (path === "/api/schemas" && method === "POST") {
      const body = parseBody(route);
      if (body.assetType === "tool_configs") {
        state.dynamicSchemaRequests.push(body);
        if (options.emptyDynamicSchema) {
          await json(route, { schema: { type: "object", properties: {} } });
          return;
        }
        await json(route, {
          schema: {
            type: "object",
            properties: {
              command: { type: "string", title: "Command" },
            },
          },
        });
        return;
      }
      await json(route, {});
      return;
    }

    if (path === "/api/v1/catalog/list" && method === "POST") {
      const body = parseBody(route);
      if (body.assetType === "agent") {
        await json(route, catalogAgents);
        return;
      }
      if (body.assetType === "model") {
        await json(route, catalogModels);
        return;
      }
      if (body.assetType === "tool") {
        await json(route, catalogTools);
        return;
      }
      await json(route, { items: [], total: 0, hasMore: false });
      return;
    }

    if (path === "/api/v1/catalog/agent/support-agent" && method === "GET") {
      await json(route, {
        id: "support-agent",
        name: "Support Agent",
        type: "default",
        avatar: "https://example.com/avatar.png",
        description: "Customer support specialist.",
        modelId: "gpt-4o-mini",
        systemPrompt: "You are a support assistant.",
        contextStrategy: {
          type: "compaction",
          enabled: true,
          keepLastTokens: 1024,
          tokenThreshold: 4096,
          recencyThreshold: 1024,
        },
        tools: [{ toolName: "run_cmd", configs: { command: "ls" } }],
        guardrails: {
          enabled: true,
          executionMode: "SYNC",
          defaultOnError: "FAIL_CLOSED",
          rules: [
            {
              id: "rule-1",
              type: "RELEVANCE",
              mode: "STEER_THEN_BLOCK",
              anchorStrategy: "LATEST_USER_AND_PLAN",
              relevanceThreshold: 0.2,
              maxSteeringRetries: 3,
              action: "WARN",
            },
          ],
        },
        runtime: {
          maxToolCalls: 8,
        },
        sessionStore: {
          enabled: false,
        },
      });
      return;
    }

    if (path === "/api/v1/model/llama-3-8b" && method === "GET") {
      await json(route, {
        id: "llama-3-8b",
        name: "Llama 3 8B",
        type: "ollama",
        model: "llama3",
        temperature: 0.7,
      });
      return;
    }

    if (path === "/api/v1/agent/agent" && method === "POST") {
      const body = parseBody(route);
      state.createdAgents.push(body);
      await json(route, { ...body, id: body.id || "created-agent" }, 200);
      return;
    }

    if (path.startsWith("/api/v1/agent/agent/") && method === "PUT") {
      const body = parseBody(route);
      state.updatedAgents.push(body);
      await json(route, body, 200);
      return;
    }

    if (path === "/api/v1/model" && method === "POST") {
      const body = parseBody(route);
      state.createdModels.push(body);
      await json(route, { ...body, id: body.id || "created-model" }, 200);
      return;
    }

    if (path.startsWith("/api/v1/model/") && method === "PUT") {
      const body = parseBody(route);
      state.updatedModels.push(body);
      await json(route, body, 200);
      return;
    }

    if ((path.startsWith("/api/v1/agent/agent/") || path.startsWith("/api/v1/model/")) && method === "DELETE") {
      await route.fulfill({ status: 204, body: "" });
      return;
    }

    await route.continue();
  });

  return state;
}
