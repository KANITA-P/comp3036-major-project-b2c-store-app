import { client } from "@repo/db/client";
import { seed } from "@repo/db/seed";
import { expect, test } from "@playwright/test";

const testEmail = `customer-${Date.now()}@example.com`;
const testPassword = "Password123";

test.beforeAll(async () => {
  await seed();
});

test.afterAll(async () => {
  await client.db.user.deleteMany({
    where: {
      email: testEmail,
    },
  });
});

test.describe("Customer authentication", () => {
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
    await expect(page.getByRole("link", { name: "Account" }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Logout" }).first()).toBeVisible();

    await page.getByRole("button", { name: "Logout" }).first().click();

    await expect(page.getByRole("link", { name: "Login" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Register" }).first()).toBeVisible();
  });
});
