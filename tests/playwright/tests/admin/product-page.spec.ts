import { client } from "@repo/db/client";
import { seed } from "@repo/db/seed";
import { expect, test } from "@playwright/test";

const adminEmail = process.env.ADMIN_EMAIL ?? "admin@threadline.com";
const adminPassword = process.env.ADMIN_PASSWORD ?? "test-admin-password";
const customerEmail = `admin-reject-customer-${Date.now()}@example.com`;
const customerPassword = "Password123";
const createdProductBaseName = `Playwright Test Jacket ${Date.now()}`;
const updatedProductName = `${createdProductBaseName} Updated`;
const deletedProductName = `Playwright Test Delete ${Date.now()}`;
const unauthDeleteProductName = `Playwright Test Unauth Delete ${Date.now()}`;
const customerDeleteProductName = `Playwright Test Customer Delete ${Date.now()}`;

test.beforeAll(async () => {
  await seed();
  await client.db.product.deleteMany({
    where: {
      name: {
        startsWith: "Playwright Test",
      },
    },
  });
});

test.afterAll(async () => {
  await client.db.user.deleteMany({
    where: {
      email: customerEmail,
    },
  });
  await client.db.product.deleteMany({
    where: {
      name: {
        startsWith: "Playwright Test",
      },
    },
  });
});

async function createTestProduct(name: string) {
  const category = await client.db.category.findUniqueOrThrow({
    where: {
      name: "Jackets",
    },
    select: {
      id: true,
    },
  });

  return client.db.product.create({
    data: {
      name,
      description: "Created by Playwright for product deletion coverage.",
      image: "https://example.com/playwright-delete-product.jpg",
      price: 64,
      stock: 3,
      categoryId: category.id,
    },
    select: {
      id: true,
    },
  });
}

async function createCustomerOrder() {
  const product = await client.db.product.findFirstOrThrow({
    where: {
      name: "Stormline Shell Jacket",
    },
    select: {
      id: true,
      name: true,
      price: true,
    },
  });
  const subtotal = Number(product.price).toFixed(2);

  await client.db.user.upsert({
    where: {
      email: customerEmail,
    },
    update: {
      name: "Admin Reject Customer",
      role: "USER",
    },
    create: {
      name: "Admin Reject Customer",
      email: customerEmail,
      password: "test-password-hash",
      role: "USER",
    },
  });

  await client.db.order.create({
    data: {
      user: {
        connect: {
          email: customerEmail,
        },
      },
      status: "CONFIRMED",
      totalAmount: subtotal,
      items: {
        create: {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          priceAtPurchase: subtotal,
          subtotal,
        },
      },
    },
  });
}

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

    await page.goto("/orders");

    await expect(page).toHaveURL(/\/$/);
    await expect(
      page.getByRole("heading", { name: "Welcome back" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Customer Orders" }),
    ).toHaveCount(0);
  });

  test("normal customer user cannot access admin purchase records", async ({
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

    await expect(page.getByRole("link", { name: "View Orders" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Create Product" }),
    ).toBeVisible();
    await expect(page.getByTestId("admin-product-card").first()).toBeVisible();
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

  test("admin can create and update a product", async ({ page }) => {
    await login(page);
    await page.getByRole("link", { name: "Create Product" }).click();

    await expect(
      page.getByRole("heading", { name: "Create Product" }),
    ).toBeVisible();

    await page.getByLabel("Name").fill(createdProductBaseName);
    await page.getByLabel("Category").fill("Jackets");
    await page
      .getByLabel("Description")
      .fill("Created by Playwright for product management coverage.");
    await page
      .getByLabel("Image URL")
      .fill("https://example.com/playwright-product.jpg");
    await page.getByLabel("Price").fill("77");
    await page.getByLabel("Stock").fill("5");
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByText("Product saved successfully")).toBeVisible();

    await page.goto("/");

    const createdCard = page
      .getByTestId("admin-product-card")
      .filter({ hasText: createdProductBaseName });

    await expect(createdCard).toBeVisible();
    await expect(createdCard).toContainText("$77.00");
    await expect(createdCard).toContainText("5 in stock");

    await createdCard
      .getByRole("link", { name: createdProductBaseName })
      .click();
    await page.getByLabel("Name").fill(updatedProductName);
    await page.getByLabel("Price").fill("88");
    await page.getByLabel("Stock").fill("6");
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByText("Product saved successfully")).toBeVisible();

    await page.goto("/");

    const updatedCard = page
      .getByTestId("admin-product-card")
      .filter({ hasText: updatedProductName });

    await expect(updatedCard).toBeVisible();
    await expect(updatedCard).toContainText("$88.00");
    await expect(updatedCard).toContainText("6 in stock");
  });

  test("admin can delete a product", async ({ page }) => {
    await createTestProduct(deletedProductName);
    await login(page);

    const productCard = page
      .getByTestId("admin-product-card")
      .filter({ hasText: deletedProductName });

    await expect(productCard).toBeVisible();

    page.once("dialog", async (dialog) => {
      expect(dialog.message()).toContain(deletedProductName);
      await dialog.accept();
    });

    await productCard
      .getByRole("button", { name: `Delete ${deletedProductName}` })
      .click();

    await expect(page.getByText(`${deletedProductName} deleted`)).toBeVisible();
    await expect(productCard).toHaveCount(0);

    const deletedProduct = await client.db.product.findFirst({
      where: {
        name: deletedProductName,
      },
    });

    expect(deletedProduct).toBeNull();
  });

  test("unauthenticated visitor cannot delete products", async ({
    page,
    request,
  }) => {
    const product = await createTestProduct(unauthDeleteProductName);

    const response = await request.delete(
      `http://localhost:3002/api/products/${product.id}`,
    );

    expect(response.status()).toBe(401);

    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Welcome back" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /Delete/ })).toHaveCount(0);
    const remainingProduct = await client.db.product.findUnique({
      where: {
        id: product.id,
      },
    });

    expect(remainingProduct).not.toBeNull();
  });

  test("normal customer cannot delete products through the admin API", async ({
    page,
    request,
  }) => {
    const product = await createTestProduct(customerDeleteProductName);

    await request.post("http://localhost:3001/api/register", {
      data: {
        name: "Admin Delete Reject Customer",
        email: customerEmail,
        password: customerPassword,
        confirmPassword: customerPassword,
      },
    });

    await page.goto("http://localhost:3001/login");
    await page.getByLabel("Email").fill(customerEmail);
    await page.getByLabel("Password").fill(customerPassword);
    await page.getByRole("button", { name: "Login" }).click();

    await expect(page.getByRole("link", { name: "Account" })).toBeVisible();

    const response = await page.request.delete(
      `http://localhost:3002/api/products/${product.id}`,
    );

    expect(response.status()).toBe(401);
    const remainingProduct = await client.db.product.findUnique({
      where: {
        id: product.id,
      },
    });

    expect(remainingProduct).not.toBeNull();
  });

  test("shows customer purchase records after admin login", async ({
    page,
  }) => {
    await createCustomerOrder();
    await login(page);
    await page.getByRole("link", { name: "View Orders" }).click();

    await expect(page).toHaveURL(/\/orders$/);
    await expect(
      page.getByRole("heading", { name: "Customer Orders" }),
    ).toBeVisible();
    await expect(page.getByTestId("admin-order-card").first()).toContainText(
      "Admin Reject Customer",
    );
    await expect(page.getByTestId("admin-order-card").first()).toContainText(
      customerEmail,
    );
    await expect(page.getByTestId("admin-order-card").first()).toContainText(
      "Stormline Shell Jacket",
    );
    await expect(page.getByTestId("admin-order-card").first()).toContainText(
      "CONFIRMED",
    );
  });
});
