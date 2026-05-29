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
}

async function addStormlineJacket(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page
    .getByTestId("product-card")
    .filter({ hasText: "Stormline Shell Jacket" })
    .getByRole("button", { name: "Add to Cart" })
    .click();
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

  test("checkout redirects to login when logged out", async ({ page }) => {
    await page.goto("/checkout");

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
      page.getByRole("heading", { name: "Thanks for your mock purchase." }),
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
  });
});
