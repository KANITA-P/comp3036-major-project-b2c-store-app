import { client } from "@repo/db/client";
import { seed } from "@repo/db/seed";
import { expect, test } from "@playwright/test";

const emailPrefix = `purchase-${Date.now()}`;
const testPassword = "Password123";
const createdEmails: string[] = [];
let emailCounter = 0;

test.beforeAll(async () => {
  await seed();
});

test.afterAll(async () => {
  await client.db.user.deleteMany({
    where: {
      email: {
        in: createdEmails,
      },
    },
  });
});

async function registerAndLogin(page: import("@playwright/test").Page) {
  emailCounter += 1;
  const email = `${emailPrefix}-${emailCounter}@example.com`;
  createdEmails.push(email);

  await page.goto("/register");
  await page.getByLabel("Name").fill("Purchase Tester");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(testPassword);
  await page.getByLabel("Confirm password").fill(testPassword);
  await page.getByRole("button", { name: "Register" }).click();
  await expect(page).toHaveURL(/\/login\?registered=1$/);

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(testPassword);
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page).toHaveURL("/");

  return email;
}

async function addProductToCart(
  page: import("@playwright/test").Page,
  productName: string,
) {
  await page.goto("/");
  await page
    .getByTestId("product-card")
    .filter({ hasText: productName })
    .getByRole("button", { name: "Add to Cart" })
    .click();
}

async function addStormlineJacket(page: import("@playwright/test").Page) {
  await addProductToCart(page, "Stormline Shell Jacket");
}

test.describe("Customer purchase flow", () => {
  test("cart page loads with an empty state", async ({ page }) => {
    await page.goto("/cart");

    await expect(
      page.getByRole("heading", { name: "Review your pieces" }),
    ).toBeVisible();
    await expect(page.getByText("Your cart is empty")).toBeVisible();
  });

  test("add to cart then view cart", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });

    await addStormlineJacket(page);

    await expect(page.getByTestId("cart-button")).toContainText("1");
    expect(
      consoleErrors.some((message) =>
        message.includes("Cannot update a component (`Navbar`)"),
      ),
    ).toBe(false);

    await page.getByTestId("cart-button").click();

    await expect(page).toHaveURL(/\/cart$/);
    await expect(
      page
        .getByTestId("cart-line")
        .filter({ hasText: "Stormline Shell Jacket" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Checkout" })).toBeVisible();
  });

  test("cart displays product details and quantity controls", async ({
    page,
  }) => {
    await addStormlineJacket(page);
    await page.goto("/cart");

    const cartLine = page
      .getByTestId("cart-line")
      .filter({ hasText: "Stormline Shell Jacket" });

    await expect(
      cartLine.getByRole("img", { name: "Stormline Shell Jacket" }),
    ).toBeVisible();
    await expect(cartLine).toContainText("Jackets");
    await expect(cartLine).toContainText("Size: M. Fit: relaxed shell fit");
    await expect(cartLine).toContainText("$189.00");
    await expect(cartLine.getByLabel("Quantity 1")).toBeVisible();
    await expect(page.getByLabel("Order summary")).toContainText("Subtotal");
    await expect(page.getByLabel("Order summary")).toContainText("$189.00");

    await cartLine
      .getByRole("button", {
        name: "Increase quantity for Stormline Shell Jacket",
      })
      .click();

    await expect(cartLine.getByLabel("Quantity 2")).toBeVisible();
    await expect(cartLine).toContainText("$378.00");

    await cartLine
      .getByRole("button", {
        name: "Decrease quantity for Stormline Shell Jacket",
      })
      .click();

    await expect(cartLine.getByLabel("Quantity 1")).toBeVisible();
  });

  test("cart quantity cannot exceed product stock", async ({ page }) => {
    await addStormlineJacket(page);
    await page.goto("/cart");

    const cartLine = page
      .getByTestId("cart-line")
      .filter({ hasText: "Stormline Shell Jacket" });
    const increaseButton = cartLine.getByRole("button", {
      name: "Increase quantity for Stormline Shell Jacket",
    });

    for (let count = 1; count < 12; count += 1) {
      await increaseButton.click();
    }

    await expect(cartLine.getByLabel("Quantity 12")).toBeVisible();
    await expect(increaseButton).toBeDisabled();
  });

  test("remove item from cart", async ({ page }) => {
    await addStormlineJacket(page);
    await page.goto("/cart");

    const cartLine = page
      .getByTestId("cart-line")
      .filter({ hasText: "Stormline Shell Jacket" });

    await cartLine.getByRole("button", { name: "Remove" }).click();

    await expect(cartLine).toHaveCount(0);
    await expect(page.getByText("Your cart is empty")).toBeVisible();
    await expect(page.getByTestId("cart-button")).toContainText("0");
  });

  test("checkout and orders redirect to login when logged out", async ({
    page,
  }) => {
    await page.goto("/checkout");

    await expect(page).toHaveURL(/\/login$/);
    await expect(
      page.getByRole("heading", { name: "Sign in to continue your cart." }),
    ).toBeVisible();

    await page.goto("/account/orders");

    await expect(page).toHaveURL(/\/login$/);
    await expect(
      page.getByRole("heading", { name: "Sign in to continue your cart." }),
    ).toBeVisible();
  });

  test("logged-in user can see checkout page", async ({ page }) => {
    await registerAndLogin(page);
    await addStormlineJacket(page);
    await page.goto("/checkout");

    await expect(
      page.getByRole("heading", { name: "Complete your purchase" }),
    ).toBeVisible();
    await expect(page.getByLabel("Full name")).toBeVisible();
    await expect(page.getByLabel("Delivery address")).toBeVisible();
    await expect(page.getByLabel("Payment method")).toBeVisible();
    await expect(page.getByLabel("Checkout order summary")).toContainText(
      "Stormline Shell Jacket",
    );
    await expect(page.getByLabel("Checkout order summary")).toContainText(
      "$189.00",
    );
  });

  test("mock payment form validates required fields", async ({ page }) => {
    await registerAndLogin(page);
    await addStormlineJacket(page);
    await page.goto("/checkout");

    await page.getByLabel("Full name").fill("");
    await page.getByRole("button", { name: "Place Order" }).click();

    await expect(
      page.getByText("Full name and delivery address are required."),
    ).toBeVisible();
  });

  test("mock checkout supports multiple cart items", async ({ page }) => {
    const email = await registerAndLogin(page);
    await addProductToCart(page, "Stormline Shell Jacket");
    await addProductToCart(page, "Rib Knit Beanie");
    await page.goto("/checkout");

    const summary = page.getByLabel("Checkout order summary");

    await expect(summary).toContainText("Stormline Shell Jacket");
    await expect(summary).toContainText("Rib Knit Beanie");
    await expect(summary).toContainText("$223.00");

    await page.getByLabel("Delivery address").fill("456 Multi Item Lane");
    await page.getByRole("button", { name: "Place Order" }).click();

    await expect(page).toHaveURL(/\/order-confirmation$/);
    await expect(page.getByTestId("cart-button")).toContainText("0");

    const order = await client.db.order.findFirst({
      where: {
        user: {
          email,
        },
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    expect(order).not.toBeNull();
    expect(Number(order?.totalAmount)).toBe(223);
    expect(order?.items).toHaveLength(2);
    expect(order?.items.map((item) => item.productName).sort()).toEqual([
      "Rib Knit Beanie",
      "Stormline Shell Jacket",
    ]);
  });

  test("checkout API rejects an empty cart body", async ({ page }) => {
    await registerAndLogin(page);

    const response = await page.request.post("/api/orders", {
      data: {},
    });
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body.error).toBe("Cart is empty");
  });

  test("checkout API rejects invalid product IDs", async ({ page }) => {
    await registerAndLogin(page);

    const response = await page.request.post("/api/orders", {
      data: {
        items: [
          {
            productId: 999999,
            quantity: 1,
          },
        ],
      },
    });
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body.error).toBe("Invalid cart product");
  });

  test("mock place order clears cart and shows confirmation", async ({
    page,
  }) => {
    await registerAndLogin(page);
    await addStormlineJacket(page);
    await page.goto("/checkout");

    await page.getByLabel("Delivery address").fill("123 Prototype Street");
    await page.getByRole("button", { name: "Place Order" }).click();

    await expect(page).toHaveURL(/\/order-confirmation$/);
    await expect(
      page.getByRole("heading", { name: "Thanks for your order." }),
    ).toBeVisible();
    await expect(page.getByTestId("cart-button")).toContainText("0");

    const order = await client.db.order.findFirst({
      where: {
        user: {
          email: createdEmails.at(-1),
        },
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    expect(order).not.toBeNull();
    expect(order?.status).toBe("CONFIRMED");
    expect(Number(order?.totalAmount)).toBeGreaterThan(0);
    expect(order?.items).toHaveLength(1);
    expect(order?.items[0]?.productName).toBe("Stormline Shell Jacket");

    await page.getByRole("link", { name: "View orders" }).click();

    await expect(page).toHaveURL(/\/account\/orders$/);
    await expect(page.getByTestId("customer-order")).toContainText(
      "Stormline Shell Jacket",
    );
    await expect(page.getByTestId("customer-order")).toContainText("CONFIRMED");
    await expect(page.getByTestId("customer-order")).toContainText("Qty 1");
    await expect(page.getByTestId("customer-order")).toContainText("$189.00");
  });
});
