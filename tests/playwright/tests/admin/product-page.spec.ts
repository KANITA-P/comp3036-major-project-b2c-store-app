import { seed } from "@repo/db/seed";
import { expect, test } from "@playwright/test";

test.beforeAll(async () => {
  await seed();
});

async function login(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByLabel("Password", { exact: true }).fill("123");
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(
    page.getByRole("heading", { name: "Store Product Admin" }),
  ).toBeVisible();
}

test.describe("Admin product management", () => {
  test("shows product admin after login", async ({ page }) => {
    await login(page);

    await expect(page.getByRole("link", { name: "Create Product" })).toBeVisible();
    await expect(page.getByTestId("admin-product-card")).toHaveCount(8);
    await expect(
      page.getByTestId("admin-product-card").filter({
        has: page.getByRole("link", { name: "Stormline Shell Jacket" }),
        hasText: "Jackets",
      }),
    ).toBeVisible();
  });

  test("opens an existing product edit page", async ({ page }) => {
    await login(page);
    await page.getByRole("link", { name: "Wide Leg Utility Trouser" }).click();

    await expect(
      page.getByRole("heading", { name: "Wide Leg Utility Trouser" }),
    ).toBeVisible();
    await expect(page.getByLabel("Name")).toHaveValue("Wide Leg Utility Trouser");
    await expect(page.getByLabel("Category")).toHaveValue("Pants");
    await expect(page.getByLabel("Price")).toHaveValue("129");
    await expect(page.getByAltText("Preview")).toBeVisible();
  });
});
