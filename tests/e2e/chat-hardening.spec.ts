import { expect, test } from "@playwright/test";

function sse(events: unknown[]): string {
  return events.map((event) => `data: ${JSON.stringify(event)}\n\n`).join("");
}

test("AC-CHAT-001 chat send+stream renders assistant output and tool usage details", async ({ page }) => {
  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method().toUpperCase();

    if (path === "/api/health") {
      await route.fulfill({ status: 200, contentType: "text/plain", body: "ok" });
      return;
    }

    if (path === "/api/v1/catalog/agent/echo_agent" && method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "echo_agent",
          name: "Echo Agent",
          description: "Test chat agent",
        }),
      });
      return;
    }

    if (path === "/api/v1/catalog/list" && method === "POST") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ items: [], total: 0, hasMore: false }),
      });
      return;
    }

    if (path === "/api/v1/events" && method === "POST") {
      await route.fulfill({
        status: 200,
        contentType: "text/event-stream",
        body: sse([
          { type: "RUN_STARTED", run_id: "run-1", thread_id: "thread-1" },
          { type: "THINKING_START", run_id: "run-1" },
          { type: "THINKING_TEXT_MESSAGE_START", run_id: "run-1" },
          { type: "THINKING_TEXT_MESSAGE_CONTENT", run_id: "run-1", delta: "Planning answer", partial: true },
          { type: "THINKING_END", run_id: "run-1" },
          { type: "TOOL_CALL_START", run_id: "run-1", tool_call_id: "tool-1", tool_call_name: "run_cmd", arguments: "{\"cmd\":\"pwd\"}" },
          { type: "TOOL_CALL_RESULT", run_id: "run-1", tool_call_id: "tool-1", tool_call_name: "run_cmd", content: "/workspace" },
          { type: "TEXT_MESSAGE_START", run_id: "run-1", message_id: "m-1" },
          { type: "TEXT_MESSAGE_CHUNK", run_id: "run-1", message_id: "m-1", delta: "Hello" },
          { type: "TEXT_MESSAGE_CHUNK", run_id: "run-1", message_id: "m-1", delta: " world" },
          { type: "TEXT_MESSAGE_END", run_id: "run-1", message_id: "m-1" },
          { type: "RUN_FINISHED", run_id: "run-1" },
        ]),
      });
      return;
    }

    await route.continue();
  });

  await page.goto("/chat/echo_agent");
  await page.getByPlaceholder("Message…").fill("Ping");
  await page.keyboard.press("Enter");

  await expect(page.getByText("Ping")).toBeVisible();
  await expect(page.getByText("Hello world")).toBeVisible();
  await expect(page.getByText("1 tool used")).toBeVisible();
});

test("AC-CHAT-002 stop clears streaming state and re-enables send", async ({ page }) => {
  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method().toUpperCase();

    if (path === "/api/v1/catalog/agent/echo_agent" && method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "echo_agent",
          name: "Echo Agent",
          description: "Test chat agent",
        }),
      });
      return;
    }

    if (path === "/api/v1/catalog/list" && method === "POST") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ items: [], total: 0, hasMore: false }),
      });
      return;
    }

    if (path === "/api/v1/events" && method === "POST") {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      await route.fulfill({
        status: 200,
        contentType: "text/event-stream",
        body: sse([
          { type: "RUN_STARTED", run_id: "run-stop", thread_id: "thread-stop" },
          { type: "RUN_FINISHED", run_id: "run-stop" },
        ]),
      });
      return;
    }

    await route.continue();
  });

  await page.goto("/chat/echo_agent");
  await page.getByPlaceholder("Message…").fill("Long run");
  await page.keyboard.press("Enter");

  await expect(page.getByLabel("Stop generating")).toBeVisible();
  await page.getByLabel("Stop generating").click();
  await expect(page.getByLabel("Stop generating")).toBeHidden();
  await expect(page.getByLabel("Send message")).toBeVisible();
});

test("AC-CHAT-003 paused session resumes through resume endpoint", async ({ page }) => {
  let resumeCalled = false;

  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method().toUpperCase();

    if (path === "/api/v1/catalog/agent/echo_agent" && method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "echo_agent",
          name: "Echo Agent",
          description: "Test chat agent",
        }),
      });
      return;
    }

    if (path === "/api/v1/catalog/list" && method === "POST") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          items: [{ id: "s-1", agentId: "echo_agent", name: "Paused session", lastActiveAt: Date.now() }],
          total: 1,
          hasMore: false,
        }),
      });
      return;
    }

    if (path === "/api/v1/catalog/session/s-1" && method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "s-1",
          events: [],
          pause: {
            paused: true,
            prompt: "Need your confirmation",
            reason: "missing_input",
            options: ["yes", "no"],
          },
        }),
      });
      return;
    }

    if (path === "/api/v1/agent/session/s-1/resume/events" && method === "POST") {
      resumeCalled = true;
      await route.fulfill({
        status: 200,
        contentType: "text/event-stream",
        body: sse([
          { type: "RUN_STARTED", run_id: "run-resume", thread_id: "s-1" },
          { type: "TEXT_MESSAGE_START", run_id: "run-resume", message_id: "m-r" },
          { type: "TEXT_MESSAGE_CHUNK", run_id: "run-resume", message_id: "m-r", delta: "Resumed successfully" },
          { type: "TEXT_MESSAGE_END", run_id: "run-resume", message_id: "m-r" },
          { type: "RUN_FINISHED", run_id: "run-resume" },
        ]),
      });
      return;
    }

    await route.continue();
  });

  await page.goto("/chat/echo_agent?sessionId=s-1");
  await expect(page.getByText("Session paused")).toBeVisible();
  await expect(page.getByText("Need your confirmation")).toBeVisible();

  await page.getByPlaceholder("Message…").fill("yes");
  await page.keyboard.press("Enter");

  await expect.poll(() => resumeCalled).toBe(true);
  await expect(page.getByText("Resumed successfully")).toBeVisible();
});

test("AC-CHAT-004 repeated text deltas are not dropped during streaming", async ({ page }) => {
  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method().toUpperCase();

    if (path === "/api/v1/catalog/agent/echo_agent" && method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "echo_agent",
          name: "Echo Agent",
          description: "Repeated deltas test",
        }),
      });
      return;
    }

    if (path === "/api/v1/catalog/list" && method === "POST") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ items: [], total: 0, hasMore: false }),
      });
      return;
    }

    if (path === "/api/v1/events" && method === "POST") {
      await route.fulfill({
        status: 200,
        contentType: "text/event-stream",
        body: sse([
          { type: "RUN_STARTED", run_id: "run-repeat", thread_id: "thread-repeat" },
          { type: "TEXT_MESSAGE_START", run_id: "run-repeat", message_id: "m-repeat" },
          { type: "TEXT_MESSAGE_CHUNK", run_id: "run-repeat", message_id: "m-repeat", delta: "a" },
          { type: "TEXT_MESSAGE_CHUNK", run_id: "run-repeat", message_id: "m-repeat", delta: "a" },
          { type: "TEXT_MESSAGE_CHUNK", run_id: "run-repeat", message_id: "m-repeat", delta: "a" },
          { type: "TEXT_MESSAGE_END", run_id: "run-repeat", message_id: "m-repeat" },
          { type: "RUN_FINISHED", run_id: "run-repeat" },
        ]),
      });
      return;
    }

    await route.continue();
  });

  await page.goto("/chat/echo_agent");
  await page.getByPlaceholder("Message…").fill("repeat");
  await page.keyboard.press("Enter");
  await expect(page.getByText("aaa")).toBeVisible();
});

test("AC-CHAT-005 keepalive SSE comments do not break chat streaming", async ({ page }) => {
  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method().toUpperCase();

    if (path === "/api/v1/catalog/agent/echo_agent" && method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "echo_agent",
          name: "Echo Agent",
          description: "Keepalive SSE test",
        }),
      });
      return;
    }

    if (path === "/api/v1/catalog/list" && method === "POST") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ items: [], total: 0, hasMore: false }),
      });
      return;
    }

    if (path === "/api/v1/events" && method === "POST") {
      const body =
        ":keepalive\n\n" +
        sse([
          { type: "RUN_STARTED", run_id: "run-keep", thread_id: "thread-keep" },
          { type: "TEXT_MESSAGE_START", run_id: "run-keep", message_id: "m-keep" },
          { type: "TEXT_MESSAGE_CHUNK", run_id: "run-keep", message_id: "m-keep", delta: "works" },
          { type: "TEXT_MESSAGE_END", run_id: "run-keep", message_id: "m-keep" },
          { type: "RUN_FINISHED", run_id: "run-keep" },
        ]);
      await route.fulfill({
        status: 200,
        contentType: "text/event-stream",
        body,
      });
      return;
    }

    await route.continue();
  });

  await page.goto("/chat/echo_agent");
  await page.getByPlaceholder("Message…").fill("keepalive");
  await page.keyboard.press("Enter");
  await expect(page.getByText("works")).toBeVisible();
});

test("AC-EVT-003 streaming tool args remain complete when args arrive before tool start", async ({ page }) => {
  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method().toUpperCase();

    if (path === "/api/v1/catalog/agent/echo_agent" && method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "echo_agent",
          name: "Echo Agent",
          description: "Streaming out-of-order tool args test",
        }),
      });
      return;
    }

    if (path === "/api/v1/catalog/list" && method === "POST") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ items: [], total: 0, hasMore: false }),
      });
      return;
    }

    if (path === "/api/v1/events" && method === "POST") {
      await route.fulfill({
        status: 200,
        contentType: "text/event-stream",
        body: sse([
          { type: "RUN_STARTED", run_id: "run-args", thread_id: "thread-args" },
          { type: "TOOL_CALL_ARGS", run_id: "run-args", tool_call_id: "tc-args", delta: "{\"cmd\":\"" },
          { type: "TOOL_CALL_START", run_id: "run-args", tool_call_id: "tc-args", tool_call_name: "run_cmd" },
          { type: "TOOL_CALL_ARGS", run_id: "run-args", tool_call_id: "tc-args", delta: "pwd\"}" },
          { type: "TOOL_CALL_RESULT", run_id: "run-args", tool_call_id: "tc-args", tool_call_name: "run_cmd", content: "/workspace" },
          { type: "TEXT_MESSAGE_START", run_id: "run-args", message_id: "m-args" },
          { type: "TEXT_MESSAGE_CHUNK", run_id: "run-args", message_id: "m-args", delta: "done" },
          { type: "TEXT_MESSAGE_END", run_id: "run-args", message_id: "m-args" },
          { type: "RUN_FINISHED", run_id: "run-args" },
        ]),
      });
      return;
    }

    await route.continue();
  });

  await page.goto("/chat/echo_agent");
  await page.getByPlaceholder("Message…").fill("tool args");
  await page.keyboard.press("Enter");
  await expect(page.getByText("1 tool used")).toBeVisible();
  await page.getByText("1 tool used").click();
  await expect(page.getByText(/pwd/)).toBeVisible();
});
