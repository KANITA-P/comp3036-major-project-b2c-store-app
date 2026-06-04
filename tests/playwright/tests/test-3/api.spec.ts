import { client } from "@repo/db/client";
import { seed } from "@repo/db/seed";
import { expect, test } from "@playwright/test";

const uniquePrefix = `api-${Date.now()}`;
const customerEmail = `${uniquePrefix}-customer@example.com`;
const orderCustomerEmail = `${uniquePrefix}-order-customer@example.com`;
const customerPassword = "Password123";
const adminEmail = process.env.ADMIN_EMAIL ?? "admin@threadline.com";
const adminPassword = process.env.ADMIN_PASSWORD ?? "test-admin-password";
const adminUrl = (
  process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:3002"
).replace(/\/$/, "");

test.beforeAll(async () => {
  await seed();
});

test.afterAll(async () => {
  await client.db.user.deleteMany({
    where: {
      email: {
        in: [customerEmail, orderCustomerEmail],
      },
    },
  });
  await client.db.product.deleteMany({
    where: {
      name: {
        startsWith: "Playwright API",
      },
    },
  });
});

test.describe("B2C store APIs", () => {
  test("GET /api/products returns database products", async ({ request }) => {
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

  test("customer register, login, and current session APIs work", async ({
    request,
  }) => {
    const registerResponse = await request.post("/api/register", {
      data: {
        name: "API Customer",
        email: customerEmail,
        password: customerPassword,
        confirmPassword: customerPassword,
      },
    });

    expect(registerResponse.status()).toBe(201);
    await expect(registerResponse).toBeOK();

    const loginResponse = await request.post("/api/login", {
      data: {
        email: customerEmail,
        password: customerPassword,
      },
    });

    expect(loginResponse.status()).toBe(200);
    await expect(loginResponse).toBeOK();

    const meResponse = await request.get("/api/me");
    const meBody = await meResponse.json();

    expect(meResponse.status()).toBe(200);
    expect(meBody.user).toEqual(
      expect.objectContaining({
        email: customerEmail,
        name: "API Customer",
        role: "USER",
      }),
    );
  });

  test("POST /api/orders creates an order for a logged-in user", async ({
    request,
  }) => {
    await request.post("/api/register", {
      data: {
        name: "API Order Customer",
        email: orderCustomerEmail,
        password: customerPassword,
        confirmPassword: customerPassword,
      },
    });
    await request.post("/api/login", {
      data: {
        email: orderCustomerEmail,
        password: customerPassword,
      },
    });
    const productsResponse = await request.get("/api/products");
    const products = await productsResponse.json();
    const product = products.find(
      (item: { stockQuantity: number }) => item.stockQuantity > 0,
    );

    expect(product).toBeTruthy();

    const orderResponse = await request.post("/api/orders", {
      data: {
        items: [
          {
            productId: product.id,
            quantity: 1,
          },
        ],
      },
    });
    const orderBody = await orderResponse.json();

    expect(orderResponse.status()).toBe(200);
    expect(orderBody).toEqual(
      expect.objectContaining({
        success: true,
        order: expect.objectContaining({
          id: expect.any(Number),
          total: expect.any(Number),
          count: 1,
        }),
      }),
    );
  });

  test("admin product APIs create, update, and delete products", async ({
    request,
  }) => {
    const authResponse = await request.post(`${adminUrl}/api/auth`, {
      data: {
        email: adminEmail,
        password: adminPassword,
      },
    });

    expect(authResponse.status()).toBe(200);
    await expect(authResponse).toBeOK();

    const createResponse = await request.post(`${adminUrl}/api/products`, {
      data: {
        name: `Playwright API Product ${uniquePrefix}`,
        description: "Created by Playwright API coverage.",
        image: "https://example.com/playwright-api-product.jpg",
        category: "Jackets",
        price: 55,
        stock: 4,
      },
    });
    const createdProduct = await createResponse.json();

    expect(createResponse.status()).toBe(201);
    expect(createdProduct).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        name: `Playwright API Product ${uniquePrefix}`,
      }),
    );

    const updateResponse = await request.patch(
      `${adminUrl}/api/products/${createdProduct.id}`,
      {
        data: {
          name: `Playwright API Product ${uniquePrefix} Updated`,
          description: "Updated by Playwright API coverage.",
          image: "https://example.com/playwright-api-product-updated.jpg",
          category: "Jackets",
          price: 66,
          stock: 3,
        },
      },
    );
    const updatedProduct = await updateResponse.json();

    expect(updateResponse.status()).toBe(200);
    expect(updatedProduct).toEqual(
      expect.objectContaining({
        id: createdProduct.id,
        name: `Playwright API Product ${uniquePrefix} Updated`,
      }),
    );

    const deleteResponse = await request.delete(
      `${adminUrl}/api/products/${createdProduct.id}`,
    );

    expect(deleteResponse.status()).toBe(200);
    await expect(deleteResponse).toBeOK();
  });
});
