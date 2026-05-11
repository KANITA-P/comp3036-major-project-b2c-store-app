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
  // use the is logged in function to check if user is authorised
  // we will use the cookie based approach
  const loggedIn = await isLoggedIn();
  const params = (await searchParams) ?? {};
  const posts = loggedIn
    ? (
      await client.db.post.findMany({
        orderBy: {
          date: "desc",
        },
        select: {
          id: true,
          title: true,
          content: true,
          urlId: true,
          imageUrl: true,
          date: true,
          category: true,
          tags: true,
          active: true,
        },
      })
    ).map((post) => ({
      ...post,
      category: post.category ?? "",
      tags: post.tags ?? "",
    }))
    : [];

  if (!loggedIn) {
    return (
      <main className={styles.authMain}>
        <section className={styles.authCard} aria-label="Admin login">
          <p className={styles.eyebrow}>Full Stack Blog Admin</p>
          <h1 className={styles.authTitle}>Welcome back</h1>
          <p className={styles.authSubtitle}>Sign in to your account</p>

          <form action="/api/auth" className={styles.authForm} method="post">
            <label className={styles.label} htmlFor="password">
              Password
            </label>
            <input
              className={styles.input}
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
            />

            {params.error === "invalid-password" ? (
              <p className={styles.error}>Incorrect password</p>
            ) : null}

            <button className={styles.primaryButton} type="submit">
              Sign In
            </button>
          </form>
        </section>
      </main>
    );
  } else {
    return (
      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Dashboard</p>
            <h1 className={styles.pageTitle}>Admin of Full Stack Blog</h1>
          </div>

          <div className={styles.headerActions}>
            <Link className={styles.primaryLink} href="/posts/create">
              Create Post
            </Link>

            <LogoutButton className={styles.secondaryButton} />
          </div>
        </header>

        <AdminList posts={posts} />
      </main>
    );
  }
}
