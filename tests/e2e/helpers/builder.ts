import { expect, Page } from "@playwright/test";

export async function gotoBuilder(page: Page, path: string) {
  await page.goto(path);
  await expect(page.locator("[data-testid$='-builder']")).toBeVisible();
}

export async function nextStep(page: Page) {
  await page.getByTestId("builder-next-step").click();
}

export async function saveBuilder(page: Page) {
  await page.getByTestId("builder-save").click();
}
