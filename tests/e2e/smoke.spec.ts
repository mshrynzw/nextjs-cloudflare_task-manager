import { expect, test } from "@playwright/test";

test.describe("login page smoke", () => {
  test("renders the sign in screen", async ({ page }) => {
    await page.goto("/login");

    await expect(
      page.getByRole("heading", {
        name: /sign in/i,
      }),
    ).toBeVisible();
  });
});
