import { seed } from "@repo/db/seed";
import { expect, test } from "@playwright/test";

test.beforeAll(async () => {
  await seed();
});

test.describe("Product search", () => {
  test("search input is visible and accepts typing", async ({ page }) => {
    await page.goto("/");

    const searchInput = page.getByPlaceholder("Search products");

    await expect(searchInput).toBeVisible();
    await searchInput.fill("Jacket");
    await expect(searchInput).toHaveValue("Jacket");
  });

  test("searching for jackets shows matching products", async ({ page }) => {
    await page.goto("/");

    await page.getByPlaceholder("Search products").fill("Jacket");
    await page.getByPlaceholder("Search products").press("Enter");

    await expect(page).toHaveURL(/\/search\?q=Jacket$/);
    await expect(
      page.getByTestId("product-card").filter({ hasText: "Stormline Shell Jacket" }),
    ).toBeVisible();
    await expect(
      page.getByTestId("product-card").filter({ hasText: "Wool Blend Overshirt" }),
    ).toBeVisible();
    await expect(
      page.getByTestId("product-card").filter({ hasText: "Everyday Heavy Hoodie" }),
    ).toHaveCount(0);
  });

  test("search query URL loads hoodie products", async ({ page }) => {
    await page.goto("/search?q=Hoodies");

    await expect(
      page.getByTestId("product-card").filter({ hasText: "Everyday Heavy Hoodie" }),
    ).toBeVisible();
    await expect(
      page.getByTestId("product-card").filter({ hasText: "Quarter Zip Travel Hoodie" }),
    ).toBeVisible();
    await expect(
      page.getByTestId("product-card").filter({ hasText: "Stormline Shell Jacket" }),
    ).toHaveCount(0);
  });

  test("invalid search shows no matching products", async ({ page }) => {
    await page.goto("/search?q=not-a-real-product");

    await expect(page.getByText("0 products available")).toBeVisible();
    await expect(page.getByText("No products found.")).toBeVisible();
    await expect(page.getByTestId("product-card")).toHaveCount(0);
  });
});
