import { expect, test, type Page } from "@playwright/test";
import {
  DEMO_USER_EMAIL,
  DEMO_USER_PASSWORD,
} from "../../lib/db/seed";

async function signIn(page: Page) {
  await page.goto("/login");
  await page.locator("#email").fill(DEMO_USER_EMAIL);
  await page.locator("#password").fill(DEMO_USER_PASSWORD);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
}

test.describe("critical user journey", () => {
  test("login → dashboard → projects → board → task → logout", async ({
    page,
  }) => {
    await signIn(page);

    await expect(
      page.getByRole("heading", { name: "Overview" }),
    ).toBeVisible();

    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Projects" }).click();
    await expect(page).toHaveURL(/\/projects/);
    await expect(
      page.getByRole("heading", { name: "Projects" }),
    ).toBeVisible();

    await page.getByRole("link", { name: "Website Redesign" }).first().click();
    await expect(page).toHaveURL(/\/projects\/project_/);

    await page.getByRole("link", { name: "Open board" }).click();
    await expect(page).toHaveURL(/\/board/);
    await expect(
      page.getByRole("heading", { name: "Task Board" }),
    ).toBeVisible();

    await page.getByRole("link", { name: "Design login page" }).click();
    await expect(page).toHaveURL(/\/tasks\/task_/);

    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/login/);
    await expect(
      page.getByRole("heading", { name: /sign in/i }),
    ).toBeVisible();
  });

  test("rejects invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.locator("#email").fill(DEMO_USER_EMAIL);
    await page.locator("#password").fill("WrongPass999!");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });
});
