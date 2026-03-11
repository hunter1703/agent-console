import { expect, test } from "@playwright/test";
import { installMockApi } from "./helpers/mockApi";
import { gotoBuilder, saveBuilder } from "./helpers/builder";

test("AC-MDL-010 model builder renders backend-driven steps", async ({ page }) => {
  await installMockApi(page);
  await gotoBuilder(page, "/settings/models/new");
  await expect(page.getByTestId("builder-steps")).toContainText("Identity");
  await expect(page.getByTestId("builder-steps")).toContainText("Sampling");
  await expect(page.getByTestId("builder-steps")).toContainText("Integration");
});

test("AC-MDL-010b root presets apply backend payload patch", async ({ page }) => {
  await installMockApi(page);
  await gotoBuilder(page, "/settings/models/new");

  await page.getByTestId("preset-focused").click();
  await expect(page.getByTestId("builder-json-preview")).toContainText("\"inference\"");
  await expect(page.getByTestId("builder-json-preview")).toContainText("\"temperature\": 0.2");
});

test("AC-MDL-011a model create roundtrip payload is sent", async ({ page }) => {
  const mock = await installMockApi(page);

  await gotoBuilder(page, "/settings/models/new");
  await saveBuilder(page);
  await expect.poll(() => mock.createdModels.length).toBe(1);
});

test("AC-MDL-011b model edit roundtrip payload is sent", async ({ page }) => {
  const mock = await installMockApi(page);
  await gotoBuilder(page, "/settings/models/llama-3-8b");
  await saveBuilder(page);
  await expect.poll(() => mock.updatedModels.length).toBe(1);
});
