import { expect, test } from "@playwright/test";

test.describe("home page smoke", () => {
  test("renders the default Next.js starter content", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", {
        name: /to get started, edit the page\.tsx file/i,
      }),
    ).toBeVisible();
  });
});
