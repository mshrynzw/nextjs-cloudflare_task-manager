import { expect, test, type Page } from "@playwright/test";
import {
  DEMO_PROJECT_NAME,
  DEMO_TASK_TITLE,
  DEMO_USER_EMAIL,
  DEMO_USER_PASSWORD,
} from "../../lib/db/seed";

async function signIn(page: Page) {
  await page.goto("/login");
  await page.locator("#email").fill(DEMO_USER_EMAIL);
  await page.locator("#password").fill(DEMO_USER_PASSWORD);
  await page.getByRole("button", { name: "サインイン" }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
}

test.describe("critical user journey", () => {
  test("login → dashboard → projects → board → task → logout", async ({
    page,
  }) => {
    await signIn(page);

    await expect(page.getByRole("heading", { name: "概要" })).toBeVisible();

    await page
      .getByRole("navigation", { name: "メイン" })
      .getByRole("link", { name: "プロジェクト" })
      .click();
    await expect(page).toHaveURL(/\/projects/);
    await expect(
      page.getByRole("heading", { name: "プロジェクト" }),
    ).toBeVisible();

    await page.getByRole("link", { name: DEMO_PROJECT_NAME }).first().click();
    await expect(page).toHaveURL(/\/projects\/project_/);

    await page.getByRole("link", { name: "ボードを開く" }).click();
    await expect(page).toHaveURL(/\/board/);
    await expect(
      page.getByRole("heading", { name: "タスクボード" }),
    ).toBeVisible();

    await page.getByRole("link", { name: DEMO_TASK_TITLE }).click();
    await expect(page).toHaveURL(/\/tasks\/task_/);

    await page.getByRole("button", { name: "サインアウト" }).click();
    await expect(page).toHaveURL(/\/login/);
    await expect(
      page.getByRole("heading", { name: "サインイン" }),
    ).toBeVisible();
  });

  test("rejects invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.locator("#email").fill(DEMO_USER_EMAIL);
    await page.locator("#password").fill("WrongPass999!");
    await page.getByRole("button", { name: "サインイン" }).click();
    await expect(
      page.getByText("メールまたはパスワードが正しくありません。"),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });
});
