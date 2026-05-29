import { client } from "@repo/db/client";
import Link from "next/link";
import { isLoggedIn } from "../utils/auth";
import { AdminList } from "./admin-list";
import { LogoutButton } from "./logout-button";
import styles from "./page.module.css";

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const loggedIn = await isLoggedIn();
  const params = (await searchParams) ?? {};
  const products = loggedIn
    ? (
        await client.db.product.findMany({
          orderBy: {
            createdAt: "desc",
          },
          include: {
            category: true,
          },
        })
      ).map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        image: product.image,
        price: Number(product.price),
        stock: product.stock,
        category: product.category.name,
        createdAt: product.createdAt,
      }))
    : [];

  if (!loggedIn) {
    return (
      <main className={styles.authMain}>
        <section className={styles.authCard} aria-label="Admin login">
          <p className={styles.eyebrow}>Threadline Admin</p>
          <h1 className={styles.authTitle}>Welcome back</h1>
          <p className={styles.authSubtitle}>
            Sign in to manage store products
          </p>

          <form action="/api/auth" className={styles.authForm} method="post">
            <label className={styles.label} htmlFor="email">
              Email
            </label>
            <input
              className={styles.input}
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />

            <label className={styles.label} htmlFor="password">
              Password
            </label>
            <input
              className={styles.input}
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />

            {params.error === "invalid-credentials" ? (
              <p className={styles.error}>Invalid credentials</p>
            ) : null}
            {params.error === "too-many-attempts" ? (
              <p className={styles.error}>
                Too many login attempts. Please try again later.
              </p>
            ) : null}

            <button className={styles.primaryButton} type="submit">
              Sign In
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Dashboard</p>
          <h1 className={styles.pageTitle}>Store Product Admin</h1>
        </div>

        <div className={styles.headerActions}>
          <Link className={styles.secondaryLink} href="/orders">
            View Orders
          </Link>

          <Link className={styles.primaryLink} href="/products/create">
            Create Product
          </Link>

          <LogoutButton className={styles.secondaryButton} />
        </div>
      </header>

      <AdminList products={products} />
    </main>
  );
}
