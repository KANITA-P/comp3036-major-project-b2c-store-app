"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Email and password are required");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });
      const body = await response.json().catch(() => null);

      if (!response.ok) {
        setError(body?.error ?? "Invalid email or password");
        return;
      }

      router.push("/");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-stone-50 px-5 py-10 text-neutral-950">
      <section className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-normal text-neutral-500">
            Threadline Account
          </p>
          <h1 className="mt-4 text-4xl font-black leading-tight tracking-normal sm:text-5xl">
            Sign in to continue your cart.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-neutral-600">
            Use your storefront account to keep shopping the latest clothing
            drops.
          </p>
        </div>

        <form
          className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm sm:p-8"
          onSubmit={handleSubmit}
        >
          <div className="space-y-5">
            <div>
              <label className="text-sm font-bold text-neutral-800" htmlFor="email">
                Email
              </label>
              <input
                autoComplete="email"
                className="mt-2 h-11 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 text-neutral-950 outline-none transition focus:border-neutral-950 focus:bg-white"
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div>
              <label
                className="text-sm font-bold text-neutral-800"
                htmlFor="password"
              >
                Password
              </label>
              <input
                autoComplete="current-password"
                className="mt-2 h-11 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 text-neutral-950 outline-none transition focus:border-neutral-950 focus:bg-white"
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
          </div>

          {error ? (
            <p className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          ) : null}

          <button
            className="mt-6 h-11 w-full rounded-full bg-neutral-950 px-5 text-sm font-bold text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
            disabled={submitting}
            type="submit"
          >
            {submitting ? "Signing in..." : "Login"}
          </button>

          <p className="mt-5 text-center text-sm text-neutral-600">
            New here?{" "}
            <Link className="font-bold text-neutral-950 underline" href="/register">
              Create an account
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
