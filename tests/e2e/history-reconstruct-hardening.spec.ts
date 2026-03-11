import { expect, test } from "@playwright/test";

test("AC-EVT-002 history load reconstructs tool args from out-of-order event stream", async ({ page }) => {
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
          description: "History reconstruction test",
        }),
      });
      return;
    }

    if (path === "/api/v1/catalog/list" && method === "POST") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          items: [{ id: "s-2", agentId: "echo_agent", name: "Session S2", lastActiveAt: Date.now() }],
          total: 1,
          hasMore: false,
        }),
      });
      return;
    }

    if (path === "/api/v1/catalog/session/s-2" && method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "s-2",
          events: [
            { type: "RUN_STARTED", run_id: "run-h", thread_id: "s-2" },
            { type: "TOOL_CALL_ARGS", run_id: "run-h", tool_call_id: "tc-h", delta: "{\"cmd\":\"" },
            { type: "TOOL_CALL_START", run_id: "run-h", tool_call_id: "tc-h", tool_call_name: "run_cmd" },
            { type: "TOOL_CALL_ARGS", run_id: "run-h", tool_call_id: "tc-h", delta: "pwd\"}" },
            { type: "TOOL_CALL_RESULT", run_id: "run-h", tool_call_id: "tc-h", tool_call_name: "run_cmd", content: "/workspace" },
            { type: "RUN_FINISHED", run_id: "run-h" },
          ],
        }),
      });
      return;
    }

    await route.continue();
  });

  await page.goto("/chat/echo_agent?sessionId=s-2");
  await expect(page.getByText("1 tool used")).toBeVisible();
  await page.getByText("1 tool used").click();
  await expect(page.getByText("run_cmd")).toBeVisible();
  await expect(page.getByText(/pwd/)).toBeVisible();
});
