import { expect, test } from "@playwright/test";
import { installMockApi } from "./helpers/mockApi";
import { gotoBuilder } from "./helpers/builder";

test("AC-AGT-020 visibility rules react to discriminator changes", async ({ page, isMobile }) => {
  test.skip(isMobile, "Desktop coverage for this validation path.");
  await installMockApi(page);
  await gotoBuilder(page, "/settings/agents/new");
  await expect(page.getByText("Sub Agents")).toHaveCount(0);

  const typeSelect = page.locator("select").first();
  await typeSelect.selectOption("orchestrator");

  await expect(page.getByText("Sub Agents", { exact: true })).toBeVisible();
  await expect(page.getByText("Orchestration Mode", { exact: true })).toBeVisible();
});

test("AC-AGT-021 fallback generic mode renders when wizard metadata is missing", async ({ page }) => {
  await installMockApi(page, { omitAgentWizardLayout: true });
  await gotoBuilder(page, "/settings/agents/new");
  await expect(page.getByTestId("basic-mode-banner")).toBeVisible();
});

test("AC-INF-005 builder load failures do not trigger infinite schema/config refetch loops", async ({
  page,
}) => {
  let schemaCalls = 0;
  let configCalls = 0;

  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method().toUpperCase();

    if (path === "/api/health") {
      await route.fulfill({ status: 200, contentType: "text/plain", body: "ok" });
      return;
    }

    if (path === "/api/schemas/agent" && method === "GET") {
      schemaCalls += 1;
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ message: "schema unavailable" }),
      });
      return;
    }

    if (path === "/api/v1/catalog/agent/shell_agent" && method === "GET") {
      configCalls += 1;
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ message: "config unavailable" }),
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

    await route.continue();
  });

  await page.goto("/settings/agents/shell_agent");
  await expect(page.getByText("Failed to load schema for agent.")).toBeVisible();

  await page.waitForTimeout(900);
  const schemaAfterSettling = schemaCalls;
  const configAfterSettling = configCalls;

  expect(schemaAfterSettling).toBeGreaterThanOrEqual(1);
  expect(configAfterSettling).toBeGreaterThanOrEqual(1);
  expect(schemaAfterSettling).toBeLessThanOrEqual(3);
  expect(configAfterSettling).toBeLessThanOrEqual(3);

  await page.waitForTimeout(1200);
  expect(schemaCalls).toBe(schemaAfterSettling);
  expect(configCalls).toBe(configAfterSettling);
});
