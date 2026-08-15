import { expect, test } from "@playwright/test";

test.describe("login page smoke", () => {
  test("renders the sign in screen", async ({ page }) => {
    await page.goto("/login");

    await expect(
      page.getByRole("heading", {
        name: "サインイン",
      }),
    ).toBeVisible();

    await expect(page.getByLabel("メール").first()).toBeVisible();
    await expect(page.getByLabel("パスワード").first()).toBeVisible();
    await expect(
      page.getByRole("button", { name: "サインイン" }),
    ).toBeVisible();
  });

  test("redirects unauthenticated users from dashboard to login", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });
});
