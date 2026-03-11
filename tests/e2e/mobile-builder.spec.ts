import { expect, Page, test } from "@playwright/test";
import { installMockApi } from "./helpers/mockApi";
import { gotoBuilder } from "./helpers/builder";

async function installChatMockApi(page: Page) {
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
          description: "Mobile safe area check",
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

    await route.continue();
  });
}

test("AC-MOB-010 mobile builder keeps step navigation actions accessible", async ({ page }) => {
  await installMockApi(page);
  await gotoBuilder(page, "/settings/agents/new");

  await expect(page.getByTestId("builder-next-step")).toBeVisible();
  await page.getByTestId("builder-next-step").click();
  await expect(page.getByTestId("builder-section-model")).toBeVisible();
});

test("AC-MOB-011 iOS safe-area contracts keep chat composer visible and usable", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Safe-area contract is validated on the mobile browser profile.");
  await installChatMockApi(page);
  await page.goto("/chat/echo_agent");

  await expect(page.locator('meta[name="viewport"]')).toHaveAttribute("content", /viewport-fit=cover/);
  await expect(page.getByPlaceholder("Message…")).toBeVisible();

  const shell = page.getByTestId("message-input-shell");
  await expect.poll(() => shell.evaluate((node) => node.className.includes("safe-area-inset-bottom"))).toBe(true);
  const paddingBottom = await shell.evaluate((node) =>
    Number.parseFloat(window.getComputedStyle(node).paddingBottom),
  );
  expect(paddingBottom).toBeGreaterThanOrEqual(12);

  await page.getByPlaceholder("Message…").fill("safe area");
  await expect(page.getByPlaceholder("Message…")).toHaveValue("safe area");
});
