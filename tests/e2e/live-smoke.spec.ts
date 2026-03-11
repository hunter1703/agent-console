import { expect, test } from "@playwright/test";

test("@live AC-LIVE-001 settings page loads in live mode", async ({ page }) => {
  await page.goto("/settings");
  await expect(page.getByTestId("settings-page")).toBeVisible();
});
