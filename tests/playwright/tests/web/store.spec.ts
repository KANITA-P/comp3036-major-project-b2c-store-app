import { seed } from "@repo/db/seed";
import { expect, test } from "@playwright/test";

test.beforeAll(async () => {
  await seed();
});

test.describe("B2C store homepage", () => {
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
      page.getByTestId("product-card").filter({ hasText: "Stormline Shell Jacket" }),
    ).toBeVisible();
    await expect(
      page.getByTestId("product-card").filter({ hasText: "Everyday Heavy Hoodie" }),
    ).toBeVisible();
    await expect(
      page.getByTestId("product-card").filter({ hasText: "Wide Leg Utility Trouser" }),
    ).toBeVisible();
  });

  test("filters products by category", async ({ page }) => {
    await page.goto("/");
    const categoryLinks = page.getByLabel("Product categories");

    await categoryLinks.getByRole("link", { name: "Pants" }).click();

    await expect(page).toHaveURL(/\/category\/pants$/);
    await expect(categoryLinks.getByRole("link", { name: "Pants" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(page.getByTestId("product-card")).toHaveCount(2);
    await expect(
      page.getByTestId("product-card").filter({ hasText: "Tapered Cargo Pants" }),
    ).toBeVisible();
    await expect(
      page.getByTestId("product-card").filter({ hasText: "Wide Leg Utility Trouser" }),
    ).toBeVisible();
    await expect(page.getByText("Everyday Heavy Hoodie")).not.toBeVisible();
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
});
