# Threadline B2C Clothing Store

## Project Overview

Threadline is a B2C clothing store prototype built for the COMP3036-FS major project. The application provides a customer storefront for browsing second-hand inspired clothing products and a separate admin interface for basic product management.

This repository is focused only on the B2C clothing store project. It was adapted from a previous assignment codebase, while the old blog application is preserved separately.

The current Iteration 1 version is a semi-functional working prototype. It supports product browsing, category filtering, search, cart count interaction, customer authentication, admin authentication, and basic admin create/edit product workflows backed by PostgreSQL and Prisma.

## Success Criteria

- Customers can browse seeded clothing products from PostgreSQL.
- Customers can search and filter products by category.
- Customers can register, log in, log out, and view their session state.
- Customers can add products to a local cart preview and see cart count/total updates.
- Admin users can log in with JWT-based authentication.
- Admin users can view, create, and edit products.
- Seeded product data includes realistic clothing descriptions, sizing notes, stock, categories, and matching public image URLs.
- E2E tests verify the main customer and admin flows.
- GitHub Actions runs database setup, seed, lint, build/test workflow automatically.

## Current Features

### Storefront

- Product grid with name, description, price, stock, category, and image.
- Featured product section.
- Category filtering for Jackets, Hoodies, Pants, and Accessories.
- Product search across product names, descriptions, and categories.
- Cart preview stored in `localStorage`.
- Cart count and total update when products are added.
- Customer registration, login, logout, and current-user session endpoint.
- Responsive UI built with Tailwind CSS.

### Admin

- JWT-protected admin login.
- Admin product list.
- Product creation page.
- Product edit page.
- Product image URL validation and preview.

### Database

- PostgreSQL database.
- Prisma schema and migrations.
- Seeded categories and products.
- Product stock remains a simple quantity field.
- Clothing sizing information is stored in product descriptions, not as separate size variants.

### Testing

- 12 passing Playwright E2E tests.
- Tests cover customer auth, search, category filtering, cart count, admin login, admin product list, and opening the edit product page.
- Web unit seed-data test with Vitest.
- CI runs tests automatically.

## Iteration 1 Status

Iteration 1 is complete as a semi-functional prototype.

Completed:

- Storefront browsing/search/filtering.
- Cart count and local cart preview interaction.
- Customer registration/login/logout.
- Admin JWT login.
- Admin product list.
- Admin create/edit product pages.
- PostgreSQL and Prisma integration.
- Prisma seed data for categories and products.
- Playwright E2E coverage for core flows.
- GitHub Actions CI with PostgreSQL service, migration, seed, lint, and tests.

Not completed yet:

- Checkout/payment.
- Purchase history.
- Admin purchase/order records.
- Product delete workflow.
- Persistent customer cart records.
- Production deployment.

## Remaining Work for Iteration 2/Final

- Implement checkout flow and order creation.
- Add purchase history for customers.
- Add admin order/purchase management.
- Add product deletion if required by final scope.
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

Create `.env` files from the provided `.env.example` files where required. At minimum, the database package and apps need access to the database URL and JWT secret.

Example:

```env
DATABASE_URL="postgresql://YOUR_USERNAME@localhost:5432/threadline_store?schema=public"
JWT_SECRET="your-secret-key"
PASSWORD="123"
```

Notes:

- `DATABASE_URL` is used by Prisma and the Next.js apps.
- `JWT_SECRET` is used for customer/admin token signing.
- `PASSWORD` is used by the admin login prototype.

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

## Running Tests

Run the full Turbo test pipeline:

```bash
pnpm turbo test
```

Run a production build:

```bash
pnpm turbo build
```

Run Playwright E2E tests directly:

```bash
pnpm --filter @repo/playwright exec playwright test
```

Current E2E status:

- 12 Playwright tests passing.
- Coverage includes auth, search, filtering, cart count, admin login, admin product list, and admin edit-page access.

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
- Runs `pnpm turbo test`.

## API Documentation

Only currently implemented API routes are listed here.

### Web App API

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

Logs in a customer and sets an auth cookie.

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

#### `GET /api/seed`

Runs the seed function and returns `{ "message": "Seeded" }`. This exists for development/test support.

### Admin App API

#### `POST /api/auth`

Logs in an admin user using the configured `PASSWORD` and sets an auth cookie.

Request body for JSON requests:

```json
{
  "password": "123"
}
```

Responses:

- `200` with `{ "success": true }` for JSON requests
- `303` redirect for form submissions
- `400` for invalid JSON requests
- `401` for invalid password

#### `DELETE /api/auth`

Logs out the admin user by clearing the auth cookie.

Response:

- `200` with `{ "success": true }`

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

### Planned API Work

The following API areas are planned for Iteration 2/final and are not implemented yet:

- Checkout/order creation.
- Customer purchase history.
- Admin purchase/order records.
- Product delete endpoint.

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

Production deployment is planned for the final submission. The applications are currently verified locally and through GitHub Actions CI.

Deployment requirements for final:

- Hosted PostgreSQL database.
- Production `DATABASE_URL`.
- Production `JWT_SECRET`.
- Secure admin password configuration.
- Hosted web and admin Next.js applications.
- Prisma migrations applied in the deployment environment.

## Demo Video

Demo video is planned for the final submission.

The final demo should show:

- Customer browsing, filtering, and searching.
- Customer registration/login/logout.
- Adding products to the cart preview.
- Admin login.
- Admin product list.
- Product creation/editing.
- E2E tests or CI status.
