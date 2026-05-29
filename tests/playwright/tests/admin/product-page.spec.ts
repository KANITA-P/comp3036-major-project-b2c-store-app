import { client } from "@repo/db/client";
import { seed } from "@repo/db/seed";
import { expect, test } from "@playwright/test";

const adminEmail = process.env.ADMIN_EMAIL ?? "admin@threadline.com";
const adminPassword = process.env.ADMIN_PASSWORD ?? "test-admin-password";
const customerEmail = `admin-reject-customer-${Date.now()}@example.com`;
const customerPassword = "Password123";

test.beforeAll(async () => {
  await seed();
});

test.afterAll(async () => {
  await client.db.user.deleteMany({
    where: {
      email: customerEmail,
    },
  });
});

async function login(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByLabel("Email").fill(adminEmail);
  await page.getByLabel("Password", { exact: true }).fill(adminPassword);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(
    page.getByRole("heading", { name: "Store Product Admin" }),
  ).toBeVisible();
}

test.describe("Admin product management", () => {
  test("admin login page loads", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Welcome back" }),
    ).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
  });

  test("invalid admin credentials fail", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Email").fill(adminEmail);
    await page.getByLabel("Password", { exact: true }).fill("wrong-password");
    await page.getByRole("button", { name: "Sign In" }).click();

    await expect(page.getByText("Invalid credentials")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Welcome back" }),
    ).toBeVisible();
  });

  test("normal customer user cannot access admin", async ({
    page,
    request,
  }) => {
    await request.post("http://localhost:3001/api/register", {
      data: {
        name: "Admin Reject Customer",
        email: customerEmail,
        password: customerPassword,
        confirmPassword: customerPassword,
      },
    });

    await page.goto("/");
    await page.getByLabel("Email").fill(customerEmail);
    await page.getByLabel("Password", { exact: true }).fill(customerPassword);
    await page.getByRole("button", { name: "Sign In" }).click();

    await expect(page.getByText("Invalid credentials")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Welcome back" }),
    ).toBeVisible();
  });

  test("shows product admin after login", async ({ page }) => {
    await login(page);

    await expect(
      page.getByRole("link", { name: "Create Product" }),
    ).toBeVisible();
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
    await expect(page.getByLabel("Name")).toHaveValue(
      "Wide Leg Utility Trouser",
    );
    await expect(page.getByLabel("Category")).toHaveValue("Pants");
    await expect(page.getByLabel("Price")).toHaveValue("129");
    await expect(page.getByAltText("Preview")).toBeVisible();
  });
});
