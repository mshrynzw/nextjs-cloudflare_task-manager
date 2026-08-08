import { expect, test } from "@playwright/test";

test.describe("login page smoke", () => {
  test("renders the sign in screen", async ({ page }) => {
    await page.goto("/login");

    await expect(
      page.getByRole("heading", {
        name: /sign in/i,
      }),
    ).toBeVisible();

    await expect(page.getByLabel("Email").first()).toBeVisible();
    await expect(page.getByLabel("Password").first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
  });

  test("redirects unauthenticated users from dashboard to login", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });
});
