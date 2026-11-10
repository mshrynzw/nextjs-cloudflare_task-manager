import { expect, test } from "@playwright/test";
import { DEMO_USER_EMAIL, DEMO_USER_PASSWORD } from "../../lib/db/seed";

test.describe("accessibility smoke", () => {
  test("skip link moves focus to main content", async ({ page }) => {
    await page.goto("/login");
    await page.locator("#email").fill(DEMO_USER_EMAIL);
    await page.locator("#password").fill(DEMO_USER_PASSWORD);
    await page.getByRole("button", { name: "サインイン" }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "メインコンテンツへスキップ" });
    await expect(skip).toBeFocused();
    await skip.press("Enter");
    await expect(page.locator("#main-content")).toBeFocused();
  });

  test("command palette opens with Ctrl+K and closes with Escape", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.locator("#email").fill(DEMO_USER_EMAIL);
    await page.locator("#password").fill(DEMO_USER_PASSWORD);
    await page.getByRole("button", { name: "サインイン" }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

    // CommandPalette is dynamically imported; retry until the listener is ready.
    const dialog = page.getByRole("dialog", { name: "コマンドパレット" });
    await expect(async () => {
      if (await dialog.isVisible()) {
        return;
      }
      await page.keyboard.press("Control+KeyK");
      await expect(dialog).toBeVisible({ timeout: 500 });
    }).toPass({ timeout: 15_000 });

    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
  });
});
