import { client } from "@repo/db/client";
import { seed } from "@repo/db/seed";
import { expect, test } from "@playwright/test";

const testEmail = `customer-${Date.now()}@example.com`;
const duplicateEmail = `duplicate-${Date.now()}@example.com`;
const separationEmail = `customer-session-separation-${Date.now()}@example.com`;
const testPassword = "Password123";
const adminLoginUrl = (
  process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:3002"
).replace(/\/$/, "");
const adminEmail = process.env.ADMIN_EMAIL ?? "admin@threadline.com";
const adminPassword = process.env.ADMIN_PASSWORD ?? "test-admin-password";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

test.beforeAll(async () => {
  await seed();
});

test.afterAll(async () => {
  await client.db.user.deleteMany({
    where: {
      email: {
        in: [testEmail, duplicateEmail, separationEmail],
      },
    },
  });
});

test.describe("Customer authentication", () => {
  test("storefront navbar shows admin login link with configured URL", async ({
    page,
  }) => {
    await page.goto("/");

    const adminLoginLink = page.getByRole("link", {
      name: "Admin Login",
    });

    await expect(adminLoginLink).toBeVisible();
    await expect(adminLoginLink).toHaveAttribute("href", adminLoginUrl);
  });

  test("admin login link navigates to the separate admin login page", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Admin Login" }).click();

    await expect(page).toHaveURL(
      new RegExp(`^${escapeRegExp(adminLoginUrl)}/?$`),
    );
    await expect(
      page.getByRole("heading", { name: "Welcome back" }),
    ).toBeVisible();
  });

  test("user logged in then navigating to admin clears customer session", async ({
    page,
    request,
  }) => {
    await request.post("/api/register", {
      data: {
        name: "Session Separation Customer",
        email: separationEmail,
        password: testPassword,
        confirmPassword: testPassword,
      },
    });

    await page.goto("/login");
    await page.getByLabel("Email").fill(separationEmail);
    await page.getByLabel("Password").fill(testPassword);
    await page.getByRole("button", { name: "Login" }).click();

    await expect(
      page.getByRole("link", { name: /^Account$/ }).first(),
    ).toBeVisible();
    await expect
      .poll(async () => {
        const cookie = (await page.context().cookies()).find(
          (item) => item.name === "customer_auth_token",
        );
        return cookie?.expires;
      })
      .toBe(-1);

    await page.goto(adminLoginUrl);

    await expect(page).toHaveURL(
      new RegExp(`^${escapeRegExp(adminLoginUrl)}/?$`),
    );
    await expect(
      page.getByRole("heading", { name: "Welcome back" }),
    ).toBeVisible();
    await expect
      .poll(async () => {
        const cookies = await page.context().cookies();
        return cookies.some((cookie) => cookie.name === "customer_auth_token");
      })
      .toBe(false);

    await page.goto("/account");

    await expect(page).toHaveURL(/\/login$/);
  });

  test("admin credentials cannot log in through the storefront login page", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(adminEmail);
    await page.getByLabel("Password").fill(adminPassword);
    await page.getByRole("button", { name: "Login" }).click();

    await expect(page.getByText("Invalid email or password")).toBeVisible();
    await expect
      .poll(async () => {
        const cookies = await page.context().cookies();
        return cookies.some((cookie) => cookie.name === "customer_auth_token");
      })
      .toBe(false);
  });

  test("customer login and register links still navigate to customer pages", async ({
    page,
  }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "Login" }).first().click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(
      page.getByRole("heading", { name: "Sign in to continue your cart." }),
    ).toBeVisible();

    await page.goto("/");
    await page.getByRole("link", { name: "Register" }).first().click();
    await expect(page).toHaveURL(/\/register$/);
    await expect(
      page.getByRole("heading", { name: "Create your customer account." }),
    ).toBeVisible();
  });

  test("register page loads", async ({ page }) => {
    await page.goto("/register");

    await expect(
      page.getByRole("heading", { name: "Create your customer account." }),
    ).toBeVisible();
    await expect(page.getByLabel("Name")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Confirm password")).toBeVisible();
  });

  test("login page loads", async ({ page }) => {
    await page.goto("/login");

    await expect(
      page.getByRole("heading", { name: "Sign in to continue your cart." }),
    ).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
  });

  test("user registration, login, and logout work", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel("Name").fill("Test Customer");
    await page.getByLabel("Email").fill(testEmail);
    await page.getByLabel("Password", { exact: true }).fill(testPassword);
    await page.getByLabel("Confirm password").fill(testPassword);
    await page.getByRole("button", { name: "Register" }).click();

    await expect(page).toHaveURL(/\/login\?registered=1$/);

    await page.getByLabel("Email").fill(testEmail);
    await page.getByLabel("Password").fill(testPassword);
    await page.getByRole("button", { name: "Login" }).click();

    await expect(page).toHaveURL("/");
    await expect(
      page.getByRole("link", { name: "Account" }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Logout" }).first(),
    ).toBeVisible();

    await page.getByRole("button", { name: "Logout" }).first().click();

    await expect(
      page.getByRole("link", { name: "Login" }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Register" }).first(),
    ).toBeVisible();
  });

  test("invalid login shows an error", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(`missing-${Date.now()}@example.com`);
    await page.getByLabel("Password").fill("WrongPassword123");
    await page.getByRole("button", { name: "Login" }).click();

    await expect(page.getByText("Invalid email or password")).toBeVisible();
  });

  test("duplicate registration is rejected", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel("Name").fill("Duplicate Customer");
    await page.getByLabel("Email").fill(duplicateEmail);
    await page.getByLabel("Password", { exact: true }).fill(testPassword);
    await page.getByLabel("Confirm password").fill(testPassword);
    await page.getByRole("button", { name: "Register" }).click();

    await expect(page).toHaveURL(/\/login\?registered=1$/);

    await page.goto("/register");
    await page.getByLabel("Name").fill("Duplicate Customer");
    await page.getByLabel("Email").fill(duplicateEmail);
    await page.getByLabel("Password", { exact: true }).fill(testPassword);
    await page.getByLabel("Confirm password").fill(testPassword);
    await page.getByRole("button", { name: "Register" }).click();

    await expect(
      page.getByText("An account already exists for this email"),
    ).toBeVisible();
  });
});
