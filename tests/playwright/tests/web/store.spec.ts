import { seed } from "@repo/db/seed";
import { expect, test } from "@playwright/test";

test.beforeAll(async () => {
  await seed();
});

test.describe("B2C store homepage", () => {
  test("public products API returns database products", async ({ request }) => {
    const response = await request.get("/api/products");
    const products = await response.json();

    expect(response.status()).toBe(200);
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThanOrEqual(8);
    expect(products[0]).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        name: expect.any(String),
        description: expect.any(String),
        price: expect.any(Number),
        image: expect.any(String),
        stockQuantity: expect.any(Number),
        category: expect.objectContaining({
          id: expect.any(Number),
          name: expect.any(String),
        }),
      }),
    );
  });

  test("shows the store homepage and seeded products", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", {
        name: "Clean layers for everyday movement.",
      }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Threadline" })).toBeVisible();
    await expect(page.getByTestId("product-card")).toHaveCount(8);
    await expect(
      page
        .getByTestId("product-card")
        .filter({ hasText: "Stormline Shell Jacket" }),
    ).toBeVisible();
    await expect(
      page
        .getByTestId("product-card")
        .filter({ hasText: "Everyday Heavy Hoodie" }),
    ).toBeVisible();
    await expect(
      page
        .getByTestId("product-card")
        .filter({ hasText: "Wide Leg Utility Trouser" }),
    ).toBeVisible();
  });

  test("product cards show product details", async ({ page }) => {
    await page.goto("/");

    const card = page
      .getByTestId("product-card")
      .filter({ hasText: "Stormline Shell Jacket" });

    await expect(card).toBeVisible();
    await expect(
      card.getByRole("img", { name: "Stormline Shell Jacket" }),
    ).toBeVisible();
    await expect(card).toContainText("Jackets");
    await expect(card).toContainText("Size: M. Fit: relaxed shell fit");
    await expect(card).toContainText("$189.00");
    await expect(card).toContainText("12 in stock");
    await expect(
      card.getByRole("button", { name: "Add to Cart" }),
    ).toBeEnabled();
    await expect(
      card.getByRole("link", { name: "Stormline Shell Jacket", exact: true }),
    ).toBeVisible();
    await expect(
      card.getByRole("link", { name: "View Stormline Shell Jacket" }),
    ).toBeVisible();
  });

  test("opens product detail page from a product card", async ({ page }) => {
    await page.goto("/");

    const productLink = page
      .getByTestId("product-card")
      .filter({ hasText: "Stormline Shell Jacket" })
      .getByRole("link", { name: "Stormline Shell Jacket", exact: true });

    await Promise.all([
      page.waitForURL(/\/product\/\d+$/),
      productLink.click(),
    ]);

    await expect(page).toHaveURL(/\/product\/\d+$/);

    const detail = page.getByTestId("product-detail");

    await expect(
      detail.getByRole("img", { name: "Stormline Shell Jacket" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Stormline Shell Jacket" }),
    ).toBeVisible();
    await expect(detail).toContainText("Size: M. Fit: relaxed shell fit");
    await expect(detail).toContainText("$189.00");
    await expect(detail).toContainText("12 in stock");
    await expect(detail).toContainText("Jackets");
    await expect(
      page.getByRole("link", { name: "Back to shop" }),
    ).toBeVisible();
  });

  test("add to cart from product detail updates cart count", async ({
    page,
  }) => {
    await page.goto("/");

    const productLink = page
      .getByTestId("product-card")
      .filter({ hasText: "Stormline Shell Jacket" })
      .getByRole("link", { name: "Stormline Shell Jacket", exact: true });

    await Promise.all([
      page.waitForURL(/\/product\/\d+$/),
      productLink.click(),
    ]);

    await expect(page.getByTestId("cart-button")).toContainText("0");
    await page
      .getByTestId("product-detail")
      .getByRole("button", { name: "Add to Cart" })
      .click();

    await expect(page.getByTestId("cart-button")).toContainText("1");
  });

  test("invalid product id shows product not found", async ({ page }) => {
    await page.goto("/product/not-a-real-product");

    await expect(
      page.getByRole("heading", { name: "Product not found" }),
    ).toBeVisible();
    await expect(page.getByText("Product unavailable")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Back to shop" }),
    ).toBeVisible();
  });

  test("category filters display and filter products", async ({ page }) => {
    await page.goto("/");
    const categoryLinks = page.getByLabel("Product categories");

    await expect(
      categoryLinks.getByRole("link", { name: "All" }),
    ).toHaveAttribute("aria-current", "page");
    await expect(
      categoryLinks.getByRole("link", { name: "Jackets" }),
    ).toBeVisible();
    await expect(
      categoryLinks.getByRole("link", { name: "Hoodies" }),
    ).toBeVisible();
    await expect(
      categoryLinks.getByRole("link", { name: "Pants" }),
    ).toBeVisible();
    await expect(
      categoryLinks.getByRole("link", { name: "Accessories" }),
    ).toBeVisible();

    await categoryLinks.getByRole("link", { name: "Jackets" }).click();

    await expect(page).toHaveURL(/\/category\/jackets$/);
    await expect(page.getByTestId("product-card")).toHaveCount(2);
    await expect(
      page
        .getByTestId("product-card")
        .filter({ hasText: "Stormline Shell Jacket" }),
    ).toBeVisible();

    await categoryLinks.getByRole("link", { name: "Hoodies" }).click();

    await expect(page).toHaveURL(/\/category\/hoodies$/);
    await expect(page.getByTestId("product-card")).toHaveCount(2);
    await expect(
      page
        .getByTestId("product-card")
        .filter({ hasText: "Everyday Heavy Hoodie" }),
    ).toBeVisible();

    await categoryLinks.getByRole("link", { name: "Pants" }).click();

    await expect(page).toHaveURL(/\/category\/pants$/);
    await expect(
      categoryLinks.getByRole("link", { name: "Pants" }),
    ).toHaveAttribute("aria-current", "page");
    await expect(page.getByTestId("product-card")).toHaveCount(2);
    await expect(
      page
        .getByTestId("product-card")
        .filter({ hasText: "Tapered Cargo Pants" }),
    ).toBeVisible();
    await expect(
      page
        .getByTestId("product-card")
        .filter({ hasText: "Wide Leg Utility Trouser" }),
    ).toBeVisible();
    await expect(page.getByText("Everyday Heavy Hoodie")).not.toBeVisible();

    await categoryLinks.getByRole("link", { name: "Accessories" }).click();

    await expect(page).toHaveURL(/\/category\/accessories$/);
    await expect(page.getByTestId("product-card")).toHaveCount(2);
    await expect(
      page.getByTestId("product-card").filter({ hasText: "Rib Knit Beanie" }),
    ).toBeVisible();

    await categoryLinks.getByRole("link", { name: "All" }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByTestId("product-card")).toHaveCount(8);
  });

  test("updates the cart count when products are added", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByTestId("cart-button")).toContainText("0");
    await page
      .getByTestId("product-card")
      .filter({ hasText: "Stormline Shell Jacket" })
      .getByRole("button", { name: "Add to Cart" })
      .click();

    await expect(page.getByTestId("cart-button")).toContainText("1");
    await expect(
      page.getByRole("heading", { name: "1 item · $189.00" }),
    ).toBeVisible();
  });
  // TODO: add a broken image fallback layout test if editable storefront images become part of the customer UI.
});
