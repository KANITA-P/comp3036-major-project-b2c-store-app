# Threadline B2C Clothing Store

## Project Overview

Threadline is a B2C clothing store prototype built for the COMP3036-FS major project. The application provides a customer storefront for browsing second-hand inspired clothing products and a separate admin interface for basic product management.

This repository is focused only on the B2C clothing store project. It was adapted from a previous assignment codebase, while the old blog application is preserved separately.

The current version is a working B2C store prototype. It supports product browsing, category filtering, search, customer authentication, local cart management, mock checkout with persisted order records, customer purchase history, admin authentication, product create/edit/delete workflows, and admin purchase record viewing backed by PostgreSQL and Prisma.

## Success Criteria

- Customers can browse seeded clothing products from PostgreSQL.
- Customers can search and filter products by category.
- Customers can register, log in, log out, and view their session state.
- Customers can add products to a local cart, update quantities, remove items, and see cart count/total updates.
- Customers can complete a mock checkout flow that saves an order and see an order confirmation screen.
- Customers can view past purchases with order dates, items, quantities, and totals.
- Admin users can log in with JWT-based authentication.
- Admin users can view, create, edit, and delete products.
- Admin users can view customer purchase records.
- Seeded product data includes realistic clothing descriptions, sizing notes, stock, categories, and matching public image URLs.
- E2E tests verify the main customer and admin flows.
- GitHub Actions runs database setup, seed, lint, build/test workflow automatically.

## Current Features

### Storefront

- Product grid with name, description, price, stock, category, and image.
- Featured product section.
- Category filtering for Jackets, Hoodies, Pants, and Accessories.
- Product search across product names, descriptions, and categories.
- Cart stored in `localStorage`.
- Cart page with product images, quantities, subtotals, remove controls, and order total.
- Mock checkout page for logged-in customers.
- Checkout creates confirmed order and order item records in PostgreSQL and decrements product stock.
- Order confirmation page that clears the local cart after mock payment.
- Purchase history page showing the logged-in customer's saved orders, dates, statuses, items, quantities, and totals.
- Cart count and total update when products are added, removed, or updated.
- Customer registration, login, logout, and current-user session endpoint.
- Responsive UI built with Tailwind CSS.

### Admin

- JWT-protected admin login.
- Admin product list.
- Product creation page.
- Product edit page.
- Product delete workflow.
- Customer purchase records page.
- Product image URL validation and preview.

### Database

- PostgreSQL database.
- Prisma schema and migrations.
- Seeded categories and products.
- Customer users, admin users, orders, order items, products, and categories are stored in PostgreSQL.
- Product, category, user, order, and order item relationships are modeled in Prisma.
- Product stock remains a simple quantity field.
- Clothing sizing information is stored in product descriptions, not as separate size variants.

### Testing

- 43 passing Playwright E2E tests.
- Tests cover customer auth, search, category filtering, product detail pages, cart behavior, mock checkout, persisted purchase history, checkout API validation, admin login, admin product list, create/edit/delete product management, admin purchase records, and access-control cases.
- Web unit seed-data test with Vitest.
- CI runs tests automatically.

## Iteration 1 Status

Iteration 1 is complete as a semi-functional prototype.

Completed:

- Storefront browsing/search/filtering.
- Cart page, cart count, and local cart interaction.
- Mock checkout with persisted order records and order confirmation.
- Customer purchase history page.
- Customer registration/login/logout.
- Admin JWT login.
- Admin product list.
- Admin create/edit product pages.
- Admin product delete workflow.
- Admin purchase records page.
- PostgreSQL and Prisma integration.
- Prisma seed data for categories and products.
- Playwright E2E coverage for core flows.
- GitHub Actions CI with PostgreSQL service, migration, seed, lint, and tests.

Not completed yet:

- Payment is currently a mock prototype flow; no real Stripe/PayPal integration is planned unless required.
- Production deployment.

## Remaining Work for Iteration 2/Final

- Keep payment as a mock prototype flow unless the final marking requirements ask for a real provider.
- Improve cart persistence beyond `localStorage`.
- Add richer validation and error states for product/admin forms.
- Deploy the web and admin applications.
- Record and link the final demo video.

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- JWT authentication
- Playwright E2E tests
- Vitest unit tests
- pnpm Turbo monorepo
- GitHub Actions CI

## Setup Instructions

Install dependencies from the repository root:

```bash
pnpm install
```

Install Playwright browsers if they are not already installed:

```bash
cd tests/playwright
pnpm playwright install
cd ../..
```

## Environment Variables

Create `.env` files from the provided `.env.example` files where required. At minimum, the database package and apps need access to the database URL and JWT secret. The web app needs its own `apps/web/.env` when you run it directly.

Example:

```env
DATABASE_URL="postgresql://YOUR_USERNAME@localhost:5432/threadline_store?schema=public"
JWT_SECRET="replace-with-a-long-random-customer-secret"
NEXT_PUBLIC_ADMIN_URL="http://localhost:3002"
NEXT_PUBLIC_WEB_URL="http://localhost:3001"
ADMIN_EMAIL="admin@threadline.com"
ADMIN_PASSWORD="replace-with-a-strong-admin-password"
ADMIN_JWT_SECRET="replace-with-a-long-random-admin-secret"
```

Notes:

- `DATABASE_URL` is used by Prisma and the Next.js apps.
- `JWT_SECRET` is required for customer token signing. The app does not fall back to a default customer JWT secret.
- `NEXT_PUBLIC_ADMIN_URL` is used by the storefront navbar's Admin Login link. Use `http://localhost:3002` locally and the deployed admin app URL in production.
- `NEXT_PUBLIC_WEB_URL` is used by the admin app's View Store link. Use `http://localhost:3001` locally and the deployed storefront URL in production.
- `ADMIN_EMAIL` and `ADMIN_PASSWORD` are used by the database seed to create the single admin user. The password is hashed with bcrypt before storage.
- `ADMIN_JWT_SECRET` is used for admin token signing and should be separate from the customer `JWT_SECRET`.

## Database Setup

Start PostgreSQL:

```bash
brew services start postgresql@16
```

Create the local database:

```bash
createdb threadline_store
```

Run Prisma migrations:

```bash
npx prisma migrate dev --schema=packages/db/prisma/schema.prisma
```

Seed the store data:

```bash
pnpm --filter @repo/db db:seed
```

The seed uses Prisma `upsert` for the fixed seeded products, so reseeding updates existing product names, descriptions, images, prices, stock, and categories instead of duplicating them.

## Running the Project

Start both applications from the repository root:

```bash
pnpm turbo dev
```

Local URLs:

- Web storefront: [http://localhost:3001](http://localhost:3001)
- Admin app: [http://localhost:3002](http://localhost:3002)

The storefront navbar includes an **Admin Login** link that opens the separate admin app. Set `NEXT_PUBLIC_ADMIN_URL` in `apps/web/.env` to control the destination. If it is not set, the web app falls back to `http://localhost:3002`.

The admin dashboard, product pages, and purchase records page include a **View Store** link that opens the customer storefront. Set `NEXT_PUBLIC_WEB_URL` in `apps/admin/.env` to control the destination. If it is not set, the admin app falls back to `http://localhost:3001`.

## Running Tests

Run the full Turbo test pipeline:

```bash
pnpm turbo test
```

Run the autograding test groups separately:

```bash
pnpm turbo test-1
pnpm turbo test-2
pnpm turbo test-3
```

- `test-1` runs customer storefront tests for auth, browsing, filtering, search, cart, checkout, and purchase history.
- `test-2` runs admin dashboard tests for admin login, product management, deletion, handoff navigation, and admin order records.
- `test-3` runs API tests for public products, customer auth APIs, checkout/order creation, and admin product APIs.

Run a production build:

```bash
pnpm turbo build
```

Run Playwright E2E tests directly:

```bash
pnpm --filter @repo/playwright exec playwright test
```

Current E2E status:

- Playwright tests are organised into `test-1`, `test-2`, and `test-3` autograding groups.
- Coverage includes customer auth, admin auth, search, filtering, product browsing, product detail pages, cart count, cart page loading, add/remove cart behavior, quantity limits, checkout login redirect, logged-in checkout access, checkout API validation, mock order confirmation, persisted purchase history, public product API, customer auth APIs, admin product APIs, admin product list, admin create/edit/delete flows, admin purchase records, and access-control cases.

If a dev server is already running on ports `3001` or `3002`, stop it before running the Playwright command that starts its own servers.

## CI Pipeline

GitHub Actions is configured in `.github/workflows/ci.yml`.

The CI workflow:

- Starts a PostgreSQL 16 service.
- Installs dependencies with pnpm.
- Generates Prisma Client.
- Applies Prisma migrations.
- Seeds the database.
- Runs web and admin lint checks.
- Installs the Playwright Chromium browser.
- Runs `pnpm turbo test-1`, `pnpm turbo test-2`, and `pnpm turbo test-3` as separate autograding steps.

## API Documentation

Only currently implemented API routes are listed here.

### Web App API

#### `GET /api/products`

Returns all available products from the database.

The `stockQuantity` response field is mapped from the database `Product.stock` field.

Request:

- No request body required.
- Authentication is not required.

Response example:

```json
[
  {
    "id": 1,
    "name": "Black Denim Jacket",
    "description": "Size: M. Fit: relaxed. Condition: Used - Good.",
    "price": 89.99,
    "image": "https://images.unsplash.com/example",
    "stockQuantity": 5,
    "category": {
      "id": 1,
      "name": "Jackets"
    }
  }
]
```

Responses:

- `200` with an array of product objects
- `500` with `{ "error": "Unable to load products" }` if products cannot be loaded

#### `POST /api/register`

Registers a customer account.

Request body:

```json
{
  "name": "Test User",
  "email": "user@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

Responses:

- `201` with `{ "success": true }`
- `400` for missing fields or password mismatch
- `409` when the email already exists

#### `POST /api/login`

Logs in a customer and sets an HTTP-only auth cookie. Customer JWTs include an expiry and `aud: "customer"`.

Request body:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Responses:

- `200` with `{ "success": true, "user": ... }`
- `400` for missing fields
- `401` for invalid credentials
- `429` for too many login attempts

#### `DELETE /api/logout`

Logs out the current customer by clearing the auth cookie.

Response:

- `200` with `{ "success": true }`

#### `GET /api/me`

Returns the current customer session.

Response:

```json
{
  "user": null
}
```

or a logged-in user object.

#### `POST /api/admin-storefront-session`

Creates a storefront session from a short-lived admin handoff token. This endpoint is used by the admin-to-storefront handoff to set the storefront `customer_auth_token` while clearing any stale admin cookie on the storefront origin.

Purpose:

- Supports secure navigation from the admin app to the storefront.
- Prevents admin/customer session cookie conflicts.
- Maintains separate customer and admin authentication states.

Request body:

```json
{
  "token": "short-lived-admin-storefront-handoff-token"
}
```

Authentication requirements:

- Requires a valid signed handoff token created by the admin app.
- The token must have `aud: "admin-storefront-handoff"` and `role: "ADMIN"`.
- The matching database user must still exist and have `role: "ADMIN"`.

Response example:

```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "Threadline Admin",
    "email": "admin@threadline.com",
    "role": "ADMIN"
  }
}
```

Responses:

- `200` with `{ "success": true, "user": ... }` and a storefront session cookie
- `401` with `{ "error": "Invalid or expired storefront session token" }` for missing, invalid, expired, or unauthorized tokens

Browser redirect support:

- `GET /api/admin-storefront-session?token=...` is also supported for the admin dashboard's **View Store** redirect flow.
- Valid tokens redirect to `/` and set the storefront session cookie.
- Invalid tokens redirect to `/` without creating a storefront session.

#### `POST /api/orders`

Creates a confirmed mock checkout order for the logged-in customer. The endpoint validates cart items against current products, rejects empty or invalid carts, saves order and order item records, and decrements stock in a database transaction.

Request body:

```json
{
  "items": [
    {
      "productId": 1,
      "quantity": 2
    }
  ]
}
```

Responses:

- `200` with `{ "success": true, "order": { "id": 1, "total": 378, "count": 2 } }`
- `400` for empty carts, invalid products, insufficient stock, or changed stock
- `401` for unauthenticated requests

#### `GET /api/seed`

Runs the seed function and returns `{ "message": "Seeded" }`. This exists for development/test support.

### Admin App API

#### `POST /api/auth`

Logs in the seeded admin user with email and password, then sets an HTTP-only admin auth cookie. The matching database user must have `role: "ADMIN"`. Admin JWTs include an expiry and `aud: "admin"`.

Request body for JSON requests:

```json
{
  "email": "admin@threadline.com",
  "password": "replace-with-a-strong-admin-password"
}
```

Responses:

- `200` with `{ "success": true }` for JSON requests
- `303` redirect for form submissions
- `400` for invalid JSON requests
- `401` for invalid credentials
- `429` for too many login attempts

#### `DELETE /api/auth`

Logs out the admin user by clearing the auth cookie.

Response:

- `200` with `{ "success": true }`

#### `POST /api/storefront-session`

Creates a short-lived admin-to-storefront handoff URL. This endpoint is used when an authenticated admin wants to navigate from the admin dashboard to the customer storefront and arrive signed in to the storefront as an admin storefront session.

Purpose:

- Allows secure storefront authentication from the admin application.
- Keeps admin and storefront session cookies separate.
- Supports session handoff between the admin app and storefront without allowing admin login through the storefront login form.

Request:

- No request body required.

Authentication requirements:

- Requires a valid admin session cookie.
- The admin token must have `aud: "admin"` and `role: "ADMIN"`.
- The matching database user must still exist and have `role: "ADMIN"`.

Response example:

```json
{
  "success": true,
  "redirectUrl": "http://localhost:3001/api/admin-storefront-session?token=..."
}
```

Responses:

- `200` with `{ "success": true, "redirectUrl": "..." }`
- `401` with `{ "error": "Unauthorized" }` when the admin session is missing or invalid

Browser redirect support:

- `GET /api/storefront-session` is also supported for the admin dashboard's **View Store** link.
- Authenticated admins are redirected to the storefront handoff receiver.
- Unauthenticated visitors are redirected to the storefront without a handoff token.

#### `POST /api/products`

Creates a product. Requires admin authentication.

Request body:

```json
{
  "name": "Example Jacket",
  "description": "Size: M. Fit: relaxed. Condition: Used - Good.",
  "image": "https://images.unsplash.com/example",
  "category": "Jackets",
  "price": 100,
  "stock": 5
}
```

Responses:

- `201` with created product id/name
- `400` for invalid product data
- `401` for unauthenticated requests

#### `PATCH /api/products/[id]`

Updates a product. Requires admin authentication.

Request body:

```json
{
  "name": "Updated Jacket",
  "description": "Size: M. Fit: relaxed. Condition: Used - Very Good.",
  "image": "https://images.unsplash.com/example",
  "category": "Jackets",
  "price": 120,
  "stock": 4
}
```

Responses:

- `200` with updated product id/name
- `400` for invalid product id or product data
- `401` for unauthenticated requests

#### `DELETE /api/products/[id]`

Deletes a product. Requires admin authentication.

Responses:

- `200` with `{ "success": true }`
- `400` for invalid product id
- `401` for unauthenticated requests
- `404` when the product does not exist
- `409` when the product has order history and cannot be safely deleted

### Planned API Work

The core auth, product browsing API, checkout/order creation, customer order history pages, admin product APIs, and admin order record pages are implemented for the university project scope.

## Project Structure

```text
apps/
  web/              Customer storefront application
  admin/            Admin product management application
packages/
  db/               Prisma schema, client, seed data, and database helpers
  env/              Shared environment validation
  ui/               Shared UI package
  utils/            Shared utility functions
  eslint-config/    Shared ESLint configuration
  tailwind-config/  Shared Tailwind configuration
  typescript-config/ Shared TypeScript configuration
tests/
  playwright/       End-to-end tests for web and admin apps
  storybook/        Storybook test/development package
.github/
  workflows/        GitHub Actions CI configuration
```

## Deployment

The project can be deployed as two separate Next.js applications: the storefront app and the admin app.

Deployment links:

- Storefront: https://threadline-web-one.vercel.app/
- Admin: https://threadline-admin.vercel.app/

Deployment requirements:

- Hosted PostgreSQL database.
- Production `DATABASE_URL`.
- Production `JWT_SECRET`.
- Production `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_JWT_SECRET`.
- Storefront `NEXT_PUBLIC_ADMIN_URL` set to the deployed admin app URL.
- Admin `NEXT_PUBLIC_WEB_URL` set to the deployed storefront app URL.
- Hosted web and admin Next.js applications.
- Prisma migrations applied in the deployment environment.

## Demo Video

Demo video is planned for the final submission.

The final demo should show:

- Customer browsing, filtering, and searching.
- Customer registration/login/logout.
- Adding products to the cart.
- Updating/removing cart items.
- Completing the mock checkout flow.
- Viewing the order confirmation and persisted purchase history.
- Admin login.
- Admin product list.
- Product creation/editing/deletion.
- Admin purchase records.
- E2E tests or CI status.
