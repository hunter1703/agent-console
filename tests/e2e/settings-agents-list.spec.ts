import { expect, test } from "@playwright/test";
import { installMockApi } from "./helpers/mockApi";

test("AC-AGT-001 settings lists agents/models and routes to dedicated builders", async ({ page }) => {
  await installMockApi(page);
  await page.goto("/settings");

  await expect(page.getByTestId("settings-page")).toBeVisible();
  await expect(page.getByText("Support Agent")).toBeVisible();
  await expect(page.getByTestId("settings-new-agent")).toBeVisible();

  await page.getByTestId("settings-new-agent").click();
  await expect(page).toHaveURL(/\/settings\/agents\/new$/);

  await page.goto("/settings");
  await page.getByRole("button", { name: "models" }).click();
  await expect(page.getByTestId("settings-new-model")).toBeVisible();
  await page.getByTestId("settings-new-model").click();
  await expect(page).toHaveURL(/\/settings\/models\/new$/);
});

test("AC-INF-002 offline banner appears when health check fails", async ({ page }) => {
  await installMockApi(page, { offlineHealth: true });
  await page.goto("/");
  await expect(page.getByText("Backend unreachable · Retrying...")).toBeVisible();
});

test("AC-AGT-003 list row action controls reveal on hover", async ({ page, isMobile }) => {
  test.skip(isMobile, "Row hover interactions are desktop-only.");
  await installMockApi(page);
  await page.goto("/settings");

  const agentRow = page.locator("div.group", { hasText: "Support Agent" }).first();
  const agentActions = agentRow.locator("div.transition-opacity").first();
  await expect(agentActions).toHaveCSS("opacity", "0");
  await agentRow.hover();
  await expect(agentActions).toHaveCSS("opacity", "1");
  await expect(agentRow.getByRole("link", { name: "Edit agent" })).toBeVisible();
  await expect(agentRow.getByRole("button", { name: "Delete agent" })).toBeVisible();

  await page.getByRole("button", { name: "models" }).click();
  const modelRow = page.locator("div.group", { hasText: "GPT 4o Mini" }).first();
  const modelActions = modelRow.locator("div.transition-opacity").first();
  await expect(modelActions).toHaveCSS("opacity", "0");
  await modelRow.hover();
  await expect(modelActions).toHaveCSS("opacity", "1");
  await expect(modelRow.getByRole("link", { name: "Edit model" })).toBeVisible();
  await expect(modelRow.getByRole("button", { name: "Delete model" })).toBeVisible();
});
