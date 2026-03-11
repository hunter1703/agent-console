import { expect, test } from "@playwright/test";
import { installMockApi } from "./helpers/mockApi";
import { gotoBuilder, saveBuilder } from "./helpers/builder";

test("AC-AGT-010 agent builder renders step/section navigation from layout.fields metadata", async ({ page }) => {
  await installMockApi(page);
  await gotoBuilder(page, "/settings/agents/new");

  const steps = page.getByTestId("builder-steps");
  await expect(steps).toContainText("Identity");
  await expect(steps).toContainText("Model");
  await expect(steps).toContainText("Guardrails");
  await expect(steps).toContainText("Runtime");
});

test("AC-AGT-011 schema + layout fields render without frontend hardcoding", async ({ page }) => {
  await installMockApi(page);
  await gotoBuilder(page, "/settings/agents/new");
  await expect(page.getByText("Avatar")).toBeVisible();
  await expect(page.getByText("Description")).toBeVisible();
});

test("AC-AGT-012a create roundtrip payload is sent", async ({ page }) => {
  const mock = await installMockApi(page);

  await gotoBuilder(page, "/settings/agents/new");
  await expect(page.getByText("ID", { exact: true })).toHaveCount(0);
  await saveBuilder(page);
  await expect.poll(() => mock.createdAgents.length).toBe(1);
});

test("AC-AGT-012b edit roundtrip payload is sent", async ({ page }) => {
  const mock = await installMockApi(page);
  await gotoBuilder(page, "/settings/agents/support-agent");
  await saveBuilder(page);
  await expect.poll(() => mock.updatedAgents.length).toBe(1);
});

test("AC-AGT-013 dynamic schema lookup for tool configs is rendered", async ({ page }) => {
  await installMockApi(page);
  await gotoBuilder(page, "/settings/agents/support-agent");
  await page.getByTestId("step-model").click();
  const modelSection = page.getByTestId("builder-section-model");
  await expect(modelSection.getByText("Tool Name", { exact: true })).toBeVisible();
  await expect(modelSection.getByText("Command", { exact: true })).toBeVisible();
});

test("AC-AGT-014 dynamic schema lookup only refetches when dependent values change", async ({ page }) => {
  const mock = await installMockApi(page);
  await gotoBuilder(page, "/settings/agents/support-agent");
  await page.getByTestId("step-model").click();

  const modelSection = page.getByTestId("builder-section-model");
  await expect(modelSection.getByText("Command", { exact: true })).toBeVisible();
  await expect.poll(() => mock.dynamicSchemaRequests.length).toBeGreaterThan(0);
  const beforeEdit = mock.dynamicSchemaRequests.length;

  await modelSection.locator("textarea").first().fill("Updated system prompt");
  await expect.poll(() => mock.dynamicSchemaRequests.length).toBe(beforeEdit);
});

test("AC-AGT-015 dynamic schema field is hidden when backend returns empty schema", async ({ page }) => {
  await installMockApi(page, { emptyDynamicSchema: true });
  await gotoBuilder(page, "/settings/agents/support-agent");
  await page.getByTestId("step-model").click();

  const modelSection = page.getByTestId("builder-section-model");
  await expect(modelSection.getByText("Tool Name", { exact: true })).toBeVisible();
  await expect(modelSection.getByText("Configuration", { exact: true })).toHaveCount(0);
  await expect(modelSection.getByText("Command", { exact: true })).toHaveCount(0);
});

test("AC-AGT-022a draft restore hydrates builder state from localStorage", async ({ page, isMobile }) => {
  test.skip(isMobile, "Draft restore assertion is validated in desktop profile.");
  await installMockApi(page);
  const key = "schema-builder:draft:agent:new";
  await gotoBuilder(page, "/settings/agents/new");
  await page.evaluate((draftKey) => {
    localStorage.setItem(
      draftKey,
      JSON.stringify({
        data: { name: "Recovered Draft Agent", description: "Recovered draft description." },
        updatedAt: Date.now(),
      }),
    );
  }, key);
  await page.reload();
  await expect(page.locator("[data-testid$='-builder']")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Restore draft?" })).toBeVisible();
  await page.getByRole("button", { name: "Restore" }).click();

  const jsonPreview = page.getByTestId("builder-json-preview");
  await expect(jsonPreview).toContainText('"name": "Recovered Draft Agent"');
  await expect(jsonPreview).toContainText('"description": "Recovered draft description."');
});

test("AC-AGT-022b draft discard keeps server-loaded edit state and clears localStorage draft", async ({ page }) => {
  await installMockApi(page);
  const key = "schema-builder:draft:agent:support-agent";
  await page.addInitScript(() => {
    localStorage.setItem(
      "schema-builder:draft:agent:support-agent",
      JSON.stringify({
        data: { name: "Discarded Draft Name", description: "Should not persist." },
        updatedAt: Date.now(),
      }),
    );
  });

  await gotoBuilder(page, "/settings/agents/support-agent");
  await expect(page.getByRole("heading", { name: "Restore draft?" })).toBeVisible();
  await page.getByRole("button", { name: "Discard" }).click();

  const jsonPreview = page.getByTestId("builder-json-preview");
  await expect(jsonPreview).toContainText('"name": "Support Agent"');
  await expect(jsonPreview).toContainText('"description": "Customer support specialist."');
  await expect(jsonPreview).not.toContainText("Discarded Draft Name");
  await expect.poll(() => page.evaluate((draftKey) => localStorage.getItem(draftKey), key)).toBeNull();
});

test("AC-AGT-022c refresh on clean baseline does not show restore draft dialog", async ({ page }) => {
  await installMockApi(page);
  await gotoBuilder(page, "/settings/agents/new");
  await page.reload();
  await expect(page.locator("[data-testid$='-builder']")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Restore draft?" })).toHaveCount(0);
});
